"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { DumbbellIcon, HomeIcon, UserIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-primary/10 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="container mx-auto max-w-6xl px-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-primary/15 rounded-xl border border-primary/20 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
            <DumbbellIcon className="w-4.5 h-4.5 text-primary group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="text-lg font-black tracking-wider uppercase font-sans text-foreground">
            FitBuddy<span className="text-primary">.AI</span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-6">
          {!mounted || !isLoaded ? (
            <div className="w-24 h-6 bg-slate-900/50 rounded-xl border border-primary/10 animate-pulse" />
          ) : isSignedIn ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <HomeIcon size={14} />
                <span>Home</span>
              </Link>

              <Link
                href="/generate-program"
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <DumbbellIcon size={14} />
                <span>Generate</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <UserIcon size={14} />
                <span>Profile</span>
              </Link>
              <Button
                asChild
                className="ml-2 bg-primary text-primary-foreground font-mono text-xs px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(22,163,74,0.3)] shadow-[0_0_10px_rgba(22,163,74,0.15)] font-bold cursor-pointer"
              >
                <Link href="/generate-program">Get Started</Link>
              </Button>
              <div className="ml-1 pl-1 border-l border-border/40">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <SignInButton>
                <Button
                  variant="outline"
                  className="border-primary/40 text-primary hover:text-primary-foreground hover:bg-primary rounded-xl px-4 font-mono text-xs transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl px-4 font-mono text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(22,163,74,0.2)]">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
