# Next Stage — Draft Article Listing & Editing System

# Goal

Implement backend APIs and architecture for:
- listing generated draft articles
- viewing draft details
- editing structured article fields
- tracking revisions
- preserving provenance mappings

IMPORTANT:
This stage is CRUD + editorial workflow ONLY.

Do NOT implement:
- AI generation
- queue workers
- frontend UI
- collaborative editing
- realtime sync

Focus ONLY on:
- scalable article management APIs
- structured editing
- provenance-safe updates
- revision tracking

---

# Core Product Requirements

Users must be able to:

1. View all generated draft articles
2. Filter/search drafts
3. Open draft details
4. Edit any article field
5. Save changes
6. Preserve provenance information
7. Reopen drafts later
8. Track updated timestamps

---

# Architectural Principle

This feature should remain inside the main NestJS modular monolith.

Do NOT create separate microservices for:
- article editing
- draft listing
- provenance APIs

Reason:
- CRUD-heavy workload
- tightly coupled data
- no independent scaling pressure
- low compute complexity

The correct scalability boundary already exists:
- AI worker service

---

# Recommended Architecture

```txt
/apps/api
  ├── AuthModule
  ├── UploadsModule
  ├── DraftsModule
  ├── ProvenanceModule
  ├── RevisionsModule
  └── JobsModule

/apps/ai-worker
  └── AI processing only
```

---

# Drafts Module Responsibilities

DraftsModule should handle:
- article listing
- draft retrieval
- field editing
- partial updates
- revision creation
- validation
- editorial states

DraftsModule should NOT:
- call OpenAI
- parse `.docx`
- process queues

---

# Recommended Database Design

# ArticleDraft Model

Main editable article entity.

```prisma
model ArticleDraft {
  id                  String   @id @default(cuid())

  uploadId            String   @unique

  upload              Upload @relation(fields: [uploadId], references: [id])

  title               String?

  hook                String?

  structuredContent   Json

  status              DraftStatus @default(DRAFT)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

---

# Why structuredContent Should Stay JSONB

The article structure is dynamic.

Example:

```json
{
  "sections": [],
  "bestFor": [],
  "notFor": [],
  "keyFacts": {},
  "ethicsNotes": []
}
```

JSONB allows:
- flexible structure evolution
- partial updates
- nested editing
- schema iteration
- future AI enhancements

This is the correct storage strategy.

---

# Draft Status Enum

```prisma
enum DraftStatus {
  DRAFT
  REVIEW_REQUIRED
  READY
  PUBLISHED
}
```

---

# Provenance Model

Tracks source mapping.

```prisma
model Provenance {
  id                  String   @id @default(cuid())

  articleDraftId      String

  articleDraft        ArticleDraft @relation(fields: [articleDraftId], references: [id])

  fieldPath           String

  sourceParagraphKey  String

  sourceText          String

  createdAt           DateTime @default(now())
}
```

---

# Why Provenance Must Remain Separate

Provenance is:
- metadata
- explainability layer
- source verification layer

Do NOT embed provenance inside article JSON.

That creates:
- duplication
- bloated payloads
- harder querying
- difficult updates

Keep provenance normalized.

---

# Recommended Revision Tracking

VERY IMPORTANT.

Users will edit AI-generated content.

You should track revisions.

---

# ArticleRevision Model

```prisma
model ArticleRevision {
  id              String   @id @default(cuid())

  articleDraftId  String

  articleDraft    ArticleDraft @relation(fields: [articleDraftId], references: [id])

  editedByUserId  String

  snapshot        Json

  createdAt       DateTime @default(now())
}
```

---

# Why Revisions Matter

Future benefits:
- undo support
- audit history
- AI regeneration comparison
- debugging
- collaborative editing later

This is worth implementing early.

---

# Recommended API Endpoints

# List Drafts

```http
GET /drafts
```

Supports:
- pagination
- filtering
- sorting

---

# Draft Detail

```http
GET /drafts/:id
```

Returns:
- article data
- provenance mappings
- metadata

---

# Update Draft

```http
PATCH /drafts/:id
```

Supports:
- partial updates
- nested JSON updates

---

# List Revisions

```http
GET /drafts/:id/revisions
```

---

# Restore Revision

```http
POST /drafts/:id/revisions/:revisionId/restore
```

Optional for now.

---

# Recommended API Response Shape

# List Drafts Response

```json
{
  "data": [
    {
      "id": "draft_123",
      "title": "Komodo Boat Adventure",
      "status": "DRAFT",
      "updatedAt": "2025-01-01"
    }
  ],
  "meta": {
    "cursor": "...",
    "hasNextPage": true
  }
}
```

---

# Draft Detail Response

```json
{
  "data": {
    "id": "draft_123",
    "title": "Komodo Boat Adventure",
    "hook": "...",
    "structuredContent": {},
    "provenance": []
  }
}
```

---

# Editing Strategy

IMPORTANT:
Do NOT replace entire JSON document for every small edit.

Support:
- partial field updates

---

# Example Edit Request

```http
PATCH /drafts/:id
```

```json
{
  "operations": [
    {
      "path": "hook",
      "value": "A magical overnight Komodo journey."
    },
    {
      "path": "structuredContent.keyFacts.priceRange",
      "value": "$140–$180"
    }
  ]
}
```

---

# Why Partial Updates Matter

Replacing entire JSON:
- increases payload size
- creates race conditions
- harder for future collaboration
- inefficient

Partial updates scale better.

---

# Recommended Internal Update Strategy

Use PostgreSQL JSONB update operations.

Example:

```sql
jsonb_set(...)
```

This avoids rewriting entire JSON blobs.

---

# Provenance Editing Rules

IMPORTANT:
User edits may invalidate provenance.

Example:

AI generated:

```txt
Price: $140
```

Source:
- paragraph p12

User edits to:

```txt
Price: $500
```

Original provenance may no longer be valid.

---

# Recommended Provenance Behavior

# Option 1 (Recommended)

Keep provenance unchanged but mark field as:

```txt
user_modified = true
```

---

# Example

```prisma
model Provenance {
  id                  String

  fieldPath           String

  sourceParagraphKey  String

  sourceText          String

  userModified        Boolean @default(false)
}
```

This preserves:
- auditability
- original AI source
- editorial transparency

---

# Recommended Query Features

# List Drafts

Support:
- cursor pagination
- filtering by status
- sorting by updatedAt

---

# Optional Search Later

Do NOT implement full-text search yet.

Simple:
- title contains
- status filters

is enough initially.

---

# Recommended Pagination

Use cursor pagination.

Do NOT use offset pagination for large datasets.

Example:

```http
GET /drafts?cursor=abc123&limit=20
```

---

# Recommended Database Indexes

VERY IMPORTANT.

Add indexes for:

```prisma
@@index([status])
@@index([updatedAt])
@@index([createdAt])
@@index([uploadId])
```

---

# Recommended NestJS Module Structure

```txt
src/modules/drafts/
├── controllers/
├── services/
├── repositories/
├── dto/
├── validators/
├── mappers/
└── drafts.module.ts
```

---

# IMPORTANT

Do NOT put Prisma queries directly in controllers.

Use:
- services
- repositories

Maintain clean boundaries.

---

# Recommended Repository Pattern

Example:

```ts
interface DraftRepository {
  findById()
  list()
  updatePartial()
}
```

This helps:
- testability
- future extraction
- cleaner architecture

---

# Recommended Validation Rules

Validate:
- title length
- section limits
- malformed JSON paths
- invalid update operations

Never trust client payloads.

---

# Recommended Update Flow

# Step 1

Validate ownership.

---

# Step 2

Validate update operations.

---

# Step 3

Create revision snapshot.

---

# Step 4

Apply partial JSONB updates.

---

# Step 5

Mark provenance entries as modified if needed.

---

# Step 6

Return updated draft.

---

# Future-Proofing Considerations

Design now for:
- collaborative editing later
- realtime editing later
- AI regeneration later

WITHOUT implementing them now.

---

# IMPORTANT

Do NOT:
- add websockets
- add CRDTs
- add operational transforms

Premature complexity.

---

# Scalability Strategy

This module scales through:
- horizontal API scaling
- PostgreSQL indexing
- cursor pagination
- Redis caching later

NOT microservices.

---

# Why Monolith Is Correct Here

Draft editing is:
- database-centric
- transactional
- tightly coupled

Microservices would add:
- distributed transactions
- API orchestration
- consistency problems

without solving a real bottleneck.

---

# Recommended Future Extraction Candidates

Potential future services:
- search/indexing
- embeddings/vector search
- realtime collaboration
- analytics pipeline

NOT draft CRUD.

---

# Important Anti-Patterns To Avoid

# DO NOT

## 1. Store Entire Draft As Flat Markdown

Use structured JSON.

---

## 2. Replace Entire JSON On Every Edit

Use partial updates.

---

## 3. Embed Provenance Inside JSON

Keep provenance normalized.

---

## 4. Skip Revision Tracking

Users WILL want undo/history later.

---

## 5. Put Prisma Everywhere

Use repositories/services.

---

## 6. Prematurely Microservice Draft Editing

No operational scaling benefit.

---

# Recommended First Milestone

Implement:

- Draft listing endpoint
- Draft detail endpoint
- Partial draft updates
- JSONB partial updates
- Provenance retrieval
- Revision snapshots
- Pagination
- Filtering
- DB indexes
- Ownership validation

Do NOT implement:
- realtime editing
- collaborative editing
- comments
- publishing workflows
- websockets

Focus ONLY on scalable editorial CRUD infrastructure.