# Design Review Procedure

This document defines the actual visual-review process for AetherLearn implementations.

---

## Review Process

### Step 1: IMPLEMENT

Build the feature or page according to the design system.

**Checklist:**
- [ ] Used documented OKLCH tokens
- [ ] Followed component patterns
- [ ] Applied rounded-lg where appropriate
- [ ] Used correct typography (Cormorant/Inter)
- [ ] Used correct spacing (Tailwind scale)
- [ ] Implemented all states

### Step 2: RENDER

View the implementation in a browser.

**Checklist:**
- [ ] Viewed at desktop size
- [ ] Viewed at tablet size
- [ ] Viewed at mobile size
- [ ] Tested hover states
- [ ] Tested focus states
- [ ] Tested active states (if applicable)
- [ ] Tested in light theme
- [ ] Tested in dark theme

### Step 3: INSPECT

Compare the implementation against DESIGN.md.

**Checklist:**
- [ ] Colors match documented OKLCH tokens
- [ ] Typography matches hierarchy (Cormorant/Inter)
- [ ] Spacing matches Tailwind scale
- [ ] Radius matches documented values (rounded-lg)
- [ ] Borders match border-border
- [ ] Motion matches documented language

### Step 4: COMPARE

Perform category-by-category comparison.

**Checklist:**
- [ ] Visual identity preserved
- [ ] Colors correct (OKLCH)
- [ ] Typography correct (Cormorant/Inter)
- [ ] Spacing correct (Tailwind)
- [ ] Geometry correct (rounded-lg)
- [ ] Components correct
- [ ] Layout correct
- [ ] Responsive correct
- [ ] Motion correct
- [ ] Interaction correct
- [ ] Accessibility correct

### Step 5: IDENTIFY DRIFT

List any deviations from the design system.

**Categorize as:**
- **Minor drift:** Small deviation, doesn't break identity
- **Major drift:** Breaks visual identity, must fix

### Step 6: FIX

Correct major drift by re-applying documented rules.

**Process:**
1. Identify the rule that was violated
2. Re-apply the exact token value
3. Re-apply the component pattern
4. Re-apply the motion language
5. Use correct Tailwind utilities

### Step 7: RENDER AGAIN

View the corrected implementation.

**Checklist:**
- [ ] Re-viewed at all screen sizes
- [ ] Re-tested all states
- [ ] Re-tested in light and dark themes
- [ ] Verified fixes

### Step 8: FINAL REVIEW

Perform pass/fail assessment.

**Criteria:**
- **PASS:** All major categories pass, minor drift justified
- **MINOR DRIFT:** Small deviations justified and documented
- **FAIL:** Still has major drift, continue fixing

---

## Review Categories

### Visual Identity

**Question:** Does it clearly look like AetherLearn?

**Check:**
- [ ] Cormorant Garamond used for headings
- [ ] Inter used for UI text
- [ ] OKLCH color palette used
- [ ] rounded-lg used for cards
- [ ] border-border used for borders
- [ ] No glassmorphism
- [ ] No starfield or animated backgrounds
- [ ] Clean, minimal aesthetic

**Fail if:**
- Wrong font families
- Wrong color space (not OKLCH)
- Arbitrary colors
- Missing rounded-lg
- Glassmorphism present
- Animated backgrounds

### Color

**Question:** Are semantic colors correct?

**Check:**
- [ ] var(--background) used for backgrounds
- [ ] var(--foreground) used for primary text
- [ ] var(--muted-foreground) used for secondary text
- [ ] var(--border) used for borders
- [ ] var(--primary) used for primary actions
- [ ] No arbitrary OKLCH values
- [ ] No hex colors

**Fail if:**
- Wrong text colors
- Wrong surface colors
- Arbitrary OKLCH values
- Hex colors used
- Missing semantic colors

### Typography

**Question:** Are families, sizes, weights, and hierarchy correct?

**Check:**
- [ ] Cormorant Garamond for headings
- [ ] Inter for UI text
- [ ] Font sizes match hierarchy
- [ ] Font weights correct (400, 500, 600, 700)
- [ ] Letter-spacing correct where used

**Fail if:**
- Wrong font family
- Wrong font sizes
- Wrong font weights
- Missing letter-spacing
- System fonts for headings

### Spacing

**Question:** Is the AetherLearn rhythm preserved?

**Check:**
- [ ] Values from Tailwind spacing scale
- [ ] Section margins: mt-2.5, mb-0.75
- [ ] Grid gaps: gap-0.75
- [ ] Card padding: p-4 or p-6
- [ ] No arbitrary spacing values

**Fail if:**
- Arbitrary spacing values
- Compressed spacing
- Inconsistent gaps
- Wrong padding values
- Pixel values instead of Tailwind

### Geometry

**Question:** Are radius and proportions correct?

**Check:**
- [ ] rounded-lg (0.75rem) for cards/panels
- [ ] rounded (0.5rem) for buttons/inputs
- [ ] rounded-full for chips/pills
- [ ] 1px border thickness
- [ ] No sharp corners

**Fail if:**
- Wrong border radius
- Sharp corners
- Wrong border thickness
- Inconsistent shapes

### Components

**Question:** Are existing component patterns reused?

**Check:**
- [ ] Cards use rounded-lg, border-border, bg-background
- [ ] Buttons use rounded, px-3 py-2
- [ ] Inputs use rounded, border-border, bg-background
- [ ] States implemented correctly

**Fail if:**
- New card style without reason
- New button style without reason
- Missing border
- Wrong radius
- Wrong states

### Layout

**Question:** Does hierarchy match AetherLearn?

**Check:**
- [ ] Content layout appropriate
- [ ] Spacing consistent
- [ ] Grid behavior correct
- [ ] Padding consistent

**Fail if:**
- Wrong layout
- Inconsistent spacing
- Wrong grid behavior
- Wrong padding

### Responsive

**Question:** Does behavior match documented rules?

**Check:**
- [ ] Single column on mobile
- [ ] Adjusted grid on tablet
- [ ] Full width on mobile where needed
- [ ] Touch targets adequate (44px)
- [ ] lg:hidden/lg:block used correctly

**Fail if:**
- Wrong breakpoints
- Wrong layout changes
- Missing mobile behavior
- Inadequate touch targets

### Motion

**Question:** Does animation feel like AetherLearn?

**Check:**
- [ ] Hover: 150-200ms transition
- [ ] Dropdown: 200ms transition
- [ ] No prohibited animations
- [ ] Reduced motion respected (when implemented)

**Fail if:**
- Wrong durations
- Wrong easing
- Bouncing/rotating animations
- No reduced-motion support

### Interaction

**Question:** Are hover, active, selected, focus, loading, and disabled states consistent?

**Check:**
- [ ] Hover: color change, background change
- [ ] Focus: ring outline
- [ ] Active: scale or color shift
- [ ] Selected: clearly indicated
- [ ] Loading: skeleton animation
- [ ] Disabled: (if used) reduced opacity

**Fail if:**
- Missing hover state
- Missing focus state
- Wrong state indicators
- Color-only state communication

### Accessibility

**Question:** Does the design remain usable and readable?

**Check:**
- [ ] Focus-visible outline present
- [ ] Contrast ratios meet WCAG AA
- [ ] Touch targets adequate (44px minimum)
- [ ] Reduced motion respected (when implemented)
- [ ] Keyboard navigation works
- [ ] States not color-only

**Fail if:**
- Missing focus states
- Low contrast
- Small touch targets
- No reduced-motion support
- Color-only states

### Visual Drift

**Question:** Does anything feel like a generic design pattern rather than AetherLearn?

**Check:**
- [ ] No generic SaaS card style
- [ ] No arbitrary colors
- [ ] No inconsistent patterns
- [ ] No missing rounded-lg
- [ ] No wrong border colors
- [ ] No wrong spacing
- [ ] No missing Cormorant/Inter
- [ ] No OKLCH violations

**Fail if:**
- Generic looking
- Arbitrary visual decisions
- Inconsistent with AetherLearn DNA
- Missing signature elements

---

## Pass/Fail Criteria

### PASS

**Requirements:**
- All major categories pass
- Minor drift is justified and documented
- Visual identity is preserved
- No arbitrary inventions
- All documented rules followed

**Example:**
- Minor: Slightly different padding (still within Tailwind scale)
- Justified: Specific content required it
- Documented: Added note to implementation

### MINOR DRIFT

**Requirements:**
- Small deviation that doesn't break identity
- Justified by specific context
- Documented for future reference
- Doesn't affect user experience

**Example:**
- Deviation: Padding is p-5 instead of p-4
- Justification: Specific content needed more space
- Documented: Added comment explaining why

### MAJOR DRIFT

**Requirements:**
- Breaks visual identity
- Arbitrary colors or patterns
- Inconsistent with AetherLearn
- Missing signature elements
- Not justified

**Example:**
- Deviation: Using solid white background
- Justification: None
- Action: Must fix, use bg-background

---

## When New Components Are Justified

A new component or pattern is justified when:

1. **Existing patterns cannot reasonably express the requirement**
   - The functionality is genuinely new
   - Adapting existing patterns would be forced
   - No reasonable alternative exists

2. **The new pattern follows AetherLearn principles**
   - Uses rounded-lg for cards
   - Uses documented OKLCH tokens
   - Follows motion language
   - Maintains visual consistency

3. **The new pattern is reusable**
   - Can be used in multiple contexts
   - Solves a recurring problem
   - Not a one-off solution

**Process:**
1. Document the new component in DESIGN.md
2. Document in references/components.md
3. Add example in examples/
4. Add screenshot if visual
5. Update SKILL.md if workflow changes

---

## Do Not Allow

- "Looks fine" as the only criterion
- Subjective judgment without reference to DESIGN.md
- Arbitrary visual decisions
- Skipping design review
- Accepting "close enough" without justification
- Ignoring major drift

---

## Review Checklist

Before considering implementation complete:

- [ ] Visual identity preserved
- [ ] Colors correct (OKLCH)
- [ ] Typography correct (Cormorant/Inter)
- [ ] Spacing correct (Tailwind)
- [ ] Geometry correct (rounded-lg)
- [ ] Components correct
- [ ] Layout correct
- [ ] Responsive correct
- [ ] Motion correct
- [ ] Interaction correct
- [ ] Accessibility correct
- [ ] No visual drift
- [ ] All documented rules followed
- [ ] No arbitrary inventions

---

## Continuous Review

### When to Review

- Before committing changes
- After major component changes
- After responsive implementation
- After adding new patterns
- Before merging pull requests

### Review Frequency

- **During development:** Continuous self-review
- **Before PR:** Formal review by peer
- **After merge:** Regression review

### Review Tools

- Browser DevTools (inspect tokens)
- Contrast checker (for accessibility)
- Screen reader (for accessibility)
- Multiple devices (for responsive)
- Different browsers (for compatibility)
