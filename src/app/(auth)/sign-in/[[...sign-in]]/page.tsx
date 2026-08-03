import { SignIn } from "@clerk/nextjs";
import { Sparkles, Shield } from "lucide-react";

const SignInPage = () => {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative py-12 px-4">
      {/* Background blur effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col items-center gap-6 relative z-10">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary uppercase">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Secure Access Node</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-mono">
            FIT<span className="text-primary">BUDDY</span>.AI
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign in to synchronize your active fitness and nutrition matrices
          </p>
        </div>

        {/* Card containing Clerk sign-in */}
        <div className="w-full border border-border/30 rounded-2xl p-1 bg-card/45 backdrop-blur-xl shadow-2xl overflow-hidden">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#16A34A",
                colorBackground: "#0F172A",
                colorText: "#F8FAFC",
                colorTextSecondary: "#94A3B8",
                colorInputBackground: "#020617",
                colorInputText: "#F8FAFC",
                colorBorder: "rgba(22, 163, 74, 0.2)",
              },
              elements: {
                card: "bg-transparent shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-primary/10 hover:bg-slate-900/60 transition-all rounded-xl py-3 flex items-center justify-center gap-2",
                socialButtonsBlockButtonText: "!text-slate-100 font-semibold font-mono text-xs",
                formButtonPrimary: "bg-primary hover:bg-primary/95 text-primary-foreground font-mono text-xs py-3 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(22,163,74,0.25)] transition-all font-bold",
                formFieldLabel: "!text-slate-300 font-mono text-xs mb-1.5 font-semibold",
                formFieldInput: "!bg-slate-950 border border-primary/20 !text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:border-primary/80 focus:ring-1 focus:ring-primary",
                footerText: "!text-slate-400 font-mono text-xs",
                footerActionLink: "!text-primary hover:!text-primary/80 font-mono text-xs font-bold transition-colors",
                dividerLine: "bg-border/20",
                dividerText: "!text-slate-400 font-mono text-xs uppercase",
                identityPreviewText: "!text-slate-100 font-mono text-xs",
                formResendCodeLink: "!text-primary hover:!text-primary/80 font-mono text-xs font-semibold",
              }
            }}
          />
        </div>

        {/* Footer info badge */}
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground uppercase">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>Biometric & Encrypted Protocols Enabled</span>
        </div>
      </div>
    </main>
  );
};
export default SignInPage;
