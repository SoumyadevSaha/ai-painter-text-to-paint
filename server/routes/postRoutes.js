import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// get route to get all our posts
router.route('/').get(async(req, res) => {
    try {
        const posts = await Post.find({});
        // console.log(posts)
        res.status(200).json({ success: true, message: 'All posts', data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong', error: error?.response.data });
    }
});

// create a new post
router.route('/').post(async(req, res) => {
    try {
        const { name, prompt, photo } = req.body;
        const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Post.create({
            name,
            prompt,
            photo: photoUrl.url,
        });

        res.status(201).json({ success: true, message: 'Post created successfully', data: newPost });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong', error: error?.response.data });
    }
});

export default router;