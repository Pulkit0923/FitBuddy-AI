import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRightIcon, Sparkles } from "lucide-react";

const NoFitnessPlan = () => {
  return (
    <div className="relative backdrop-blur-md border border-border/30 rounded-2xl p-10 text-center bg-card/45 max-w-xl mx-auto space-y-6">
      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
          NO ACTIVE FITNESS PLAN
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Specify your metrics, available days, injuries, and nutrition guidelines during an interactive real-time call with our AI assistant.
        </p>
      </div>

      <Button
        size="lg"
        asChild
        className="rounded-xl overflow-hidden bg-primary text-primary-foreground px-8 py-5 text-sm font-semibold font-mono cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:scale-[1.02] transition-transform"
      >
        <Link href="/generate-program" className="flex items-center gap-2">
          Start Consultation Call
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};
export default NoFitnessPlan;
