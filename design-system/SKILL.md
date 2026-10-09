# AetherLearn Design System — Application Skill

This document describes how to apply the AetherLearn design system during development work. It provides a repeatable workflow for implementing AetherLearn visuals consistently across projects.

---

## Overview

The AetherLearn design system is a complete visual language specification. This skill document explains how to apply that specification when building or modifying interfaces.

**Goal:** Ensure all implementations consistently reproduce the AetherLearn visual identity.

---

## Implementation Workflow

### Step 1: Inspect the Existing Project Context

Before applying AetherLearn visuals:

1. **Understand the project structure**
   - What framework is being used? (Next.js, React, Vue, etc.)
   - What styling approach exists? (Tailwind, CSS-in-JS, etc.)
   - What are the existing patterns?

2. **Identify what needs to be built or modified**
   - New page? New component? Modification?
   - Is there an existing AetherLearn pattern that fits?

3. **Check for existing design tokens**
   - Does the project already have OKLCH tokens?
   - Can AetherLearn tokens be added or mapped?
   - Is Tailwind configured?

### Step 2: Read DESIGN.md

Before writing any code:

1. **Read the relevant sections of DESIGN.md**
   - Design Tokens for exact OKLCH values
   - Components for element specifications
   - Layout for structure
   - Responsive for behavior
   - Motion for animations

2. **Identify which rules apply**
   - What tokens do you need?
   - What component pattern fits?
   - What responsive behavior is required?

3. **Note the exact values**
   - Write down the exact OKLCH values
   - Note the Tailwind utility classes
   - Don't rely on memory or approximation

### Step 3: Determine Which AetherLearn Design Rules Apply

For each decision:

1. **Check if a pattern exists**
   - Is there a similar component in AetherLearn?
   - Can it be adapted?

2. **Use documented tokens**
   - Colors: var(--background), var(--foreground), var(--primary), etc.
   - Spacing: Tailwind spacing scale (p-4, p-6, gap-4, etc.)
   - Typography: Cormorant Garamond for headings, Inter for UI
   - Radius: rounded-lg (0.75rem), rounded, rounded-full

3. **Follow component behavior**
   - Hover: color change, background change
   - Focus: ring outline
   - Active: scale or color shift
   - Borders: border-border, focus:border-foreground/40

4. **Apply motion language**
   - Hover: 150-200ms transition
   - Dropdown: 200ms ease-in-out
   - Skeleton: 1.25s shimmer
   - Respect reduced motion (when implemented)

### Step 4: Reuse Existing Patterns Before Creating New Ones

1. **Check for similar components**
   - Flashcard → use flashcard pattern
   - Chip/button → use chip pattern
   - Search field → use search field pattern
   - Card → use card pattern

2. **Adapt if necessary**
   - Can the existing pattern work with minor changes?
   - Are the changes justified?

3. **Only create new when necessary**
   - Existing pattern cannot reasonably express the requirement
   - Document the new pattern for future reuse

### Step 5: Use Documented Tokens

Always use the documented tokens from DESIGN.md:

**Colors (OKLCH):**
```css
--background: oklch(0.965 0.011 259) /* Light */
--background: oklch(0.176 0.031 265) /* Dark */
--foreground: oklch(0.176 0.031 265) /* Light */
--foreground: oklch(0.981 0.003 247) /* Dark */
--primary: oklch(0.176 0.031 265) /* Light */
--primary: oklch(0.981 0.003 247) /* Dark */
--muted-foreground: oklch(0.573 0.032 254) /* Light */
--muted-foreground: oklch(0.712 0.031 254) /* Dark */
--border: oklch(0.85 0.012 258) /* Light */
--border: oklch(0.297 0.032 261) /* Dark */
```

**Spacing (Tailwind):**
Use Tailwind's spacing scale (p-4, p-6, gap-4, mt-2.5, etc.)

**Typography:**
```css
--font-display: 'Cormorant Garamond', Georgia, serif;
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

**Radius:**
```css
rounded-md: 0.375rem
rounded: 0.5rem
rounded-lg: 0.75rem (default)
rounded-full: 999px
```

**Motion:**
```css
transition-colors /* 150-200ms */
transition-all duration-200 /* Dropdowns */
```

### Step 6: Follow AetherLearn Typography and Spacing

**Typography:**
- Headings: Cormorant Garamond (font-display)
- Body/UI: Inter (font-sans)
- Use the documented hierarchy
- Use the documented weights (400, 500, 600, 700)

**Spacing:**
- Use Tailwind's spacing scale
- Don't invent arbitrary values
- Consistent spacing creates rhythm

**Example:**
```css
/* Correct: use Tailwind scale */
className="p-6 gap-4 mt-2.5"

/* Incorrect: arbitrary values */
className="padding: 24px; gap: 16px; margin-top: 40px;"
```

### Step 7: Follow AetherLearn Component Behavior

**For each component:**

1. **Apply rounded corners**
```css
rounded-lg /* Default for cards, panels */
rounded /* For buttons, inputs */
rounded-full /* For chips, pills */
```

2. **Apply borders**
```css
border border-border
focus:border-foreground/40
```

3. **Apply hover state**
```css
transition-colors
hover:bg-secondary
hover:text-foreground
```

4. **Apply focus state**
```css
focus:outline-none
focus-visible:ring-2 ring-ring ring-offset-2
```

5. **Use correct radius**
- Cards/panels: rounded-lg (0.75rem)
- Buttons/inputs: rounded (0.5rem)
- Chips/pills: rounded-full
- Small elements: rounded-md (0.375rem)

### Step 8: Follow AetherLearn Responsive Rules

**Implement responsive behavior:**

1. **Use Tailwind breakpoints**
   - sm: 640px
   - md: 768px
   - lg: 1024px
   - xl: 1280px

2. **Mobile-first or desktop-first?**
   - AetherLearn uses Tailwind's responsive utilities
   - Can be mobile-first or desktop-first
   - Use lg:hidden/lg:block for visibility

3. **Grid behavior**
   - Desktop: auto-fit with minmax(14rem, 1fr)
   - Tablet: Adjust columns
   - Mobile: 1 column

4. **Typography scaling**
   - Use Tailwind's text-size utilities
   - text-sm, text-base, text-lg, text-xl, etc.

5. **Touch targets**
   - Minimum 44px height on mobile
   - Adequate padding for links

### Step 9: Follow AetherLearn Motion Rules

**Apply motion consistently:**

1. **Hover transitions**
   - Duration: 150-200ms
   - Easing: ease-in-out
   - Properties: color, background, border

2. **Dropdown transitions**
   - Duration: 200ms
   - Easing: ease-in-out
   - Effect: opacity + visibility

3. **Don't introduce:**
   - Bouncing animations
   - Rotating animations
   - Excessive motion
   - Complex keyframes beyond current set

4. **Respect reduced motion**
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
}
```

### Step 10: Use Approved Libraries Where Appropriate

**Library decision hierarchy:**

1. **Existing AetherLearn component or utility** — Use this first
2. **Existing project dependency** — Use this second
3. **Approved public library** — Use this third
4. **Custom implementation** — Only when necessary

**For icons:**
- Use Lucide React
- Stroke-based icons
- 1.5-2px stroke width

**For components:**
- Use shadcn/ui components where available
- Build custom components following patterns
- Use Tailwind utilities

**For motion:**
- Use CSS transitions
- Use Tailwind's transition utilities
- Avoid heavy animation libraries

**For other categories:**
- See references/libraries.md for approved libraries
- Don't introduce multiple libraries for the same problem

### Step 11: Compare Implementation Against References

**After implementation:**

1. **Visual comparison**
   - Does it look like AetherLearn?
   - Are colors correct (OKLCH)?
   - Is typography correct (Cormorant/Inter)?
   - Is spacing correct (Tailwind scale)?

2. **Code comparison**
   - Are tokens used correctly?
   - Are Tailwind utilities correct?
   - Are states correct?
   - Is motion correct?

3. **Responsive comparison**
   - Does it match documented behavior?
   - Are breakpoints correct?
   - Is mobile usable?

### Step 12: Perform Design Review

**Use the review process from references/design-review.md:**

1. **IMPLEMENT** → Build the feature
2. **RENDER** → View in browser
3. **INSPECT** → Compare against DESIGN.md
4. **COMPARE** → Check all categories
5. **IDENTIFY DRIFT** → List deviations
6. **FIX** → Correct major drift
7. **RENDER AGAIN** → Verify fixes
8. **FINAL REVIEW** → Pass/fail assessment

**Review categories:**
- Visual identity
- Color (OKLCH)
- Typography (Cormorant/Inter)
- Spacing (Tailwind)
- Geometry (rounded-lg)
- Components
- Layout
- Responsive
- Motion
- Interaction
- Accessibility
- Visual drift

### Step 13: Correct Visual Drift

**When drift is identified:**

1. **Categorize as minor or major**
   - Minor: Small deviation, doesn't break identity
   - Major: Breaks visual identity, must fix

2. **Fix major drift**
   - Re-apply documented rules
   - Use exact token values
   - Re-apply component patterns
   - Use correct Tailwind utilities

3. **Consider minor drift**
   - Is it justified by context?
   - Should it be documented?
   - Can it be avoided?

4. **Re-apply when necessary**
   - Don't accept "close enough"
   - Use exact values from DESIGN.md

### Step 14: Re-Review

**After corrections:**

1. **Render again**
   - View the corrected implementation
   - Check at different screen sizes
   - Test in both light and dark themes

2. **Verify fixes**
   - Did the drift resolve?
   - Are tokens correct now?
   - Is visual identity preserved?

3. **Final assessment**
   - Pass: All major categories pass
   - Minor drift: Justified and documented
   - Fail: Still has major drift, continue fixing

### Step 15: Only Then Consider Complete

**Do not consider the work complete until:**

- All design tokens are used correctly
- All component patterns are followed
- All states are implemented
- Responsive behavior matches documentation
- Motion language is applied
- Accessibility requirements are met
- Design review passes
- Theme support works (light/dark/custom)

---

## Creating New Pages

### Process

1. **Determine page type**
   - Hub/landing → Use homepage pattern
   - Content detail → Use content page pattern
   - List/index → Use card grid pattern
   - Form → Use form pattern

2. **Apply background**
   - Always use bg-background
   - Always include theme support
   - Use proper color tokens

3. **Choose container**
   - Use Tailwind container utilities if needed
   - Use responsive padding
   - No fixed max-width unless necessary

4. **Apply typography**
   - Headings: Cormorant Garamond (font-display)
   - Body: Inter (font-sans)
   - Follow hierarchy

5. **Use components**
   - Cards: rounded-lg, border-border, bg-background
   - Buttons: rounded, bg-primary
   - Inputs: rounded, border-border, bg-background

6. **Apply spacing**
   - Use Tailwind spacing scale
   - Section margins: mt-2.5, mb-0.75
   - Grid gaps: gap-0.75

7. **Ensure responsive**
   - Mobile: single column
   - Tablet: adjusted grid
   - Desktop: full layout

8. **Add motion**
   - Hover: transition-colors
   - Dropdown: transition-all duration-200
   - No excessive motion

9. **Verify accessibility**
   - Focus states
   - Contrast
   - Touch targets

10. **Design review**
    - Compare against DESIGN.md
    - Fix any drift
    - Final assessment

---

## Creating New Components

### Process

1. **Check for existing similar component**
   - Is there already a component that fits?
   - Can it be adapted?

2. **If no existing component:**
   - Follow rounded-lg pattern for cards
   - Use documented tokens
   - Apply hover/focus states
   - Use correct radius

3. **Document the new component**
   - Add to DESIGN.md Components section
   - Add to references/components.md
   - Add example in examples/
   - Add screenshot if visual

4. **Make it reusable**
   - Use semantic props
   - Support variants if needed
   - Document the variants

5. **Test thoroughly**
   - All states
   - All responsive breakpoints
   - Light and dark themes
   - Accessibility

6. **Design review**
   - Does it feel like AetherLearn?
   - Is it consistent?
   - Should it be part of the system?

---

## Modifying Existing Components

### Process

1. **Understand why modification is needed**
   - Is it a bug fix?
   - Is it a feature addition?
   - Is it a visual improvement?

2. **Check design system impact**
   - Does this change a documented rule?
   - Should DESIGN.md be updated?
   - Should the component spec be updated?

3. **Make minimal changes**
   - Only change what's necessary
   - Preserve existing patterns
   - Maintain consistency

4. **Update documentation**
   - Update DESIGN.md if rule changes
   - Update references/components.md
   - Update examples if needed

5. **Test affected areas**
   - All uses of the component
   - All states
   - All responsive breakpoints
   - Light and dark themes

6. **Design review**
   - Does the change improve consistency?
   - Does it break anything?
   - Is it justified?

---

## Introducing New Patterns

### When Is It Justified?

A new pattern is justified when:

1. **Existing patterns cannot reasonably express the requirement**
   - The functionality is genuinely new
   - Adapting existing patterns would be forced
   - No reasonable alternative exists

2. **The new pattern follows AetherLearn principles**
   - Uses rounded-lg for cards
   - Uses documented tokens
   - Follows motion language
   - Maintains visual consistency

3. **The new pattern is reusable**
   - Can be used in multiple contexts
   - Solves a recurring problem
   - Not a one-off solution

### Process

1. **Design the pattern**
   - Follow AetherLearn principles
   - Use documented tokens
   - Apply rounded-lg where appropriate
   - Implement states

2. **Document the pattern**
   - Add to DESIGN.md
   - Add to references/
   - Add example
   - Add screenshot

3. **Test thoroughly**
   - All states
   - All contexts
   - Responsive behavior
   - Light and dark themes

4. **Design review**
   - Does it feel like AetherLearn?
   - Is it consistent?
   - Should it be canonical?

5. **Integrate into system**
   - Make it available for reuse
   - Update SKILL.md if workflow changes
   - Update library decisions if applicable

---

## Handling Unspecified Design Decisions

### Decision Framework

When DESIGN.md doesn't specify something:

1. **Reuse the closest existing AetherLearn pattern**
   - Is there a similar component?
   - Can an existing pattern be adapted?

2. **Reuse an existing semantic token**
   - Is there a color token that fits?
   - Is there a spacing token that works?
   - Is there a typography token that matches?

3. **Reuse the existing spacing/radius/type scale**
   - Choose the closest Tailwind utility
   - Don't invent new values
   - Maintain consistency

4. **Prefer consistency over novelty**
   - Does this match the visual language?
   - Would this feel like AetherLearn?
   - Is this consistent with other elements?

5. **Introduce new only when necessary**
   - Can the requirement be expressed with existing patterns?
   - Is this genuinely new functionality?
   - Is there no reasonable alternative?

6. **Document genuinely new reusable patterns**
   - If a new pattern is created, document it
   - Add to DESIGN.md
   - Make it available for future use

### Examples

**Unspecified button size:**
- Use px-3 py-2 (standard button padding)
- Don't invent new padding

**Unspecified color for a new state:**
- Use primary, secondary, or muted-foreground
- Don't introduce new OKLCH values

**Unspecified spacing:**
- Use Tailwind spacing scale (p-4, p-6, gap-4, etc.)
- Don't invent arbitrary rem values

**Unspecified component:**
- Adapt the closest existing component pattern
- Apply rounded-lg, border-border, bg-background
- Don't create from scratch

---

## Preserving Consistency

### Rules

1. **Always use documented tokens**
   - Don't guess OKLCH values
   - Don't use approximate values
   - Use exact values from DESIGN.md

2. **Always follow component patterns**
   - Don't reinvent components
   - Don't create new styles unnecessarily
   - Reuse existing patterns

3. **Always apply rounded-lg for cards**
   - Default radius is 0.75rem
   - Use rounded for buttons
   - Use rounded-full for pills

4. **Always use the motion language**
   - Documented durations
   - Documented easing
   - Documented transitions

5. **Always ensure responsive behavior**
   - Documented breakpoints
   - Documented layouts
   - Documented sizing

6. **Always perform design review**
   - Compare against DESIGN.md
   - Fix drift
   - Don't accept "close enough"

### Consistency Checklist

Before considering work complete:

- [ ] All colors use documented OKLCH tokens
- [ ] All spacing uses Tailwind scale
- [ ] All typography uses Cormorant/Inter
- [ ] All components follow documented patterns
- [ ] All states are implemented correctly
- - rounded-lg used for cards
- - border-border used for borders
- - Motion follows documented language
- - Responsive behavior matches documentation
- - Accessibility requirements are met
- - Design review passes

---

## Responsive Implementation

### Process

1. **Use Tailwind breakpoints**
   - sm: 640px
   - md: 768px
   - lg: 1024px
   - xl: 1280px
   - Don't introduce new breakpoints without reason

2. **Implement documented behavior**
   - Grid changes at specific breakpoints
   - Typography scaling with Tailwind utilities
   - Padding changes with Tailwind utilities

3. **Test on actual devices**
   - Mobile phone
   - Tablet
   - Desktop
   - Large desktop

4. **Touch targets**
   - Minimum 44px height for buttons
   - Adequate padding for links
   - Adequate spacing between interactive elements

5. **Content visibility**
   - Use lg:hidden/lg:block for visibility
   - Stack columns appropriately
   - Ensure content remains accessible

---

## Motion Implementation

### Process

1. **Use documented durations**
   - Hover: 150-200ms
   - Dropdown: 200ms
   - Skeleton: 1.25s

2. **Use documented easing**
   - Hover: ease-in-out
   - Dropdown: ease-in-out
   - Confetti: ease-in

3. **Use documented transitions**
   - transition-colors for color changes
   - transition-all for dropdowns

4. **Don't introduce:**
   - Bouncing animations
   - Rotating animations
   - Excessive motion
   - Complex keyframes beyond current set

5. **Respect reduced motion**
   - Always include reduced-motion media query when adding animations
   - Disable or simplify animations when preferred

---

## Library Selection

### Decision Hierarchy

1. **Existing AetherLearn component or utility** — Use this first
2. **Existing project dependency** — Use this second
3. **Approved public library** — Use this third
4. **Custom implementation** — Only when necessary

### Guidelines

- Don't add libraries for simple problems
- Prefer lightweight, focused libraries
- Ensure libraries fit AetherLearn philosophy
- Check if existing implementation already satisfies requirement

### See references/libraries.md

For approved libraries and their intended roles.

---

## Accessibility Implementation

### Requirements

1. **Focus states**
   - focus:outline-none
   - focus-visible:ring-2 ring-ring ring-offset-2
   - Applied to all interactive elements

2. **Contrast**
   - WCAG AA contrast ratios
   - High contrast for text
   - Adequate contrast for interactive elements

3. **Touch targets**
   - Minimum 44px height for buttons
   - Adequate padding for links
   - Adequate spacing

4. **Keyboard navigation**
   - All interactive elements keyboard-accessible
   - Logical tab order
   - Visible focus indicators

5. **Non-color state communication**
   - States use multiple indicators
   - Color + border + background
   - Never rely on color alone

6. **Reduced motion**
   - Always respect prefers-reduced-motion
   - Simplify or disable animations

---

## Visual Review

### Process

1. **Implement** → Build the feature
2. **Render** → View in browser at multiple sizes
3. **Inspect** → Check against DESIGN.md
4. **Compare** → Check all review categories
5. **Identify drift** → List deviations
6. **Fix** → Correct major drift
7. **Render again** → View corrections
8. **Final review** → Pass/fail assessment

### Review Categories

- Visual identity
- Color (OKLCH)
- Typography (Cormorant/Inter)
- Spacing (Tailwind)
- Geometry (rounded-lg)
- Components
- Layout
- Responsive
- Motion
- Interaction
- Accessibility
- Visual drift

### Pass/Fail Criteria

**PASS:**
- All major categories pass
- Minor drift is justified and documented
- Visual identity is preserved
- No arbitrary inventions

**MINOR DRIFT:**
- Small deviations that don't break identity
- Justified by context
- Documented for future reference

**MAJOR DRIFT:**
- Breaks visual identity
- Arbitrary colors or patterns
- Inconsistent with AetherLearn
- Missing signature elements
- Not justified

---

## Creating New Pages

### Process

1. **Determine page type**
   - Hub/landing → Use homepage pattern
   - Content detail → Use content page pattern
   - List/index → Use card grid pattern
   - Form → Use form pattern

2. **Apply background**
   - Always use bg-background
   - Always include theme support
   - Use proper color tokens

3. **Choose container**
   - Use Tailwind container utilities if needed
   - Use responsive padding
   - No fixed max-width unless necessary

4. **Apply typography**
   - Headings: Cormorant Garamond (font-display)
   - Body: Inter (font-sans)
   - Follow hierarchy

5. **Use components**
   - Cards: rounded-lg, border-border, bg-background
   - Buttons: rounded, bg-primary
   - Inputs: rounded, border-border, bg-background

6. **Apply spacing**
   - Use Tailwind spacing scale
   - Section margins: mt-2.5, mb-0.75
   - Grid gaps: gap-0.75

7. **Ensure responsive**
   - Mobile: single column
   - Tablet: adjusted grid
   - Desktop: full layout

8. **Add motion**
   - Hover: transition-colors
   - Dropdown: transition-all duration-200
   - No excessive motion

9. **Verify accessibility**
   - Focus states
   - Contrast
   - Touch targets

10. **Design review**
    - Compare against DESIGN.md
    - Fix any drift
    - Final assessment

---

## Documentation Updates

### When to Update the Design System

When a reusable design change is intentionally introduced:

1. **Identify if the change is reusable**
   - Can this pattern be used in other contexts?
   - Is this a genuinely new component or pattern?
   - Is this a modification to an existing reusable pattern?

2. **Update DESIGN.md if applicable**
   - If introducing a new reusable component, add to Components section
   - If introducing a new pattern, add to Patterns section
   - If modifying existing rules, update the relevant section
   - If adding new tokens, add to Design Tokens section

3. **Update reference documents**
   - Add detailed component spec to references/components.md
   - Add motion details to references/motion.md
   - Add responsive behavior to references/responsive.md
   - Update implementation-notes.md with new file references

4. **Update machine-readable tokens**
   - Add new tokens to tokens/tokens.json
   - Update tokens/README.md if schema changes
   - Ensure tokens match DESIGN.md exactly

5. **Increment version**
   - Update version in README.md
   - Add entry to CHANGELOG.md
   - Categorize as Major, Minor, or Patch

6. **Document the reason**
   - Explain why the change was necessary
   - Describe what problem it solves
   - Note any alternatives considered

### When Updates Are Not Required

**Do not update the design system for:**
- One-off solutions that won't be reused
- Context-specific hacks
- Temporary implementations
- Bug fixes that don't change visual rules
- Business logic changes
- Content changes

### Update Workflow

**Before implementation:**
1. Determine if the change is genuinely reusable
2. If yes, plan the documentation update

**After implementation:**
1. Update canonical source (DESIGN.md)
2. Update reference documents
3. Update machine-readable tokens
4. Update version and changelog
5. Verify consistency across all documents
