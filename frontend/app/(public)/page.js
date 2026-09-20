"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Mic, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/onboarding');
    }
  }, [status, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Graphic Primitives */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-tr-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">

        {/* Main Header Area */}
        <div className="w-full flex flex-col items-center justify-center space-y-10 text-center py-12 md:py-20">


          {/* Typography */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight">
              PARALLAX
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto">
              Accessibility-first digital services. Let our intelligent engine guide you through every step.
            </p>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto">
            <Button
              onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
              size="lg"
              className="h-16 px-12 text-xl shadow-md group"
            >
              Explore Services
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
          {[
            {
              icon: <Mic className="w-8 h-8 text-primary" />,
              title: "Voice Guided",
              desc: "Interact entirely through speech without touching a screen.",
              color: "bg-accent"
            },
            {
              icon: <Sparkles className="w-8 h-8 text-secondary" />,
              title: "Smart Autofill",
              desc: "Scan documents and automate instant data entry.",
              color: "bg-green-100" // using tailwind color for now
            },
            {
              icon: <ShieldCheck className="w-8 h-8 text-destructive" />,
              title: "Accessible",
              desc: "Designed ground-up for cognitive & motor accessibility needs.",
              color: "bg-red-100"
            }
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-start text-left p-8 rounded-md bg-card border-2 border-border shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className={`p-4 rounded-full mb-6 ${feat.color}`}>
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{feat.title}</h3>
              <p className="text-lg text-muted-foreground font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>

      </div>

      <footer className="w-full text-center mt-24 mb-6 relative z-10 text-muted-foreground font-mono text-sm">
        <p>/* &copy; {new Date().getFullYear()} Parallax System. */</p>
      </footer>
    </main>
  );
}
