# Next Stage — Upload Page (.docx Upload Flow)

# Goal

Implement the upload page where authenticated users can:
- upload `.docx` travel notes files
- track upload progress
- trigger backend extraction job creation
- view upload states
- handle validation/errors cleanly

Use:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- Axios

IMPORTANT:
Focus ONLY on:
- upload page UI
- file validation
- upload request flow
- upload progress
- loading/error/success states

Do NOT implement:
- article editor
- AI processing UI
- realtime websocket updates
- drag-and-drop libraries
- multi-file uploads

Single `.docx` upload only.

---

# Upload Flow Requirements

Current backend behavior:

```txt
Client
  →
NestJS API
  →
API uploads file to S3
  →
API creates extraction job
  →
API returns immediately
```

Frontend only needs to:
1. upload file
2. show progress/loading
3. show success/error state
4. redirect or navigate to articles page

---

# Tech Stack

- Next.js 15+
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- Axios

---

# Route Requirements

Create route:

```txt
/upload
```

This route must:
- require authentication
- use existing app shell/navbar
- match overall editorial/minimal design system

---

# Page Layout Requirements

Layout should feel:
- focused
- clean
- editorial
- premium SaaS

Avoid:
- clutter
- huge upload zones
- excessive gradients
- playful UI

---

# Upload UI Requirements

Page should contain:

# Header

Example:

```txt
Upload Travel Notes
```

Subtitle:

```txt
Upload a .docx file containing rough travel notes. We'll transform it into a structured editorial draft.
```

---

# Upload Card

Centered upload container with:
- file picker
- upload instructions
- selected file state
- upload progress
- submit button

---

# File Restrictions

IMPORTANT:
Allow ONLY:

```txt
.docx
```

Accepted MIME type:

```txt
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Reject:
- pdf
- doc
- txt
- images
- zip

---

# File Size Restrictions

Max size:

```txt
10MB
```

Validate:
- client-side
- server-side errors

---

# Upload UX Requirements

# Before File Selected

Show:
- upload icon
- instruction text
- supported format note

Example:

```txt
Select a .docx file
```

---

# After File Selected

Display:
- filename
- size
- remove/change action

Example:

```txt
komodo-trip.docx
2.1 MB
```

---

# Upload Progress

IMPORTANT:
Show real upload progress.

Use:
- Axios onUploadProgress

Display:
- progress bar
- percentage

Example:

```txt
Uploading... 62%
```

---

# Upload States

Support:
- idle
- validating
- uploading
- success
- error

---

# Success State

After successful upload:

Show:

```txt
Upload successful. Your draft is being processed.
```

Provide:
- button to view articles
OR
- automatic redirect

Recommended:
- redirect to `/articles`

---

# Error State Requirements

Handle:
- invalid file type
- file too large
- upload failures
- server errors
- auth errors

Example messages:

```txt
Only .docx files are supported.
```

```txt
File size exceeds 10MB limit.
```

```txt
Upload failed. Please try again.
```

---

# React Query Requirements

Create mutation hook:

```txt
/hooks/mutations/use-upload-document.ts
```

Use:
- useMutation

Responsibilities:
- upload file
- track progress
- handle success/error
- invalidate article queries if needed

---

# Recommended Query Invalidations

After successful upload:

```ts
queryClient.invalidateQueries({
  queryKey: ['articles']
})
```

Reason:
new draft may appear later.

---

# API Requirements

Assume backend endpoint:

```http
POST /uploads
```

Content-Type:

```txt
multipart/form-data
```

Payload:

```txt
file: .docx
```

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

---

# API Layer Requirements

Create:

```txt
/lib/api/uploads.service.ts
```

Responsibilities:
- multipart upload handling
- progress callback support
- typed responses

---

# Recommended Component Structure

```txt
/components
  /upload
    upload-card.tsx
    upload-dropzone.tsx
    upload-progress.tsx
    upload-error.tsx
```

IMPORTANT:
No external dropzone library needed yet.

Simple file input is enough.

---

# Upload Interaction Requirements

Use:
- clickable upload area
- hidden file input
- drag-hover styling optional

Do NOT implement:
- complex drag-and-drop logic
- multi-upload queue
- resumable uploads

Keep flow simple.

---

# Styling Requirements

Use:
- Tailwind utility classes
- shadcn/ui

Do NOT:
- use inline CSS
- use CSS modules
- use styled-components

---

# Recommended shadcn/ui Components

Use:
- Card
- Button
- Progress
- Alert
- Separator

---

# Accessibility Requirements

Must support:
- keyboard file selection
- screen reader labels
- accessible progress updates
- proper button states

---

# Mobile Responsiveness

Mobile:
- stacked layout
- full-width upload card
- touch-friendly actions

Desktop:
- centered upload card
- constrained width

---

# Empty Upload State Example

```txt
------------------------------------------------
|                                              |
|            Upload .docx Notes                |
|                                              |
|   Drag and drop or click to browse           |
|                                              |
|   Supported format: .docx                    |
|   Max size: 10MB                             |
|                                              |
------------------------------------------------
```

---

# Loading State Requirements

While uploading:
- disable upload button
- prevent duplicate submissions
- show progress UI

---

# Recommended Mutation Flow

# Step 1

Validate file client-side.

---

# Step 2

Create FormData.

---

# Step 3

Start upload mutation.

---

# Step 4

Track upload progress.

---

# Step 5

Handle success/error.

---

# Step 6

Redirect user to articles page.

---

# Recommended Validation Logic

Validate:
- MIME type
- extension
- file size

Do NOT rely ONLY on extension.

---

# Type Safety Requirements

Create:

```txt
/types/upload.types.ts
```

Include:
- UploadResponse
- UploadStatus
- UploadError

---

# Authentication Requirements

Upload page must:
- require authenticated user
- use existing auth flow/token injection

Do NOT implement auth again.

---

# Future-Proofing Considerations

Prepare architecture for future:
- multi-file uploads
- drag-and-drop
- resumable uploads
- upload history

BUT do NOT implement now.

---

# Important Anti-Patterns To Avoid

# DO NOT

## 1. Read Entire File Into Memory Manually

Use FormData directly.

---

## 2. Upload Multiple Files

Single file only.

---

## 3. Add Complex Upload Libraries

Native file input is enough.

---

## 4. Skip Client Validation

Validate before upload request.

---

## 5. Put Upload Logic Inside Components

Use mutation hooks + service layer.

---

## 6. Ignore Upload Progress

Progress feedback is important UX.

---

# Recommended First Milestone

Implement:

- upload page
- upload card UI
- file selection
- client validation
- upload mutation
- upload progress UI
- loading/error/success states
- redirect after upload
- responsive layout
- typed upload service

Do NOT implement:
- realtime job tracking
- article editor
- websockets
- drag-and-drop libraries
- multi-file uploads

Focus ONLY on scalable single `.docx` upload UX.