import { Button } from "@/components/ui/button";
import UserPrograms from "@/components/UserPrograms";
import { ArrowRightIcon, Sparkles, Activity, Flame, Shield, Trophy } from "lucide-react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden bg-background">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: "1.5s" }}></div>

      <section className="relative z-10 pt-16 pb-12 lg:pt-28 lg:pb-20 flex-grow">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-mono text-primary uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen AI Fitness Partner</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none uppercase text-foreground">
                  The Next Evolution Of{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-shift">
                    Personal Training
                  </span>
                </h1>
                <h2 className="text-lg md:text-xl font-bold font-mono text-accent uppercase tracking-wider">
                  Your Personal AI Fitness Coach
                </h2>
              </div>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg">
                Ditch the generic workout sheets. Talk to our premium AI health coach in real-time, get a bespoke diet and gym plan tailored to your telemetry, and transform your body starting today.
              </p>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-primary/10 font-mono">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-primary flex items-baseline">
                    10K<span className="text-sm text-muted-foreground font-normal ml-0.5">+</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">ACTIVE ATHLETES</div>
                </div>
                <div className="space-y-1 border-l border-primary/10 pl-4">
                  <div className="text-2xl sm:text-3xl font-black text-accent">100%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">BESPOKE SPLITS</div>
                </div>
                <div className="space-y-1 border-l border-primary/10 pl-4">
                  <div className="text-2xl sm:text-3xl font-black text-secondary flex items-baseline">
                    2.4M<span className="text-xs text-muted-foreground font-normal ml-0.5">kcal</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">CALORIES BURNT</div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="rounded-xl overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-sm font-bold cursor-pointer shadow-[0_0_25px_rgba(22,163,74,0.35)] hover:shadow-[0_0_35px_rgba(22,163,74,0.5)] transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Link href={"/generate-program"} className="flex items-center gap-2 font-mono uppercase tracking-wider">
                    Start AI Voice Call
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-xl border-primary/30 text-foreground px-8 py-6 text-sm font-bold cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  <a href="#featured-plans" className="font-mono uppercase tracking-wider">
                    Explore Programs
                  </a>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE HERO GRAPHICS WITH MODERN 3D COACH ILLUSTRATION & FLOATING CARDS */}
            <div className="lg:col-span-6 relative mt-12 lg:mt-0 flex justify-center items-center">
              {/* Outer decorative backdrops */}
              <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse-slow"></div>
              <div className="absolute w-[450px] h-[450px] rounded-full border border-primary/5 scale-100 pointer-events-none"></div>

              {/* Main Visual Frame */}
              <div className="relative border border-primary/15 rounded-3xl p-2.5 bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden max-w-md w-full animate-float">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950/60 border border-primary/10">
                  <img
                    src="/ai-fitness-coach.png"
                    alt="FitBuddy AI Fitness Coach"
                    className="w-full h-full object-cover opacity-85 saturate-[1.1] contrast-[1.05]"
                  />
                  {/* Subtle grid lines overlay on image */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
                  
                  {/* Neon shadow vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30"></div>
                </div>

                {/* Overlaid stats badges to simulate active coach telemetry */}
                
                {/* Heart Rate overlay */}
                <div className="absolute top-8 -left-6 bg-slate-900/90 border border-primary/30 backdrop-blur rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-float" style={{ animationDelay: "1.5s" }}>
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block font-mono tracking-widest uppercase">HEART RATE</span>
                    <span className="text-sm font-black font-mono text-foreground">134 BPM</span>
                  </div>
                </div>

                {/* Calorie burn ring overlay */}
                <div className="absolute bottom-8 -right-6 bg-slate-900/90 border border-accent/30 backdrop-blur rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-float" style={{ animationDelay: "0.5s" }}>
                  <div className="p-2.5 rounded-xl bg-accent/15 text-accent relative">
                    <Flame className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block font-mono tracking-widest uppercase">ENERGY BURNED</span>
                    <span className="text-sm font-black font-mono text-accent">1,845 KCAL</span>
                  </div>
                </div>

                {/* Streak Badge overlay */}
                <div className="absolute top-4 right-4 bg-primary/20 border border-primary/45 backdrop-blur-md rounded-xl px-3 py-1.5 shadow font-mono text-[9px] text-primary font-bold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span>STREAK: 12 DAYS</span>
                </div>

                {/* Safety Protocol status overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-border rounded-xl px-3 py-1.5 font-mono text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>TELEMETRY ONLINE</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* RENDER DYNAMIC CARD GRID GALLEY */}
      <div id="featured-plans">
        <UserPrograms />
      </div>
    </div>
  );
};
export default HomePage;
