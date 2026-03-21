# VinciForge

VinciForge is a full-stack MERN app for uploading your own artwork, generating new images with AI, building a personal gallery, and sharing selected pieces with the world through a public community feed.

It is designed to stay usable even when some external services are missing:

- external image APIs can be absent and the app still generates images through Puter or the local mock generator
- MongoDB can be absent and the app still stores data in local JSON files
- Cloudinary can be absent and the app still saves posts with the original image payload

## Highlights

- React + Vite frontend
- Express backend with REST APIs
- JWT authentication
- Upload-first studio for personal images and GIFs
- AI image generation with browser-first fallback support
- Personal gallery for everything you create
- Public community gallery with share/unshare control
- MongoDB support with local JSON fallback
- Cloudinary support with free-tier-friendly upload guards
- Image uploads capped for a Cloudinary free account workflow
- GitHub Actions CI for server tests, client tests, and client builds

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB Atlas or local JSON fallback
- Auth: JWT + password hashing
- Media hosting: Cloudinary
- Image generation: Puter.js, local mock generator

## Project Structure

```text
client/   React frontend
server/   Express API, auth, storage, models, and tests
docs/     Setup, testing, service, and deployment guides
```

## Core Flow

Each user can:

- register and log in
- upload images from their device
- generate fresh artwork with AI
- keep all of their creations in a personal gallery
- share or unshare pieces from the public gallery whenever they want
- delete artwork from their own gallery

Image generation currently follows this fallback order:

1. Puter.js in the browser
2. Local mock SVG preview from the backend

## Product Experience

VinciForge is designed around three simple ideas:

- bring your own image and publish it with your own prompt or description
- create a new frame with AI when you want a fresh concept
- manage everything you make from your own gallery, then decide what stays public

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
