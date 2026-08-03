"use client";

import { Button } from "@/components/ui/button";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Phone, PhoneOff, Shield, AudioLines } from "lucide-react";

const GenerateProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  // Tab and manual form states
  const [activeTab, setActiveTab] = useState<"voice" | "manual">("voice");
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    injuries: "",
    workout_days: "3",
    fitness_goal: "Muscle gain",
    fitness_level: "Intermediate",
    dietary_restrictions: "Indian diet, High protein",
    workout_setup: "Gym Workouts"
  });
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { user } = useUser();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // SOLUTION to get rid of "Meeting has ended" and "Krisp processor" errors
  useEffect(() => {
    const originalError = console.error;
    console.error = function (msg, ...args) {
      const msgStr = typeof msg === "string" ? msg : (msg?.toString() || "");
      const argStr = args[0] ? args[0].toString() : "";

      const shouldIgnore =
        msgStr.includes("Meeting has ended") ||
        msgStr.includes("Error unloading krisp processor") ||
        msgStr.includes("WASM_OR_WORKER_NOT_READY") ||
        msgStr.includes("error applying mic processor") ||
        msgStr.includes("didInitError") ||
        argStr.includes("Meeting has ended") ||
        argStr.includes("Error unloading krisp processor") ||
        argStr.includes("WASM_OR_WORKER_NOT_READY") ||
        argStr.includes("error applying mic processor") ||
        argStr.includes("didInitError");

      if (shouldIgnore) {
        console.log("Ignoring known error:", msgStr || argStr);
        return;
      }
      return originalError.call(console, msg, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // navigate user to profile page after the call ends
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 2500);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  // setup event listeners for vapi
  useEffect(() => {
    const handleCallStart = () => {
      console.log("Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      console.log("AI started Speaking");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("AI stopped Speaking");
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.log("Vapi Error", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
      return;
    }

    try {
      setConnecting(true);
      setMessages([]);
      setCallEnded(false);
      setErrorMsg("");

      const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Guest";

      const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(".cloud", ".site") + "/vapi/generate-program";

      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          full_name: fullName,
          user_id: user?.id || "guest_user",
        },
        serverUrl: convexSiteUrl,
        backgroundSpeechDenoisingPlan: {
          smartDenoisingPlan: {
            enabled: false
          }
        }
      } as any);
    } catch (error: any) {
      console.warn("Failed to start call:", error);
      setErrorMsg(error.message || "Failed to establish voice call connection. Please try again.");
      setConnecting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setErrorMsg("");

    try {
      const siteUrl = "/api/generate-program";
      const finalGoal = `${formData.fitness_goal} (${formData.workout_setup})`;
      
      const payload = {
        user_id: user?.id || "guest_user",
        age: formData.age || "25",
        height: formData.height || "175 cm",
        weight: formData.weight || "70 kg",
        injuries: formData.injuries || "None",
        workout_days: formData.workout_days,
        fitness_goal: finalGoal,
        fitness_level: formData.fitness_level,
        dietary_restrictions: formData.dietary_restrictions
      };

      const response = await fetch(siteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        router.push("/profile");
      } else {
        setErrorMsg(data.error || "Failed to formulate plan. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error. Ensure your server is active.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-12 pt-28 bg-background relative">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 h-full max-w-4xl relative z-10 flex-grow flex flex-col justify-between">
        
        {/* Title Block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Fitness Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-foreground">
            CONSULT <span className="text-primary">FITBUDDY AI</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            Choose voice call consultation or specify your exact fitness metrics and dietary choices below.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-950/60 border border-primary/10 p-1 rounded-2xl flex gap-1.5 w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex-1 py-3 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all duration-300 ${
                activeTab === "voice"
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              }`}
            >
              🎙️ AI VOICE COACH
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-3 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all duration-300 ${
                activeTab === "manual"
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              }`}
            >
              ⚙️ PREFERENCES FORM
            </button>
          </div>
        </div>

        {activeTab === "voice" ? (
          <div className="flex-grow flex flex-col justify-between">
            {/* HOLOGRAM CORE CONTAINER */}
            <div className="flex-grow flex flex-col items-center justify-center py-6">
              <div className="relative flex flex-col items-center justify-center">
                
                {/* Pulsing Backlit rings */}
                <div className={`absolute w-72 h-72 rounded-full border border-primary/20 transition-all duration-700 scale-100 ${
                  isSpeaking ? "animate-pulse-slow border-primary/45 bg-primary/5 shadow-[0_0_60px_rgba(22,163,74,0.25)]" : ""
                }`}></div>
                <div className={`absolute w-96 h-96 rounded-full border border-accent/10 transition-all duration-700 scale-100 ${
                  isSpeaking ? "animate-pulse-slow border-accent/25 shadow-[0_0_90px_rgba(132,204,22,0.15)]" : ""
                }`} style={{ animationDelay: "1s" }}></div>

                {/* Glowing Orb Hologram (Avatar) */}
                <div className="relative w-48 h-48 rounded-full border border-primary/30 p-2 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-accent/30 to-secondary/30 animate-slow-spin"></div>
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border border-primary/20 flex items-center justify-center relative z-10">
                    <img
                      src="/fitbuddy-orb.png"
                      alt="FitBuddy Orb Hologram"
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isSpeaking ? "scale-105 saturate-125" : "scale-100 opacity-90"
                      }`}
                    />
                    
                    {/* Simulated scan overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/10 to-transparent animate-scanline pointer-events-none" />
                  </div>
                </div>

                {/* Voice bounce wave lines */}
                <div className="h-10 flex items-center justify-center gap-1.5 mt-8 w-60">
                  {isSpeaking ? (
                    [...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-gradient-to-t from-primary to-accent animate-sound-wave animate-float"
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))
                  ) : callActive ? (
                    <div className="text-xs font-mono text-primary uppercase tracking-widest flex items-center gap-1.5 font-bold animate-pulse">
                      <AudioLines className="w-4 h-4 text-primary" />
                      <span>Listening... speak now</span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-semibold bg-slate-950/40 border border-primary/5 px-3 py-1 rounded-full">
                      Assistant Offline
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {errorMsg && (
              <div className="w-full max-w-2xl mx-auto mb-4 bg-destructive/10 border border-destructive/25 text-destructive text-xs font-mono p-4 rounded-2xl text-center shadow-[0_4px_12px_rgba(239,68,68,0.15)] animate-fadeIn">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* DYNAMIC TRANSCRIPT DRAWER */}
            <div className="w-full max-w-2xl mx-auto mb-6">
              {messages.length > 0 ? (
                <div
                  ref={messageContainerRef}
                  className="w-full bg-slate-900/40 backdrop-blur border border-primary/10 rounded-2xl p-5 h-48 overflow-y-auto shadow-inner transition-all duration-300 scroll-smooth space-y-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.role === "assistant" ? "items-start" : "items-end"
                      } animate-fadeIn`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                          msg.role === "assistant" ? "text-primary" : "text-accent"
                        }`}>
                          {msg.role === "assistant" ? "FitBuddy AI" : "You"}
                        </span>
                      </div>
                      <div className={`max-w-[85%] rounded-2xl px-4.5 py-2.5 text-xs ${
                        msg.role === "assistant"
                          ? "bg-slate-950/70 border border-primary/10 text-foreground rounded-tl-none font-sans leading-relaxed"
                          : "bg-primary text-primary-foreground rounded-tr-none font-mono font-medium shadow-[0_0_10px_rgba(22,163,74,0.15)]"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {callEnded && (
                    <div className="flex flex-col items-center justify-center py-4 text-center animate-fadeIn">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping mb-2 shadow-[0_0_6px_#16A34A]"></div>
                      <p className="text-xs font-mono text-primary uppercase tracking-wider font-bold">
                        Plan generated successfully! Syncing to profile...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                callActive && (
                  <div className="w-full bg-slate-900/20 border border-primary/10 rounded-2xl p-6 text-center text-xs font-mono text-muted-foreground animate-pulse">
                    Introduce yourself and tell the coach your physical stats, gym goal, schedule, and diet targets.
                  </div>
                )
              )}
            </div>

            {/* FLOATING ACTION CONTROL BAR */}
            <div className="w-full max-w-md mx-auto flex items-center justify-center gap-4">
              {/* User profile float avatar */}
              {user && (
                <div className="bg-slate-900/60 border border-primary/10 backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <img src={user.imageUrl} alt="User profile" className="w-5 h-5 rounded-full object-cover border border-primary/30" />
                  <span className="font-bold text-foreground">{user.firstName}</span>
                </div>
              )}

              <Button
                className={`h-14 px-8 rounded-2xl font-mono text-xs tracking-wider cursor-pointer font-bold shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] uppercase ${
                  callActive
                    ? "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : connecting
                      ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20 shadow-[0_0_20px_rgba(22,163,74,0.25)]"
                }`}
                onClick={toggleCall}
                disabled={connecting || callEnded}
              >
                {callActive ? (
                  <span className="flex items-center gap-2">
                    <PhoneOff className="w-4 h-4" />
                    END CONVERSATION
                  </span>
                ) : connecting ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    INITIALIZING CORE...
                  </span>
                ) : callEnded ? (
                  <span className="flex items-center gap-2">
                    PLAN SYNCHRONIZED
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary-foreground animate-bounce" />
                    START VOICE CALL
                  </span>
                )}
              </Button>

              <div className="bg-slate-900/60 border border-primary/10 backdrop-blur-md rounded-full p-2.5 flex items-center justify-center text-muted-foreground">
                <Shield className="w-4.5 h-4.5 text-primary" />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="w-full max-w-2xl mx-auto border border-primary/10 rounded-2xl p-8 bg-card/30 backdrop-blur-xl space-y-6 animate-fadeIn shadow-xl">
            <h3 className="text-sm font-bold font-mono text-foreground border-b border-primary/10 pb-4 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              DEFINE FITBUDDY MATRICES
            </h3>

            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/25 text-destructive text-xs font-mono p-3.5 rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-4 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider">Height</label>
                <input
                  type="text"
                  placeholder="e.g. 180 cm"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-4 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider">Weight</label>
                <input
                  type="text"
                  placeholder="e.g. 75 kg"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-4 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider block">Goal Matrix</label>
                <select
                  value={formData.fitness_goal}
                  onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-3.5 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer transition-all"
                >
                  <option value="Muscle gain">Muscle gain (Hypertrophy & overload)</option>
                  <option value="Weight loss">Weight loss (Deficit & cardio)</option>
                  <option value="Strength">Strength (Low rep compound power)</option>
                  <option value="Body recomposition">Body recomposition (Lose fat, gain muscle)</option>
                  <option value="Maintenance">Maintenance (Functional health)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider block">Workout Setup</label>
                <select
                  value={formData.workout_setup}
                  onChange={(e) => setFormData({ ...formData, workout_setup: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-3.5 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer transition-all"
                >
                  <option value="Gym Workouts">Gym Setup (Barbells, dumbbells, machines)</option>
                  <option value="Home Workouts">Home Setup (Bodyweight, bands, HIIT)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider block">Workout Schedule</label>
                <select
                  value={formData.workout_days}
                  onChange={(e) => setFormData({ ...formData, workout_days: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-3.5 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer transition-all"
                >
                  <option value="3">3 Days/week (Standard split)</option>
                  <option value="4">4 Days/week (Upper/Lower or Push/Pull)</option>
                  <option value="5">5 Days/week (Hypertrophy focus)</option>
                  <option value="6">6 Days/week (Push/Pull/Legs split)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider block">Training Experience</label>
                <select
                  value={formData.fitness_level}
                  onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
                  className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-3.5 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer transition-all"
                >
                  <option value="Beginner">Beginner (Starting out)</option>
                  <option value="Intermediate">Intermediate (1-3 years lift)</option>
                  <option value="Advanced">Advanced (3+ years lift)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider block">Diet & Nutrition Profile</label>
              <select
                value={formData.dietary_restrictions}
                onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-3.5 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer transition-all"
              >
                <option value="Indian diet, High protein">Indian Diet (High protein / Lentils, paneer, eggs, lean meats)</option>
                <option value="Indian diet, Vegetarian">Indian Diet (Vegetarian / Paneer, dal, chana, roti)</option>
                <option value="Vegetarian, High protein">Vegetarian (High protein / Tofu, greek yogurt, shakes)</option>
                <option value="Vegan, High protein">Vegan (High protein / Plant proteins, beans, tempeh)</option>
                <option value="High protein, Low carb">Low Carb (Meat, vegetables, eggs, healthy fats)</option>
                <option value="None">No restrictions (Standard macro distribution)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-wider block">Physical Injuries / Limitations</label>
              <input
                type="text"
                placeholder="e.g. Lower back pain, shoulder impingement, or None"
                value={formData.injuries}
                onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                className="w-full bg-slate-950 border border-primary/15 text-foreground rounded-xl px-4 py-3 text-xs font-mono focus:border-primary/80 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={generating}
              className="w-full h-14 bg-primary hover:bg-primary/95 text-primary-foreground font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  FORMULATING AI TRAINING MATRIX...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  GENERATE CUSTOM PLANS
                </>
              )}
            </Button>
          </form>
        )}

      </div>
    </div>
  );
};

export default GenerateProgramPage;
