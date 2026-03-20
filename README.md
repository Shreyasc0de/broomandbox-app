# Broom & Box

Broom & Box is a Vite + React frontend with an Express server for form submissions, admin data APIs, media uploads, and the site chatbot. Supabase is used for the database and object storage.

## Stack

- React 19 + React Router 7
- Vite 6
- Express
- Supabase
- Tailwind CSS 4
- Nodemailer
- Gemini via `@google/genai`

## Local Development

### Prerequisites

- Node.js 20+
- A Supabase project with the expected tables and storage buckets
- Gmail app credentials if you want booking emails to send

### Environment variables

Create a `.env` file for the server and a `.env.local` or `.env` file for Vite with the following values:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
GEMINI_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Start the app

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Project Notes

- `server.ts` starts the Express app and mounts the API route modules.
- `src/server/routes` contains the backend route registration grouped by concern.
- `src/admin` contains the admin interface.
- `src/components/home` contains the marketing site sections.
- `src/components/layout` contains shared page-shell components for top-level site pages.
