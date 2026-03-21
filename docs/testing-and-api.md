# VinciForge Testing and API

This guide covers local test commands, optional Mongo integration testing, the public API surface, and CI behavior.

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

Interactive API docs are available from the server at:

```text
GET /api-docs
GET /api-docs.json
```

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
POST /api/v1/auth/change-password
DELETE /api/v1/auth/me
```

### Posts

```text
GET /api/v1/post
GET /api/v1/post/mine
POST /api/v1/post
PATCH /api/v1/post/:postId
PATCH /api/v1/post/:postId/community
DELETE /api/v1/post/:postId
POST /api/v1/post/:postId/reaction
```

### Image Generation

```text
GET /api/v1/dalle
POST /api/v1/dalle
```

`POST /api/v1/dalle` is the mock preview fallback route. The create page tries Puter in the browser first.

## Quick Verification Checklist

After setup, this is the fastest way to confirm the full app works:

1. Start backend and frontend
2. Register a user
3. Open `Create`, upload one of your own images, add a prompt or description, and share it
4. Confirm the new post appears on the Home page as a public community item
5. Return to `Create`, use an AI prompt, and generate an image
6. Share the generated image and confirm it also appears on the Home page
7. Open `My Creations` and confirm both your uploaded and AI-generated works appear in your personal gallery
8. Unshare one of the posts from `My Creations` and confirm its status changes from public to private
9. Share that same post again and confirm it returns to the public gallery
10. Like or dislike a community post while signed in, then click the same icon again to clear it
11. Open `Profile`, change the password, and confirm the old password no longer works
12. Delete one of your creations and confirm it disappears from `My Creations`
13. If Cloudinary is enabled, confirm the image appears in Cloudinary Media Library and disappears after deletion
14. If MongoDB is enabled, restart the backend and confirm the data persists

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
