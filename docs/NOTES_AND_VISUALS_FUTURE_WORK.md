# Notes and Visuals - Future Work

## ⚠️ IMPORTANT NOTE
**This work is NOT PRIORITY at all.** The current visual tools are sufficient for basic note-taking. Focus should be on filesystem integration and button placement rendering first.

---

## Current Status

### ✅ Implemented
- **Visual Tools Toolbar** - Buttons for Diagram, Mind Map, Drawing
- **Diagram Editor** - Flowcharts, sequence diagrams, entity relationships
- **Mind Map Editor** - Hierarchical concept nodes and connections
- **Drawing Editor** - Freehand canvas with various tools
- **Note Export** - TXT, PDF, and image export utilities
- **Local Storage** - Notes saved locally in browser

### ⚠️ Pending / Unfinished Tasks

#### 1. Visual Artifacts Persistence
- **Status**: UI exists, persistence unverified
- **Issue**: Not confirmed if diagrams/mind maps/drawings are properly serialized and persisted
- **What's Needed**:
  - Verify visual artifacts are saved to note content structure
  - Test that visual artifacts are restored when loading notes
  - Ensure PDF/image exports actually capture the visual content
  - Test data serialization/deserialization of complex visual data

#### 2. Interactive Maps
- **Status**: NOT IMPLEMENTED
- **Issue**: Request was for "interactive maps" but only mind maps and diagrams were implemented
- **Current Implementation**: Only mind maps (hierarchical) and general diagrams
- **What's Needed**: True interactive map component (geographical, concept, etc.)

#### 3. Note Filesystem Integration
- **Status**: PARTIALLY INTEGRATED
- **Issue**: Notes are saved to filesystem but dedicated notes workspace may not be properly structured
- **What's Needed**:
  - Ensure notes are in a dedicated "notes" folder in user's filesystem
  - Verify file operations work correctly on notes
  - Test shortcut creation from subjects to notes
  - Ensure notes remain private to user (not visible to admin)

---

## 🗺️ Future Map Types (Brainstorming)

### Currently Implemented
- ✅ **Mind Maps** - Hierarchical concept organization
- ✅ **Diagrams** - Flowcharts, sequence diagrams, class diagrams, entity relationships
- ✅ **Drawings** - Freehand sketches with canvas tools

### Potential Future Map Types

#### 1. Concept Maps (Enhanced Mind Maps)
- **Description**: Labeled edges between nodes showing relationship types
- **Features**:
  - Multiple connection types (causes, relates to, part of, leads to, etc.)
  - Cross-links between different branches
  - Relationship labels on connections
- **Use Cases**:
  - Complex relationships between concepts
  - Causal chains in history
  - Scientific concept relationships
- **Implementation Priority**: Low (can be built on top of existing mind map editor)

#### 2. Venn Diagrams
- **Description**: Visual comparison of 2-4 concepts with overlapping areas
- **Features**:
  - Draggable circles with adjustable overlap
  - Labels for each circle and intersection areas
  - Different colors for each set
- **Use Cases**:
  - Comparing theories (e.g., socialism vs capitalism)
  - Comparing historical periods
  - Comparing scientific classifications
- **Implementation Priority**: Medium (simple to implement, very useful for students)

#### 3. Timeline/Chronological Maps
- **Description**: Horizontal or vertical timeline with events
- **Features**:
  - Add events with dates and descriptions
  - Drag events along timeline
  - Zoom in/out for different time scales
  - Color-coded event categories
- **Use Cases**:
  - History chronology
  - Biological evolution timeline
  - Literature historical context
  - Project planning
- **Implementation Priority**: Medium (useful across many subjects)

#### 4. Process Maps / Flowcharts
- **Description**: Step-by-step procedures with decision points
- **Features**:
  - Decision diamonds with yes/no branches
  - Process rectangles
  - Start/end points
  - Connectors with arrows
- **Use Cases**:
  - Math problem-solving steps
  - Scientific method
  - Grammar rules application
  - Programming algorithms
- **Implementation Priority**: Low (partially covered by diagram editor)

#### 5. Matrix/Grid Maps
- **Description**: 2D grid for categorizing information
- **Features**:
  - Configurable rows and columns
  - Cell content editing
  - Color-coded cells
- **Use Cases**:
  - Comparing features of concepts
  - Categorizing elements
  - SWOT analysis
  - Periodic table style organization
- **Implementation Priority**: Low (could use table component)

#### 6. Fishbone Diagrams (Ishikawa)
- **Description**: Cause-and-effect analysis diagram
- **Features**:
  - Central problem (effect)
  - Branches for different cause categories
  - Sub-causes on each branch
- **Use Cases**:
  - Problem-solving
  - Historical event causes
  - Scientific phenomenon causes
- **Implementation Priority**: Low (specific use case)

#### 7. Organizational Charts
- **Description**: Hierarchical structures with reporting relationships
- **Features**:
  - Tree structure with boxes
  - Lines showing reporting relationships
  - Multiple levels
- **Use Cases**:
  - Government structures
  - Corporate hierarchies
  - Classification systems
  - Literary character relationships
- **Implementation Priority**: Low (similar to mind maps but more rigid)

#### 8. Network Diagrams
- **Description**: Bi-directional relationships between entities
- **Features**:
  - Nodes representing entities
  - Bidirectional edges
  - Network visualization
- **Use Cases**:
  - Social networks
  - Ecological systems
  - Literature character connections
  - Trade routes in history
- **Implementation Priority**: Low (can be built on mind map editor)

#### 9. Cycle Diagrams
- **Description**: Circular processes with repeating patterns
- **Features**:
  - Circular arrangement of steps
  - Arrows showing flow direction
  - Center description
- **Use Cases**:
  - Water cycle
  - Economic cycles
  - Biological processes (cell cycle)
  - Product lifecycle
- **Implementation Priority**: Low (specific use case)

#### 10. Tree Diagrams
- **Description**: Hierarchical breakdown with branching paths
- **Features**:
  - Root node at top or left
  - Branching decisions
  - Leaf nodes at ends
- **Use Cases**:
  - Classification systems
  - Decision trees
  - Grammar parsing
  - Taxonomy
- **Implementation Priority**: Low (similar to mind maps)

---

## 🎯 Recommended Implementation Order (If Ever Implemented)

### Phase 1: Most Valuable for Students
1. **Venn Diagrams** - Simple, very useful for comparisons
2. **Timeline Maps** - Useful across history, science, literature
3. **Concept Maps** - Enhanced mind maps with labeled relationships

### Phase 2: Specialized Use Cases
4. **Process Maps** - For step-by-step procedures
5. **Matrix/Grid Maps** - For categorization
6. **Cycle Diagrams** - For circular processes

### Phase 3: Advanced/Niche
7. **Fishbone Diagrams** - Cause-and-effect analysis
8. **Network Diagrams** - Complex relationships
9. **Organizational Charts** - Hierarchical structures
10. **Tree Diagrams** - Classification/taxonomy

---

## 💡 Why Mind Maps Alone Are Not Enough

Mind maps are limited because:
- They only show hierarchy, not relationship types
- They don't handle comparisons well (no overlapping areas)
- They don't handle time-based information (no timeline aspect)
- They're limited to hierarchical structures (can't show cycles, networks, etc.)
- They don't support bidirectional relationships easily
- They don't have built-in support for decision-making (process flows)

**Conclusion**: The current implementation (mind maps + diagrams + drawings) is sufficient for basic note-taking. Additional map types should only be implemented if there's clear student demand and time/resources available. Focus on filesystem integration and button placement first.