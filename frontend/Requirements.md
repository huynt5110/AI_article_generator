# Next Stage — Articles List Page + Navigation

# Goal

Implement the authenticated application layout and articles list screen using:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query

This stage should allow users to:
- view list of article drafts
- paginate through drafts
- navigate to edit page
- navigate to upload page
- view article metadata
- use authenticated navbar layout

IMPORTANT:
Focus ONLY on:
- app shell
- navbar
- articles list page
- list item cards/table
- pagination
- loading/empty/error states
- navigation

Do NOT implement:
- article editor
- upload functionality
- AI generation
- realtime updates
- search indexing

---

# Tech Stack

- Next.js 15+
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- Axios

---

# Application Layout Requirements

Create authenticated application layout.

Recommended structure:

```txt
/app
  /(dashboard)
    /articles
    /upload
```

---

# Main Layout Requirements

Create:
- top navbar
- responsive container
- content area

Navbar should contain:
- app logo/name
- Articles link
- Upload link
- user avatar/menu placeholder

---

# Navbar Requirements

Desktop navbar:

```txt
---------------------------------------------------
Logo      Articles      Upload        User Avatar
---------------------------------------------------
```

Mobile:
- responsive menu
- collapsible navigation

---

# Navigation Requirements

Navbar links:

| Label | Route |
|---|---|
| Articles | /articles |
| Upload | /upload |

Active route should be visually highlighted.

---

# Articles Page Requirements

Route:

```txt
/articles
```

Page should display:
- draft article list
- article metadata
- edit action
- pagination
- loading states
- empty states

---

# Article List Data Source

Assume backend endpoint:

```http
GET /drafts
```

Supports:
- cursor pagination
- limit

Example response:

```json
{
  "data": [
    {
      "id": "draft_123",
      "title": "Komodo Boat Adventure",
      "status": "DRAFT",
      "updatedAt": "2025-01-01",
      "createdAt": "2025-01-01"
    }
  ],
  "meta": {
    "nextCursor": "abc123",
    "hasNextPage": true
  }
}
```

---

# React Query Requirements

Create query hook:

```txt
/hooks/queries/use-articles.ts
```

Use:
- useInfiniteQuery OR cursor pagination pattern

Recommended query key:

```ts
['articles']
```

---

# React Query Config

Recommended:

```ts
staleTime: 1000 * 60 * 2
gcTime: 1000 * 60 * 30
refetchOnWindowFocus: false
```

Reason:
- article lists change moderately
- avoid excessive refetching

---

# UI Style Requirements

The application should feel:
- editorial
- modern
- minimal
- premium SaaS

Inspiration:
- Notion
- Linear
- Medium
- Vercel

Avoid:
- cluttered dashboards
- giant shadows
- excessive colors

---

# Articles List Layout

Use:
- clean card list OR table layout
- responsive spacing
- subtle borders
- hover states

Each article item should show:

| Field | Example |
|---|---|
| Title | Komodo Boat Adventure |
| Status | DRAFT |
| Updated At | Jan 1, 2025 |
| Action | Edit button |

---

# Edit Button Requirements

Each article row/card should contain:

```txt
Edit
```

Button action:

```txt
/articles/:id/edit
```

IMPORTANT:
Do NOT implement full editor page yet.

Only navigation setup.

---

# Empty State Requirements

If no articles exist:

Show:
- empty illustration placeholder
- helpful message
- upload CTA button

Example:

```txt
No drafts yet.
Upload your first travel notes document to get started.
```

Include button:

```txt
Go to Upload
```

---

# Loading State Requirements

During loading:
- show skeleton loaders
- avoid layout shift

Use:
- shadcn skeleton component

---

# Error State Requirements

Display friendly error UI.

Example:

```txt
Failed to load drafts.
Try again.
```

Include retry button.

---

# Pagination Requirements

Use cursor pagination.

Do NOT use offset pagination.

Requirements:
- Load More button OR infinite scroll
- preserve query cache
- stable ordering

Recommended ordering:

```txt
updatedAt DESC
```

---

# Recommended Components Structure

```txt
/components
  /layout
    navbar.tsx
    app-shell.tsx

  /articles
    article-list.tsx
    article-card.tsx
    article-empty-state.tsx
    article-skeleton.tsx
```

---

# Recommended Hooks Structure

```txt
/hooks
  /queries
    use-articles.ts
```

---

# Recommended API Layer

```txt
/lib/api
  drafts.service.ts
```

Responsibilities:
- fetch drafts
- pagination params
- response typing

---

# Type Safety Requirements

Create shared types:

```txt
/types
  article.types.ts
```

Include:
- DraftArticle
- DraftStatus
- PaginatedDraftResponse

---

# Status Badge Requirements

Display colored status badges.

Statuses:

| Status | Style |
|---|---|
| DRAFT | neutral |
| REVIEW_REQUIRED | warning |
| READY | success |

Use subtle colors only.

---

# Accessibility Requirements

Must support:
- keyboard navigation
- semantic buttons
- aria labels
- accessible pagination
- screen reader support

---

# Responsive Requirements

Desktop:
- comfortable content width
- table/card layout

Mobile:
- stacked cards
- simplified metadata
- responsive navbar

---

# Recommended shadcn/ui Components

Use:
- Card
- Button
- Badge
- Skeleton
- DropdownMenu
- Separator

---

# Authentication Requirements

Articles page must assume authenticated users only.

Use existing:
- auth query
- auth guard
- token handling

Do NOT implement auth again.

---

# Recommended Layout Structure

```txt
---------------------------------------------------
Navbar
---------------------------------------------------

My Articles

[ Article Card ]
[ Article Card ]
[ Article Card ]

Load More
```

---

# Important UI Behaviors

# Hover State

Article card should:
- slightly elevate
- show subtle border change

Keep motion minimal.

---

# Active Navbar Link

Highlight current route.

Use:
- muted background
- font weight change

Avoid flashy indicators.

---

# Future-Proofing Considerations

Prepare architecture for future:
- article search
- filtering
- sorting
- collaborative editing

BUT do NOT implement them now.

---

# Important Anti-Patterns To Avoid

# DO NOT

## 1. Put Fetch Logic Inside Components

Use:
- hooks
- service layer

---

## 2. Use Offset Pagination

Use cursor pagination only.

---

## 3. Add Redux/Zustand

React Query is enough.

---

## 4. Overbuild Dashboard UI

Keep UI clean and focused.

---

## 5. Hardcode API Responses

Use typed interfaces.

---

## 6. Refetch Aggressively

Disable unnecessary refetching.

---

# Recommended First Milestone

Implement:

- authenticated app shell
- responsive navbar
- articles page
- article list component
- article cards/table
- React Query articles hook
- cursor pagination
- loading skeletons
- empty states
- error states
- Edit button navigation
- Upload page navigation

Do NOT implement:
- article editor
- uploads
- AI workflows
- realtime features
- search/filtering

Focus ONLY on scalable article browsing/navigation infrastructure.