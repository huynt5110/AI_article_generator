<<<<<<< Updated upstream
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
=======
# Next Stage — Scalable AI Processing Pipeline (Server Upload → S3 → Queue → AI Workers)

# Goal

Implement scalable asynchronous AI processing infrastructure for uploaded `.docx` travel note files.

Current architecture:
- authentication already exists
- NestJS upload endpoint already exists
- API uploads files to S3
- API can enqueue BullMQ jobs

Now implement:
- scalable AI processing pipeline
- async workers
- document parsing
- paragraph extraction
- structured AI extraction
- provenance tracking
- extraction job lifecycle

IMPORTANT:
AI processing must scale independently from the NestJS API.

---

# Current Upload Flow

Current architecture:

```txt
Client
   |
POST /uploads
   |
NestJS API
   |
Upload .docx to S3
   |
Create Upload row
   |
Enqueue BullMQ job
   |
Return immediately
```

This is acceptable because:
- uploads are `.docx` only
- small file sizes
- upload bandwidth is NOT the scaling bottleneck

The true scaling bottleneck is:
- AI processing
- LLM latency
- queue throughput
- retries
- provider rate limits

---

# Core Architectural Principle

The NestJS API should NEVER:
- parse `.docx`
- extract content
- call OpenAI synchronously
- process AI workloads inline

The API should ONLY:
1. receive upload
2. validate upload
3. upload to S3
4. create DB rows
5. enqueue jobs
6. return immediately

ALL AI work must happen asynchronously in workers.

---

# Recommended High-Level Architecture

```txt
                ┌────────────┐
                │  Frontend  │
                └─────┬──────┘
                      │
                NestJS API
                      │
              Upload .docx
                      │
                  AWS S3
                      │
             Create Upload row
                      │
           Create Extraction Job
                      │
                BullMQ Queue
                      │
        ┌─────────────┴─────────────┐
        │                           │
   AI Worker 1                 AI Worker N
        │                           │
        └─────────────┬─────────────┘
                      │
               OpenAI / LLM
                      │
                 PostgreSQL
```

---

# Tech Stack

# API

- NestJS
- Prisma
- PostgreSQL

---

# Queue

- BullMQ
- Redis

---

# AI Workers

Separate deployment from API.

Recommended:
- separate NestJS app

Example:

```txt
/apps/api
/apps/ai-worker
```

---

# AI Provider

- OpenAI API

Use:
- structured JSON outputs
- schema validation

---

# Why Async Workers Are Critical

AI workloads are:
- slow
- bursty
- expensive
- retry-prone
- rate-limited

Do NOT process AI inside HTTP requests.

Bad architecture:

```txt
POST /uploads
 -> upload file
 -> parse document
 -> call OpenAI
 -> wait 45 seconds
```

This will destroy API scalability.

---

# Correct Architecture

```txt
POST /uploads
 -> upload to S3
 -> enqueue job
 -> return immediately
```

Workers handle everything else.

---

# Recommended Upload Flow

# Step 1 — Upload File

```http
POST /uploads
```

multipart/form-data

Requirements:
- authenticated route
- `.docx` only
- max 10MB

---

# Step 2 — Validate Upload

Validate:
- auth
- MIME type
- `.docx` extension
- file size

Allowed MIME type:

```txt
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Reject:
- pdf
- images
- zip
- executables
- doc
- txt

---

# Step 3 — Upload File to S3

NestJS uploads file to S3 immediately.

Do NOT:
- keep permanent local file
- process file in API
- parse document here

---

# Step 4 — Create Upload Record

Create upload DB row.

Example status:

```txt
UPLOADED
```

---

# Step 5 — Create Extraction Job

Immediately create extraction job.

Status:

```txt
QUEUED
```

---

# Step 6 — Enqueue BullMQ Job

Queue payload should remain minimal.

Example:

```json
{
  "uploadId": "upload_123",
  "jobId": "job_123"
}
```

Do NOT put:
- document text
- AI prompts
- large payloads
inside BullMQ jobs.

---

# Step 7 — Return Immediately

Example response:

```json
{
  "data": {
    "uploadId": "upload_123",
    "jobId": "job_123",
    "status": "QUEUED"
  }
}
```

API request should complete quickly.

---

# Database Design

# Upload Model

Tracks storage lifecycle ONLY.
>>>>>>> Stashed changes

```prisma
model ArticleDraft {
  id                  String   @id @default(cuid())

  uploadId            String   @unique

  upload              Upload @relation(fields: [uploadId], references: [id])

  title               String?

<<<<<<< Updated upstream
  hook                String?
=======
  size          Int
>>>>>>> Stashed changes

  structuredContent   Json

<<<<<<< Updated upstream
  status              DraftStatus @default(DRAFT)
=======
  status        UploadStatus
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
enum DraftStatus {
  DRAFT
  REVIEW_REQUIRED
  READY
  PUBLISHED
=======
enum UploadStatus {
  UPLOADING
  UPLOADED
  FAILED
>>>>>>> Stashed changes
}
```

IMPORTANT:
Upload status tracks ONLY:
- storage transfer lifecycle

<<<<<<< Updated upstream
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
=======
NOT AI processing lifecycle.

---

# Extraction Job Model

Tracks AI processing lifecycle.

```prisma
model ExtractionJob {
  id              String   @id @default(cuid())

  uploadId        String
  upload          Upload @relation(fields: [uploadId], references: [id])

  status          ExtractionJobStatus

  model           String?

  promptVersion   String?
>>>>>>> Stashed changes

  tokenInput      Int?
  tokenOutput     Int?

<<<<<<< Updated upstream
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
=======
  latencyMs       Int?

  errorMessage    String?

  startedAt       DateTime?
  completedAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
>>>>>>> Stashed changes
```

---

<<<<<<< Updated upstream
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
=======
# Extraction Job Status Enum

```prisma
enum ExtractionJobStatus {
  QUEUED
  PARSING
  EXTRACTING
  VALIDATING
  COMPLETED
  FAILED
}
```

IMPORTANT:
Do NOT mix:
- upload lifecycle
- extraction lifecycle

These are separate state machines.

---

# Document Model

Represents parsed `.docx` content.

```prisma
model Document {
  id              String   @id @default(cuid())

  uploadId        String   @unique
  upload          Upload @relation(fields: [uploadId], references: [id])

  extractedText   String

  createdAt       DateTime @default(now())
}
```

---

# Document Paragraph Model

CRITICAL FOR PROVENANCE.

```prisma
model DocumentParagraph {
  id            String   @id @default(cuid())

  documentId    String
  document      Document @relation(fields: [documentId], references: [id])

  paragraphKey  String

  text          String

  orderIndex    Int

  createdAt     DateTime @default(now())
}
```

---

# Why Paragraph-Level Storage Matters

Each paragraph should receive stable IDs.

Example:

```txt
p1
p2
p3
```

This enables:
- provenance tracking
- source references
- hallucination reduction
- explainability
- editable AI outputs

This is one of the MOST important architecture decisions.

---

# Example Paragraph

```json
{
  "paragraphKey": "p12",
  "text": "The overnight Komodo boat trip cost about $140."
}
```

---

# Article Draft Model

Structured AI-generated content.

```prisma
model ArticleDraft {
  id                  String   @id @default(cuid())

  uploadId            String   @unique

  title               String?

  hook                String?

  structuredContent   Json

  status              DraftStatus @default(DRAFT)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

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

VERY IMPORTANT.

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

# Example Provenance Record

```txt
fieldPath = "keyFacts.priceRange"

sourceParagraphKey = "p12"

sourceText = "The overnight Komodo boat trip cost about $140."
```

---

# Why Provenance Is Critical

Without provenance:
- users cannot verify claims
- hallucinations become dangerous
- editing UX becomes weak
- AI trust decreases

This is NOT optional architecture.

---

# Worker Responsibilities

AI workers should:

1. Download `.docx` from S3
2. Parse document
3. Extract paragraphs
4. Persist paragraph records
5. Build AI prompt
6. Call OpenAI
7. Validate structured JSON
8. Store article draft
9. Store provenance
10. Update extraction status

Workers should be stateless.

Workers should NOT:
- store permanent local state
- depend on singleton execution
- rely on memory sessions

This allows horizontal scaling.

---

# Recommended Queue Architecture

# Queue Name

```txt
document-extraction
```

---

# BullMQ Job Payload

Minimal payload only.

Example:

```json
{
  "uploadId": "upload_123",
  "jobId": "job_123"
}
```

---

# Retry Strategy

AI providers WILL fail.

Use:
- retries
- exponential backoff

Example:

```txt
attempts: 3
backoff:
  type: exponential
```

---

# Worker Concurrency

Concurrency must be configurable.

Example:

```env
WORKER_CONCURRENCY=5
```

Do NOT hardcode concurrency.

---

# Dead Letter Strategy

Failed jobs must remain inspectable.

Do NOT silently discard failed jobs.

---

# Recommended Processing Pipeline

# Stage 1 — Parse Document

Extract:
- raw text
- paragraphs
- ordering

Store:
- Document
- DocumentParagraph rows

---

# Stage 2 — AI Extraction

LLM generates structured JSON.

Example:

```json
{
  "title": "...",
  "hook": "...",
  "sections": [],
  "bestFor": [],
  "notFor": [],
  "keyFacts": {},
  "ethicsNotes": []
}
```

---

# Stage 3 — Validation

Validate:
- JSON schema
- required fields
- malformed outputs
- invalid structures

---

# Stage 4 — Persist Draft

Store:
- structured article
- provenance mappings

---

# Recommended AI Prompt Strategy

Do NOT:
- dump entire system into one giant prompt
- rely on free-form markdown

Prefer:
- structured extraction
- schema-driven responses
- JSON outputs

---

# Recommended NestJS Structure

# API App

```txt
/apps/api
```

Responsibilities:
- auth
- uploads
- job creation
- draft retrieval APIs

---

# Worker App

```txt
/apps/ai-worker
```

Responsibilities:
- queue consumers
- AI orchestration
- document parsing
- OpenAI integration

---

# Shared Packages

```txt
/packages
  /shared-types
  /prompt-templates
  /common-utils
>>>>>>> Stashed changes
```

---

<<<<<<< Updated upstream
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
=======
# API Endpoints

# Upload File

```http
POST /uploads
```

Responsibilities:
- receive `.docx`
- upload to S3
- create upload row
- enqueue extraction job

---

# Get Job Status

```http
GET /jobs/:id
```

Returns:
- current extraction status
- timestamps
- errors
- progress

---

# Get Draft

```http
GET /drafts/:id
```

Returns:
- structured article
- provenance mappings

---

# Observability Requirements

Track:
- token usage
- model version
- prompt version
- retries
- failures
- latency
- queue depth

This becomes extremely important later.

---

# Recommended Document Parser

Use dedicated `.docx` parsing library.

Requirements:
- paragraph extraction
- ordering preservation
- clean normalization

Do NOT:
- parse via regex
- rely on raw XML manually
>>>>>>> Stashed changes

---

# Important Anti-Patterns To Avoid

# DO NOT

<<<<<<< Updated upstream
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
=======
## 1. Process AI Inside Upload Request

Always enqueue.

---

## 2. Put Large Payloads Into BullMQ

Send IDs only.

---

## 3. Store Only Raw Markdown

Store structured JSON.

---

## 4. Skip Provenance

This is core product architecture.

---

## 5. Create One Giant Status Enum

Separate:
- upload lifecycle
- extraction lifecycle
- editorial lifecycle

---

## 6. Make Workers Stateful

Workers must scale horizontally.
>>>>>>> Stashed changes

---

# Recommended First Milestone

Implement:

<<<<<<< Updated upstream
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
=======
- ExtractionJob model
- extraction status enum
- BullMQ setup
- Redis setup
- AI worker app
- extraction queue
- `.docx` parser
- paragraph extraction
- paragraph persistence
- extraction job updates
- OpenAI integration
- structured JSON validation
- article draft persistence
- provenance persistence

Do NOT implement:
- frontend
- publishing
- collaborative editing
- embeddings/search

Focus ONLY on scalable AI processing infrastructure.
>>>>>>> Stashed changes
