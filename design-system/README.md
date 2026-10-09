# AetherLearn UI Design System

**Version:** 1.0.0

A portable visual design system that preserves the AetherLearn visual identity for use across future projects and technology stacks.

## Structure

**README.md** — Entry point and overview
**DESIGN.md** — Canonical visual design specification
**SKILL.md** — Canonical application workflow
**CHANGELOG.md** — Version history and changes

**references/** — Detailed supporting documentation
- `components.md` — In-depth component reference (chips, search field, flashcard, button, dropdown, skeleton)
- `component-atlas.md` — Structured component and state reference
- `motion.md` — Complete motion language specification (durations, easing, animations, reduced motion)
- `responsive.md` — Detailed responsive behavior at all breakpoints
- `accessibility.md` — Accessibility conventions (focus states, contrast, touch targets, keyboard behavior)
- `libraries.md` — Approved public libraries and their intended roles (Lucide React, shadcn/ui, Tailwind CSS)
- `patterns.md` — Reusable UI patterns for page composition, cards, forms, lists
- `design-review.md` — Visual review procedure with pass/fail criteria
- `implementation-notes.md` — Evidence from the existing AetherLearn codebase with file references

**tokens/** — Machine-readable design tokens
- `tokens.json` — Structured token values
- `README.md` — Token schema documentation

**examples/** — Practical demonstrations of AetherLearn rules in action

**screenshots/** — Visual source material organized by viewport and state

**assets/** — Optional reusable visual assets and icon references

## How to Use

1. **Read `DESIGN.md`** — Understand the complete visual system
2. **Read `SKILL.md`** — Learn the application workflow
3. **Reference `references/components.md`** — When building specific components
4. **Reference `references/motion.md`** — When implementing animations
5. **Reference `references/responsive.md`** — When handling different screen sizes
6. **Reference `references/accessibility.md` — When ensuring keyboard and screen-reader compatibility
7. **Reference `references/libraries.md`** — Before adding third-party dependencies
8. **Use `references/design-review.md`** — To validate implementation consistency

## Portability

This system is designed to work when copied into a completely different project. It does not rely on:
- AetherLearn source-code paths
- AetherLearn business logic
- AetherLearn database structure
- Framework-specific assumptions
- A specific editor
- A specific development platform

### Reusing in a New Project

To use this design system in a new project:

1. **Copy the entire design-system folder** into your project
2. **Read README.md** — Understand the system structure
3. **Read DESIGN.md** — Understand the visual language
4. **Read SKILL.md** — Learn the application workflow
5. **Reference tokens/tokens.json** — Use machine-readable tokens
6. **Apply the design rules** — Follow the documented patterns
7. **Perform design review** — Use references/design-review.md

### Implementation References

Implementation references in references/implementation-notes.md show where rules originated in the AetherLearn codebase. These are provided for context but are not required to understand or apply the design system.

## Design-Token Priority

1. Exact design tokens (authoritative)
2. Component-specific rules
3. Layout and interaction rules
4. General design principles
5. Reasonable judgment (last resort)

## Source of Truth

Existing AetherLearn implementation → observed design system → DESIGN.md → supporting references → future implementation
