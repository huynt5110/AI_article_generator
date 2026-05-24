# Next Stage — Authentication UI (Signup/Login)

# Goal

Implement authentication screens using:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- Axios
- React Hook Form
- Zod

IMPORTANT:
- Do NOT use inline CSS
- Do NOT use CSS modules
- Use Tailwind utility classes only
- Use React Query for ALL API requests/state
- Configure stale times properly

Focus ONLY on:
- login page
- signup page
- auth layout
- form validation
- API integration
- auth state management

Do NOT implement:
- dashboard
- uploads
- article editing
- AI workflows

---

# Tech Stack

- Next.js 15+
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack React Query
- Axios
- React Hook Form
- Zod

---

# Architecture Requirements

Implement clean frontend architecture.

Recommended structure:

```txt
/app
  /(auth)
    /login
    /signup

/components
  /auth

/lib
  /api
  /auth
  /react-query

/hooks
  /mutations
  /queries

/schemas
```

---

# React Query Setup

Create centralized React Query provider.

Example:

```txt
/lib/react-query/
  query-client.ts
  provider.tsx
```

---

# Query Client Requirements

Configure:
- staleTime
- gcTime
- retry behavior
- refetch policies

Recommended defaults:

```ts
staleTime: 1000 * 60 * 5
gcTime: 1000 * 60 * 30
retry: 1
refetchOnWindowFocus: false
```

IMPORTANT:
Do NOT use default aggressive refetching behavior.

---

# Why Stale Time Matters

Auth/user state changes infrequently.

Without staleTime:
- unnecessary API calls
- extra renders
- poor UX

Use meaningful cache strategy.

---

# Recommended Auth Query Strategy

# Current User Query

Use query key:

```ts
['me']
```

Recommended staleTime:

```ts
10 minutes
```

Reason:
- user profile rarely changes
- avoids spam refetching

---

# Login/Signup

Use:
- React Query mutations

NOT queries.

---

# API Layer Requirements

Create reusable Axios client.

Example:

```txt
/lib/api/
  client.ts
```

Requirements:
- baseURL support
- auth token injection
- response interceptors
- error normalization

---

# Authentication Layer

Recommended structure:

```txt
/lib/auth/
  auth.service.ts
  auth.storage.ts
  auth.types.ts
  auth.constants.ts
```

---

# Token Handling

Use abstraction.

Do NOT access localStorage directly throughout app.

Example:

```ts
authStorage.setToken()
authStorage.getToken()
authStorage.clear()
```

---

# Recommended Token Strategy

Preferred:
- httpOnly cookies if backend supports it

Temporary acceptable:
- localStorage abstraction

---

# Pages To Implement

# 1. Login Page

Route:

```txt
/login
```

Fields:
- email
- password

Actions:
- submit login
- link to signup

---

# 2. Signup Page

Route:

```txt
/signup
```

Fields:
- full name
- email
- password
- confirm password

Actions:
- submit signup
- link to login

---

# Validation Requirements

Use:
- Zod
- React Hook Form

---

# Login Validation

```txt
email:
- required
- valid email

password:
- minimum 8 chars
```

---

# Signup Validation

```txt
name:
- required
- minimum 2 chars

email:
- valid email

password:
- minimum 8 chars

confirmPassword:
- must match password
```

---

# UI Design Requirements

The UI should feel:
- modern
- premium
- editorial
- minimal

Inspiration:
- Linear
- Vercel
- Notion
- Medium

Avoid:
- flashy gradients
- oversized shadows
- playful UI

---

# Layout Requirements

Desktop:
- split-screen auth layout

Left side:
- branding
- product messaging

Right side:
- auth form card

Mobile:
- stacked layout

---

# Example Branding Copy

```txt
Transform rough travel notes into structured editorial stories powered by AI.
```

Keep copy short and premium.

---

# Component Requirements

Create reusable components:

```txt
/components/auth/
  auth-layout.tsx
  auth-header.tsx
  login-form.tsx
  signup-form.tsx
```

---

# Recommended shadcn/ui Components

Use:
- Card
- Button
- Input
- Label
- Alert
- Form
- Separator

---

# Accessibility Requirements

Must support:
- keyboard navigation
- semantic labels
- aria-invalid
- accessible errors
- proper focus states

---

# Form UX Requirements

# Loading State

Disable submit button during mutation.

Show:
- spinner
- loading text

Examples:

```txt
Signing in...
Creating account...
```

---

# Error Handling

Handle:
- validation errors
- network errors
- API auth errors

Example:

```txt
Invalid email or password
```

---

# Success Handling

After successful auth:
- persist token
- invalidate current user query
- redirect user

Use React Query invalidation.

Example:

```ts
queryClient.invalidateQueries({
  queryKey: ['me']
})
```

---

# React Query Mutation Requirements

# Login Mutation

Create:

```txt
/hooks/mutations/use-login.ts
```

Use:
- useMutation

Responsibilities:
- call login API
- persist token
- invalidate user query
- redirect

---

# Signup Mutation

Create:

```txt
/hooks/mutations/use-signup.ts
```

Responsibilities:
- register user
- persist token
- invalidate user query
- redirect

---

# Current User Query

Create:

```txt
/hooks/queries/use-current-user.ts
```

Requirements:
- fetch authenticated user
- cache with staleTime
- disable retries on 401

Recommended config:

```ts
retry: false
staleTime: 1000 * 60 * 10
```

---

# Protected Route Preparation

Prepare architecture for future protected routes.

Suggested:

```txt
/components/auth/
  auth-guard.tsx
```

Do NOT fully implement route middleware yet.

---

# Styling Rules

IMPORTANT:
Use:
- Tailwind utility classes
- shadcn/ui

Do NOT:
- use inline styles
- use CSS modules
- use styled-components

Bad:

```tsx
style={{ padding: 12 }}
```

---

# Responsive Requirements

Must work well on:
- mobile
- tablet
- desktop

Mobile:
- full-width form
- reduced spacing
- stacked layout

---

# Dark Mode Support

Support dark mode using Tailwind class strategy.

Ensure:
- readable contrast
- muted backgrounds
- accessible borders

---

# Recommended Query Keys

```ts
['me']
['auth']
```

Keep query keys centralized.

Example:

```txt
/lib/react-query/query-keys.ts
```

---

# Important React Query Anti-Patterns To Avoid

# DO NOT

## 1. Use React Query For Form State

React Query is for:
- server state

NOT:
- input state

Use React Hook Form for forms.

---

## 2. Refetch Aggressively

Disable:

```ts
refetchOnWindowFocus: true
```

for auth flows.

---

## 3. Use Giant Global Stores

Do NOT add Redux/Zustand prematurely.

React Query + hooks is enough.

---

## 4. Scatter Axios Calls Everywhere

Centralize API client/service layer.

---

## 5. Ignore Loading/Error States

Every mutation must handle:
- loading
- success
- failure

---

# Recommended First Milestone

Implement:

- React Query provider
- Axios client
- auth service layer
- login page
- signup page
- Zod validation
- React Hook Form integration
- login mutation
- signup mutation
- current user query
- token storage abstraction
- responsive auth layout
- dark mode support

Do NOT implement:
- dashboard
- uploads
- article pages
- collaborative editing
- websocket logic

Focus ONLY on scalable authentication UI architecture.