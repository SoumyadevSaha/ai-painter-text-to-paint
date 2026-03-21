# VinciForge Local Development

This guide covers local setup, environment files, and how to run the app with or without external services.

## What The App Lets You Do

Once the app is running, a signed-in user can:

- upload an image or GIF from their device
- generate a new image with AI
- share creations to the public community gallery
- keep a personal gallery of everything they have created
- unshare or delete creations later from `My Creations`

## Prerequisites

- Node.js 18+
- npm
- Optional: MongoDB Community Server or MongoDB Atlas
- Optional: Cloudinary account

## Install Dependencies

```bash
cd client
npm ci

cd ../server
npm ci
```

## Create Environment Files

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## Environment Variables

### `server/.env`

```env
HOST=127.0.0.1
PORT=8080
MONGODB_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=ai-painter
CLOUDINARY_MIRROR_REMOTE_IMAGES=false
MAX_SOURCE_IMAGE_BYTES=5242880
```

### `client/.env`

```env
VITE_API_URL=http://127.0.0.1:8080
VITE_ENABLE_PUTER_FALLBACK=true
VITE_PUTER_MODEL=gpt-image-1.5
```

`MAX_SOURCE_IMAGE_BYTES=5242880` keeps uploads at 5 MB by default, and the studio only accepts image files or GIFs.

## Start the App

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://127.0.0.1:5173
```

## Running Without External Services

If you do not configure MongoDB or Cloudinary:

- posts are stored in `server/data/posts.json`
- users are stored in `server/data/users.json`
- images fall back to Puter or the local mock generator
- the app still runs and the auth, upload, AI generation, personal gallery, and community sharing flow still works

This is the easiest way to explore the project before wiring real services.
