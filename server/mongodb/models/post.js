import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
    prompt: { type: String, required: true },
    photo: { type: String, required: true },
    isCommunity: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post;
