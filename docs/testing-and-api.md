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
```

### Posts

```text
GET /api/v1/post
GET /api/v1/post/mine
POST /api/v1/post
PATCH /api/v1/post/:postId/community
POST /api/v1/post/:postId/reaction
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
