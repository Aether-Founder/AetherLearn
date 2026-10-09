# Motion Reference

This document provides the complete AetherLearn motion language specification.

---

## Overview

AetherLearn motion is subtle and functional. The motion language is defined by specific durations, easing functions, and transitions.

---

## Durations

### Hover Duration

**Canonical value:** 150-200ms

**Usage:**
- All hover transitions
- Color changes
- Background changes

**Implementation:**
```css
transition-colors
```

### Dropdown Duration

**Canonical value:** 200ms

**Usage:**
- Dropdown fade-in
- Dropdown fade-out
- Visibility transitions

**Implementation:**
```css
transition-all duration-200
```

### Animation Durations

**Success animation:** 1.2s
**Skeleton shimmer:** 1.25s
**Reflection animation:** 2.4s

---

## Easing Functions

### Hover Easing

**Canonical value:** ease-in-out

**Usage:**
- All hover transitions
- Creates smooth, predictable motion

### Dropdown Easing

**Canonical value:** ease-in-out

**Usage:**
- Dropdown transitions
- Opacity and visibility changes

### Animation Easing

**Confetti:** ease-in
**Reflection:** ease-in-out

---

## Transitions

### Hover Transitions

**Canonical:**
```css
transition-colors
```

**Applied to:**
- Buttons
- Chips
- Links
- All interactive elements

### Dropdown Transitions

**Canonical:**
```css
transition-all duration-200
```

**Applied to:**
- Dropdown menus
- Popovers
- Floating elements

---

## Animations

### Skeleton Shimmer

**Canonical keyframe:**
```css
@keyframes subject-shimmer {
  to {
    transform: translateX(100%);
  }
}
```

**Usage:**
- Loading placeholders
- Skeleton screens

**Implementation:**
```css
animation: subject-shimmer 1.25s infinite
```

### Success Flash

**Canonical keyframe:**
```css
@keyframes workspace-drop-success {
  0%, 45% {
    background-color: var(--secondary);
  }
  100% {
    background-color: transparent;
  }
}
```

**Usage:**
- Success feedback
- Action confirmation

**Implementation:**
```css
animation: workspace-drop-success 1.2s ease-out
```

### Confetti Fall

**Canonical keyframe:**
```css
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

**Usage:**
- Celebration animation
- Achievement unlocked

**Implementation:**
```css
animation: confetti-fall ease-in forwards
```

### Reflection Animation

**Canonical keyframe:**
```css
@keyframes initial-loader-reflection {
  from {
    transform: translate(-100%, -100%);
  }
  to {
    transform: translate(100%, 100%);
  }
}
```

**Usage:**
- Initial loader reflection effect
- Logo shine animation

**Implementation:**
```css
animation: initial-loader-reflection 2.4s ease-in-out infinite
```

---

## Reduced Motion

### Current Status

**Not explicitly implemented**

Should be added for accessibility:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Motion That Should NOT Be Introduced

### Prohibited Animations

- Bouncing animations
- Rotating animations
- Shaking/wobbling
- Dramatic scale changes
- Particle effects
- Parallax
- Complex keyframes beyond current set
- Elastic/bouncy easing
- Scroll jacking
- Page transition effects

### When to Avoid Motion

- On sensitive content
- On forms
- On error states
- On loading states (use skeleton instead)
- On accessibility-critical elements

---

## Motion Summary

### Key Values

|| Property | Value | Usage |
||----------|-------|-------|
|| Hover duration | 150-200ms | All hover transitions |
|| Dropdown duration | 200ms | Dropdown fade |
|| Success duration | 1.2s | Success flash |
|| Shimmer duration | 1.25s | Skeleton loading |
|| Reflection duration | 2.4s | Logo animation |
|| Hover easing | ease-in-out | All hover |
|| Dropdown easing | ease-in-out | Dropdowns |
|| Confetti easing | ease-in | Celebration |

### Principles

1. **Subtle** — Motion enhances, doesn't distract
2. **Consistent** — Same durations and easing throughout
3. **Functional** — Every animation has a purpose
4. **Respectful** — Honors reduced-motion preference (when implemented)
5. **Purposeful** — Used for feedback, not decoration

### Prohibited

- Bouncing, rotating, shaking
- Dramatic scale changes
- Particle effects
- Parallax
- Complex keyframes beyond current set
- Scroll jacking
- Page transition effects

---

## Implementation Checklist

When implementing motion in AetherLearn:

- [ ] Use 150-200ms for hover transitions
- [ ] Use ease-in-out for hover easing
- [ ] Use 200ms for dropdown transitions
- [ ] Use documented keyframes for animations
- [ ] Apply focus-visible outline (not motion, but related)
- [ ] Respect prefers-reduced-motion (when implemented)
- [ ] Don't introduce prohibited animations
- [ ] Keep motion subtle
- [ ] Test performance
