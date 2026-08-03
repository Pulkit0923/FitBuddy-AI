import { WebhookEvent } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

console.log("HTTP.TS LOADED");

const http = httpRouter();

// Helper to safely parse JSON from AI, stripping markdown fences if present
function parseJSONSafe(text: string) {
  try {
    let cleanText = text.trim();
    // Match optional ```json ... ``` blocks
    const match = cleanText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (match) {
      cleanText = match[1].trim();
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON parsing error. Raw text was:", text);
    throw new Error("Failed to parse AI generated JSON: " + (error instanceof Error ? error.message : String(error)));
  }
}

// Validate and normalize workout plan
function validateWorkoutPlan(plan: any) {
  if (plan && typeof plan === "object") {
    if (plan.workoutPlan && typeof plan.workoutPlan === "object") {
      plan = plan.workoutPlan;
    } else if (plan.workout_plan && typeof plan.workout_plan === "object") {
      plan = plan.workout_plan;
    }
  }

  const safePlan = (plan && typeof plan === "object") ? plan : {};

  const schedule: string[] = [];
  if (Array.isArray(safePlan.schedule)) {
    for (const s of safePlan.schedule) {
      if (s) schedule.push(String(s));
    }
  }
  if (schedule.length === 0) {
    schedule.push("Monday", "Wednesday", "Friday");
  }

  const exercises: any[] = [];
  const rawExercises = Array.isArray(safePlan.exercises) ? safePlan.exercises : [];

  for (const item of rawExercises) {
    if (!item || typeof item !== "object") continue;
    const day = item.day ? String(item.day) : "Workout Day";
    const routines: any[] = [];
    const rawRoutines = Array.isArray(item.routines) ? item.routines : [];

    for (const r of rawRoutines) {
      if (!r || typeof r !== "object") continue;
      const name = r.name ? String(r.name) : "Exercise";
      let sets = 3;
      if (typeof r.sets === "number") sets = r.sets;
      else if (r.sets) sets = parseInt(r.sets) || 3;

      let reps = 10;
      if (typeof r.reps === "number") reps = r.reps;
      else if (r.reps) reps = parseInt(r.reps) || 10;

      const routineItem: any = { name, sets, reps };
      if (r.description) routineItem.description = String(r.description);
      routines.push(routineItem);
    }

    if (routines.length === 0) {
      routines.push({ name: "General Warm-up & Light Cardio", sets: 3, reps: 10 });
    }

    exercises.push({ day, routines });
  }

  if (exercises.length === 0) {
    for (const day of schedule) {
      exercises.push({
        day,
        routines: [{ name: "General Warm-up & Light Cardio", sets: 3, reps: 10 }]
      });
    }
  }

  return {
    schedule,
    exercises
  };
}

// Validate and normalize diet plan
function validateDietPlan(plan: any) {
  if (plan && typeof plan === "object") {
    if (plan.dietPlan && typeof plan.dietPlan === "object") {
      plan = plan.dietPlan;
    } else if (plan.diet_plan && typeof plan.diet_plan === "object") {
      plan = plan.diet_plan;
    }
  }

  const safePlan = (plan && typeof plan === "object") ? plan : {};

  let dailyCalories = 2000;
  if (typeof safePlan.dailyCalories === "number") {
    dailyCalories = safePlan.dailyCalories;
  } else if (typeof safePlan.daily_calories === "number") {
    dailyCalories = safePlan.daily_calories;
  } else if (safePlan.dailyCalories) {
    dailyCalories = parseInt(safePlan.dailyCalories) || 2000;
  } else if (safePlan.daily_calories) {
    dailyCalories = parseInt(safePlan.daily_calories) || 2000;
  }

  const meals: any[] = [];
  const rawMeals = Array.isArray(safePlan.meals) ? safePlan.meals : [];

  for (const item of rawMeals) {
    if (!item || typeof item !== "object") continue;
    const name = item.name ? String(item.name) : "Meal";
    const foods: string[] = [];
    const rawFoods = Array.isArray(item.foods) ? item.foods : [];
    for (const f of rawFoods) {
      if (f) foods.push(String(f));
    }
    if (foods.length === 0) {
      foods.push("Balanced food item");
    }
    meals.push({ name, foods });
  }

  if (meals.length === 0) {
    meals.push(
      { name: "Breakfast", foods: ["Oatmeal with fruit", "Scrambled eggs"] },
      { name: "Lunch", foods: ["Grilled chicken breast", "Brown rice", "Steamed broccoli"] },
      { name: "Dinner", foods: ["Baked salmon", "Sweet potato", "Mixed greens salad"] }
    );
  }

  const validatedPlan: any = {
    dailyCalories,
    meals
  };

  const rawMacros = safePlan.macros || safePlan.macroDistribution;
  if (rawMacros && typeof rawMacros === "object") {
    validatedPlan.macros = {
      protein: rawMacros.protein ? String(rawMacros.protein) : undefined,
      carbs: rawMacros.carbs ? String(rawMacros.carbs) : undefined,
      fats: rawMacros.fats ? String(rawMacros.fats) : undefined,
    };
  }

  return validatedPlan;
}

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } =
        evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          email,
          name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    return new Response("Webhooks processed successfully", { status: 200 });
  }),
});

http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      console.log("Incoming generate-program webhook payload:", JSON.stringify(payload));

      // Extract variables from the request body
      let user_id = payload.user_id;
      let age = payload.age;
      let height = payload.height;
      let weight = payload.weight;
      let injuries = payload.injuries;
      let workout_days = payload.workout_days;
      let fitness_goal = payload.fitness_goal;
      let fitness_level = payload.fitness_level;
      let dietary_restrictions = payload.dietary_restrictions;

      // Extract details if nested in a Vapi Tool Call or End of Call Report
      const message = payload.message;
      let toolCallId: string | undefined;

      if (message) {
        // If it's a Vapi webhook but not a tool call or end-of-call report, ignore it
        const allowedTypes = ["tool-calls", "end-of-call-report"];
        if (!allowedTypes.includes(message.type)) {
          console.log(`[Webhook] Ignoring Vapi event of type: ${message.type}`);
          return new Response(
            JSON.stringify({
              success: true,
              message: `Ignored message type: ${message.type}`
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // If Vapi tool call
        if (message.type === "tool-calls" && Array.isArray(message.toolCalls) && message.toolCalls.length > 0) {
          const toolCall = message.toolCalls[0];
          toolCallId = toolCall.id;
          if (toolCall.function && toolCall.function.arguments) {
            const args = toolCall.function.arguments;
            age = age ?? args.age;
            height = height ?? args.height;
            weight = weight ?? args.weight;
            injuries = injuries ?? args.injuries;
            workout_days = workout_days ?? args.workout_days ?? args.workoutDays;
            fitness_goal = fitness_goal ?? args.fitness_goal ?? args.fitnessGoal;
            fitness_level = fitness_level ?? args.fitness_level ?? args.fitnessLevel;
            dietary_restrictions = dietary_restrictions ?? args.dietary_restrictions ?? args.dietaryRestrictions;
          }
        }
        
        // If Vapi end-of-call report or analysis
        if (message.analysis && message.analysis.structuredData) {
          const sd = message.analysis.structuredData;
          age = age ?? sd.age;
          height = height ?? sd.height;
          weight = weight ?? sd.weight;
          injuries = injuries ?? sd.injuries;
          workout_days = workout_days ?? sd.workout_days ?? sd.workoutDays;
          fitness_goal = fitness_goal ?? sd.fitness_goal ?? sd.fitnessGoal;
          fitness_level = fitness_level ?? sd.fitness_level ?? sd.fitnessLevel;
          dietary_restrictions = dietary_restrictions ?? sd.dietary_restrictions ?? sd.dietaryRestrictions;
        }

        // Retrieve clerk user_id passed in call variable values
        if (message.call && message.call.variableValues) {
          user_id = user_id ?? message.call.variableValues.user_id ?? message.call.variableValues.userId;
        }
      }

      console.log("Extracted program inputs:", {
        user_id,
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
      });

      if (!user_id) {
        console.warn("Missing Clerk user ID (user_id) in webhook. Falling back to guest_user.");
        user_id = "guest_user";
      }

      // Check if the user already has a plan created very recently (e.g., in the last 2 minutes) to prevent duplicates from multiple webhooks in the same call
      if (user_id && user_id !== "guest_user") {
        const recentPlans = await ctx.runQuery(api.plans.getUserPlans, { userId: user_id });
        if (recentPlans && recentPlans.length > 0) {
          const mostRecentPlan = recentPlans[0];
          const timeDiffMs = Date.now() - mostRecentPlan._creationTime;
          if (timeDiffMs < 120000) { // 2 minutes
            console.log(`[Webhook] Skipping plan creation: A plan was already created ${timeDiffMs / 1000}s ago for user ${user_id}`);
            return new Response(
              JSON.stringify({
                success: true,
                message: "Skipped plan creation to prevent duplicates in the same call.",
                data: {
                  planId: mostRecentPlan._id,
                  workoutPlan: mostRecentPlan.workoutPlan,
                  dietPlan: mostRecentPlan.dietPlan,
                }
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable. Please set it in Convex dashboard.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelsToTry = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

      // Normalize inputs
      const normalizedAge = age ? String(age) : "Not specified";
      const normalizedHeight = height ? String(height) : "Not specified";
      const normalizedWeight = weight ? String(weight) : "Not specified";
      const normalizedInjuries = injuries ? String(injuries) : "None";
      const normalizedWorkoutDays = workout_days ? String(workout_days) : "3";
      const normalizedFitnessGoal = fitness_goal ? String(fitness_goal) : "General Fitness";
      const normalizedFitnessLevel = fitness_level ? String(fitness_level) : "Beginner";
      const normalizedDietaryRestrictions = dietary_restrictions ? String(dietary_restrictions) : "None";

      const workoutPrompt = `You are a world-class professional fitness coach creating a personalized workout plan for a user with these stats:
      Age: ${normalizedAge}
      Height: ${normalizedHeight}
      Weight: ${normalizedWeight}
      Injuries or limitations: ${normalizedInjuries}
      Available days for workout: ${normalizedWorkoutDays}
      Fitness goal: ${normalizedFitnessGoal} (could be Weight loss, Muscle gain, Strength, Body recomposition, Maintenance, etc.)
      Fitness level: ${normalizedFitnessLevel}
      
      Design a target-driven program tailored to these settings. Avoid routines that aggravate the user's injuries.
      Support all requested workout modalities including:
      - Gym Workouts (hypertrophy, barbell, dumbbells, machines)
      - Home Workouts (bodyweight, resistance bands, high-intensity intervals) if requested or appropriate
      - Goals including: Weight loss (cardio+strength), Muscle gain (progressive overload), Strength (low rep compound lifts), Body recomposition (high intensity resistance training), Maintenance (functional training).
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Output MUST strictly be a JSON object matching the exact structure below.
      - "sets" and "reps" MUST be integers (numbers), NOT strings.
      - For cardio routines, use "sets": 1, "reps": 1 or similar numerical targets.
      - Do NOT output extra text or fields.
      
      Structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10,
                "description": "Optional short form execution tip"
              }
            ]
          }
        ]
      }
      
      Return ONLY valid JSON text.`;

      const dietPrompt = `You are an expert sports nutritionist creating a personalized diet plan based on:
        Age: ${normalizedAge}
        Height: ${normalizedHeight}
        Weight: ${normalizedWeight}
        Fitness goal: ${normalizedFitnessGoal}
        Dietary restrictions / Preferences: ${normalizedDietaryRestrictions}
        
        As a nutrition coach, calculate their daily energy targets and design structured meals respecting their restrictions.
        Support all requested dietary preferences and configurations including:
        - Vegetarian & Vegan guidelines (incorporating high-quality plant proteins like tofu, lentils, beans, tempeh)
        - Indian diets (traditional macro distributions like paneer, dal, roti, brown rice, chana)
        - Macro priorities: High protein (high lean meats/tofu, eggs, greek yogurt), Low carb (vegetables, proteins, healthy fats), Lactose intolerant / dairy-free, Gluten-free, or balanced maintenance.
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Output MUST strictly be a JSON object matching the exact structure below.
        - "dailyCalories" MUST be a number, NOT a string.
        - Include macro estimates in the "macros" object.
        
        Structure:
        {
          "dailyCalories": 2200,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["3 scrambled egg whites or tofu scramble", "1 slice whole-wheat toast", "Black coffee"]
            }
          ],
          "macros": {
            "protein": "160g",
            "carbs": "220g",
            "fats": "70g"
          }
        }
        
        Return ONLY valid JSON text.`;

      let workoutPlanText = "";
      let dietPlanText = "";
      let generationSuccess = false;

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Webhook] Attempting generation with model: ${modelName}`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              topP: 0.9,
              responseMimeType: "application/json",
            },
          });

          const workoutResult = await model.generateContent(workoutPrompt, { timeout: 45000 });
          workoutPlanText = workoutResult.response.text();

          const dietResult = await model.generateContent(dietPrompt, { timeout: 45000 });
          dietPlanText = dietResult.response.text();

          generationSuccess = true;
          break;
        } catch (err: any) {
          console.warn(`[Webhook] Model ${modelName} failed generation:`, err.message || err);
        }
      }

      if (!generationSuccess) {
        throw new Error("All Gemini model generation attempts failed inside Convex webhook.");
      }

      let workoutPlan = parseJSONSafe(workoutPlanText);
      workoutPlan = validateWorkoutPlan(workoutPlan);

      let dietPlan = parseJSONSafe(dietPlanText);
      dietPlan = validateDietPlan(dietPlan);

      console.log("Saving plan using createPlan mutation for:", user_id);
      
      const planName = `${normalizedFitnessGoal} Plan - ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
      
      const planId = await ctx.runMutation(api.plans.createPlan, {
        userId: user_id,
        name: planName,
        workoutPlan,
        dietPlan,
        isActive: true,
      });

      console.log("Plan created successfully. ID:", planId);

      // If it is a Vapi tool call, return the response Vapi expects
      if (toolCallId) {
        return new Response(
          JSON.stringify({
            results: [
              {
                toolCallId: toolCallId,
                result: `Successfully generated and saved your plan named: ${planName}. It is now active on your profile.`
              }
            ]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Default response
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error generating or saving fitness plan:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

export default http;
