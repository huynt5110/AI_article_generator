# Next Stage — Backend File Upload System via AWS S3 Presigned URLs

# Goal

Implement backend infrastructure that allows authenticated users to upload `.docx` travel note files securely using AWS S3 presigned URLs.

IMPORTANT:
This stage is BACKEND ONLY.

Do NOT implement:
- frontend
- React components
- upload UI
- drag & drop UI

Only implement:
- NestJS backend
- Prisma schema
- S3 integration
- upload APIs
- validation
- secure upload flow

---

# Core Requirements

The upload system must:
- support authenticated users
- support `.docx` uploads ONLY
- generate AWS S3 presigned upload URLs
- upload files directly to S3
- track uploads in database
- validate upload completion
- prepare for future AI processing pipeline

IMPORTANT:
The NestJS API should NEVER receive actual file binary uploads.

The browser/client uploads directly to S3.

---

# Supported File Types

ONLY allow:

```txt
.docx
```

Allowed MIME type:

```txt
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Reject:
- pdf
- doc
- images
- zip
- executables
- any other mime type

This system is specifically for Word travel notes.

---

# Architecture Overview

```txt
Client
   |
   | POST /uploads/presign
   |
NestJS API
   |
   | Generate presigned URL
   |
AWS S3
   ^
   |
Client uploads directly
```

---

# Why Presigned URLs

Do NOT upload through NestJS.

Bad architecture:

```txt
Client -> NestJS -> S3
```

Problems:
- memory pressure
- bandwidth bottlenecks
- expensive scaling
- timeout risks
- unnecessary API load

Correct architecture:

```txt
Client -> S3 directly
```

NestJS only:
- authenticates
- validates
- generates temporary upload URL
- tracks upload state

---

# Tech Stack

## Backend

- NestJS
- Prisma
- PostgreSQL

---

# Storage

- AWS S3

---

# AWS SDK

Use AWS SDK v3.

Required packages:

```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```

---

# Environment Variables

```env
AWS_REGION=ap-southeast-1

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

AWS_S3_BUCKET=travel-ai-files
```

---

# Database Design

# Upload Model

Add upload tracking model.

```prisma
model Upload {
  id            String   @id @default(cuid())

  userId        String
  user          User @relation(fields: [userId], references: [id])

  originalName  String

  mimeType      String

  size          Int?

  s3Key         String
  bucket        String

  status        UploadStatus @default(PENDING)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

# Upload Status Enum

```prisma
enum UploadStatus {
  PENDING
  UPLOADING
  UPLOADED
  FAILED
}
```

---

# Why Upload Table Is Important

Do NOT rely only on S3.

Database tracking is required for:
- ownership validation
- auditability
- upload state tracking
- future AI pipeline linkage
- retries
- cleanup
- orphan detection

---

# Recommended S3 Key Structure

Use deterministic structure.

Example:

```txt
uploads/{userId}/{uploadId}/original.docx
```

Example:

```txt
uploads/clx123/ul_abc123/original.docx
```

Benefits:
- easier debugging
- lifecycle policies
- cleanup
- avoids collisions

---

# Upload Flow

# Step 1 — Request Presigned URL

Authenticated client calls:

```http
POST /uploads/presign
```

Request body:

```json
{
  "fileName": "komodo-trip.docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "size": 1048576
}
```

---

# Step 2 — Backend Validation

Validate:
- authenticated user
- `.docx` extension
- exact MIME type
- file size limits

Reject all other file types.

---

# Step 3 — Generate Presigned PUT URL

Backend:
- generates upload ID
- generates S3 key

Generate temporary S3 upload URL.

Recommended expiration:

```txt
5 minutes
```

---

# Step 4 — Create Upload Record

Backend:
- inserts upload row using the generated ID and key

Initial status:

```txt
PENDING
```

Return:

```json
{
  "data": {
    "uploadId": "ul_123",
    "uploadUrl": "https://s3....",
    "s3Key": "uploads/user123/ul_123/original.docx"
  }
}
```

---

# Step 5 — Client Uploads Directly to S3

Client uploads file directly to S3 using PUT request.

NestJS is bypassed entirely for file transfer.

---

# Step 6 — Confirm Upload Completion

Client calls:

```http
POST /uploads/:id/complete
```

Backend:
- verifies S3 object exists
- validates object metadata
- updates upload status

Final status:

```txt
UPLOADED
```

---

# Why Completion Endpoint Is Important

Do NOT trust client upload completion blindly.

Possible failures:
- upload cancelled
- partial upload
- expired upload URL
- empty object

Backend must verify object existence in S3 before confirming upload.

---

# Recommended NestJS Module Structure

```txt
src/modules/uploads/
├── dto/
│   ├── create-presigned-url.dto.ts
│   └── complete-upload.dto.ts
│
├── uploads.controller.ts
├── uploads.service.ts
├── uploads.module.ts
│
├── storage/
│   ├── s3.service.ts
│   └── storage.interface.ts
│
└── validators/
```

---

# Architectural Principle

Separate:
- upload business logic
- storage provider implementation

Do NOT tightly couple uploads service to raw AWS SDK usage.

Use abstraction:

```ts
interface StorageProvider {
  generatePresignedUploadUrl(): Promise<string>;
}
```

Benefits:
- testability
- provider swapping
- cleaner architecture
- easier mocking

---

# API Endpoints

# Generate Presigned Upload URL

```http
POST /uploads/presign
```

Authenticated route.

---

# Confirm Upload Completion

```http
POST /uploads/:id/complete
```

Authenticated route.

---

# Get Upload Metadata

```http
GET /uploads/:id
```

Authenticated route.

---

# Validation Requirements

# CreatePresignedUrlDto

```ts
fileName: string;
mimeType: string;
size: number;
```

---

# Validation Rules

# File Extension

ONLY allow:

```txt
.docx
```

---

# MIME Type

ONLY allow:

```txt
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

---

# File Size Limit

Recommended:

```txt
10MB max
```

Prevent:
- abuse
- storage attacks
- excessive costs

---

# Security Requirements

# IMPORTANT

## Never Trust Client Metadata

Validate:
- extension
- MIME type
- size

Client input is untrusted.

---

# S3 Bucket Security

Bucket should:
- remain private
- disable public ACLs
- use presigned URLs only

Do NOT expose public upload buckets.

---

# Presigned URL Expiration

Short expiration only.

Recommended:

```txt
5 minutes
```

---

# Store S3 Keys — NOT Public URLs

Store:
- bucket name
- S3 key

Do NOT store:
- temporary signed URLs
- public URLs

Generate signed download URLs later if needed.

---

# Recommended Service Responsibilities

# UploadsService

Responsibilities:
- validation
- upload orchestration
- DB writes
- upload completion flow

Should NOT:
- contain raw AWS SDK complexity

---

# S3Service

Responsibilities:
- generate presigned URLs
- verify object existence
- storage operations

---

# Future Compatibility

This upload system must prepare for future async AI workflows.

Future flow:

```txt
upload.completed
   |
queue extraction job
   |
AI worker downloads file
   |
parse .docx
   |
generate structured article draft
```

So uploads should later connect to:
- documents
- extraction jobs
- article drafts

---

# Important Anti-Patterns To Avoid

# DO NOT

## 1. Upload Files Through NestJS

Bad:

```txt
Client -> API -> S3
```

Use direct S3 upload.

---

## 2. Allow Multiple File Types

ONLY `.docx`.

Do NOT prematurely support:
- pdf
- images
- doc
- txt

Keep scope strict.

---

## 3. Trust Upload Completion Calls

Always verify object existence in S3.

---

## 4. Skip Upload Tracking Table

Upload tracking is required.

---

## 5. Spread AWS SDK Logic Everywhere

Centralize inside:
- S3Service
- StorageProvider abstraction

---

# Recommended First Milestone

Implement:

- Upload Prisma model
- Upload status enum
- Upload module
- S3 service
- Presigned URL generation
- Upload completion endpoint
- `.docx` validation
- MIME type validation
- file size validation
- authenticated upload routes
- S3 object verification

Do NOT implement:
- frontend
- drag & drop UI
- AI processing
- queues
- document parsing

Focus ONLY on backend upload infrastructure.