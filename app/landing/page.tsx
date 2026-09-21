/**
 * Landing Page
 *
 * Public landing page for non-authenticated users
 * Shows platform features and encourages sign up
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState('flashcards');
  const [demoAnimating, setDemoAnimating] = useState(false);
  const [indicatorPosition, setIndicatorPosition] = useState({ top: 0, height: 0 });
  const demoContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Consolidated scroll handler with parallax effects
  useEffect(() => {
    let rafId: number | null = null;
    let ticking = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = requestAnimationFrame(() => {
        // Update navbar scroll state
        setIsScrolled(window.scrollY > 50);

        if (!prefersReducedMotion) {
          // Hero parallax effect
          if (heroRef.current && heroContentRef.current) {
            const heroRect = heroRef.current.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, -heroRect.top / (heroRect.height * 0.8)));
            
            const translateY = progress * 40;
            const scale = 1 - progress * 0.08;
            const opacity = Math.max(0, 1 - progress * 1.1);

            heroContentRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
            heroContentRef.current.style.opacity = opacity.toString();
          }

          // Preview parallax effect
          if (previewRef.current) {
            const previewRect = previewRef.current.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, (window.innerHeight - previewRect.top) / (window.innerHeight * 0.9)));
            
            const scale = 0.94 + progress * 0.06;
            previewRef.current.style.transform = `scale(${scale})`;
          }
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Scroll reveal animations
  useEffect(() => {
    // Reset all animations on mount
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.remove('visible');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('animate');
        observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      // Clean up animations on unmount
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.remove('animate', 'visible');
      });
    };
  }, []);

  // Update sliding indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = document.querySelector(`[data-demo="${activeDemo}"]`) as HTMLButtonElement;
      const container = demoContainerRef.current;
      
      if (activeButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        
        setIndicatorPosition({
          top: buttonRect.top - containerRect.top,
          height: buttonRect.height,
        });
      }
    };

    updateIndicator();
    
    // Update on window resize
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeDemo]);

  const demoOptions = [
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'notities', label: 'Notities' },
    { id: 'mind-maps', label: 'Mind Maps' },
    { id: 'artisan', label: 'Artisan' },
    { id: 'leersets', label: 'Leersets' },
    { id: 'tekeningen', label: 'Tekeningen' },
    { id: 'spelletjes', label: 'Spelletjes' },
  ];

  const handleDemoChange = (id: string) => {
    if (activeDemo === id) return;
    setDemoAnimating(true);
    setActiveDemo(id);
    setTimeout(() => setDemoAnimating(false), 500);
  };

  const activeDemoLabel = demoOptions.find(o => o.id === activeDemo)?.label || '';

  return (
    <div className="min-h-screen bg-background scrollbar-hide">
      <style>{`
        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reveal {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal.animate {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1);
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .demo-button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .demo-button:active {
          transform: scale(0.95);
        }

        .demo-indicator {
          position: absolute;
          left: 0;
          right: 0;
          background: white;
          border-radius: 0.5rem;
          transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .glass-nav {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .reveal.visible,
          .demo-button,
          .demo-indicator {
            animation: none;
            transition: none;
            opacity: 1;
            transform: none;
          }
        }

        .will-change-transform {
          will-change: transform;
        }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav' : 'bg-transparent'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/icons/aetherlearn/icon-96x96.png" 
                alt="AetherLearn" 
                className="h-4 w-4"
              />
              <span className="font-display text-xl font-semibold">AetherLearn</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Inloggen
              </Link>
              <Button asChild size="sm">
                <Link href="/register">
                  Aanmelden
                </Link>
              </Button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4">
            <div className="flex flex-col gap-4">
              <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground">
                Demo
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Inloggen
              </Link>
              <Button asChild size="sm" className="w-full">
                <Link href="/register">
                  Aanmelden
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden px-4 py-32 md:py-48 pt-32 scroll-smooth">
        <div 
          ref={heroContentRef}
          className="mx-auto max-w-4xl text-center will-change-transform"
          style={{ transformOrigin: 'center top' }}
        >
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground mb-6" style={{ transitionDelay: '0.1s' }}>
            <img src="/icons/aetherlearn/icon-96x96.png" alt="AetherLearn" className="h-4 w-4" />
            <span>Slimmer leren</span>
          </div>
          <h1 className="reveal font-display text-5xl font-semibold leading-tight md:text-7xl" style={{ transitionDelay: '0.2s' }}>
            Leer slimmer,
            <br />
            leer beter
          </h1>
          <p className="reveal mt-6 text-lg text-muted-foreground md:text-xl" style={{ transitionDelay: '0.35s' }}>
            AetherLearn helpt je om slimmer te leren. Je oefent met flashcards, maakt notities en houdt al je vakken op één plek bij.
          </p>
          <div className="reveal mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center" style={{ transitionDelay: '0.5s' }}>
            <Button 
              asChild 
              size="lg" 
              className="text-base hover:scale-102 active:scale-100 transition-transform duration-150"
            >
              <Link href="/register">
                Account aanmaken
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-base hover:scale-102 active:scale-100 transition-transform duration-150"
            >
              <Link href="#demo">
                Bekijk demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="border-t border-border px-4 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold text-center md:text-4xl mb-4">
            Bekijk in actie
          </h2>
          <p className="text-center text-muted-foreground mb-16">
            Kies een onderdeel om te zien hoe het werkt.
          </p>

          <div className="flex gap-8 items-start">
            {/* Vertical Navigation */}
            <div 
              ref={demoContainerRef}
              className="relative flex flex-col gap-2 w-48 flex-shrink-0"
            >
              {/* Sliding Indicator */}
              <div 
                className="demo-indicator"
                style={{
                  top: indicatorPosition.top,
                  height: indicatorPosition.height,
                }}
              />
              
              {demoOptions.map((option, index) => (
                <button
                  key={option.id}
                  data-demo={option.id}
                  onClick={() => handleDemoChange(option.id)}
                  className={`demo-button relative z-10 text-left px-4 py-3 rounded-lg transition-all ${
                    activeDemo === option.id
                      ? 'text-black font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Big Preview with Animation */}
            <div 
              ref={previewRef}
              className={`flex-1 aspect-video bg-secondary rounded-2xl overflow-hidden flex items-center justify-center min-w-0 transition-all duration-300 ${
                demoAnimating ? 'border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.03)]' : ''
              }`}
            >
              <div 
                className={`text-muted-foreground text-center px-4 transition-all duration-300 ${
                  demoAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              >
                Voorbeeld: {activeDemoLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimal Bullet Points with Scroll Reveal */}
      <section className="border-t border-border bg-secondary/20 px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-semibold text-center md:text-4xl mb-16">
            Waarom AetherLearn?
          </h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="reveal flex gap-4" style={{ transitionDelay: '0ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Je herhaalt op de momenten die voor jou het beste werken
              </p>
            </div>
            <div className="reveal flex gap-4" style={{ transitionDelay: '70ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Al je vakken, hoofdstukken en oefensets op één plek
              </p>
            </div>
            <div className="reveal flex gap-4" style={{ transitionDelay: '140ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                AetherLearn plant je herhalingen automatisch voor je in
              </p>
            </div>
            <div className="reveal flex gap-4" style={{ transitionDelay: '210ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Altijd zicht op je vakken, toetsen en voortgang
              </p>
            </div>
            <div className="reveal flex gap-4" style={{ transitionDelay: '280ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Maak notities met tekst, tekeningen en mind maps
              </p>
            </div>
            <div className="reveal flex gap-4" style={{ transitionDelay: '350ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Laat Artisan flashcards en oefenvragen voor je maken
              </p>
            </div>
            <div className="reveal flex gap-4" style={{ transitionDelay: '420ms' }}>
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Werkt ook offline en synchroniseert vanzelf
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-secondary/30 to-background px-4 py-20 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <img 
            src="/icons/aetherlearn/icon-96x96.png" 
            alt="AetherLearn" 
            className="h-10 w-10 mx-auto mb-6"
          />
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Klaar om te beginnen?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Maak een account en begin met leren.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="mt-8 text-base hover:scale-102 active:scale-100 transition-transform duration-150"
          >
            <Link href="/register">
              Account aanmaken
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img 
              src="/icons/aetherlearn/icon-96x96.png" 
              alt="AetherLearn" 
              className="h-5 w-5"
            />
            <span className="font-display font-semibold">AetherLearn</span>
          </div>
          <p>© 2026 AetherLearn. Alle rechten voorbehouden.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">
              Voorwaarden
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
