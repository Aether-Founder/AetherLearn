# Technical Implementation Roadmap: Internationalization & Multi-Audience Support

## Overview

This document provides detailed technical specifications for transforming AetherLearn from a Dutch middle school platform to a global, multi-audience learning application.

---

## Module 1: i18n Infrastructure Enhancement

### Current State
- File: `lib/i18n-config.ts` - 19 languages configured
- File: `lib/i18n.ts` - Server-side mock implementation
- File: `lib/i18n-client.ts` - Client-side implementation
- File: `lib/i18n-server.ts` - Server-side implementation
- Location: `public/locales/` - Translation JSON files

### Required Changes

#### 1.1 Default Language Migration

**File: `lib/i18n-config.ts`**
```typescript
// Current
export const DEFAULT_LANGUAGE: Language = 'nl';

// Proposed
export const DEFAULT_LANGUAGE: Language = 'en'; // English as global default
export const REGIONAL_DEFAULTS: Record<string, Language> = {
  'nl': 'nl', // Netherlands users get Dutch
  'be': 'nl', // Belgium users get Dutch
  'de': 'de', // Germany users get German
  'fr': 'fr', // France users get French
  // etc.
};
```

#### 1.2 Language Detection Enhancement

**New file: `lib/i18n-detection.ts`**
```typescript
import { headers } from 'next/headers';
import { DEFAULT_LANGUAGE, REGIONAL_DEFAULTS, type Language } from './i18n-config';

export function detectLanguage(): Language {
  // Priority: URL param > Cookie > GeoIP > Accept-Language > Default
  const headersList = headers();
  
  // 1. Check URL parameter
  const urlLang = headersList.get('x-url-language');
  if (urlLang && isValidLanguage(urlLang)) return urlLang;
  
  // 2. Check cookie
  const cookieLang = headersList.get('cookie')?.match(/aether_language=([^;]+)/)?.[1];
  if (cookieLang && isValidLanguage(cookieLang)) return cookieLang;
  
  // 3. Check GeoIP (from Cloudflare or similar)
  const country = headersList.get('cf-ipcountry') || headersList.get('x-country-code');
  if (country && REGIONAL_DEFAULTS[country.toLowerCase()]) {
    return REGIONAL_DEFAULTS[country.toLowerCase()];
  }
  
  // 4. Check Accept-Language header
  const acceptLang = headersList.get('accept-language');
  if (acceptLang) {
    const preferredLang = acceptLang.split(',')[0].split('-')[0];
    if (isValidLanguage(preferredLang)) return preferredLang;
  }
  
  return DEFAULT_LANGUAGE;
}

function isValidLanguage(code: string): code is Language {
  return ['nl', 'en', 'ru', 'zh', 'fr', 'es', 'ar', 'de', 'ja', 'ko', 'hi', 'pt', 'it', 'tr', 'id', 'vi', 'th', 'pl', 'uk'].includes(code);
}
```

#### 1.3 RTL Language Support

**New file: `lib/i18n-rtl.ts`**
```typescript
import { type Language } from './i18n-config';

export const RTL_LANGUAGES: Language[] = ['ar', 'he', 'fa', 'ur'];

export function isRTL(language: Language): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function getDirection(language: Language): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}
```

**Integration in layout:**
```typescript
// app/layout.tsx
import { getDirection } from '@/lib/i18n-rtl';
import { useTranslation } from '@/lib/useTranslation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useTranslation();
  const direction = getDirection(currentLanguage);
  
  return (
    <html lang={currentLanguage} dir={direction}>
      {/* ... */}
    </html>
  );
}
```

---

## Module 2: Content Architecture Redesign

### Current Schema
- Content stored in JSON files: `content/subjects/[subject]/[content].json`
- Flat structure with Dutch-specific metadata
- No multi-language support at content level

### New Database Schema

#### 2.1 Core Content Tables

**File: `supabase/migrations/001_content_units.sql`**
```sql
-- Core content units (language-agnostic)
CREATE TABLE content_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universal_id VARCHAR(255) UNIQUE NOT NULL, -- Cross-language identifier
  domain VARCHAR(50) NOT NULL, -- 'stem', 'languages', 'humanities', etc.
  subject VARCHAR(50) NOT NULL, -- 'physics', 'mathematics', etc.
  topic VARCHAR(50) NOT NULL, -- 'mechanics', 'algebra', etc.
  educational_levels TEXT[] NOT NULL, -- ['middle-school', 'high-school', 'university', 'professional']
  difficulty_score INT CHECK (difficulty_score BETWEEN 1 AND 10),
  prerequisite_ids UUID[] REFERENCES content_units(id),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Content translations
CREATE TABLE content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_unit_id UUID NOT NULL REFERENCES content_units(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  examples JSONB DEFAULT '[]',
  cultural_context JSONB DEFAULT '{}',
  audio_url TEXT,
  video_url TEXT,
  translation_status VARCHAR(20) DEFAULT 'draft' CHECK (translation_status IN ('draft', 'review', 'published', 'archived')),
  translated_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  ai_confidence_score DECIMAL(3,2), -- For machine-translated content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_unit_id, language_code)
);

-- Curriculum alignments
CREATE TABLE curriculum_alignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_unit_id UUID NOT NULL REFERENCES content_units(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,
  curriculum_system VARCHAR(50) NOT NULL, -- 'vwo', 'ap-physics', 'cambridge-igcse', 'university-generic'
  educational_level VARCHAR(50) NOT NULL,
  chapter_unit VARCHAR(100),
  lesson_number INT,
  exam_weight DECIMAL(5,2),
  related_topics TEXT[],
  external_id VARCHAR(255), -- Reference to external curriculum ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_unit_id, country_code, curriculum_system, educational_level)
);

-- Learning paths
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universal_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(50),
  educational_level VARCHAR(50) NOT NULL,
  estimated_hours INT,
  skill_tags TEXT[],
  prerequisite_path_ids UUID[] REFERENCES learning_paths(id),
  is_certified BOOLEAN DEFAULT FALSE,
  certification_body VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning path steps
CREATE TABLE learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  content_unit_id UUID REFERENCES content_units(id),
  step_order INT NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  estimated_minutes INT,
  UNIQUE(learning_path_id, step_order)
);

-- User progress
CREATE TABLE user_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_unit_id UUID NOT NULL REFERENCES content_units(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'mastered')),
  mastery_score DECIMAL(5,2) CHECK (mastery_score BETWEEN 0 AND 100),
  last_studied_at TIMESTAMP WITH TIME ZONE,
  total_study_time_seconds INT DEFAULT 0,
  review_count INT DEFAULT 0,
  UNIQUE(user_id, content_unit_id, language_code)
);

-- Create indexes for performance
CREATE INDEX idx_content_units_domain ON content_units(domain);
CREATE INDEX idx_content_units_subject ON content_units(subject);
CREATE INDEX idx_content_units_levels ON content_units USING GIN(educational_levels);
CREATE INDEX idx_content_translations_unit ON content_translations(content_unit_id);
CREATE INDEX idx_content_translations_language ON content_translations(language_code);
CREATE INDEX idx_content_translations_status ON content_translations(translation_status);
CREATE INDEX idx_curriculum_alignments_country ON curriculum_alignments(country_code);
CREATE INDEX idx_curriculum_alignments_system ON curriculum_alignments(curriculum_system);
CREATE INDEX idx_user_progress_user ON user_content_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_content_progress(status);
```

#### 2.2 TypeScript Types

**File: `lib/content/types.ts`**
```typescript
export type EducationalLevel = 'middle-school' | 'high-school' | 'university' | 'professional';
export type Domain = 'stem' | 'languages' | 'humanities' | 'business' | 'arts' | 'personal-development';
export type TranslationStatus = 'draft' | 'review' | 'published' | 'archived';

export interface ContentUnit {
  id: string;
  universalId: string;
  domain: Domain;
  subject: string;
  topic: string;
  educationalLevels: EducationalLevel[];
  difficultyScore: number;
  prerequisiteIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  publishedAt?: Date;
  isFeatured: boolean;
}

export interface ContentTranslation {
  id: string;
  contentUnitId: string;
  languageCode: string;
  title: string;
  description?: string;
  content: string;
  examples: Example[];
  culturalContext: Record<string, any>;
  audioUrl?: string;
  videoUrl?: string;
  translationStatus: TranslationStatus;
  translatedBy?: string;
  reviewedBy?: string;
  aiConfidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Example {
  concept: string;
  text: string;
  culturalVariant?: string;
}

export interface CurriculumAlignment {
  id: string;
  contentUnitId: string;
  countryCode: string;
  curriculumSystem: string;
  educationalLevel: EducationalLevel;
  chapterUnit?: string;
  lessonNumber?: number;
  examWeight?: number;
  relatedTopics: string[];
  externalId?: string;
}

export interface LearningPath {
  id: string;
  universalId: string;
  title: string;
  description?: string;
  domain?: Domain;
  educationalLevel: EducationalLevel;
  estimatedHours: number;
  skillTags: string[];
  prerequisitePathIds: string[];
  isCertified: boolean;
  certificationBody?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserContentProgress {
  id: string;
  userId: string;
  contentUnitId: string;
  languageCode: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  masteryScore: number;
  lastStudiedAt?: Date;
  totalStudyTimeSeconds: number;
  reviewCount: number;
}
```

---

## Module 3: User Onboarding Redesign

### Current Flow
- Dutch-only registration
- No educational level selection
- No curriculum alignment

### New Onboarding Flow

#### 3.1 Onboarding State Management

**File: `hooks/useOnboarding.ts`**
```typescript
import { useState, useCallback } from 'react';
import { type EducationalLevel, type Domain } from '@/lib/content/types';

export interface OnboardingState {
  step: number;
  language: string;
  educationalLevel?: EducationalLevel;
  domains: Domain[];
  subjects: string[];
  learningGoals: LearningGoal[];
  countryCode?: string;
  curriculumSystem?: string;
}

export type LearningGoal = 'exam-prep' | 'skill-upgrade' | 'knowledge' | 'certification' | 'research';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    language: 'en',
    domains: [],
    subjects: [],
    learningGoals: [],
  });

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  }, []);

  const updateState = useCallback<K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    // Save to user profile
    await fetch('/api/user/onboarding', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }, [state]);

  return {
    state,
    nextStep,
    previousStep,
    updateState,
    completeOnboarding,
  };
}
```

#### 3.2 Onboarding Components

**File: `components/onboarding/LanguageSelection.tsx`**
```typescript
'use client';

import { LANGUAGE_REGISTRY } from '@/lib/i18n-config';
import { useOnboarding } from '@/hooks/useOnboarding';

export function LanguageSelection() {
  const { state, updateState, nextStep } = useOnboarding();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Choose your language</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {LANGUAGE_REGISTRY.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              updateState('language', lang.code);
              nextStep();
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.language === lang.code
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-lg font-medium">{lang.nativeName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**File: `components/onboarding/EducationalLevelSelection.tsx`**
```typescript
'use client';

import { type EducationalLevel } from '@/lib/content/types';
import { useOnboarding } from '@/hooks/useOnboarding';

const LEVELS: { value: EducationalLevel; label: string; description: string; icon: string }[] = [
  {
    value: 'middle-school',
    label: 'Middle School',
    description: 'Ages 12-15. Foundational concepts with visual learning.',
    icon: '🎒',
  },
  {
    value: 'high-school',
    label: 'High School',
    description: 'Ages 15-18. Advanced concepts and exam preparation.',
    icon: '📚',
  },
  {
    value: 'university',
    label: 'University',
    description: 'Higher education. Theoretical depth and research.',
    icon: '🎓',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Career development. Practical skills and certifications.',
    icon: '💼',
  },
];

export function EducationalLevelSelection() {
  const { state, updateState, nextStep } = useOnboarding();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">I am a...</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => {
              updateState('educationalLevel', level.value);
              nextStep();
            }}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              state.educationalLevel === level.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-3xl mb-2">{level.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{level.label}</h3>
            <p className="text-sm text-muted-foreground">{level.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Module 4: Adaptive Dashboard

### Current Dashboard
- Single layout for all users
- Dutch-focused widgets
- No personalization

### New Adaptive Dashboard

#### 4.1 Dashboard Configuration

**File: `lib/dashboard/config.ts`**
```typescript
import { type EducationalLevel } from '@/lib/content/types';

export interface DashboardWidget {
  id: string;
  type: 'study-schedule' | 'exam-countdown' | 'streak' | 'progress' | 'recommendations' | 'calendar' | 'stats';
  position: { x: number; y: number };
  size: { w: number; h: number };
  visible: boolean;
}

export interface DashboardConfig {
  educationalLevel: EducationalLevel;
  widgets: DashboardWidget[];
}

export const DASHBOARD_CONFIGS: Record<EducationalLevel, DashboardConfig> = {
  'middle-school': {
    educationalLevel: 'middle-school',
    widgets: [
      { id: 'streak', type: 'streak', position: { x: 0, y: 0 }, size: { w: 1, h: 1 }, visible: true },
      { id: 'study-schedule', type: 'study-schedule', position: { x: 1, y: 0 }, size: { w: 2, h: 1 }, visible: true },
      { id: 'recommendations', type: 'recommendations', position: { x: 0, y: 1 }, size: { w: 3, h: 2 }, visible: true },
      { id: 'progress', type: 'progress', position: { x: 0, y: 3 }, size: { w: 2, h: 1 }, visible: true },
    ],
  },
  'high-school': {
    educationalLevel: 'high-school',
    widgets: [
      { id: 'streak', type: 'streak', position: { x: 0, y: 0 }, size: { w: 1, h: 1 }, visible: true },
      { id: 'exam-countdown', type: 'exam-countdown', position: { x: 1, y: 0 }, size: { w: 1, h: 1 }, visible: true },
      { id: 'study-schedule', type: 'study-schedule', position: { x: 2, y: 0 }, size: { w: 1, h: 1 }, visible: true },
      { id: 'recommendations', type: 'recommendations', position: { x: 0, y: 1 }, size: { w: 3, h: 2 }, visible: true },
      { id: 'calendar', type: 'calendar', position: { x: 0, y: 3 }, size: { w: 2, h: 1 }, visible: true },
    ],
  },
  'university': {
    educationalLevel: 'university',
    widgets: [
      { id: 'study-schedule', type: 'study-schedule', position: { x: 0, y: 0 }, size: { w: 2, h: 1 }, visible: true },
      { id: 'progress', type: 'progress', position: { x: 2, y: 0 }, size: { w: 1, h: 1 }, visible: true },
      { id: 'recommendations', type: 'recommendations', position: { x: 0, y: 1 }, size: { w: 3, h: 2 }, visible: true },
      { id: 'calendar', type: 'calendar', position: { x: 0, y: 3 }, size: { w: 2, h: 1 }, visible: true },
      { id: 'stats', type: 'stats', position: { x: 2, y: 3 }, size: { w: 1, h: 1 }, visible: true },
    ],
  },
  'professional': {
    educationalLevel: 'professional',
    widgets: [
      { id: 'progress', type: 'progress', position: { x: 0, y: 0 }, size: { w: 1, h: 1 }, visible: true },
      { id: 'recommendations', type: 'recommendations', position: { x: 1, y: 0 }, size: { w: 2, h: 1 }, visible: true },
      { id: 'calendar', type: 'calendar', position: { x: 0, y: 1 }, size: { w: 3, h: 1 }, visible: true },
      { id: 'stats', type: 'stats', position: { x: 0, y: 2 }, size: { w: 3, h: 1 }, visible: true },
    ],
  },
};
```

#### 4.2 Adaptive Dashboard Component

**File: `components/dashboard/AdaptiveDashboard.tsx`**
```typescript
'use client';

import { useUserProfile } from '@/hooks/useAuth';
import { DASHBOARD_CONFIGS } from '@/lib/dashboard/config';
import { DashboardGrid } from './DashboardGrid';
import { WidgetStudySchedule } from './widgets/StudySchedule';
import { WidgetExamCountdown } from './widgets/ExamCountdown';
import { WidgetStreak } from './widgets/Streak';
import { WidgetProgress } from './widgets/Progress';
import { WidgetRecommendations } from './widgets/Recommendations';
import { WidgetCalendar } from './widgets/Calendar';
import { WidgetStats } from './widgets/Stats';

const WIDGET_COMPONENTS = {
  'study-schedule': WidgetStudySchedule,
  'exam-countdown': WidgetExamCountdown,
  'streak': WidgetStreak,
  'progress': WidgetProgress,
  'recommendations': WidgetRecommendations,
  'calendar': WidgetCalendar,
  'stats': WidgetStats,
};

export function AdaptiveDashboard() {
  const { profile } = useUserProfile();
  const educationalLevel = profile?.educationalLevel || 'middle-school';
  const config = DASHBOARD_CONFIGS[educationalLevel];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-muted-foreground capitalize">
          {educationalLevel.replace('-', ' ')}
        </span>
      </div>
      
      <DashboardGrid>
        {config.widgets
          .filter(widget => widget.visible)
          .map(widget => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type];
            return (
              <WidgetComponent
                key={widget.id}
                position={widget.position}
                size={widget.size}
              />
            );
          })}
      </DashboardGrid>
    </div>
  );
}
```

---

## Module 5: Curriculum Integration System

### 5.1 Curriculum Registry

**File: `lib/curriculum/registry.ts`**
```typescript
export interface CurriculumSystem {
  code: string;
  name: string;
  country: string;
  educationalLevels: string[];
  externalApi?: string;
  hasExams: boolean;
}

export const CURRICULUM_SYSTEMS: CurriculumSystem[] = [
  {
    code: 'nl-vwo',
    name: 'VWO',
    country: 'NL',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'nl-havo',
    name: 'HAVO',
    country: 'NL',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'us-ap-physics',
    name: 'AP Physics',
    country: 'US',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'us-sat',
    name: 'SAT',
    country: 'US',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'uk-gcse',
    name: 'GCSE',
    country: 'UK',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'uk-a-level',
    name: 'A-Levels',
    country: 'UK',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'de-abitur',
    name: 'Abitur',
    country: 'DE',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'fr-baccalaureat',
    name: 'Baccalauréat',
    country: 'FR',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'in-jee',
    name: 'JEE',
    country: 'IN',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'cn-gaokao',
    name: 'Gaokao',
    country: 'CN',
    educationalLevels: ['high-school'],
    hasExams: true,
  },
  {
    code: 'university-generic',
    name: 'University Course',
    country: '*',
    educationalLevels: ['university'],
    hasExams: false,
  },
];
```

#### 5.2 Curriculum Content Fetcher

**File: `lib/curriculum/fetcher.ts`**
```typescript
import { supabase } from '@/lib/db';
import { type EducationalLevel } from '@/lib/content/types';

export interface CurriculumContent {
  contentUnitId: string;
  curriculumSystem: string;
  chapterUnit?: string;
  lessonNumber?: number;
  examWeight?: number;
  relatedTopics: string[];
}

export async function getCurriculumAlignedContent(
  countryCode: string,
  educationalLevel: EducationalLevel,
  subject: string,
  languageCode: string
): Promise<CurriculumContent[]> {
  const { data, error } = await supabase
    .from('curriculum_alignments')
    .select(`
      content_unit_id,
      curriculum_system,
      chapter_unit,
      lesson_number,
      exam_weight,
      related_topics,
      content_units!inner (
        domain,
        subject,
        topic
      )
    `)
    .eq('country_code', countryCode)
    .eq('educational_level', educationalLevel)
    .eq('content_units.subject', subject);

  if (error) throw error;

  return data.map(item => ({
    contentUnitId: item.content_unit_id,
    curriculumSystem: item.curriculum_system,
    chapterUnit: item.chapter_unit,
    lessonNumber: item.lesson_number,
    examWeight: item.exam_weight,
    relatedTopics: item.related_topics,
  }));
}

export async function getExamDates(
  curriculumSystem: string,
  countryCode: string
): Promise<{ date: Date; subject: string }[]> {
  // This would integrate with external exam board APIs
  // For now, return mock data
  return [];
}
```

---

## Module 6: Recommendation Engine

### 6.1 Content Recommendation Algorithm

**File: `lib/recommendations/engine.ts`**
```typescript
import { supabase } from '@/lib/db';
import { type EducationalLevel, type Domain } from '@/lib/content/types';

export interface RecommendationContext {
  userId: string;
  educationalLevel: EducationalLevel;
  languageCode: string;
  country?: string;
  curriculumSystem?: string;
  currentTopics: string[];
  learningGoals: string[];
  masteryScores: Record<string, number>;
}

export interface Recommendation {
  contentUnitId: string;
  title: string;
  reason: string;
  confidence: number;
  estimatedTime: number;
}

export class RecommendationEngine {
  async getRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 1. Prerequisite-based recommendations
    const prereqRecs = await this.getPrerequisiteRecommendations(context);
    recommendations.push(...prereqRecs);

    // 2. Curriculum-aligned recommendations
    if (context.curriculumSystem) {
      const curriculumRecs = await this.getCurriculumRecommendations(context);
      recommendations.push(...curriculumRecs);
    }

    // 3. Interest-based recommendations
    const interestRecs = await this.getInterestBasedRecommendations(context);
    recommendations.push(...interestRecs);

    // 4. Difficulty progression
    const progressionRecs = await this.getProgressionRecommendations(context);
    recommendations.push(...progressionRecs);

    // Sort by confidence and deduplicate
    return this.deduplicateAndSort(recommendations);
  }

  private async getPrerequisiteRecommendations(
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    // Find content that is prerequisite for what user is studying
    const { data } = await supabase
      .from('content_units')
      .select(`
        id,
        universal_id,
        prerequisite_ids,
        content_translations!inner (
          title,
          language_code
        )
      `)
      .contains('educational_levels', [context.educationalLevel])
      .eq('content_translations.language_code', context.languageCode)
      .overlap('prerequisite_ids', context.currentTopics);

    return data.map(item => ({
      contentUnitId: item.id,
      title: item.content_translations[0].title,
      reason: 'Recommended based on your current studies',
      confidence: 0.8,
      estimatedTime: 30,
    }));
  }

  private async getCurriculumRecommendations(
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    if (!context.country || !context.curriculumSystem) return [];

    const { data } = await supabase
      .from('curriculum_alignments')
      .select(`
        content_unit_id,
        exam_weight,
        content_units!inner (
          content_translations!inner (
            title
          )
        )
      `)
      .eq('country_code', context.country)
      .eq('curriculum_system', context.curriculumSystem)
      .eq('educational_level', context.educationalLevel)
      .order('exam_weight', { ascending: false })
      .limit(10);

    return data.map(item => ({
      contentUnitId: item.content_unit_id,
      title: item.content_units.content_translations[0].title,
      reason: `Aligned with ${context.curriculumSystem} curriculum`,
      confidence: 0.9,
      estimatedTime: 45,
    }));
  }

  private async getInterestBasedRecommendations(
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    // Based on user's learning goals and current topics
    const { data } = await supabase
      .from('content_units')
      .select(`
        id,
        tags,
        content_translations!inner (
          title
        )
      `)
      .contains('educational_levels', [context.educationalLevel])
      .eq('content_translations.language_code', context.languageCode)
      .overlaps('tags', context.learningGoals)
      .limit(5);

    return data.map(item => ({
      contentUnitId: item.id,
      title: item.content_translations[0].title,
      reason: 'Matches your learning goals',
      confidence: 0.7,
      estimatedTime: 30,
    }));
  }

  private async getProgressionRecommendations(
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    // Suggest slightly more difficult content based on mastery
    const avgMastery = Object.values(context.masteryScores).reduce((a, b) => a + b, 0) / Object.keys(context.masteryScores).length;

    if (avgMastery > 80) {
      // User is doing well, suggest harder content
      const { data } = await supabase
        .from('content_units')
        .select(`
          id,
          difficulty_score,
          content_translations!inner (
            title
          )
        `)
        .contains('educational_levels', [context.educationalLevel])
        .eq('content_translations.language_code', context.languageCode)
        .gt('difficulty_score', 5)
        .limit(5);

      return data.map(item => ({
        contentUnitId: item.id,
        title: item.content_translations[0].title,
        reason: 'Challenge yourself with advanced content',
        confidence: 0.6,
        estimatedTime: 60,
      }));
    }

    return [];
  }

  private deduplicateAndSort(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    return recommendations
      .filter(rec => {
        if (seen.has(rec.contentUnitId)) return false;
        seen.add(rec.contentUnitId);
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }
}
```

---

## Module 7: Assessment System Enhancement

### 7.1 Adaptive Assessment Types

**File: `lib/assessments/types.ts`**
```typescript
export type AssessmentType = 
  | 'multiple-choice'
  | 'fill-blank'
  | 'matching'
  | 'short-answer'
  | 'essay'
  | 'problem-solving'
  | 'case-study'
  | 'practical-simulation'
  | 'portfolio';

export interface Assessment {
  id: string;
  contentUnitId: string;
  type: AssessmentType;
  educationalLevel: EducationalLevel;
  questions: Question[];
  timeLimit?: number; // minutes
  passingScore: number;
  allowsRetries: boolean;
  randomizeOrder: boolean;
}

export interface Question {
  id: string;
  type: AssessmentType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: number;
}

export interface AssessmentResult {
  assessmentId: string;
  userId: string;
  score: number;
  passed: boolean;
  answers: Record<string, any>;
  timeSpent: number;
  completedAt: Date;
}
```

### 7.2 Difficulty Adaptation

**File: `lib/assessments/adaptive.ts`**
```typescript
import { type EducationalLevel } from '@/lib/content/types';
import { type AssessmentType } from './types';

export function getDefaultAssessmentTypes(level: EducationalLevel): AssessmentType[] {
  switch (level) {
    case 'middle-school':
      return ['multiple-choice', 'fill-blank', 'matching'];
    case 'high-school':
      return ['multiple-choice', 'fill-blank', 'short-answer', 'problem-solving'];
    case 'university':
      return ['short-answer', 'essay', 'problem-solving', 'case-study'];
    case 'professional':
      return ['case-study', 'practical-simulation', 'portfolio'];
    default:
      return ['multiple-choice'];
  }
}

export function adaptQuestionDifficulty(
  baseDifficulty: number,
  userMastery: number,
  educationalLevel: EducationalLevel
): number {
  // Adjust difficulty based on user's mastery level
  const adjustment = (userMastery - 50) / 10; // -5 to +5 adjustment
  let adjusted = baseDifficulty + adjustment;

  // Clamp based on educational level
  const maxDifficulty = getMaxDifficulty(educationalLevel);
  const minDifficulty = getMinDifficulty(educationalLevel);

  return Math.max(minDifficulty, Math.min(maxDifficulty, adjusted));
}

function getMaxDifficulty(level: EducationalLevel): number {
  switch (level) {
    case 'middle-school': return 5;
    case 'high-school': return 7;
    case 'university': return 9;
    case 'professional': return 10;
  }
}

function getMinDifficulty(level: EducationalLevel): number {
  switch (level) {
    case 'middle-school': return 1;
    case 'high-school': return 3;
    case 'university': return 5;
    case 'professional': return 6;
  }
}
```

---

## Module 8: API Endpoints

### 8.1 Content API

**File: `app/api/content/recommendations/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { RecommendationEngine } from '@/lib/recommendations/engine';

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const educationalLevel = user.educational_level || 'middle-school';
  const languageCode = user.language_code || 'en';
  const country = user.country_code;
  const curriculumSystem = user.curriculum_system;

  const engine = new RecommendationEngine();
  const recommendations = await engine.getRecommendations({
    userId: user.id,
    educationalLevel,
    languageCode,
    country,
    curriculumSystem,
    currentTopics: [], // From user's recent activity
    learningGoals: [], // From user's profile
    masteryScores: {}, // From user's progress
  });

  return NextResponse.json({ recommendations });
}
```

### 8.2 Onboarding API

**File: `app/api/user/onboarding/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { language, educationalLevel, domains, subjects, learningGoals, countryCode, curriculumSystem } = body;

  const { error } = await supabase
    .from('user_profiles')
    .update({
      language_code: language,
      educational_level: educationalLevel,
      preferred_domains: domains,
      preferred_subjects: subjects,
      learning_goals: learningGoals,
      country_code: countryCode,
      curriculum_system: curriculumSystem,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

## Migration Strategy

### Phase 1: Database Setup (Week 1-2)
1. Create new Supabase tables
2. Run migration scripts
3. Set up indexes and constraints
4. Create TypeScript types

### Phase 2: Content Migration (Week 3-6)
1. Migrate existing JSON content to database
2. Create English translations for all Dutch content
3. Tag content with educational levels
4. Create curriculum alignments for Dutch system

### Phase 3: UI Updates (Week 7-10)
1. Update i18n infrastructure
2. Implement new onboarding flow
3. Build adaptive dashboard
4. Update all hardcoded Dutch text

### Phase 4: Testing (Week 11-12)
1. Unit tests for new modules
2. Integration tests for API endpoints
3. E2E tests for user flows
4. Performance testing

### Phase 5: Launch (Week 13)
1. Feature flag gradual rollout
2. Monitor analytics
3. Collect user feedback
4. Iterate based on feedback

---

## Testing Strategy

### Unit Tests
- i18n detection logic
- Recommendation engine algorithms
- Curriculum alignment queries
- Assessment difficulty adaptation

### Integration Tests
- Onboarding flow end-to-end
- Content retrieval by language/level
- User progress tracking
- Assessment submission

### E2E Tests
- New user registration and onboarding
- Content study flow
- Dashboard personalization
- Multi-language switching

---

## Performance Considerations

### Database Optimization
- Use read replicas for high-traffic regions
- Implement content caching with Redis
- Optimize queries with proper indexes
- Use connection pooling

### CDN Strategy
- Cache static content by region
- Optimize images and videos
- Implement edge caching for API responses
- Use WebP format for images

### Caching Strategy
```typescript
// Cache content translations by language
const cacheKey = `content:${contentUnitId}:${languageCode}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fetch from database
const content = await fetchContent(contentUnitId, languageCode);
await redis.setex(cacheKey, 3600, JSON.stringify(content)); // 1 hour cache
```

---

## Security Considerations

### Content Moderation
- Implement content review workflow
- Rate limit user-generated content
- Sanitize all user inputs
- Implement spam detection

### Privacy
- Anonymize learning analytics
- Comply with GDPR and regional laws
- Secure user profile data
- Implement data export functionality

---

## Monitoring and Analytics

### Key Metrics
- User engagement by country/language
- Content completion rates by level
- Translation quality feedback
- Recommendation click-through rates

### Error Tracking
- Language detection failures
- Content loading errors
- Translation missing keys
- API rate limit hits

---

## Conclusion

This technical roadmap provides a detailed implementation plan for transforming AetherLearn into a global, multi-audience learning platform. The modular approach allows for incremental development and testing while maintaining system stability.
