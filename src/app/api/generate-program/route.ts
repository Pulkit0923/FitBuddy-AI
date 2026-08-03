import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

function parseJSONSafe(text: string) {
  try {
    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch {
    console.error("JSON parsing error on text:", text);
    return null;
  }
}

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

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Next.js local route payload:", payload);

    const user_id = payload.user_id || payload.userId;
    const age = payload.age;
    const height = payload.height;
    const weight = payload.weight;
    const injuries = payload.injuries;
    const workout_days = payload.workout_days || payload.workoutDays;
    const fitness_goal = payload.fitness_goal || payload.fitnessGoal;
    const fitness_level = payload.fitness_level || payload.fitnessLevel;
    const dietary_restrictions = payload.dietary_restrictions || payload.dietaryRestrictions;

    if (!user_id) {
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Missing GEMINI_API_KEY environment variable" }, { status: 500 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ success: false, error: "Missing NEXT_PUBLIC_CONVEX_URL environment variable" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
    
    let workoutPlanText = "";
    let dietPlanText = "";
    let generationSuccess = false;

    // Retry loop over candidate models to survive transient free tier rate limits / 503s
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            responseMimeType: "application/json",
          },
        });

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
        Fitness goal: ${normalizedFitnessGoal}
        Fitness level: ${normalizedFitnessLevel}
        
        Design a target-driven program tailored to these settings. Avoid routines that aggravate the user's injuries.
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Output MUST strictly be a JSON object matching the exact structure below.
        - "sets" and "reps" MUST be integers (numbers), NOT strings.
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
                  "description": "Optional short form tip"
                }
              ]
            }
          ]
        }
        
        Return ONLY valid JSON text.`;

        const workoutResult = await model.generateContent(workoutPrompt, { timeout: 45000 });
        workoutPlanText = workoutResult.response.text();

        const dietPrompt = `You are an expert sports nutritionist creating a personalized diet plan based on:
        Age: ${normalizedAge}
        Height: ${normalizedHeight}
        Weight: ${normalizedWeight}
        Fitness goal: ${normalizedFitnessGoal}
        Dietary restrictions / Preferences: ${normalizedDietaryRestrictions}
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Output MUST strictly be a JSON object matching the exact structure below.
        - "dailyCalories" MUST be a number, NOT a string.
        
        Structure:
        {
          "dailyCalories": 2200,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["3 scrambled egg whites or tofu scramble", "1 slice whole-wheat toast"]
            }
          ],
          "macros": {
            "protein": "160g",
            "carbs": "220g",
            "fats": "70g"
          }
        }
        
        Return ONLY valid JSON text.`;

        const dietResult = await model.generateContent(dietPrompt, { timeout: 45000 });
        dietPlanText = dietResult.response.text();

        generationSuccess = true;
        break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed generation:`, err.message || err);
      }
    }

    if (!generationSuccess) {
      throw new Error("All Gemini model generation attempts failed. Please retry.");
    }

    let workoutPlan = parseJSONSafe(workoutPlanText);
    workoutPlan = validateWorkoutPlan(workoutPlan);

    let dietPlan = parseJSONSafe(dietPlanText);
    dietPlan = validateDietPlan(dietPlan);

    const client = new ConvexHttpClient(convexUrl);
    const planName = `${fitness_goal || "General Fitness"} Plan - ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;

    console.log("Calling Convex mutation plans:createPlan for user:", user_id);
    const planId = await client.mutation(api.plans.createPlan, {
      userId: user_id,
      name: planName,
      workoutPlan,
      dietPlan,
      isActive: true,
    });

    console.log("Successfully created plan with ID:", planId);

    return NextResponse.json({
      success: true,
      data: {
        planId,
        workoutPlan,
        dietPlan
      }
    });

  } catch (error: any) {
    console.error("Local route error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
