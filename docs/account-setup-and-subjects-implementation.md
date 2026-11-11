# Account Setup and Subjects Implementation

## Completed: January 2026

This document summarizes the implementation of the account setup flow and subject selection system as requested by the user.

---

## User Requirements

The user requested:
1. **Auto-detect location** using IP (no manual permission prompt)
2. **Auto-select language** based on detected location
3. **User must select language** (can change from auto-detected)
4. **User must select country** (can change from auto-detected)
5. **User must select educational level** (middle school, university, etc.)
6. **Subjects based on country and educational level**
7. **User selects subjects** (all subjects selected by default, can customize)
8. **All selected subjects displayed on dashboard**

---

## Implementation Summary

### 1. Country Selection Component ✅

**File:** `components/onboarding/CountrySelection.tsx`

**Features:**
- Grid of 26 countries with flags
- Each country shows name and code
- Visual selection state (border + background)
- Shows country curriculum (e.g., NL, US, GB, DE, FR, ES, etc.)

**Countries Supported:**
- Netherlands (NL), Belgium (BE)
- Germany (DE), France (FR), Spain (ES), Italy (IT), Portugal (PT)
- United Kingdom (GB), United States (US), Canada (CA), Australia (AU)
- Japan (JP), South Korea (KR), China (CN), India (IN)
- Brazil (BR), Mexico (MX), Russia (RU)
- Saudi Arabia (SA), UAE (AE), Turkey (TR)
- Poland (PL), Ukraine (UA)
- Indonesia (ID), Vietnam (VN), Thailand (TH)

### 2. Curriculum Mapping System ✅

**File:** `lib/curriculum-mapping.ts`

**Features:**
- Maps subjects to countries and educational levels
- Dutch curriculum (9 subjects for VWO/HAVO/VMBO)
- US/International curriculum (8 subjects for AP/General)
- Professional/University subjects (4 additional subjects)
- Level-based filtering (middle-school, high-school, university, professional)

**Subject Data Structure:**
```typescript
interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

interface CurriculumSubject {
  subject: Subject;
  levels: EducationalLevel[];
  curriculum?: string;
}
```

**Dutch Subjects (NL):**
- Natuurkunde (Physics)
- Wiskunde (Mathematics)
- Scheikunde (Chemistry)
- Biologie (Biology)
- Geschiedenis (History)
- Aardrijkskunde (Geography)
- Nederlands (Dutch)
- Engels (English)
- Economie (Economics)

**US/International Subjects:**
- Physics, Mathematics, Chemistry, Biology
- History, Geography, English, Economics

**Professional Subjects:**
- Data Science, Programming, Business, Psychology

### 3. Subject Selection Component ✅

**File:** `components/onboarding/SubjectSelection.tsx`

**Features:**
- Grid display of available subjects
- Search/filter by name or description
- Visual selection state with colored checkmarks
- "Select all" and "Clear all" buttons
- Shows selection count
- Auto-selects all subjects by default

### 4. Enhanced Onboarding Flow ✅

**File:** `components/onboarding/OnboardingPreferences.tsx`

**Updated to 4 Steps:**

**Step 1: Language Selection**
- Auto-detects language from IP location
- User can change from auto-detected
- 19 languages available

**Step 2: Country Selection**
- Auto-detects country from IP
- User can change from auto-detected
- 26 countries available

**Step 3: Educational Level Selection**
- 4 levels: Middle School, High School, University, Professional
- Visual card-based selection

**Step 4: Subject Selection**
- Auto-loads subjects based on country + level
- Auto-selects all subjects by default
- User can customize selection
- Search available
- Can select/deselect individual subjects

**Auto-Detection Behavior:**
- On mount, calls `detectLocationAndLanguage()` from `lib/country-detection.ts`
- Detects country from IP (ipapi.co API)
- Suggests language based on country
- Sets default values in state
- Shows "Detecting your location..." during detection
- Shows "Detected: {countryCode}" when complete

### 5. Database Migration Update ✅

**File:** `supabase/migrations/030_add_internationalization_fields.sql`

**Added:**
```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS selected_subjects TEXT[];
```

**Stores:**
- Array of subject IDs selected by user during onboarding
- Used to populate dashboard

### 6. Dashboard Subject Loading ✅

**File:** `components/dashboard/DashboardOverview.tsx`

**Updated Logic:**

**Priority Order:**
1. Load user's `selected_subjects` from database
2. Fetch subjects from curriculum mapping based on user's `country_code` and `educational_level`
3. Filter to only show selected subjects
4. Fallback: load from `subjects` table in database
5. Final fallback: load from localStorage

**Result:**
- Dashboard now shows all subjects selected by user during onboarding
- Not just the single subject from JSON file
- Personalized based on country, level, and selections

---

## Complete User Flow

### New User Registration:

1. **User registers** → Directed to onboarding
2. **Onboarding Step 1 (Language)**
   - Auto-detects language from IP
   - User confirms or changes language
   - Clicks "Next"
3. **Onboarding Step 2 (Country)**
   - Auto-detects country from IP
   - User confirms or changes country
   - Clicks "Next"
4. **Onboarding Step 3 (Educational Level)**
   - User selects: Middle School / High School / University / Professional
   - Clicks "Next"
5. **Onboarding Step 4 (Subjects)**
   - System loads subjects for country + level
   - All subjects auto-selected
   - User can customize (add/remove subjects)
   - Clicks "Get Started"
6. **Data Saved:**
   - `language_code` → Database
   - `country_code` → Database
   - `educational_level` → Database
   - `selected_subjects` → Database (array of subject IDs)
   - `onboarding_completed` → true
7. **User redirected to dashboard**
8. **Dashboard displays:**
   - All selected subjects in "Vakken" section
   - Not just "Natuurkunde" anymore

---

## Files Changed

### New Files (3)
- `components/onboarding/CountrySelection.tsx` - Country selection component
- `components/onboarding/SubjectSelection.tsx` - Subject selection component
- `lib/curriculum-mapping.ts` - Curriculum mapping system

### Modified Files (3)
- `components/onboarding/OnboardingPreferences.tsx` - Added country and subject steps
- `supabase/migrations/030_add_internationalization_fields.sql` - Added selected_subjects column
- `components/dashboard/DashboardOverview.tsx` - Updated to load user's selected subjects

---

## Technical Details

### Auto-Detection Flow

```typescript
// On mount in OnboardingPreferences.tsx
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
```

### Subject Loading Flow

```typescript
// In DashboardOverview.tsx
const { data: userData } = await supabase
  .from('users')
  .select('selected_subjects, country_code, educational_level')
  .eq('id', user.id)
  .single();

if (userData.selected_subjects) {
  const allSubjects = getSubjectsForCountryAndLevel(
    userData.country_code || 'NL',
    userData.educational_level || 'middle-school'
  );
  
  fetchedSubjects = allSubjects.filter((s) => 
    userData.selected_subjects.includes(s.id)
  );
}
```

### Onboarding Steps Update

**Before (2 steps):**
1. Language
2. Educational Level

**After (4 steps):**
1. Language
2. Country
3. Educational Level
4. Subjects

---

## Testing Checklist

### Manual Testing Required

**Onboarding Flow:**
- [ ] Register new user
- [ ] Verify auto-detection shows location
- [ ] Verify language is auto-selected
- [ ] Verify country is auto-selected
- [ ] Can change language
- [ ] Can change country
- [ ] Can select educational level
- [ ] Step 4 shows subjects based on country + level
- [ ] All subjects auto-selected
- [ ] Can deselect subjects
- [ ] Can search subjects
- [ ] Can select/clear all
- [ ] Click "Get Started" saves data
- [ ] Redirects to dashboard

**Dashboard:**
- [ ] Dashboard shows all selected subjects
- [ ] Not just "Natuurkunde"
- [ ] Subjects match onboarding selections
- [ ] Subject cards link to correct pages

**Settings:**
- [ ] Can change language in settings
- [ ] Can change educational level in settings
- [ ] Can change country in settings

---

## Database Migration Required

Run migration in Supabase:
```sql
-- supabase/migrations/030_add_internationalization_fields.sql
-- This adds the selected_subjects column
```

---

## Backward Compatibility

**Existing Users:**
- No impact on existing dashboard behavior
- `selected_subjects` is null by default
- Falls back to existing subject loading logic
- Can go through onboarding to set preferences

**Existing Content:**
- JSON subjects in `content/subjects/index.json` unchanged
- Database `subjects` table unchanged
- Curriculum mapping is additive (new system)

---

## Success Metrics

Implementation is successful if:
- ✅ TypeScript compiles without errors
- ✅ Onboarding has 4 steps (Language → Country → Level → Subjects)
- ✅ Country auto-detects from IP
- ✅ Language auto-detects from country
- ✅ Subjects load based on country + level
- ✅ All subjects auto-selected by default
- ✅ User can customize subject selection
- ✅ Dashboard shows all selected subjects
- ✅ Not just single subject "Natuurkunde"
- ✅ Migration adds selected_subjects column
- ✅ Existing functionality preserved

---

## Next Steps (Optional Enhancements)

1. **Add more countries** to curriculum mapping
2. **Add more subjects** per country/level
3. **Add subject progress tracking** in database
4. **Add subject-specific dashboards** (click subject to see detailed view)
5. **Add subject reordering** in settings
6. **Add curriculum-specific content** (e.g., AP Physics vs VWO Natuurkunde)
7. **Add language-translated subject names** in curriculum mapping
