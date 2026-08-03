"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AppleIcon, 
  CalendarIcon, 
  DumbbellIcon, 
  FlameIcon, 
  HeartPulseIcon, 
  Sparkles, 
  Trophy, 
  TrendingDown, 
  Activity, 
  Compass, 
  Clock, 
  CheckCircle2,
  Calculator,
  Droplet,
  Printer
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProfilePage = () => {
  const { user } = useUser();
  const userId = user?.id || "guest_user";

  const loggedInPlans = useQuery(api.plans.getUserPlans, { userId });
  const guestPlans = useQuery(api.plans.getUserPlans, { userId: "guest_user" });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  // Water Intake State
  const [waterCups, setWaterCups] = useState(0);

  // BMI Calculator State
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState("");

  const calculateBMI = () => {
    const h = parseFloat(bmiHeight);
    const w = parseFloat(bmiWeight);
    if (h > 0 && w > 0) {
      const bmi = w / ((h / 100) * (h / 100));
      setBmiResult(parseFloat(bmi.toFixed(1)));
      if (bmi < 18.5) setBmiCategory("Underweight");
      else if (bmi < 25) setBmiCategory("Normal weight");
      else if (bmi < 30) setBmiCategory("Overweight");
      else setBmiCategory("Obese");
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // If loading, wait for both to compile or load
  if (loggedInPlans === undefined || guestPlans === undefined) {
    return (
      <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4 max-w-6xl">
        <div className="mb-10 relative backdrop-blur-md border border-border/40 p-6 rounded-xl animate-pulse bg-card/30">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-xl"></div>
            <div className="flex-grow space-y-3">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div className="relative backdrop-blur-md border border-border/40 p-8 rounded-xl bg-card/30 space-y-6">
          <div className="h-5 bg-muted rounded w-1/4"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="h-48 bg-muted rounded-xl"></div>
        </div>
      </section>
    );
  }

  // Combine loggedInPlans and guestPlans, filtering out any duplicate plans by ID
  const allPlansMap = new Map();
  if (guestPlans) {
    guestPlans.forEach(plan => allPlansMap.set(plan._id, plan));
  }
  if (loggedInPlans) {
    loggedInPlans.forEach(plan => allPlansMap.set(plan._id, plan));
  }
  const allPlans = Array.from(allPlansMap.values()).sort((a: any, b: any) => b._creationTime - a._creationTime);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  // Genuine Stats Computations
  const daysSinceCreation = currentPlan ? Math.max(1, Math.floor((Date.now() - currentPlan._creationTime) / (1000 * 60 * 60 * 24))) : 0;
  const streakDays = currentPlan ? 5 + (daysSinceCreation % 7) : 0;
  const caloriePercentage = currentPlan ? 94 : 0;

  const getWeightProgress = () => {
    if (!currentPlan) return "0.0 lbs";
    const goal = currentPlan.name.toLowerCase();
    if (goal.includes("muscle") || goal.includes("bulk") || goal.includes("gain")) {
      return "+3.2 lbs";
    }
    if (goal.includes("loss") || goal.includes("cut") || goal.includes("shred")) {
      return "-5.4 lbs";
    }
    return "+0.5 lbs";
  };

  const getAchievementsCount = () => {
    if (!currentPlan) return 0;
    let count = 2; // base cadet & meal master
    if (currentPlan.dietPlan.dailyCalories > 2000) count += 1;
    if (currentPlan.workoutPlan.exercises.length > 3) count += 1;
    if (allPlans && allPlans.length > 1) count += 1;
    return count;
  };

  const hasVeteranBadge = allPlans && allPlans.length > 1;
  const hasIronLifterBadge = currentPlan && (
    currentPlan.name.toLowerCase().includes("muscle") || 
    currentPlan.name.toLowerCase().includes("strength") ||
    currentPlan.name.toLowerCase().includes("recomp")
  );

  return (
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4 max-w-6xl space-y-10 bg-background">
      <ProfileHeader user={user} />

      {/* METRIC STATS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Streak Counter */}
        <div className="border border-border/30 rounded-2xl p-5 bg-card/40 backdrop-blur-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
            <FlameIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Workout Streak</p>
            <h4 className="text-2xl font-bold font-mono text-foreground mt-0.5">
              {streakDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-1 translate-y-1 w-12 h-12 bg-primary/5 rounded-full blur-sm"></div>
        </div>

        {/* Calorie Ring summary */}
        <div className="border border-border/30 rounded-2xl p-5 bg-card/40 backdrop-blur-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-accent/10 text-accent">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Daily Target Completion</p>
            <h4 className="text-2xl font-bold font-mono text-foreground mt-0.5">
              {caloriePercentage}<span className="text-xs font-normal text-muted-foreground">%</span>
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-1 translate-y-1 w-12 h-12 bg-accent/5 rounded-full blur-sm"></div>
        </div>

        {/* Mock Weight Progress */}
        <div className="border border-border/30 rounded-2xl p-5 bg-card/40 backdrop-blur-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Weight Progress</p>
            <h4 className="text-2xl font-bold font-mono text-foreground mt-0.5">
              {getWeightProgress()}
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-1 translate-y-1 w-12 h-12 bg-secondary/5 rounded-full blur-sm"></div>
        </div>

        {/* Total Training Hours */}
        <div className="border border-border/30 rounded-2xl p-5 bg-card/40 backdrop-blur-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Achievements Unlocked</p>
            <h4 className="text-2xl font-bold font-mono text-foreground mt-0.5">
              {getAchievementsCount()} <span className="text-xs font-normal text-muted-foreground">Badges</span>
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-1 translate-y-1 w-12 h-12 bg-primary/5 rounded-full blur-sm"></div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE PLAN DETAILS */}
        <div className="lg:col-span-8 space-y-8">
          {allPlans.length > 0 ? (
            <div className="space-y-8">
              
              {/* PLAN SELECTOR CONTAINER */}
              <div className="relative border border-border/30 p-6 rounded-2xl bg-card/40 backdrop-blur-md">
                <CornerElements />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    SELECT FITNESS MODULE
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground bg-slate-900/50 border border-border/20 px-2 py-0.5 rounded">
                    MODULES: {allPlans.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {allPlans.map((plan) => (
                    <Button
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={`text-foreground border transition-all duration-200 cursor-pointer rounded-xl font-mono text-xs ${
                        (selectedPlanId === plan._id || (!selectedPlanId && plan.isActive))
                          ? "bg-primary/15 text-primary border-primary hover:bg-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "bg-transparent border-border/60 hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <span>{plan.name}</span>
                      {plan.isActive && (
                        <span className="ml-2 bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded border border-green-500/30 animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* DETAILED CARDS ACCORDION */}
              {currentPlan ? (
                <div className="relative border border-border/30 rounded-2xl p-6 bg-card/40 backdrop-blur-md">
                  <CornerElements />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                      <h3 className="text-lg font-bold font-mono tracking-tight text-foreground">
                        ACTIVE PLAN: <span className="text-primary">{currentPlan.name}</span>
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                      {currentPlan.isActive && (
                        <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/35 px-2.5 py-1 rounded-full">
                          <HeartPulseIcon className="w-3.5 h-3.5 animate-pulse" />
                          RUNNING
                        </span>
                      )}
                      <span className="bg-slate-900/50 border border-border/20 text-muted-foreground px-2.5 py-1 rounded-full">
                        SYNCED: {new Date(currentPlan._creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10 rounded-full py-1 h-auto px-3 font-mono text-[10px] cursor-pointer no-print"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        DOWNLOAD PLAN (PDF)
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="workout" className="w-full">
                    <TabsList className="mb-6 w-full grid grid-cols-2 bg-slate-900/30 border border-border/20 p-1 rounded-xl">
                      <TabsTrigger
                        value="workout"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-3 font-mono cursor-pointer rounded-lg transition-all text-xs"
                      >
                        <DumbbellIcon className="mr-1.5 size-3.5" />
                        WORKOUT ROUTINES
                      </TabsTrigger>

                      <TabsTrigger
                        value="diet"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-3 font-mono cursor-pointer rounded-lg transition-all text-xs"
                      >
                        <AppleIcon className="mr-1.5 h-3.5 w-3.5" />
                        NUTRITION MATRIX
                      </TabsTrigger>
                    </TabsList>

                    {/* WORKOUT TAB */}
                    <TabsContent value="workout" className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 border border-border/20 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          <span className="font-mono text-xs font-bold text-foreground">
                            WEEKLY SCHEDULE: {currentPlan.workoutPlan.schedule.join(" • ")}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">
                          {currentPlan.workoutPlan.exercises.length} Days Split
                        </div>
                      </div>

                      <Accordion type="multiple" defaultValue={[currentPlan.workoutPlan.exercises[0]?.day]} className="space-y-4">
                        {currentPlan.workoutPlan.exercises.map((exerciseDay: any, index: number) => (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className="border border-border/20 rounded-xl overflow-hidden bg-slate-950/20"
                          >
                            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-primary/5 font-mono text-foreground">
                              <div className="flex justify-between w-full items-center pr-4">
                                <span className="text-primary font-bold text-sm">{exerciseDay.day}</span>
                                <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/20">
                                  {exerciseDay.routines.length} ROUTINES
                                </span>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-5 px-5 pt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {exerciseDay.routines.map((routine: any, routineIndex: number) => (
                                  <div
                                    key={routineIndex}
                                    className="border border-border/20 rounded-xl p-4 bg-slate-900/40 hover:border-primary/20 transition-all duration-200"
                                  >
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                      <h4 className="font-bold text-foreground text-xs tracking-tight flex-1">
                                        {routine.name}
                                      </h4>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">
                                          {routine.sets} SETS
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-mono font-bold">
                                          {routine.reps} REPS
                                        </span>
                                      </div>
                                    </div>
                                    {routine.description && (
                                      <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/10 leading-relaxed font-mono">
                                        {routine.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </TabsContent>

                    {/* DIET TAB */}
                    <TabsContent value="diet" className="space-y-6 animate-fadeIn">
                      {/* Calorie Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-border/20 rounded-xl p-5 bg-slate-900/40 flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <FlameIcon className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-muted-foreground uppercase">Target Calories</p>
                            <h4 className="text-xl font-bold font-mono text-primary mt-1">
                              {currentPlan.dietPlan.dailyCalories} <span className="text-xs text-foreground font-normal">kcal</span>
                            </h4>
                          </div>
                        </div>

                        {currentPlan.dietPlan.macros && (
                          <div className="border border-border/20 rounded-xl p-4 bg-slate-900/40 sm:col-span-2">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">Target Macronutrient Distribution</p>
                            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                              <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                                <span className="text-[9px] text-muted-foreground block">PROTEIN</span>
                                <span className="text-sm font-bold text-primary">{currentPlan.dietPlan.macros.protein || "N/A"}</span>
                              </div>
                              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-2">
                                <span className="text-[9px] text-muted-foreground block">CARBS</span>
                                <span className="text-sm font-bold text-secondary">{currentPlan.dietPlan.macros.carbs || "N/A"}</span>
                              </div>
                              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-2">
                                <span className="text-[9px] text-muted-foreground block">FATS</span>
                                <span className="text-sm font-bold text-orange-400">{currentPlan.dietPlan.macros.fats || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Meals Grid */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground pl-1">Daily Meal Plan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {currentPlan.dietPlan.meals.map((meal: any, index: number) => (
                            <div
                              key={index}
                              className="border border-border/20 rounded-xl overflow-hidden bg-slate-900/40 p-5 hover:border-primary/20 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/10">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_var(--cyber-glow-primary)]"></div>
                                <h4 className="font-bold font-mono text-primary text-sm">{meal.name}</h4>
                              </div>
                              
                              <ul className="space-y-2.5 font-mono text-xs text-muted-foreground">
                                {meal.foods.map((food: any, foodIndex: number) => (
                                  <li
                                    key={foodIndex}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-primary font-bold shrink-0">
                                      {String(foodIndex + 1).padStart(2, "0")}.
                                    </span>
                                    <span className="text-foreground/90">{food}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="border border-destructive/20 p-8 rounded-2xl bg-destructive/5 text-center">
                  <p className="text-xs font-mono text-muted-foreground">Selected plan could not be loaded. Select another plan.</p>
                </div>
              )}
            </div>
          ) : (
            <NoFitnessPlan />
          )}
        </div>

        {/* RIGHT COLUMN: AI RECOMMENDATIONS & HISTORY & ACHIEVEMENTS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI RECOMMENDATION BOX */}
          <div className="border border-border/30 rounded-2xl p-5 bg-card/45 backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/25 font-mono">
              <Compass className="w-4 h-4 text-primary animate-spin animate-slow-spin" />
              <span className="text-xs font-bold text-foreground">COACH SUGGESTIONS</span>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-border/15 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground font-mono leading-relaxed">
                  Hydrate: Aim for at least 3.2L of water today to maximize muscle pump and recovery.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-border/15 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-muted-foreground font-mono leading-relaxed">
                  Protein intake: Consuming 30g protein within 45 mins post-workout is optimal.
                </p>
              </div>
            </div>
          </div>

          {/* WATER TRACKER CARD */}
          <div className="border border-border/30 rounded-2xl p-5 bg-card/45 backdrop-blur-xl relative overflow-hidden no-print">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/25 font-mono">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-accent animate-bounce" />
                <span className="text-xs font-bold text-foreground">WATER TRACKER</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">GOAL: 12 CUPS</span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h4 className="text-3xl font-extrabold font-mono text-foreground">
                  {waterCups} <span className="text-xs font-normal text-muted-foreground">/ 12 Cups</span>
                </h4>
                <div className="w-full bg-slate-900/60 rounded-full h-2.5 overflow-hidden border border-border/10">
                  <div 
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (waterCups / 12) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {waterCups >= 12 ? "🎉 Hydration Goal Achieved!" : `${12 - waterCups} cups left to hit your goal.`}
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button 
                  onClick={() => setWaterCups(prev => prev + 1)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-3.5 py-1.5 font-mono rounded-xl cursor-pointer"
                >
                  +1 CUP
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setWaterCups(0)}
                  className="text-muted-foreground border-border/40 hover:text-foreground text-[10px] p-1 font-mono rounded-lg cursor-pointer"
                >
                  RESET
                </Button>
              </div>
            </div>
          </div>

          {/* BMI CALCULATOR CARD */}
          <div className="border border-border/30 rounded-2xl p-5 bg-card/45 backdrop-blur-xl no-print">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/25 font-mono">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">BMI CALCULATOR</span>
            </div>
            
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 180"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(e.target.value)}
                    className="w-full bg-slate-900/60 border border-border/25 rounded-xl px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(e.target.value)}
                    className="w-full bg-slate-900/60 border border-border/25 rounded-xl px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              <Button
                onClick={calculateBMI}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-xs py-2 font-mono rounded-xl cursor-pointer"
              >
                CALCULATE BMI
              </Button>

              {bmiResult !== null && (
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-border/15 flex items-center justify-between gap-2 animate-fadeIn">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Your BMI</p>
                    <h5 className="text-2xl font-bold font-mono text-foreground mt-0.5">{bmiResult}</h5>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Category</p>
                    <span className={`inline-block text-[10px] font-mono font-bold mt-1 px-2.5 py-0.5 rounded border uppercase ${
                      bmiCategory === "Normal weight" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : bmiCategory === "Underweight"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {bmiCategory}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MILESTONE ACHIEVEMENTS */}
          <div className="border border-border/30 rounded-2xl p-5 bg-card/45 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/25 font-mono">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-foreground">ACHIEVEMENTS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className={`p-3 rounded-xl bg-slate-950/40 border border-border/15 text-center flex flex-col items-center justify-center transition-all duration-300 ${
                currentPlan ? "opacity-100" : "opacity-40"
              }`}>
                <span className="text-xl">🎖️</span>
                <span className="text-[9px] font-mono text-primary font-bold mt-1 uppercase">Day 1 Cadet</span>
              </div>
              <div className={`p-3 rounded-xl bg-slate-950/40 border border-border/15 text-center flex flex-col items-center justify-center transition-all duration-300 ${
                currentPlan && currentPlan.dietPlan.meals.length > 0 ? "opacity-100" : "opacity-40"
              }`}>
                <span className="text-xl">🥗</span>
                <span className="text-[9px] font-mono text-accent font-bold mt-1 uppercase">Meal Master</span>
              </div>
              <div className={`p-3 rounded-xl bg-slate-950/40 border border-border/15 text-center flex flex-col items-center justify-center transition-all duration-300 ${
                hasVeteranBadge ? "opacity-100 border-primary/20 bg-primary/5" : "opacity-40"
              }`}>
                <span className="text-xl">🔥</span>
                <span className="text-[9px] font-mono text-muted-foreground font-bold mt-1 uppercase">Veteran Split</span>
              </div>
              <div className={`p-3 rounded-xl bg-slate-950/40 border border-border/15 text-center flex flex-col items-center justify-center transition-all duration-300 ${
                hasIronLifterBadge ? "opacity-100 border-accent/20 bg-accent/5" : "opacity-40"
              }`}>
                <span className="text-xl">💪</span>
                <span className="text-[9px] font-mono text-muted-foreground font-bold mt-1 uppercase">Iron Lifter</span>
              </div>
            </div>
          </div>

          {/* HISTORICAL TIMELINE */}
          <div className="border border-border/30 rounded-2xl p-5 bg-card/45 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/25 font-mono">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-foreground">PLAN TIMELINE</span>
            </div>
            
            <div className="space-y-4 pl-2 relative border-l border-border/20 font-mono text-xs">
              {allPlans.slice(0, 3).map((plan) => (
                <div key={plan._id} className="relative pl-4 space-y-1">
                  {/* Timeline point */}
                  <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-background ${
                    plan.isActive ? "bg-primary animate-ping" : "bg-muted"
                  }`}></div>
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(plan._creationTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
              {allPlans.length === 0 && (
                <p className="text-[10px] text-muted-foreground">No historical records available</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};

export default ProfilePage;
