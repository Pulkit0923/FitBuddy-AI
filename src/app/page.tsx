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

      <section className="relative z-10 pt-20 pb-16 lg:pt-32 lg:pb-24 flex-grow">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen AI Fitness Partner</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Get Fit with the Power of{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-shift">
                  Conversational AI
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Ditch the generic workout sheets. Talk to our premium AI health coach in real-time, get a bespoke diet and gym plan, and transform your body starting today.
              </p>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-6 py-4 border-y border-border/30 font-mono">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary flex items-baseline">
                    10K<span className="text-sm text-foreground/75 font-normal ml-0.5">+</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">ACTIVE USERS</div>
                </div>
                <div className="space-y-1 border-l border-border/30 pl-6">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">100%</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">PERSONALIZED</div>
                </div>
                <div className="space-y-1 border-l border-border/30 pl-6">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary flex items-baseline">
                    2.4M<span className="text-sm text-foreground/75 font-normal ml-0.5">s</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">CALORIES BURNT</div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="rounded-xl overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-base font-semibold cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
                >
                  <Link href={"/generate-program"} className="flex items-center gap-2 font-mono">
                    Start AI Voice Call
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-xl border-border/60 text-foreground px-8 py-6 text-base font-semibold cursor-pointer hover:bg-muted/30 transition-all hover:scale-[1.02]"
                >
                  <a href="#featured-plans" className="font-mono">
                    Explore Programs
                  </a>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE HERO GRAPHICS */}
            <div className="lg:col-span-6 relative mt-10 lg:mt-0">
              {/* Decorative backdrops */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent rounded-3xl blur-2xl"></div>

              {/* Sleek Floating Dashboard Container */}
              <div className="relative border border-border/40 rounded-3xl p-6 bg-card/45 backdrop-blur-xl shadow-2xl overflow-hidden animate-float">
                <div className="flex items-center justify-between mb-6 border-b border-border/20 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-ping"></div>
                    <span className="text-xs font-mono text-primary font-bold uppercase tracking-widest">LIVE PROGRESS WATCH</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/20">FITBUDDY v1.2</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Calorie Ring Circle */}
                  <div className="bg-slate-900/40 border border-border/20 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
                    <svg className="w-36 h-36" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="8" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="url(#emeraldGrad)" strokeWidth="8" fill="transparent" 
                        strokeDasharray="251.2" strokeDashoffset="65" strokeLinecap="round" className="rotate-[-90deg] origin-[50px_50px] transition-all duration-1000" />
                      <defs>
                        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <Flame className="w-6 h-6 text-primary animate-pulse" />
                      <span className="text-xl font-bold font-mono mt-1">1,845</span>
                      <span className="text-[10px] font-mono text-muted-foreground">KCAL BURNT</span>
                    </div>
                  </div>

                  {/* Real-time stats card lists */}
                  <div className="space-y-4">
                    <div className="bg-slate-900/40 border border-border/20 rounded-xl p-4 flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                        <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-muted-foreground block font-mono">HEART RATE</span>
                        <span className="text-base font-bold font-mono text-foreground">128 BPM</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-border/20 rounded-xl p-4 flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-secondary/10 text-secondary">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-muted-foreground block font-mono">WORKOUT STREAK</span>
                        <span className="text-base font-bold font-mono text-foreground">12 DAYS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Heartwave Graph */}
                <div className="mt-6 pt-4 border-t border-border/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-muted-foreground">CARDIO LOAD FACTOR</span>
                    <span className="text-xs font-mono text-accent">OPTIMAL ZONE</span>
                  </div>
                  <div className="h-16 flex items-end gap-1.5 pt-2">
                    {[35, 55, 40, 60, 75, 50, 90, 65, 80, 45, 60, 70, 85, 50, 60].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-secondary to-accent opacity-80"
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative floating details */}
              <div className="absolute -top-4 -right-4 bg-primary/10 border border-primary/20 backdrop-blur rounded-xl p-3 shadow-lg font-mono text-[10px] text-primary flex items-center gap-2 animate-float" style={{ animationDelay: "1s" }}>
                <Shield className="w-4 h-4" />
                <span>AI SAFETY PROTOCOLS STABLE</span>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-secondary/10 border border-secondary/20 backdrop-blur rounded-xl p-3 shadow-lg font-mono text-[10px] text-secondary flex items-center gap-2 animate-float" style={{ animationDelay: "2s" }}>
                <Sparkles className="w-4 h-4" />
                <span>MEAL TIMING SYNCHRONIZED</span>
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
