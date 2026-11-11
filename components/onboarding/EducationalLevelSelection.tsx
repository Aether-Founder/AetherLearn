'use client';

import { EDUCATIONAL_LEVELS, type EducationalLevel } from '@/lib/education-levels';

interface EducationalLevelSelectionProps {
  selectedLevel: EducationalLevel;
  onLevelChange: (level: EducationalLevel) => void;
  className?: string;
}

/**
 * Educational level selection component for onboarding.
 * Shows cards for each educational level with descriptions and icons.
 *
 * Usage:
 * ```tsx
 * <EducationalLevelSelection
 *   selectedLevel={educationalLevel}
 *   onLevelChange={setEducationalLevel}
 * />
 * ```
 */
export function EducationalLevelSelection({
  selectedLevel,
  onLevelChange,
  className = '',
}: EducationalLevelSelectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EDUCATIONAL_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onLevelChange(level.value)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedLevel === level.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{level.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{level.label}</h3>
                <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                <p className="text-xs text-muted-foreground">{level.ageRange}</p>
                {selectedLevel === level.value && (
                  <span className="inline-block mt-2 text-xs font-medium text-primary">
                    ✓ Selected
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
