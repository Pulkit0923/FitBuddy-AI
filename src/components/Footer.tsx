import { DumbbellIcon } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-primary/10 bg-background/95 backdrop-blur-xl relative overflow-hidden">
      {/* Top border glow */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-primary/15 rounded-xl border border-primary/20 group-hover:border-primary/50 transition-all duration-300">
                <DumbbellIcon className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-lg font-black tracking-wider uppercase font-sans text-foreground">
                FitBuddy<span className="text-primary">.AI</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground font-mono">
              © {new Date().getFullYear()} FitBuddy AI. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-3 text-xs font-mono">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              // ABOUT
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              // TERMS
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              // PRIVACY
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              // CONTACT
            </Link>
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              // BLOG
            </Link>
            <Link
              href="/help"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              // HELP
            </Link>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2.5 px-4 py-2 border border-primary/20 rounded-full bg-slate-900/50">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E] animate-pulse"></div>
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">SYSTEM OPERATIONAL</span>
          </div>
        </div>

        {/* Bottom row developer attribution */}
        <div className="mt-10 pt-6 border-t border-border/20 text-center">
          <p className="text-xs font-mono tracking-wider text-muted-foreground/60 uppercase">
            Powered by Conversational AI • Developed with ❤️ by <span className="text-primary hover:text-accent transition-colors duration-200 font-bold">Monali Jain</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
