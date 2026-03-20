# AI Painter

AI Painter is a full-stack MERN app for generating AI artwork, saving it to a personal studio, and publishing selected pieces to a community gallery.

It is designed to stay usable in local development even when paid services are missing:

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
```

## Core Flow

### Authentication and Ownership

Each user can:

- register and log in
- generate images
- save creations to a private studio
- publish selected creations to the community gallery later

Community posts appear on the home page. Private posts appear only on the `My Creations` page for the signed-in user.

### Image Generation Fallback Order

The app currently tries image generation in this order:

1. OpenAI on the backend
2. Puter.js in the browser
3. Local mock SVG preview

This keeps the app functional even if your OpenAI key is missing, expired, or intentionally disabled.

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- Optional: MongoDB Community Server or MongoDB Atlas
- Optional: Cloudinary account
- Optional: OpenAI API key

### Install Dependencies

```bash
cd client
npm ci

cd ../server
npm ci
```

### Create Environment Files

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### Environment Variables

#### `server/.env`

```env
HOST=127.0.0.1
PORT=8080
MONGODB_URL=
JWT_SECRET=
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=ai-painter
CLOUDINARY_MIRROR_REMOTE_IMAGES=false
MAX_SOURCE_IMAGE_BYTES=5242880
```

#### `client/.env`

```env
VITE_API_URL=http://127.0.0.1:8080
VITE_ENABLE_PUTER_FALLBACK=true
VITE_PUTER_MODEL=gpt-image-1.5
```

### Start the App

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

If you do not configure MongoDB, Cloudinary, or OpenAI:

- posts are stored in `server/data/posts.json`
- users are stored in `server/data/users.json`
- images fall back to Puter or the local mock generator
- the app still runs and the auth/studio/community flow still works

This is the easiest way to test the app locally before wiring real services.

## MongoDB Setup

MongoDB is recommended if you want persistent multi-user data.

### Official Installation Guides

- Main install guide: https://www.mongodb.com/docs/manual/installation/
- Linux install guide: https://www.mongodb.com/docs/manual/administration/install-on-linux/
- macOS install guide: https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-os-x/
- Windows install guide: https://www.mongodb.com/docs/v5.2/tutorial/install-mongodb-on-windows/

### macOS

```bash
xcode-select --install
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
mongosh
```

### Ubuntu Linux

Install MongoDB using MongoDB's official repository for your Ubuntu version, then run:

```bash
sudo systemctl enable mongod
sudo systemctl start mongod
sudo systemctl status mongod
mongosh
```

### Windows

Install MongoDB Community Server from MongoDB's Download Center, then run:

```powershell
net start MongoDB
mongosh
```

If you run it manually:

```powershell
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath="c:\data\db"
```

### MongoDB Atlas

MongoDB Atlas is the simplest free hosted database option for this project.

Official docs:

- Create a free cluster: https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/
- Connect to cluster: https://www.mongodb.com/docs/atlas/connect-to-cluster/
- Atlas connection string guide: https://www.mongodb.com/docs/guides/atlas/connection-string/

Recommended flow:

1. Create an Atlas project
2. Create an `M0` free cluster
3. Create a database user
4. Add your IP address to network access
5. Copy the Node.js driver connection string
6. Put it in `server/.env` as `MONGODB_URL`
7. Restart the backend

Example:

```env
MONGODB_URL=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/ai_painter?retryWrites=true&w=majority&appName=Cluster0
```

## Cloudinary Setup

This project uses signed server-side uploads from the backend.

### What You Need

- Cloudinary account
- `cloud name`
- `API key`
- `API secret`

### What You Do Not Need for This Project

- auto-upload mappings
- upload defaults
- unsigned upload presets

Your unsigned preset can exist, but it is not used by the current backend flow.

### Official Docs

- Find credentials: https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials
- Upload guide: https://cloudinary.com/documentation/upload_images
- Node.js upload guide: https://cloudinary.com/documentation/node_image_and_video_upload
- Media Library: https://cloudinary.com/documentation/media_library_for_developers
- Upload presets: https://cloudinary.com/documentation/upload_presets
- Delete assets: https://cloudinary.com/documentation/delete_assets

### Configure Cloudinary for This Project

1. Create or log in to your Cloudinary account
2. Open the Cloudinary Console
3. Open the environment or product environment you want to use
4. Copy:
   - `Cloud name`
   - `API Key`
   - `API Secret`
5. Add them to `server/.env`

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=ai-painter
CLOUDINARY_MIRROR_REMOTE_IMAGES=false
MAX_SOURCE_IMAGE_BYTES=5242880
```

### Why the Current Defaults Are Safe for a Free Cloudinary Account

- `MAX_SOURCE_IMAGE_BYTES=5242880` keeps uploads below 5 MB
- `CLOUDINARY_MIRROR_REMOTE_IMAGES=false` avoids re-uploading remote provider URLs unnecessarily
- Cloudinary is only used when a user saves a post

### Local Cloudinary Verification

1. Add the Cloudinary credentials to `server/.env`
2. Start the backend with `npm run dev`
3. Start the frontend with `npm run dev`
4. Register or log in
5. Generate an image
6. Save it
7. Open the Home page or My Creations page and confirm the image URL is now a Cloudinary delivery URL

### Where Uploaded Images Appear

Uploaded files appear in the Cloudinary `Media Library`.

To find them:

1. Open the Cloudinary Console
2. Open `Media Library`
3. Open the folder defined by `CLOUDINARY_UPLOAD_FOLDER`

By default:

```env
CLOUDINARY_UPLOAD_FOLDER=ai-painter
```

### How to Delete Uploaded Images

1. Open `Media Library`
2. Open your project folder, such as `ai-painter`
3. Select the uploaded assets
4. Delete them from the toolbar or the asset menu

### Security Note

If an API secret was ever exposed publicly, rotate it in Cloudinary before using the app in production.

## OpenAI and Fallback Providers

OpenAI is optional.

To enable backend image generation:

```env
OPENAI_API_KEY=your_openai_key
OPENAI_IMAGE_MODEL=gpt-image-1.5
```

If `OPENAI_API_KEY` is missing or fails:

- the frontend can fall back to Puter when `VITE_ENABLE_PUTER_FALLBACK=true`
- the app can still fall back to the local mock generator

## Testing

### Server

```bash
cd server
npm test
npm run test:unit
npm run test:integration
```

Optional Mongo-backed integration test:

```bash
cd server
MONGODB_TEST_URI="your_mongodb_connection_string" npm run test:mongo
```

If `MONGODB_TEST_URI` is not set, the optional Mongo integration test is skipped.

### Client

```bash
cd client
npm test
npm run test:unit
npm run test:integration
npm run build
```

## API Overview

### Health and Status

```text
GET /
GET /api/v1/health
```

### Auth

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

### Posts

```text
GET /api/v1/post
GET /api/v1/post/mine
POST /api/v1/post
PATCH /api/v1/post/:postId/community
```

### Image Generation

```text
GET /api/v1/dalle
POST /api/v1/dalle
```

## Quick Verification Checklist

After setup, this is the fastest way to confirm the full app works:

1. Start backend and frontend
2. Register a user
3. Generate an image
4. Save it as a private post
5. Open `My Creations`
6. Publish the post to the community
7. Open the home page and confirm the post appears there
8. If Cloudinary is enabled, confirm the image appears in Cloudinary Media Library
9. If MongoDB is enabled, restart the backend and confirm the data persists

## Deploy with GitHub

### Frontend on Netlify

Netlify is a good fit for the `client/` app.

Official docs:

- Netlify getting started: https://docs.netlify.com/start/get-started-guide/
- Environment variables: https://docs.netlify.com/build/configure-builds/environment-variables/

Recommended steps:

1. Push the repository to GitHub
2. Sign in to Netlify
3. Click `Add new site` or `Add new project`
4. Choose `Import an existing project`
5. Connect Netlify to GitHub
6. Select this repository
7. Set:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
8. Add frontend environment variables:

```env
VITE_API_URL=https://your-backend-service.onrender.com
VITE_ENABLE_PUTER_FALLBACK=true
VITE_PUTER_MODEL=gpt-image-1.5
```

9. Click deploy

After that, every push to the connected GitHub branch can trigger a new Netlify deploy automatically.

### Backend on Render

If you want a free backend, Render is the most practical choice for this project.

Official docs:

- Render quickstarts: https://render.com/docs
- Environment variables: https://render.com/docs/configure-environment-variables

Recommended steps:

1. Push the repository to GitHub
2. Sign in to Render
3. Create a new `Web Service`
4. Connect your GitHub account
5. Select this repository
6. Set:
   - Root directory: `server`
   - Build command: `npm ci`
   - Start command: `npm start`
7. Add backend environment variables:

```env
HOST=0.0.0.0
PORT=10000
MONGODB_URL=your_atlas_connection_string
JWT_SECRET=your_long_random_secret
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=ai-painter
CLOUDINARY_MIRROR_REMOTE_IMAGES=false
MAX_SOURCE_IMAGE_BYTES=5242880
```

8. Deploy the service

After that, every push to the connected GitHub branch can trigger a new Render deploy automatically.

### Database and Media for Production

For a proper hosted full-stack setup:

- use MongoDB Atlas for persistent database storage
- use Cloudinary for hosted images
- use Netlify for the frontend
- use Render for the backend

### Heroku Note

If you specifically need a free backend, prefer Render. Heroku no longer offers a free dyno tier, so it is not the right choice for a free deployment.

## GitHub Actions CI

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

It currently runs:

- server tests on every push and pull request
- client tests on every push and pull request
- client production build on every push and pull request
- optional MongoDB integration tests when `MONGODB_TEST_URI` is added as a GitHub Actions secret

To enable the optional Mongo job in GitHub:

1. Open your GitHub repository
2. Go to `Settings`
3. Open `Secrets and variables`
4. Open `Actions`
5. Add a new repository secret named `MONGODB_TEST_URI`

## Production Notes

- Set a strong `JWT_SECRET` in production
- Use MongoDB Atlas instead of local JSON storage
- Use Cloudinary credentials that are not exposed publicly
- Rotate any secret that was previously shared
- Set `VITE_API_URL` to your deployed backend URL before deploying the frontend
