# VinciForge

VinciForge is a full-stack MERN app for generating AI artwork, saving it to a personal studio, and publishing selected pieces to a community gallery.

It is designed to stay usable even when some external services are missing:

- OpenAI can be absent and the app still generates images through Puter or the local mock generator
- MongoDB can be absent and the app still stores data in local JSON files
- Cloudinary can be absent and the app still saves posts with the original image payload

## Highlights

- React + Vite frontend
- Express backend with REST APIs
- JWT authentication
- Private personal studio for each user
- Community gallery with publish/unpublish control
- MongoDB support with local JSON fallback
- Cloudinary support with free-tier-friendly upload guards
- OpenAI support with Puter and mock-image fallback
- GitHub Actions CI for server tests, client tests, and client builds

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB Atlas or local JSON fallback
- Auth: JWT + password hashing
- Media hosting: Cloudinary
- Image generation: OpenAI, Puter.js, local mock generator

## Project Structure

```text
client/   React frontend
server/   Express API, auth, storage, models, and tests
docs/     Setup, testing, service, and deployment guides
```

## Core Flow

Each user can:

- register and log in
- generate images
- save creations to a private studio
- publish selected creations to the community gallery later

Image generation currently follows this fallback order:

1. OpenAI on the backend
2. Puter.js in the browser
3. Local mock SVG preview

## Quick Start

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env

cd client
npm ci

cd ../server
npm ci
```

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

## Documentation

- [Local development guide](docs/local-development.md)
- [MongoDB, Cloudinary, and provider setup](docs/services-and-storage.md)
- [Testing, API overview, and CI](docs/testing-and-api.md)
- [Deployment guide for Netlify and Render](docs/deployment.md)
- [Server test notes](server/tests/README.md)

## When You Want More Than Local Mode

For a proper hosted full-stack setup:

- use MongoDB Atlas for persistent database storage
- use Cloudinary for hosted images
- use Netlify for the frontend
- use Render for the backend

If you specifically need a free backend, prefer Render. Heroku no longer offers a free dyno tier, so it is not the right choice for a free deployment.
