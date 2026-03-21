import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    value: { type: String, enum: ['like', 'dislike'], required: true },
}, { _id: false });

const PostSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
    prompt: { type: String, required: true },
    photo: { type: String, required: true },
    photoPublicId: { type: String, default: null },
    isCommunity: { type: Boolean, default: false },
    reactions: { type: [ReactionSchema], default: [] },
}, {
    timestamps: true,
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post;
