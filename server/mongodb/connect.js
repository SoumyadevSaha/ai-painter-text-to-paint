import mongoose from 'mongoose';

const connectDB = async (url) => {
    mongoose.set('strictQuery', true);

    if (!url) {
        console.warn('MONGODB_URL is not configured. Falling back to local JSON storage.');
        return false;
    }

    try {
        await mongoose.connect(url);
        console.log('MongoDB connected');
        return true;
    } catch (err) {
        console.error('MongoDB connection failed. Falling back to local JSON storage.');
        console.error(err.message);
        return false;
    }
};

const isMongoReady = () => mongoose.connection.readyState === 1;

export default connectDB;
export { isMongoReady };
