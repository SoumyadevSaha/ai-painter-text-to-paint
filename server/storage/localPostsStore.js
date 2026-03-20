import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { pathToFileURL } from 'url';

const defaultDataDir = new URL('../data/', import.meta.url);
const defaultPostsFile = new URL('../data/posts.json', import.meta.url);

const getPostsFile = () => {
    if (process.env.LOCAL_POSTS_FILE) {
        return pathToFileURL(process.env.LOCAL_POSTS_FILE);
    }

    return defaultPostsFile;
};

const getDataDir = () => {
    const postsFile = getPostsFile();
    return new URL('./', postsFile);
};

const ensureDataFile = async () => {
    const dataDir = getDataDir() || defaultDataDir;
    const postsFile = getPostsFile();

    await mkdir(dataDir, { recursive: true });

    try {
        await readFile(postsFile, 'utf8');
    } catch {
        await writeFile(postsFile, '[]\n', 'utf8');
    }
};

const readPosts = async () => {
    const postsFile = getPostsFile();
    await ensureDataFile();
    const fileContents = await readFile(postsFile, 'utf8');

    try {
        return JSON.parse(fileContents);
    } catch {
        await writeFile(postsFile, '[]\n', 'utf8');
        return [];
    }
};

const writePosts = async (posts) => {
    const postsFile = getPostsFile();
    await ensureDataFile();
    await writeFile(postsFile, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
};

const sortPosts = (posts) => posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const getCommunityPosts = async () => {
    const posts = await readPosts();
    return sortPosts(posts.filter((post) => post.isCommunity));
};

const getLocalPosts = async () => {
    const posts = await readPosts();
    return sortPosts(posts);
};

const getUserPosts = async (userId) => {
    const posts = await readPosts();
    return sortPosts(posts.filter((post) => post.userId === userId));
};

const createLocalPost = async (post) => {
    const posts = await readPosts();

    const newPost = {
        _id: randomUUID(),
        ...post,
        reactions: Array.isArray(post.reactions) ? post.reactions : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    posts.push(newPost);
    await writePosts(posts);

    return newPost;
};

const updateLocalPostCommunityState = async ({ postId, userId, isCommunity }) => {
    const posts = await readPosts();
    const postIndex = posts.findIndex((post) => post._id === postId && post.userId === userId);

    if (postIndex === -1) {
        return null;
    }

    posts[postIndex] = {
        ...posts[postIndex],
        isCommunity,
        updatedAt: new Date().toISOString(),
    };

    await writePosts(posts);
    return posts[postIndex];
};

const updateLocalPostReaction = async ({ postId, userId, reaction }) => {
    const posts = await readPosts();
    const postIndex = posts.findIndex((post) => post._id === postId && post.isCommunity);

    if (postIndex === -1) {
        return null;
    }

    const reactions = Array.isArray(posts[postIndex].reactions) ? [...posts[postIndex].reactions] : [];
    const existingReactionIndex = reactions.findIndex((item) => item.userId === userId);

    if (!reaction) {
        if (existingReactionIndex !== -1) {
            reactions.splice(existingReactionIndex, 1);
        }
    } else if (existingReactionIndex === -1) {
        reactions.push({ userId, value: reaction });
    } else {
        reactions[existingReactionIndex] = { userId, value: reaction };
    }

    posts[postIndex] = {
        ...posts[postIndex],
        reactions,
        updatedAt: new Date().toISOString(),
    };

    await writePosts(posts);
    return posts[postIndex];
};

export {
    createLocalPost,
    getCommunityPosts,
    getLocalPosts,
    getUserPosts,
    updateLocalPostCommunityState,
    updateLocalPostReaction,
};
