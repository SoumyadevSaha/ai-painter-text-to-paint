# VinciForge Deployment

This guide covers GitHub-connected deployments for Netlify and Render, plus the recommended production service layout.

## Frontend on Netlify

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
7. Set the base directory to `client`
8. Set the build command to `npm run build`
9. Set the publish directory to `dist`
10. Add frontend environment variables:

```env
VITE_API_URL=https://your-backend-service.onrender.com
VITE_ENABLE_PUTER_FALLBACK=true
VITE_PUTER_MODEL=gpt-image-1.5
```

11. Click deploy

Every push to the connected GitHub branch can trigger a new Netlify deploy automatically.

## Backend on Render

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
6. Set the root directory to `server`
7. Set the build command to `npm ci`
8. Set the start command to `npm start`
9. Add backend environment variables:

```env
HOST=0.0.0.0
PORT=10000
MONGODB_URL=your_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=ai-painter
CLOUDINARY_MIRROR_REMOTE_IMAGES=false
MAX_SOURCE_IMAGE_BYTES=5242880
```

10. Deploy the service

Every push to the connected GitHub branch can trigger a new Render deploy automatically.

## Recommended Production Setup

For a proper hosted full-stack setup:

- use MongoDB Atlas for persistent database storage
- use Cloudinary for hosted images
- use Netlify for the frontend
- use Render for the backend

## Heroku Note

If you specifically need a free backend, prefer Render. Heroku no longer offers a free dyno tier, so it is not the right choice for a free deployment.

## Production Notes

- Set a strong `JWT_SECRET` in production
- Use MongoDB Atlas instead of local JSON storage
- Use Cloudinary credentials that are not exposed publicly
- Keep `MAX_SOURCE_IMAGE_BYTES` at a free-tier-friendly value such as `5242880`
- The create page only accepts image uploads and GIFs, so do not wire document or video upload expectations into deployment
- Rotate any secret that was previously shared
- Set `VITE_API_URL` to your deployed backend URL before deploying the frontend
