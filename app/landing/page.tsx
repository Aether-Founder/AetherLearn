/**
 * Landing Page
 *
 * Public landing page for non-authenticated users
 * Shows platform features and encourages sign up
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState('flashcards');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [wheelStart, setWheelStart] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % features.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const swipeThreshold = 50;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
  };

  // Wheel handler for desktop two-finger swipe
  const handleWheel = (e: React.WheelEvent) => {
    const swipeThreshold = 50;
    const diff = e.deltaX;
    
    if (Math.abs(diff) > swipeThreshold) {
      e.preventDefault();
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
  };

  const demoOptions = [
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'notities', label: 'Notities' },
    { id: 'mind-maps', label: 'Mind Maps' },
    { id: 'artisan', label: 'Artisan' },
    { id: 'leersets', label: 'Leersets' },
    { id: 'tekeningen', label: 'Tekeningen' },
    { id: 'spelletjes', label: 'Spelletjes' },
  ];

  return (
    <div className="min-h-screen bg-background scrollbar-hide">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : 'bg-transparent'
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
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Inloggen
              </Link>
              <Button asChild size="sm">
                <Link href="/register">
                  Gratis starten
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
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground">
                Demo
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Inloggen
              </Link>
              <Button asChild size="sm" className="w-full">
                <Link href="/register">
                  Gratis starten
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-32 md:py-48 pt-32 scroll-smooth">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground mb-6">
            <img src="/icons/aetherlearn/icon-96x96.png" alt="AetherLearn" className="h-4 w-4" />
            <span>De toekomst van studeren</span>
          </div>
          <h1 className="font-display text-5xl font-semibold leading-tight md:text-7xl">
            Leer slimmer,
            <br />
            leer beter
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            AetherLearn helpt je om effectiever te studeren met gepersonaliseerde leerpaden,
            actieve herhaling en slimme planning.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/register">
                Maak gratis account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="#demo">
                Bekijk demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <section id="features" className="border-t border-border px-4 py-20 md:py-32 bg-secondary/20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold text-center md:text-4xl mb-4">
            Ontdek AetherLearn
          </h2>
          <p className="text-center text-muted-foreground mb-16">
            Alles wat je nodig hebt voor effectief studeren
          </p>

          <div className="relative overflow-hidden">
            <div 
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-in-out scrollbar-hide"
              style={{ 
                transform: `translateX(-${activeSlide * 100}%)`,
                touchAction: 'pan-y'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="mx-auto max-w-3xl">
                    <div className="aspect-video bg-secondary rounded-2xl overflow-hidden flex items-center justify-center mb-4">
                      <div className="text-muted-foreground text-sm">
                        Placeholder: {feature.title}
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {feature.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 md:-translate-x-0.01 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-primary hover:text-primary-foreground transition-all shadow-lg z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 md:translate-x-0.01 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-primary hover:text-primary-foreground transition-all shadow-lg z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === index ? 'w-8 bg-primary' : 'w-2 bg-border'
                  }`}
                />
              ))}
            </div>
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
            Klik op een optie om de demo te bekijken
          </p>

          <div className="flex gap-8 items-start">
            {/* Vertical Navigation */}
            <div className="flex flex-col gap-2 w-48 flex-shrink-0">
              {demoOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveDemo(option.id)}
                  className={`text-left px-4 py-3 rounded-lg transition-all ${
                    activeDemo === option.id
                      ? 'bg-primary/20 backdrop-blur-sm text-primary shadow-lg'
                      : 'bg-secondary/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Big Preview Image */}
            <div className="flex-1 aspect-video bg-secondary rounded-2xl overflow-hidden flex items-center justify-center min-w-0">
              <div className="text-muted-foreground text-center px-4">
                Placeholder: {demoOptions.find(o => o.id === activeDemo)?.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimal Bullet Points */}
      <section className="border-t border-border bg-secondary/20 px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-semibold text-center md:text-4xl mb-16">
            Waarom AetherLearn?
          </h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Actief leren met spatiële herhaling en gepersonaliseerde herhalingsmomenten
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Organiseer je studiemateriaal in vakken, hoofdstukken en studiesets
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Automatische planning van je herhalingsmomenten
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Compleet overzicht van al je vakken, toetsen en voortgang
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Rijke notities met diagrammen, mind maps en tekeningen
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                AI-gestuurde content creatie met Artisan
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Werk offline en synchroniseer automatisch
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
            Maak vandaag nog een account en start met effectiever studeren.
            Geen creditcard nodig.
          </p>
          <Button asChild size="lg" className="mt-8 text-base">
            <Link href="/register">
              Start gratis
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

const features = [
  {
    title: "Flashcards",
    caption: "Interactieve flashcards met spatiële herhaling"
  },
  {
    title: "Notities",
    caption: "Rijke notities met diagrammen en mind maps"
  },
  {
    title: "Mind Maps",
    caption: "Visuele mind maps voor concepten"
  },
  {
    title: "Tekeningen",
    caption: "Freehand tekeningen in notities"
  },
  {
    title: "Vakken",
    caption: "Georganiseerde vakken en hoofdstukken"
  },
  {
    title: "Artisan AI",
    caption: "AI-gestuurde content creatie"
  }
];