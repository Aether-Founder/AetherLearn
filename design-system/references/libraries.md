# Libraries Reference

This document defines the policy for third-party/public libraries in AetherLearn implementations.

---

## Library Decision Hierarchy

When considering a library, follow this hierarchy:

1. **Existing AetherLearn component or utility** — Use this first
2. **Existing project dependency** — Use this second
3. **Approved public library** — Use this third
4. **Custom implementation** — Only when necessary

---

## Icon Libraries

### Status: Lucide React (Approved)

**AetherLearn uses:** Lucide React for icons

**Why Lucide React:**
- Clean, consistent stroke style
- Lightweight
- Well-maintained
- Extensive icon set
- React-native

**Icon style:**
- Stroke-based
- Stroke width: 1.5-2px
- Rounded line caps
- Standard sizes: h-4 w-4, h-5 w-5, h-6 w-6

**When to consider icon library:**
- Different icon style needed
- Icon search functionality

**Approved alternatives:**
- None currently needed

**Do not:**
- Mix multiple icon families
- Use filled icons when AetherLearn uses stroke
- Use inconsistent stroke widths

---

## UI Component Libraries

### Status: shadcn/ui (Foundation)

**AetherLearn uses:** shadcn/ui as component foundation

**Why shadcn/ui:**
- Built on Radix UI primitives
- Tailwind CSS based
- Accessible by default
- Customizable
- Copy-paste components

**Component usage:**
- Button (components/ui/button)
- Other shadcn components as needed

**Why not other UI libraries:**
- Material UI — Different aesthetic
- Ant Design — Different aesthetic
- Bootstrap — Different aesthetic
- Tailwind UI — Different aesthetic
- Chakra UI — Different aesthetic
- Mantine — Different aesthetic

**Approved approach:**
- Use shadcn/ui components where available
- Build custom components using Tailwind
- Reuse CSS custom properties
- Follow AetherLearn patterns

---

## Animation Libraries

### Status: CSS Transitions (Preferred)

**AetherLearn uses:** CSS transitions and keyframe animations

**Why not use animation libraries:**
- AetherLearn motion is simple and well-defined
- CSS transitions are sufficient for hover states
- Keyframe animations for specific effects
- Animation libraries add unnecessary complexity
- Performance impact on simple animations

**When to consider:**
- Complex physics simulations
- Complex timeline-based animations
- Gesture-based animations

**Approved alternatives:**
- CSS transitions and animations
- Framer Motion (if needed for React)
- Web Animations API for complex sequences

---

## Form Libraries

### Status: Native HTML (Preferred)

**AetherLearn uses:** Native HTML form elements with Tailwind styling

**Why not use form libraries:**
- AetherLearn forms are simple
- Custom styling ensures consistency
- Native elements are accessible
- Avoids dependency bloat

**When to consider:**
- Complex form validation
- Multi-step forms
- Dynamic form generation

**Approved alternatives:**
- React Hook Form (React-specific)
- Native HTML with custom validation

---

## Date/Time Libraries

### Status: Not Currently Used

**AetherLearn uses:** No date/time components in current implementation

**When needed:**
- Choose lightweight library
- Ensure styling can match AetherLearn
- Prefer native Date API when possible

**Approved alternatives:**
- date-fns (lightweight, functional)
- Day.js (lightweight, Moment.js replacement)
- Luxon (modern, chainable)

**Not recommended:**
- Moment.js (deprecated, large)

---

## Utility Libraries

### Status: Use Judiciously

**AetherLearn uses:** Minimal utilities

**Approved:**
- React utilities (useState, useEffect, etc.)
- Next.js utilities
- Tailwind utilities

**Guidelines:**
- Only import what you use
- Prefer tree-shaking
- Consider if native API suffices

**Not recommended:**
- Loading entire utility library for one function
- Using utilities when native API works

---

## CSS Frameworks

### Status: Tailwind CSS (Used)

**AetherLearn uses:** Tailwind CSS

**Why Tailwind CSS:**
- Utility-first approach
- Consistent with OKLCH tokens
- Responsive utilities
- Custom configuration
- Industry standard

**Not recommended:**
- Bootstrap (different aesthetic)
- Bulma (different aesthetic)
- Foundation (different aesthetic)
- Semantic UI (different aesthetic)

**Tailwind configuration:**
- Maps OKLCH tokens to Tailwind colors
- Custom font families
- Custom plugins if needed

---

## Build Tools

### Status: Next.js (Used)

**AetherLearn uses:** Next.js build system

**Approved:**
- Next.js (used in project)
- Vite (if migrating)
- Webpack (industry standard)
- Parcel (zero-config)
- esbuild (extremely fast)

**Guidelines:**
- Match project existing setup
- Don't introduce new build tools without reason
- Consider performance impact

---

## Testing Libraries

### Status: Not Currently Documented

**When needed:**
- Choose based on project framework
- Ensure testing utilities match project needs

**Approved:**
- Jest (JavaScript testing)
- Vitest (Vite-native alternative to Jest)
- Testing Library (React, Vue, etc.)
- Playwright (E2E testing)
- Cypress (E2E testing)

---

## General Library Policy

### Principles

1. **Prefer native APIs** when they suffice
2. **Prefer lightweight libraries** over heavy ones
3. **Prefer libraries that can be styled** to match AetherLearn
4. **Avoid multiple libraries** for the same problem
5. **Document the reason** when adding a new library
6. **Remove unused libraries** regularly

### Adding a New Library

**Before adding:**
1. Check if existing solution works
2. Check if project already has similar library
3. Verify library can be styled to match AetherLearn
4. Consider performance impact
5. Consider bundle size impact
6. Consider maintenance burden

**After adding:**
1. Document in this file
2. Document when to use it
3. Document when NOT to use it
4. Document integration approach
5. Update package.json with version pinning

### Removing a Library

**When to remove:**
- Library is no longer used
- Better alternative exists
- Library is deprecated
- Library causes security issues

**Process:**
1. Verify no code uses the library
2. Remove from package.json
3. Remove from node_modules
4. Update this file
5. Test application

---

## Library Maintenance

### Regular Review

**Quarterly:**
- Review all dependencies
- Check for security vulnerabilities
- Check for deprecated libraries
- Check for better alternatives

**When vulnerability found:**
- Update to secure version
- If no secure version, find alternative
- Document the change

### Version Pinning

**Recommendation:**
- Pin exact versions in package.json
- Use caret (^) for minor updates only
- Use tilde (~) for patch updates only
- Avoid wildcards (*) for production

---

## Summary

### Recommended Approach

1. **Use Tailwind CSS** for styling
2. **Use Lucide React** for icons
3. **Use shadcn/ui** for component foundation
4. **Use native APIs** when they suffice
5. **Use existing project dependencies** before adding new ones
6. **Choose lightweight libraries** when necessary
7. **Ensure libraries can be styled** to match AetherLearn
8. **Document all library decisions**

### What to Avoid

1. Don't add libraries for simple problems
2. Don't add multiple libraries for the same purpose
3. Don't use heavy libraries when lightweight alternatives exist
4. Don't use libraries that can't be styled to match AetherLearn
5. Don't use deprecated libraries
6. Don't ignore security vulnerabilities

### Decision Framework

**When considering a library:**

1. Can native API solve this? → Use native API
2. Does project already have a library? → Use existing
3. Is there a lightweight approved library? → Use approved
4. Must build custom? → Build custom with AetherLearn tokens

**Only add new library when all above fail.**
