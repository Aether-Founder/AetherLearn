'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageSelection } from './LanguageSelection';
import { EducationalLevelSelection } from './EducationalLevelSelection';
import { CountrySelection } from './CountrySelection';
import { SubjectSelection } from './SubjectSelection';
import { type Language } from '@/lib/i18n-config';
import { type EducationalLevel } from '@/lib/education-levels';
import { supabase } from '@/lib/supabase/client';
import { detectLocationAndLanguage, inferCountryFromLanguage } from '@/lib/country-detection';
import { getSubjectsForCountryAndLevel, type Subject } from '@/lib/curriculum-mapping';

interface OnboardingPreferencesProps {
  onComplete?: () => void;
  skipUrl?: string;
  className?: string;
}

/**
 * Onboarding preferences component.
 * Allows users to set their language and educational level.
 * This is optional - users can skip and use defaults.
 *
 * Defaults:
 * - Language: Dutch (nl)
 * - Educational Level: Middle School
 *
 * Usage:
 * ```tsx
 * <OnboardingPreferences
 *   onComplete={() => router.push('/dashboard')}
 *   skipUrl="/dashboard"
 * />
 * ```
 */
export function OnboardingPreferences({
  onComplete,
  skipUrl = '/vakken',
  className = '',
}: OnboardingPreferencesProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<Language>('nl');
  const [countryCode, setCountryCode] = useState('');
  const [educationalLevel, setEducationalLevel] = useState<EducationalLevel>('middle-school');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(true);

  // Auto-detect country and suggest language on mount
  useEffect(() => {
    const detectDefaults = async () => {
      const { country, suggestedLanguage } = await detectLocationAndLanguage();
      
      if (country) {
        setCountryCode(country.countryCode);
      }
      
      if (suggestedLanguage !== 'nl') {
        setLanguage(suggestedLanguage);
      }
      
      setDetectingLocation(false);
    };

    detectDefaults();
  }, []);

  // Update available subjects when country or level changes
  useEffect(() => {
    const subjects = getSubjectsForCountryAndLevel(
      countryCode || 'NL',
      educationalLevel
    );
    setAvailableSubjects(subjects);
    
    // Auto-select all subjects by default
    if (selectedSubjects.length === 0 && subjects.length > 0) {
      setSelectedSubjects(subjects.map((s) => s.id));
    }
  }, [countryCode, educationalLevel]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Update user profile with preferences
      // Infer country from language if not set
      const finalCountryCode = countryCode || inferCountryFromLanguage(language) || '';
      
      // Note: language_code, educational_level, country_code, and selected_subjects fields are added in migrations
      // We use any here to bypass TypeScript until types are regenerated after migration
      const { error } = await supabase
        .from('users')
        .update({
          language_code: language,
          educational_level: educationalLevel,
          country_code: finalCountryCode || null,
          selected_subjects: selectedSubjects,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error saving preferences:', error);
        // Continue anyway - not critical
      }

      // Save language preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('aether_language', language);
      }

      if (onComplete) {
        onComplete();
      } else {
        router.push(skipUrl);
      }
    } catch (error) {
      console.error('Error in onboarding:', error);
      // Continue to dashboard even if save fails
      router.push(skipUrl);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Save defaults (Dutch, middle-school) and mark onboarding as complete
    handleSave();
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to AetherLearn</h1>
        <p className="text-muted-foreground">
          Let's personalize your learning experience
        </p>
        {detectingLocation && (
          <p className="text-xs text-muted-foreground mt-2">
            Detecting your location...
          </p>
        )}
        {countryCode && !detectingLocation && (
          <p className="text-xs text-muted-foreground mt-2">
            Detected: {countryCode}
          </p>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 4 ? 'bg-primary' : 'bg-border'}`} />
      </div>

      {/* Step 1: Language Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Choose your language</h2>
            <p className="text-muted-foreground">
              Select the language you'd like to use for the interface
            </p>
          </div>

          <LanguageSelection
            selectedLanguage={language}
            onLanguageChange={setLanguage}
            showAll={false}
          />

          <div className="flex justify-between pt-4">
            <div></div>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Country Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Where are you studying?</h2>
            <p className="text-muted-foreground">
              Select your country to get curriculum-specific subjects
            </p>
          </div>

          <CountrySelection
            selectedCountry={countryCode}
            onCountryChange={setCountryCode}
          />

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Educational Level Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">I am a...</h2>
            <p className="text-muted-foreground">
              Select your educational level to get personalized content
            </p>
          </div>

          <EducationalLevelSelection
            selectedLevel={educationalLevel}
            onLevelChange={setEducationalLevel}
          />

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Subject Selection */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Select your subjects</h2>
            <p className="text-muted-foreground">
              Choose the subjects you want to study. These will appear on your dashboard.
            </p>
          </div>

          <SubjectSelection
            subjects={availableSubjects}
            selectedSubjects={selectedSubjects}
            onSubjectsChange={setSelectedSubjects}
          />

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Get Started'}
            </button>
          </div>
        </div>
      )}

      {/* Skip option */}
      <div className="mt-8 pt-6 border-t border-border">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Skip for now (use defaults: Dutch, Middle School)
        </button>
      </div>
    </div>
  );
}
