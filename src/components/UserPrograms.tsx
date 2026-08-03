import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Dumbbell,
  Sparkles,
  Users,
  Clock,
  AppleIcon,
} from "lucide-react";
import { USER_PROGRAMS } from "@/constants";

const UserPrograms = () => {
  return (
    <div className="w-full pb-24 pt-16 relative bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* HEADER- PROGRAM GALLERY */}
        <div className="relative border border-border/30 rounded-2xl overflow-hidden mb-16 bg-card/40 backdrop-blur-md">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-slate-900/30">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs text-primary font-mono font-bold tracking-widest uppercase">Verified Showcase</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">AI Training Splits</div>
          </div>

          {/* HEADER CONTENT */}
          <div className="p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Explore Our <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">AI-Generated Splits</span>
            </h2>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
              Discover customized fitness & nutrition structures built for our community based on real body telemetry.
            </p>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 border-t border-border/20 font-mono">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">500+</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">PROGRAMS</p>
              </div>
              <div className="text-center border-l border-border/20">
                <p className="text-2xl font-extrabold text-accent">1.2m</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">TOKENS RUN</p>
              </div>
              <div className="text-center border-l border-border/20">
                <p className="text-2xl font-extrabold text-secondary">3min</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">BUILD TIME</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USER_PROGRAMS.map((program) => (
            <Card
              key={program.id}
              className="bg-card/40 backdrop-blur-md border border-border/30 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300 overflow-hidden flex flex-col rounded-2xl"
            >
              {/* Card header with user info */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-mono text-primary font-bold">CLIENT #{1000 + program.id}</span>
                </div>
                <div className="text-[10px] font-mono font-bold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/20">
                  {program.fitness_level.toUpperCase()}
                </div>
              </div>

              <CardHeader className="pt-6 px-6 flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden border border-border/30 bg-slate-800 shrink-0">
                    <img
                      src={program.profilePic}
                      alt={`${program.first_name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {program.first_name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-mono">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {program.age}y • {program.workout_days} days/wk
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 pt-2">
                  <span className="px-3 py-1 bg-primary/10 rounded-lg border border-primary/20 text-xs text-primary font-mono font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    {program.fitness_goal}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Custom Coach
                  </span>
                </div>
              </CardHeader>

              <CardContent className="px-6 flex-grow">
                {/* Program details */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5 shrink-0">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {program.workout_plan.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {program.equipment_access}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-secondary/10 text-secondary mt-0.5 shrink-0">
                      <AppleIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{program.diet_plan.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Custom macro distribution
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-accent/10 text-accent mt-0.5 shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">Active Nutrition Rules</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Allergens locked: {program.dietary_restrictions || "None"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program description */}
                <div className="mt-5 pt-4 border-t border-border/20">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &quot;{program.workout_plan.description.substring(0, 105)}...&quot;
                  </p>
                </div>
              </CardContent>

              <CardFooter className="px-6 py-4 border-t border-primary/10 bg-slate-950/20">
                <Link href="/generate-program" className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-foreground hover:text-white border border-primary/20 hover:border-primary/50 font-mono text-xs py-5 rounded-xl cursor-pointer transition-all duration-300">
                    Clone Program Settings
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5 text-primary" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-16 text-center">
          <Link href="/generate-program">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/95 px-8 py-6 text-base font-bold rounded-xl cursor-pointer shadow-[0_0_25px_rgba(22,163,74,0.3)] transition-all hover:scale-[1.03] active:scale-[0.98] font-mono uppercase tracking-wider"
            >
              Consult FitBuddy AI Assistant
              <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground font-mono mt-4 uppercase tracking-widest">
            Takes less than 3 minutes to compute
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserPrograms;
