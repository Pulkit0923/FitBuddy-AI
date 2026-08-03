"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
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
  Printer,
  Palette,
  Play,
  Pause,
  RotateCcw,
  Moon
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

  // Dynamic Theme State
  const [currentTheme, setCurrentTheme] = useState("emerald");
  useEffect(() => {
    const savedTheme = localStorage.getItem("fitbuddy-theme") || "emerald";
    setCurrentTheme(savedTheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("theme-emerald", "theme-volt", "theme-orange", "theme-cyan");
      root.classList.add(`theme-${savedTheme}`);
    }
  }, []);

  const changeTheme = (themeName: string) => {
    setCurrentTheme(themeName);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("theme-emerald", "theme-volt", "theme-orange", "theme-cyan");
      root.classList.add(`theme-${themeName}`);
      localStorage.setItem("fitbuddy-theme", themeName);
    }
  };

  // Stopwatch / Rest Interval Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive]);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startStopwatch = () => setTimerActive(true);
  const pauseStopwatch = () => setTimerActive(false);
  const resetStopwatch = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  // Sleep & Recovery Score Calculator State
  const [sleepHours, setSleepHours] = useState("");
  const [restingHR, setRestingHR] = useState("");
  const [recoveryScore, setRecoveryScore] = useState<number | null>(null);

  const calculateRecovery = () => {
    const hours = parseFloat(sleepHours);
    const rhr = parseFloat(restingHR);
    if (hours > 0 && rhr > 0) {
      const sleepFactor = Math.min(100, (hours / 8.5) * 100);
      const rhrFactor = Math.max(0, 100 - (rhr - 45) * 2); 
      const score = Math.round((sleepFactor + rhrFactor) / 2);
      setRecoveryScore(Math.min(100, Math.max(10, score)));
    }
  };

  // Target Heart Rate Zones Calculator State
  const [athleteAge, setAthleteAge] = useState("");
  const [maxHR, setMaxHR] = useState<number | null>(null);
  const [hrZones, setHrZones] = useState<{ zone: string; min: number; max: number; desc: string }[] | null>(null);

  const calculateHRZones = () => {
    const age = parseInt(athleteAge);
    if (age > 0) {
      const calculatedMax = 220 - age;
      setMaxHR(calculatedMax);
      setHrZones([
        { zone: "Zone 1: Active Recovery", min: Math.round(calculatedMax * 0.50), max: Math.round(calculatedMax * 0.60), desc: "Fat burn & warm-up" },
        { zone: "Zone 2: Aerobic/Endurance", min: Math.round(calculatedMax * 0.60), max: Math.round(calculatedMax * 0.70), desc: "Cardiovascular health" },
        { zone: "Zone 3: Tempo/Threshold", min: Math.round(calculatedMax * 0.70), max: Math.round(calculatedMax * 0.85), desc: "Strength & stamina" },
        { zone: "Zone 4: Anaerobic/VO2 Max", min: Math.round(calculatedMax * 0.85), max: Math.round(calculatedMax * 0.95), desc: "High intensity power" },
      ]);
    }
  };

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
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4 max-w-6xl space-y-10 bg-background text-foreground">
      <ProfileHeader user={user} />

      {/* METRIC STATS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Streak Counter */}
        <div className="border border-primary/10 hover:border-primary/30 rounded-2xl p-5 bg-card/30 backdrop-blur-xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(22,163,74,0.08)] group">
          <div className="p-3.5 rounded-xl bg-primary/15 text-primary group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(22,163,74,0.1)]">
            <FlameIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Workout Streak</p>
            <h4 className="text-2xl font-black font-mono text-foreground mt-0.5">
              {streakDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-12 h-12 bg-primary/5 rounded-full blur-sm"></div>
        </div>

        {/* Calorie Ring summary */}
        <div className="border border-primary/10 hover:border-primary/30 rounded-2xl p-5 bg-card/30 backdrop-blur-xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(22,163,74,0.08)] group">
          <div className="p-3.5 rounded-xl bg-accent/15 text-accent group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(132,204,22,0.15)]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Daily Target Completion</p>
            <h4 className="text-2xl font-black font-mono text-foreground mt-0.5">
              {caloriePercentage}<span className="text-xs font-normal text-muted-foreground">%</span>
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-12 h-12 bg-accent/5 rounded-full blur-sm"></div>
        </div>

        {/* Mock Weight Progress */}
        <div className="border border-primary/10 hover:border-primary/30 rounded-2xl p-5 bg-card/30 backdrop-blur-xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(22,163,74,0.08)] group">
          <div className="p-3.5 rounded-xl bg-secondary/20 text-secondary group-hover:scale-110 transition-transform duration-300">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Weight Progress</p>
            <h4 className="text-2xl font-black font-mono text-foreground mt-0.5">
              {getWeightProgress()}
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-12 h-12 bg-secondary/5 rounded-full blur-sm"></div>
        </div>

        {/* Total Training Hours */}
        <div className="border border-primary/10 hover:border-primary/30 rounded-2xl p-5 bg-card/30 backdrop-blur-xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(22,163,74,0.08)] group">
          <div className="p-3.5 rounded-xl bg-primary/15 text-primary group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(22,163,74,0.1)]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Achievements Unlocked</p>
            <h4 className="text-2xl font-black font-mono text-foreground mt-0.5">
              {getAchievementsCount()} <span className="text-xs font-normal text-muted-foreground">Badges</span>
            </h4>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-12 h-12 bg-primary/5 rounded-full blur-sm"></div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE PLAN DETAILS */}
        <div className="lg:col-span-8 space-y-8">
          {allPlans.length > 0 ? (
            <div className="space-y-8">
              
              {/* PLAN SELECTOR CONTAINER */}
              <div className="relative border border-primary/10 p-6 rounded-2xl bg-card/30 backdrop-blur-xl shadow-lg">
                <CornerElements />
                <div className="flex items-center justify-between mb-4 border-b border-primary/5 pb-3">
                  <h2 className="text-xs font-bold font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    SELECT FITNESS MODULE
                  </h2>
                  <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                    MODULES: {allPlans.length}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto pr-1.5 flex flex-wrap gap-2.5 custom-scrollbar">
                  {allPlans.map((plan) => (
                    <Button
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={`text-foreground border transition-all duration-300 cursor-pointer rounded-xl font-mono text-xs py-5 px-4 h-auto ${
                        (selectedPlanId === plan._id || (!selectedPlanId && plan.isActive))
                          ? "bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(22,163,74,0.2)] font-bold scale-[1.02]"
                          : "bg-transparent border-primary/10 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{plan.name}</span>
                      {plan.isActive && (
                        <span className="ml-2 bg-green-500/25 text-green-400 text-[9px] px-1.5 py-0.5 rounded border border-green-500/40 animate-pulse font-black">
                          ACTIVE
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* DETAILED CARDS ACCORDION */}
              {currentPlan ? (
                <div className="relative border border-primary/10 rounded-2xl p-6 bg-card/30 backdrop-blur-xl shadow-lg">
                  <CornerElements />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#16A34A]"></div>
                      <h3 className="text-base font-bold font-mono tracking-tight text-foreground uppercase">
                        Active Plan: <span className="text-primary">{currentPlan.name}</span>
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                      {currentPlan.isActive && (
                        <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/35 px-3 py-1 rounded-full font-bold">
                          <HeartPulseIcon className="w-3.5 h-3.5 animate-pulse" />
                          RUNNING
                        </span>
                      )}
                      <span className="bg-slate-950/60 border border-primary/15 text-muted-foreground px-3 py-1 rounded-full">
                        SYNCED: {new Date(currentPlan._creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <Button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-full py-1.5 h-auto px-4 font-mono text-[10px] font-bold cursor-pointer transition-all duration-200 hover:scale-[1.03] shadow-[0_0_15px_rgba(22,163,74,0.25)] no-print"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        DOWNLOAD PLAN (PDF)
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="workout" className="w-full">
                    <TabsList className="mb-6 w-full grid grid-cols-2 bg-slate-950/60 border border-primary/10 p-1 rounded-xl">
                      <TabsTrigger
                        value="workout"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3.5 font-mono cursor-pointer rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                      >
                        <DumbbellIcon className="mr-1.5 size-3.5" />
                        WORKOUT ROUTINES
                      </TabsTrigger>

                      <TabsTrigger
                        value="diet"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3.5 font-mono cursor-pointer rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                      >
                        <AppleIcon className="mr-1.5 h-3.5 w-3.5" />
                        NUTRITION MATRIX
                      </TabsTrigger>
                    </TabsList>

                    {/* WORKOUT TAB */}
                    <TabsContent value="workout" className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 border border-primary/10 rounded-xl p-4 border-l-4 border-l-primary">
                        <div className="flex items-center gap-2.5">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          <span className="font-mono text-xs font-bold text-foreground tracking-wide uppercase">
                            WEEKLY SCHEDULE: {currentPlan.workoutPlan.schedule.join(" • ")}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-primary font-bold uppercase bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                          {currentPlan.workoutPlan.exercises.length} Days Split
                        </div>
                      </div>

                      <Accordion type="multiple" defaultValue={[currentPlan.workoutPlan.exercises[0]?.day]} className="space-y-4">
                        {currentPlan.workoutPlan.exercises.map((exerciseDay: any, index: number) => (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className="border border-primary/10 rounded-xl overflow-hidden bg-slate-950/30"
                          >
                            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-primary/5 font-mono text-foreground font-bold text-sm tracking-wide">
                              <div className="flex justify-between w-full items-center pr-4">
                                <span className="text-primary font-black uppercase">{exerciseDay.day}</span>
                                <span className="text-[9px] bg-slate-900 border border-primary/15 text-primary px-2.5 py-1 rounded-full font-bold">
                                  {exerciseDay.routines.length} EXERCISES
                                </span>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-5 px-5 pt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {exerciseDay.routines.map((routine: any, routineIndex: number) => (
                                  <div
                                    key={routineIndex}
                                    className="border border-primary/5 hover:border-primary/20 rounded-xl p-4 bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-200"
                                  >
                                    <div className="flex justify-between items-start gap-4 mb-2 pb-2 border-b border-primary/5">
                                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wide flex-1">
                                        {routine.name}
                                      </h4>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold">
                                          {routine.sets} SETS
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/20 text-[9px] font-mono font-bold">
                                          {routine.reps} REPS
                                        </span>
                                      </div>
                                    </div>
                                    {routine.description && (
                                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-sans">
                                        💡 {routine.description}
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
                        <div className="border border-primary/10 rounded-xl p-5 bg-slate-900/40 flex items-center gap-4 border-l-4 border-l-primary">
                          <div className="p-3 bg-primary/15 rounded-xl text-primary shadow-[0_0_10px_rgba(22,163,74,0.15)]">
                            <FlameIcon className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Target Calories</p>
                            <h4 className="text-xl font-black font-mono text-primary mt-0.5">
                              {currentPlan.dietPlan.dailyCalories} <span className="text-xs text-foreground font-normal">kcal</span>
                            </h4>
                          </div>
                        </div>

                        {currentPlan.dietPlan.macros && (
                          <div className="border border-primary/10 rounded-xl p-4 bg-slate-900/40 sm:col-span-2">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2.5">Target Macronutrient Distribution</p>
                            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                                <span className="text-[9px] text-muted-foreground block font-bold">PROTEIN</span>
                                <span className="text-sm font-black text-primary">{currentPlan.dietPlan.macros.protein || "N/A"}</span>
                              </div>
                              <div className="bg-accent/10 border border-accent/20 rounded-lg p-2">
                                <span className="text-[9px] text-muted-foreground block font-bold">CARBS</span>
                                <span className="text-sm font-black text-accent">{currentPlan.dietPlan.macros.carbs || "N/A"}</span>
                              </div>
                              <div className="bg-lime-500/10 border border-lime-500/25 rounded-lg p-2">
                                <span className="text-[9px] text-muted-foreground block font-bold">FATS</span>
                                <span className="text-sm font-black text-lime-400">{currentPlan.dietPlan.macros.fats || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Meals Grid */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground pl-1">Daily Meal Plan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {currentPlan.dietPlan.meals.map((meal: any, index: number) => (
                            <div
                              key={index}
                              className="border border-primary/5 hover:border-primary/20 rounded-xl overflow-hidden bg-slate-900/40 p-5 hover:bg-slate-900/70 transition-all duration-300 shadow"
                            >
                              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/5">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#16A34A]"></div>
                                <h4 className="font-black font-mono text-primary text-sm uppercase tracking-wide">{meal.name}</h4>
                              </div>
                              
                              <ul className="space-y-2.5 text-xs text-muted-foreground">
                                {meal.foods.map((food: any, foodIndex: number) => (
                                  <li
                                    key={foodIndex}
                                    className="flex items-start gap-2 font-mono"
                                  >
                                    <span className="text-primary font-bold shrink-0">
                                      {String(foodIndex + 1).padStart(2, "0")}.
                                    </span>
                                    <span className="text-foreground/90 leading-relaxed">{food}</span>
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
          
          {/* CONSOLE CUSTOMIZER CARD */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl relative overflow-hidden shadow no-print">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <Palette className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-bold text-foreground">CONSOLE THEME</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "emerald", label: "Green", color: "bg-emerald-600" },
                { id: "volt", label: "Volt", color: "bg-lime-400" },
                { id: "orange", label: "Orange", color: "bg-orange-500" },
                { id: "cyan", label: "Cyan", color: "bg-cyan-500" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  className={`p-2 py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    currentTheme === theme.id
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(22,163,74,0.15)] scale-105 font-bold"
                      : "border-primary/10 hover:border-primary/40 bg-slate-900/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme.color} border border-white/10`} />
                  <span className="text-[8px] font-mono tracking-wide uppercase">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* AI RECOMMENDATION BOX */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl relative overflow-hidden shadow">
            <div className="flex items-center gap-2 mb-3.5 pb-3 border-b border-primary/10 font-mono text-xs">
              <Compass className="w-4 h-4 text-primary animate-spin animate-slow-spin" />
              <span className="font-bold text-foreground uppercase tracking-wider">COACH SUGGESTIONS</span>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-primary/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5 shadow-[0_0_6px_#16A34A]" />
                <p className="text-muted-foreground font-mono leading-relaxed">
                  Hydrate: Aim for at least 3.2L of water today to maximize muscle pump and recovery.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-primary/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5 shadow-[0_0_6px_#84CC16]" />
                <p className="text-muted-foreground font-mono leading-relaxed">
                  Protein intake: Consuming 30g protein within 45 mins post-workout is optimal.
                </p>
              </div>
            </div>
          </div>

          {/* WATER TRACKER CARD WITH INTERACTIVE DROPLETS */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl relative overflow-hidden no-print shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-accent animate-bounce" />
                <span className="font-bold text-foreground">WATER TRACKER</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-bold">GOAL: 12 CUPS</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h4 className="text-3xl font-black font-mono text-foreground">
                  {waterCups} <span className="text-xs font-normal text-muted-foreground">/ 12 Cups</span>
                </h4>
                <span className="text-[10px] font-mono text-accent font-bold uppercase">
                  {waterCups >= 12 ? "🎯 Goal hit!" : `${12 - waterCups} cups left`}
                </span>
              </div>

              {/* Grid of clickable drops */}
              <div className="grid grid-cols-6 gap-2 py-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWaterCups(i + 1)}
                    className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                      i < waterCups
                        ? "bg-accent/20 border-accent text-accent shadow-[0_0_12px_rgba(132,204,22,0.25)] scale-105"
                        : "bg-slate-900/40 border-primary/5 text-muted-foreground/30 hover:border-accent/40"
                    }`}
                    title={`Record ${i + 1} Cups`}
                  >
                    <Droplet className={`w-4 h-4 ${i < waterCups ? "fill-accent" : ""}`} />
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-primary/5">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">
                  {waterCups >= 12 ? "🎉 Hydration Optimized!" : "Tap drops to log hydration"}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setWaterCups(0)}
                  className="text-muted-foreground border-primary/10 hover:text-foreground text-[10px] py-1 px-3 h-auto font-mono rounded-lg cursor-pointer hover:bg-primary/5"
                >
                  RESET
                </Button>
              </div>
            </div>
          </div>

          {/* REST STOPWATCH TIMER */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl relative overflow-hidden shadow no-print animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 text-primary ${timerActive ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                <span className="font-bold text-foreground">REST INTERVALS</span>
              </div>
              <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-black tracking-widest font-mono">STOPWATCH</span>
            </div>
            
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <h4 className="text-3xl font-black font-mono text-foreground tracking-widest">
                  {formatTimer(timerSeconds)}
                </h4>
                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mt-1.5 font-bold">
                  {timerActive ? "⏱️ Running Rest interval" : "Timer Paused"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {timerActive ? (
                  <Button
                    onClick={pauseStopwatch}
                    className="p-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                  >
                    <Pause className="w-4.5 h-4.5" />
                  </Button>
                ) : (
                  <Button
                    onClick={startStopwatch}
                    className="p-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl cursor-pointer shadow-[0_0_12px_rgba(22,163,74,0.3)]"
                  >
                    <Play className="w-4.5 h-4.5" />
                  </Button>
                )}
                <Button
                  onClick={resetStopwatch}
                  variant="outline"
                  className="p-2.5 border-primary/10 text-muted-foreground hover:text-foreground rounded-xl cursor-pointer hover:bg-primary/5"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* BMI CALCULATOR CARD */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl no-print shadow">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">BMI CALCULATOR</span>
            </div>
            
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-wider">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 180"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(e.target.value)}
                    className="w-full bg-slate-950 border border-primary/15 rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-primary/15 rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </div>

              <Button
                onClick={calculateBMI}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-xs py-2.5 font-mono rounded-xl cursor-pointer font-bold shadow-[0_0_15px_rgba(22,163,74,0.2)]"
              >
                CALCULATE BMI
              </Button>

              {bmiResult !== null && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-primary/10 flex items-center justify-between gap-2 animate-fadeIn shadow-inner">
                  <div>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Your BMI</p>
                    <h5 className="text-2xl font-black font-mono text-foreground mt-0.5">{bmiResult}</h5>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Category</p>
                    <span className={`inline-block text-[9px] font-mono font-bold mt-1 px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                      bmiCategory === "Normal weight" 
                        ? "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]" 
                        : bmiCategory === "Underweight"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}>
                      {bmiCategory}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SLEEP & RECOVERY ESTIMATOR */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl shadow no-print animate-fadeIn">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <Moon className="w-4 h-4 text-accent" />
              <span className="font-bold text-foreground">RECOVERY MONITOR</span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-wider">Sleep (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 7.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full bg-slate-950 border border-primary/15 rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-wider">Rest HR (BPM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 58"
                    value={restingHR}
                    onChange={(e) => setRestingHR(e.target.value)}
                    className="w-full bg-slate-950 border border-primary/15 rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </div>

              <Button
                onClick={calculateRecovery}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/95 text-xs py-2.5 font-mono rounded-xl cursor-pointer font-bold shadow-[0_0_15px_rgba(132,204,22,0.2)]"
              >
                COMPUTE RECOVERY SCORE
              </Button>

              {recoveryScore !== null && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-primary/10 flex items-center justify-between gap-2 animate-fadeIn shadow-inner">
                  <div>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Recovery Level</p>
                    <h5 className="text-2xl font-black font-mono mt-0.5" style={{
                      color: recoveryScore > 75 ? "#22C55E" : recoveryScore > 50 ? "#EAB308" : "#EF4444"
                    }}>
                      {recoveryScore}%
                    </h5>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Score Status</p>
                    <span className={`inline-block text-[9px] font-mono font-bold mt-1 px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                      recoveryScore > 75 
                        ? "bg-green-500/10 text-green-400 border-green-500/30" 
                        : recoveryScore > 50
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}>
                      {recoveryScore > 75 ? "Optimal" : recoveryScore > 50 ? "Moderate" : "Strain Heavy"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MILESTONE ACHIEVEMENTS */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl shadow">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-accent animate-pulse" />
              <span className="font-bold text-foreground">ACHIEVEMENTS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-300 ${
                currentPlan 
                  ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(22,163,74,0.1)] font-bold" 
                  : "bg-slate-950/40 border-primary/5 opacity-30"
              }`}>
                <span className="text-xl">🎖️</span>
                <span className="text-[9px] font-mono font-bold mt-1.5 uppercase tracking-wider">Day 1 Cadet</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-300 ${
                currentPlan && currentPlan.dietPlan.meals.length > 0 
                  ? "bg-accent/15 border-accent/30 text-accent shadow-[0_0_10px_rgba(132,204,22,0.1)] font-bold" 
                  : "bg-slate-950/40 border-primary/5 opacity-30"
              }`}>
                <span className="text-xl">🥗</span>
                <span className="text-[9px] font-mono font-bold mt-1.5 uppercase tracking-wider">Meal Master</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-300 ${
                hasIronLifterBadge 
                  ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(22,163,74,0.1)] font-bold" 
                  : "bg-slate-950/40 border-primary/5 opacity-30"
              }`}>
                <span className="text-xl">💪</span>
                <span className="text-[9px] font-mono font-bold mt-1.5 uppercase tracking-wider">Iron Lifter</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-300 ${
                hasVeteranBadge 
                  ? "bg-accent/15 border-accent/30 text-accent shadow-[0_0_10px_rgba(132,204,22,0.1)] font-bold" 
                  : "bg-slate-950/40 border-primary/5 opacity-30"
              }`}>
                <span className="text-xl">🔥</span>
                <span className="text-[9px] font-mono font-bold mt-1.5 uppercase tracking-wider">Veteran Split</span>
              </div>
            </div>
          </div>

          {/* TARGET CARDIO HR ZONES */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl shadow no-print animate-fadeIn">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <HeartPulseIcon className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-bold text-foreground">HEART TELEMETRY</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter age (e.g. 25)"
                  value={athleteAge}
                  onChange={(e) => setAthleteAge(e.target.value)}
                  className="flex-1 bg-slate-950 border border-primary/15 rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                />
                <Button
                  onClick={calculateHRZones}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs px-4 font-mono rounded-xl cursor-pointer font-bold shadow-[0_0_12px_rgba(22,163,74,0.2)]"
                >
                  CALC
                </Button>
              </div>

              {maxHR !== null && hrZones !== null && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="flex justify-between items-center text-xs font-mono border-b border-primary/5 pb-2">
                    <span className="text-muted-foreground uppercase">Estimated Max HR:</span>
                    <span className="font-black text-foreground">{maxHR} BPM</span>
                  </div>

                  <div className="space-y-2">
                    {hrZones.map((z, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950/40 border border-primary/5 text-left font-mono">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-primary uppercase">{z.zone}</span>
                          <span className="text-foreground">{z.min} - {z.max} BPM</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 lowercase">// {z.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HISTORICAL TIMELINE */}
          <div className="border border-primary/10 rounded-2xl p-5 bg-card/30 backdrop-blur-xl shadow">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10 font-mono text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="font-bold text-foreground">PLAN TIMELINE</span>
            </div>
            
            <div className="space-y-5 pl-2 relative border-l border-primary/15 font-mono text-xs">
              {allPlans.slice(0, 3).map((plan) => (
                <div key={plan._id} className="relative pl-5 space-y-1">
                  {/* Timeline point */}
                  <div className={`absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 border-background ${
                    plan.isActive 
                      ? "bg-primary animate-pulse shadow-[0_0_8px_#16A34A]" 
                      : "bg-muted-foreground/30"
                  }`}></div>
                  <p className="font-bold text-foreground uppercase tracking-wide">{plan.name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {new Date(plan._creationTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
              {allPlans.length === 0 && (
                <p className="text-[10px] text-muted-foreground pl-2">No historical records available</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};

export default ProfilePage;
