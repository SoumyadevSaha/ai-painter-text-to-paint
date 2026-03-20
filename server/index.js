import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { pathToFileURL } from 'url';

import connectDB, { isMongoReady } from './mongodb/connect.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'VinciForge API is running',
        mongoConnected: isMongoReady(),
    });
});

app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'ok',
        mongoConnected: isMongoReady(),
        cloudinaryConfigured: Boolean(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        ),
        openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
        jwtConfigured: Boolean(process.env.JWT_SECRET),
        storageMode: isMongoReady() ? 'mongodb' : 'local-json',
    });
});

const startServer = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);

        const port = Number(process.env.PORT) || 8080;
        const host = process.env.HOST || '127.0.0.1';

        app.listen(port, host, () => {
            console.log(`Server started on http://${host}:${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    startServer();
}

export { startServer };
export default app;
