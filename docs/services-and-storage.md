# VinciForge Services and Storage

This guide covers MongoDB, Cloudinary, OpenAI, and the app's fallback behavior.

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
4. Copy the `Cloud name`, `API Key`, and `API Secret`
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

## OpenAI and Provider Fallbacks

OpenAI is optional.

To enable backend image generation:

```env
OPENAI_API_KEY=your_openai_key
OPENAI_IMAGE_MODEL=gpt-image-1.5
```

If `OPENAI_API_KEY` is missing or fails:

- the frontend can fall back to Puter when `VITE_ENABLE_PUTER_FALLBACK=true`
- the app can still fall back to the local mock generator
