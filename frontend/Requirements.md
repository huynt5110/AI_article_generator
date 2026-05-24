# Next Stage — Article Editor & Save Flow

# Goal

Implement the article editing screen where authenticated users can:
- open a generated draft article
- edit structured content
- save partial changes
- preserve provenance visibility
- track saving state
- handle optimistic updates cleanly

Use:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- React Hook Form
- Zod

IMPORTANT:
Focus ONLY on:
- article editor page
- editable structured fields
- save flow
- partial updates
- provenance display
- optimistic UI

Do NOT implement:
- collaborative editing
- realtime sync
- comments
- AI regeneration
- version restore UI
- publishing workflow

---

# High-Level Requirements

Users should be able to:
- open article draft
- edit any editable field
- save changes
- see save state
- see provenance/source references
- navigate back to articles list

---

# Route Requirements

Create route:

```txt
/articles/[id]/edit
```

This route should:
- require authentication
- fetch article draft
- fetch provenance data
- support editing/saving

---

# Tech Stack

- Next.js 15+
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- React Hook Form
- Zod
- Axios

---

# API Requirements

Assume backend endpoints:

# Get Draft

```http
GET /drafts/:id
```

---

# Update Draft

```http
PATCH /drafts/:id
```

---

# Example Draft Response

```json
{
  "data": {
    "id": "draft_123",
    "title": "Komodo Boat Adventure",
    "hook": "A magical overnight journey through Komodo National Park.",
    "structuredContent": {
      "sections": [
        {
          "heading": "The Boat Experience",
          "content": "..."
        }
      ],
      "bestFor": [
        "Budget travelers"
      ],
      "notFor": [
        "Luxury travelers"
      ],
      "keyFacts": {
        "priceRange": "$140-$180",
        "duration": "2D1N"
      }
    },
    "provenance": [
      {
        "fieldPath": "structuredContent.keyFacts.priceRange",
        "sourceParagraphKey": "p12",
        "sourceText": "The overnight Komodo boat trip cost about $140."
      }
    ]
  }
}
```

---

# Layout Requirements

Desktop layout:

```txt
----------------------------------------------------
| Navbar                                            |
----------------------------------------------------

| Editor Content             | Provenance Sidebar  |
|                            |                     |
| Title                      | Source paragraph    |
| Hook                       | mappings            |
| Sections                   |                     |
| Key Facts                  |                     |
| Best For                   |                     |
----------------------------------------------------
```

---

# Mobile Layout

Stack vertically:

```txt
Editor
↓
Provenance
```

---

# Editor Requirements

Editable fields:

| Field | Editable Type |
|---|---|
| title | text input |
| hook | textarea |
| sections | repeatable block |
| bestFor | tag/list editor |
| notFor | tag/list editor |
| keyFacts | key-value fields |

---

# Recommended Form Structure

Use:
- React Hook Form
- nested form structure

Recommended schema:

```ts
{
  title: string
  hook: string
  structuredContent: {
    sections: []
    bestFor: []
    notFor: []
    keyFacts: {}
  }
}
```

---

# Validation Requirements

Use:
- Zod
- React Hook Form resolver

Validate:
- title max length
- empty sections
- malformed key facts
- invalid arrays

---

# Save Flow Requirements

IMPORTANT:
Support partial updates.

Do NOT send:
- giant full payloads for tiny edits

Backend already supports:
- partial JSON updates

---

# Example Update Payload

```json
{
  "operations": [
    {
      "path": "title",
      "value": "Updated Komodo Adventure"
    },
    {
      "path": "structuredContent.keyFacts.priceRange",
      "value": "$150-$200"
    }
  ]
}
```

---

# Save UX Requirements

# Saving State

Show:
- saving indicator
- disabled save button

Example:

```txt
Saving...
```

---

# Saved State

Show subtle confirmation:

```txt
Saved
```

Avoid intrusive toasts for every save.

---

# Recommended Save Strategy

Preferred:
- manual save button

NOT autosave yet.

Autosave introduces:
- race conditions
- debounce complexity
- conflict handling

Keep save flow explicit for now.

---

# React Query Requirements

# Draft Query

Create:

```txt
/hooks/queries/use-draft.ts
```

Query key:

```ts
['draft', draftId]
```

Recommended config:

```ts
staleTime: 1000 * 60 * 5
refetchOnWindowFocus: false
```

---

# Save Mutation

Create:

```txt
/hooks/mutations/use-update-draft.ts
```

Responsibilities:
- partial update mutation
- optimistic updates
- error rollback
- query invalidation

---

# Optimistic Update Requirements

IMPORTANT:
Use optimistic updates for better UX.

Flow:

# Step 1

Update cache immediately.

---

# Step 2

Send PATCH request.

---

# Step 3

Rollback on failure.

---

# Example React Query Pattern

```ts
onMutate
onError
onSettled
```

Use proper optimistic mutation flow.

---

# Provenance Sidebar Requirements

Display:
- source mappings
- paragraph references
- original extracted text

Example:

```txt
Price Range
Source: p12

"The overnight Komodo boat trip cost about $140."
```

---

# Provenance UX Requirements

When user edits field:
- provenance may become outdated

Display subtle badge:

```txt
Modified
```

if field changed from original AI value.

---

# Recommended Provenance Structure

Sidebar grouped by:
- field
- source paragraph

Avoid giant raw provenance dumps.

---

# Recommended Component Structure

```txt
/components
  /editor
    article-editor.tsx
    editor-header.tsx
    section-editor.tsx
    key-facts-editor.tsx
    provenance-sidebar.tsx
    save-status.tsx
```

---

# Recommended Hook Structure

```txt
/hooks
  /queries
    use-draft.ts

  /mutations
    use-update-draft.ts
```

---

# Styling Requirements

Use:
- Tailwind utility classes
- shadcn/ui

Do NOT:
- use inline CSS
- use giant CSS files
- use overly animated UI

---

# Recommended shadcn/ui Components

Use:
- Card
- Input
- Textarea
- Button
- Badge
- Separator
- ScrollArea
- Skeleton

---

# Editor UX Requirements

# Sticky Header

Header should contain:
- article title
- save button
- save state

Optional:
- sticky positioning

---

# Section Editing

Allow:
- edit section headings
- edit content

Do NOT implement:
- drag reorder
- block editor
- rich text editor

Simple textarea editing only.

---

# Key Facts Editing

Use:
- structured key-value layout

Example:

```txt
Price Range: $140-$180
Duration: 2D1N
Season: April-August
```

---

# Loading State Requirements

While fetching draft:
- show skeleton layout
- avoid layout shifts

---

# Error State Requirements

If draft fails to load:

Show:
- friendly error message
- retry action

---

# Navigation Requirements

Provide:
- back to articles button
- persistent navbar

---

# Accessibility Requirements

Must support:
- keyboard navigation
- semantic labels
- accessible buttons
- proper focus states
- screen reader compatibility

---

# Mobile Requirements

Mobile:
- stacked layout
- collapsible provenance panel
- full-width editor

Avoid:
- tiny sidebars
- cramped controls

---

# Future-Proofing Considerations

Prepare architecture for future:
- autosave
- collaborative editing
- AI regeneration
- realtime sync
- rich text editing

BUT do NOT implement them now.

---

# Important Anti-Patterns To Avoid

# DO NOT

## 1. Replace Entire Draft On Every Save

Use partial operations.

---

## 2. Add Rich Text Editor Prematurely

Textarea editing is enough initially.

---

## 3. Use Autosave Immediately

Explicit save button first.

---

## 4. Ignore Optimistic Updates

Saving should feel responsive.

---

## 5. Put Fetch Logic Inside Components

Use hooks + service layer.

---

## 6. Store Local Editor State Globally

Use React Hook Form locally.

---

# Recommended First Milestone

Implement:

- draft editor route
- draft fetch query
- editable structured fields
- provenance sidebar
- partial save mutation
- optimistic updates
- loading/error states
- manual save button
- save status indicator
- responsive editor layout

Do NOT implement:
- collaborative editing
- autosave
- block editors
- rich text editors
- realtime updates
- AI regeneration

Focus ONLY on scalable structured article editing infrastructure.