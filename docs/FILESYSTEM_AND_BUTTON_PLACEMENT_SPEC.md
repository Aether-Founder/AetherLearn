# Filesystem Integration and Button Placement - Complete Specification

## Overview

This document describes the complete expected behavior for two critical tasks:
1. **Filesystem to Actual Content Integration**
2. **Button Placement Rendering in Main App**

These are the highest priority tasks because they enable the core admin functionality and the unified digital filesystem that the entire application depends on.

---

## Task 1: Filesystem to Actual Content Integration

### Current State
- ✅ Filesystem architecture exists (`types/filesystem.ts`, `lib/filesystem/filesystemService.ts`, `hooks/useFilesystem.ts`)
- ✅ File operations API is implemented (move, rename, delete, duplicate, shortcuts)
- ❌ Filesystem is NOT connected to actual content from `content/` directory
- ❌ Filesystem is NOT automatically updated when admin creates content
- ❌ Subjects, chapters, paragraphs from content directory are not in filesystem

### Expected Behavior

#### 1. Initial Filesystem Population
When the application starts or when a user logs in:
- **Automatic Content Loading**: Filesystem should automatically scan and populate with:
  - All subjects from the content directory
  - All chapters under each subject
  - All paragraphs under each chapter
  - All leerset pages (JSON content pages)
  - All study sets
- **Hierarchical Structure**: Maintain exact content hierarchy
  ```
  Root
  ├── Subject: Wiskunde
  │   ├── Chapter: Lineaire Algebra
  │   │   ├── Paragraph: Vectoren
  │   │   └── Paragraph: Matrices
  │   └── Chapter: Calculus
  │       └── Paragraph: Derivaten
  ├── Subject: Natuurkunde
  │   └── Chapter: Mechanica
  │       └── Paragraph: Kracht
  └── Leerset Page: Rekenvaardigheid Basis
  ```

#### 2. Real-Time Filesystem Updates
When admin creates, modifies, or deletes content:
- **Immediate Filesystem Update**: The filesystem must be updated immediately
- **Sync with Content Directory**: Any changes in content directory reflect in filesystem
- **Database Integration**: If content is stored in database, filesystem must sync with database
- **Cache Invalidation**: Clear any cached filesystem data when content changes

#### 3. Admin Content Creation Flow
When admin creates new content via admin portal:

**Step 1: Admin creates a new subject**
- Admin navigates to `/admin/subjects` (or similar)
- Admin fills in subject name, description, metadata
- Admin clicks "Create"
- **Expected Behavior**:
  - Subject is saved to content directory/database
  - Filesystem is immediately updated with new subject node
  - Subject appears in filesystem tree at root level
  - Subject is now available for:
    - Moving to different locations
    - Duplicating
    - Adding buttons to
    - Attaching leerset pages

**Step 2: Admin creates a new chapter**
- Admin navigates to a subject's edit page
- Admin fills in chapter name, description
- Admin clicks "Create"
- **Expected Behavior**:
  - Chapter is saved under the selected subject
  - Filesystem is immediately updated with new chapter node
  - Chapter appears as child of subject in filesystem
  - Chapter is now available for:
    - Moving within subject
    - Adding paragraphs to
    - Adding buttons to

**Step 3: Admin creates a new paragraph**
- Admin navigates to a chapter's edit page
- Admin fills in paragraph content, learning goals
- Admin clicks "Create"
- **Expected Behavior**:
  - Paragraph is saved under the selected chapter
  - Filesystem is immediately updated with new paragraph node
  - Paragraph appears as child of chapter in filesystem
  - Paragraph is now available for:
    - Adding learning goals to
    - Adding buttons to
    - Referencing in other content

**Step 4: Admin creates a JSON leerset page**
- Admin navigates to `/admin/leerset-pages`
- Admin fills in title, description, JSON content
- Admin clicks "Create"
- **Expected Behavior**:
  - Leerset page is saved to database
  - Filesystem is immediately updated with new leerset page node
  - **CRITICAL**: A modal or button appears asking: "Do you want to add a shortcut button to this leerset page?"
  - If admin chooses "Yes":
    - Show placement selection UI (see Task 2 below)
    - Admin selects location (subject/chapter/paragraph)
    - Button is created at selected location
    - Filesystem is updated with button link node
  - If admin chooses "No":
    - Leerset page exists but no button is created
    - Admin can add button later via button management

#### 4. Filesystem Node Types
The unified filesystem must support these node types:

- **root** - Root of filesystem
- **subject** - Academic subject (e.g., Wiskunde, Natuurkunde)
- **chapter** - Chapter within a subject
- **paragraph** - Paragraph within a chapter
- **leerset_page** - JSON leerset page with educational content
- **study_set** - Flashcard deck
- **note_folder** - Folder for user notes
- **note** - Individual user note
- **button_link** - Shortcut button to content

#### 5. Filesystem Operations

**Move Operation**:
- Admin can move a leerset from one subject to another
- Admin can move a chapter from one subject to another
- Admin can move a paragraph from one chapter to another
- **Expected Behavior**:
  - Filesystem updates immediately
  - Content directory/database is updated
  - All references are updated
  - Cache is invalidated

**Duplicate Operation**:
- Admin can duplicate a leerset within same subject
- Admin can duplicate a chapter with all its paragraphs
- **Expected Behavior**:
  - Filesystem creates new node with copied content
  - Content directory/database is updated
  - New node appears in filesystem tree
  - Original remains unchanged

**Delete Operation**:
- Admin can delete a subject (with confirmation)
- Admin can delete a chapter
- Admin can delete a paragraph
- **Expected Behavior**:
  - Filesystem removes node and all children
  - Content directory/database is updated
  - All references are cleaned up
  - Cache is invalidated

**Rename Operation**:
- Admin can rename any node
- **Expected Behavior**:
  - Filesystem updates node name
  - Content directory/database is updated
  - All references are updated
  - Cache is invalidated

**Create Shortcut Operation**:
- Admin can create shortcut button to any content
- **Expected Behavior**:
  - Filesystem creates button_link node
  - Button appears at specified location
  - Button can reference: leerset page, study set, note, etc.

#### 6. User Notes in Filesystem
User notes must be part of the filesystem but kept private:

**Notes Workspace**:
- Each user has a dedicated "notes" folder in their local filesystem
- Notes are stored in browser localStorage (not in database)
- Admin cannot see user notes
- Notes are not synced to server (local-only)

**Notes Filesystem Operations**:
- User can rename notes
- User can move notes within notes folder
- User can delete notes
- User can duplicate notes
- User can create shortcuts from subjects to notes

**Privacy**:
- Notes are stored with `isLocal: true` flag
- Notes are not included in admin content
- Notes are not visible in admin portal
- Notes are backed up to localStorage only

---

## Task 2: Button Placement Rendering in Main App

### Current State
- ✅ Admin can configure button placement in admin portal
- ✅ Button configuration is saved to database
- ✅ Filesystem can store button_link nodes
- ❌ Buttons are NOT rendered in the main app (vakken page, subjects, chapters)
- ❌ No mechanism to fetch and display configured buttons

### Expected Behavior

#### 1. Button Configuration Data Structure
When admin configures a button, the data structure should be:

```typescript
interface ButtonConfig {
  id: string;
  text: string;                    // Button text (defaults to page title)
  icon?: string;                  // Optional icon
  targetPath: string;             // Path to navigate to (e.g., /leerset/rekenvaardigheid)
  targetId: string;              // ID of target content (leerset page, study set, etc.)
  placement: 'root' | 'subject' | 'chapter' | 'paragraph';
  placementId: string;            // ID of subject/chapter/paragraph
  style: 'primary' | 'secondary' | 'outline';
  createdAt: string;
  createdBy: string;
}
```

#### 2. Button Placement Flow

**Step 1: Admin Creates JSON Leerset Page**
- Admin navigates to `/admin/leerset-pages`
- Admin fills in title, description, JSON content
- Admin clicks "Create"
- **Modal Appears**: "Do you want to add a shortcut button to this leerset page?"
  - Options: "Yes, add button" / "No, skip"

**Step 2: Admin Chooses to Add Button**
- If "Yes", show placement selection UI:
  ```
  Where should the button appear?
  
  ○ Root (homepage)
  ○ Subject (select subject dropdown)
  ○ Chapter (select subject, then chapter dropdown)
  ○ Paragraph (select subject, chapter, then paragraph dropdown)
  
  Button Text: [default: page title]
  Button Icon: [optional selector]
  Button Style: [Primary / Secondary / Outline]
  ```
- Admin selects placement location
- Admin customizes button text (optional)
- Admin selects icon (optional)
- Admin selects button style
- Admin clicks "Create Button"

**Step 3: Button is Created**
- Button configuration is saved to database
- Filesystem is updated with button_link node
- Button is linked to specific placement location

#### 3. Button Rendering in Main App

**Homepage (Root) Buttons**:
- When user visits homepage (`/`)
- Fetch all buttons with `placement: 'root'`
- Render buttons in designated section (e.g., "Quick Access" section)
- Each button:
  - Shows configured text and icon
  - On click, navigates to `targetPath`
  - Uses configured style

**Subject Page Buttons**:
- When user visits subject page (`/vakken/[subjectId]`)
- Fetch subject ID from URL
- Fetch all buttons with `placement: 'subject'` and `placementId: subjectId`
- Render buttons in designated section (e.g., top of subject page, or in sidebar)
- Each button:
  - Shows configured text and icon
  - On click, navigates to `targetPath`
  - Uses configured style

**Chapter Page Buttons**:
- When user visits chapter page (`/vakken/[subjectId]/[chapterId]`)
- Fetch chapter ID from URL
- Fetch all buttons with `placement: 'chapter'` and `placementId: chapterId`
- Render buttons in designated section (e.g., top of chapter page)
- Each button:
  - Shows configured text and icon
  - On click, navigates to `targetPath`
  - Uses configured style

**Paragraph/Content Page Buttons**:
- When user visits content page (`/vakken/[subjectId]/[chapterId]/[paragraphId]`)
- Fetch paragraph ID from URL
- Fetch all buttons with `placement: 'paragraph'` and `placementId: paragraphId`
- Render buttons in designated section (e.g., inline in content, or sidebar)
- Each button:
  - Shows configured text and icon
  - On click, navigates to `targetPath`
  - Uses configured style

#### 4. Button Management UI

Admin should have a dedicated page to manage all buttons:
- **Route**: `/admin/buttons` or `/admin/button-management`
- **Features**:
  - List all buttons with their placement
  - Edit button configuration
  - Delete button
  - Move button to different location
  - Enable/disable button (temporary)

#### 5. Button Rendering Implementation

**Fetch Button Data**:
```typescript
// API endpoint: /api/buttons?placement=subject&placementId=123
// Returns: ButtonConfig[]

// Or fetch all buttons for a location in one call
const fetchButtons = async (placement: string, placementId: string) => {
  const response = await fetch(`/api/buttons?placement=${placement}&placementId=${placementId}`);
  return response.json();
};
```

**Render Buttons Component**:
```typescript
function ButtonSection({ placement, placementId }: { placement: string, placementId: string }) {
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
  
  useEffect(() => {
    fetchButtons(placement, placementId).then(setButtons);
  }, [placement, placementId]);
  
  if (buttons.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(button => (
        <Button
          key={button.id}
          variant={button.style === 'primary' ? 'default' : button.style === 'outline' ? 'outline' : 'secondary'}
          onClick={() => router.push(button.targetPath)}
        >
          {button.icon && <Icon name={button.icon} />}
          {button.text}
        </Button>
      ))}
    </div>
  );
}
```

**Integration in Pages**:
- Add `ButtonSection` component to:
  - `app/vakken/[subjectId]/page.tsx` - Subject page
  - `app/vakken/[subjectId]/[chapterId]/page.tsx` - Chapter page
  - `app/vakken/[subjectId]/[chapterId]/[paragraphId]/page.tsx` - Paragraph page
  - `app/page.tsx` - Homepage (for root buttons)

#### 6. Button Creation API

**API Endpoint**: `POST /api/buttons`
```typescript
{
  targetPath: string;
  targetId: string;
  buttonText: string;
  buttonIcon?: string;
  placement: 'root' | 'subject' | 'chapter' | 'paragraph';
  placementId: string;
  style: 'primary' | 'secondary' | 'outline';
}
```

**API Endpoint**: `GET /api/buttons?placement=subject&placementId=123`
```typescript
// Returns array of ButtonConfig
```

**API Endpoint**: `DELETE /api/buttons/:id`
```typescript
// Deletes button
```

---

## Why Unified Filesystem is Critical

### Problem Without Unified Filesystem
Without a unified filesystem:
- **No specific locations**: Can't place buttons at precise locations (chapter X, paragraph Y)
- **No hierarchy**: Can't understand parent-child relationships
- **No operations**: Can't move, duplicate, or reorganize content
- **No shortcuts**: Can't create cross-references between content
- **No consistency**: Content exists in multiple places (database, filesystem, content directory) without sync

### Solution With Unified Filesystem
With a unified filesystem:
- **Precise Locations**: Every piece of content has a unique ID and path
- **Hierarchy**: Clear parent-child relationships (subject → chapter → paragraph)
- **Operations**: Can move, duplicate, delete any content while maintaining structure
- **Shortcuts**: Can create buttons/links that reference specific nodes by ID
- **Consistency**: Single source of truth for all content structure
- **Scalability**: Easy to add new content types and operations

### Specific Location Example
Without unified filesystem:
- "Add button to paragraph about derivatives" - Impossible, can't identify specific paragraph

With unified filesystem:
- "Add button to paragraph with ID `paragraph-123`" - Possible, filesystem can locate it
- Button stores `placement: 'paragraph'` and `placementId: 'paragraph-123'`
- When rendering paragraph page, fetch buttons with matching placementId
- Button appears exactly where intended

---

## Implementation Priority

### Phase 1: Filesystem Content Integration (HIGH PRIORITY)
1. Create content loader that scans content directory
2. Populate filesystem with existing subjects/chapters/paragraphs
3. Ensure admin content creation updates filesystem immediately
4. Test all file operations (move, duplicate, delete, rename)

### Phase 2: Button Placement Rendering (HIGH PRIORITY)
1. Create button API endpoints (GET, POST, DELETE)
2. Integrate button creation modal in leerset page admin
3. Create button management admin page
4. Add button rendering components to subject/chapter/paragraph pages
5. Test button placement at all levels (root, subject, chapter, paragraph)

### Phase 3: Testing and Refinement
1. Test end-to-end: Admin creates leerset page → adds button → button appears in app
2. Test button editing and deletion
3. Test button moving to different locations
4. Test filesystem operations with content
5. Verify performance with large content sets

---

## Success Criteria

### Filesystem Integration Success Criteria
- ✅ Filesystem automatically populates with all existing content
- ✅ Admin content creation immediately updates filesystem
- ✅ File operations (move, duplicate, delete, rename) work correctly
- ✅ Filesystem is single source of truth for content structure
- ✅ User notes are private and local-only

### Button Placement Success Criteria
- ✅ Admin can create leerset page and add button in one flow
- ✅ Modal appears after leerset page creation asking about button
- ✅ Admin can select precise button placement (subject/chapter/paragraph)
- ✅ Buttons render correctly in main app at specified locations
- ✅ Buttons navigate to correct target pages
- ✅ Admin can manage (edit/delete) existing buttons

---

## Notes
- **Current Status**: Architecture exists, integration not implemented
- **Complexity**: Medium - requires careful data sync between filesystem and content
- **Dependencies**: Depends on database schema and content directory structure
- **Testing**: Requires comprehensive testing of all operations
- **Timeline**: Should be completed before any notes/visuals enhancements