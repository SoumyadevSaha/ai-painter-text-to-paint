import { useEffect, useState } from 'react';

import { Card, Loader } from '../components';
import { useAuth } from '../context/AuthContext';

const MyCreations = () => {
  const { authFetch, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingPostId, setUpdatingPostId] = useState('');
  const [deletingPostId, setDeletingPostId] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authFetch('/api/v1/post/mine');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load your creations');
      }

      setPosts(data.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const toggleCommunityState = async (post) => {
    setUpdatingPostId(post._id);
    setError('');

    try {
      const response = await authFetch(`/api/v1/post/${post._id}/community`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCommunity: !post.isCommunity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update post visibility');
      }

      setPosts((currentPosts) =>
        currentPosts.map((item) => (item._id === post._id ? data.data : item))
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingPostId('');
    }
  };

  const deletePost = async (postId) => {
    setDeletingPostId(postId);
    setError('');

    try {
      const response = await authFetch(`/api/v1/post/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete post');
      }

      setPosts((currentPosts) => currentPosts.filter((item) => item._id !== postId));
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingPostId('');
    }
  };

  return (
    <section className='space-y-8 pb-6'>
      <div className='glass-panel-strong rounded-[34px] px-6 py-8 sm:px-8'>
        <div className='chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]'>
          Your Private Gallery
        </div>
        <h1 className='font-display gradient-text mt-5 pb-1 text-4xl leading-[1.08] sm:text-5xl'>
          {user?.name ? `${user.name}'s creations` : 'Your creations'}
        </h1>
        <p className='mt-4 max-w-2xl text-sm leading-7 text-[#5f6776] sm:text-base'>
          Every upload and every generated piece can live here first. Publish selected posts to the community when they are ready for the gallery wall.
        </p>
      </div>

      {error && (
        <p className='rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
          {error}
        </p>
      )}

      {loading ? (
        <div className='glass-panel-strong flex min-h-[260px] items-center justify-center rounded-[30px]'>
          <Loader />
        </div>
      ) : posts.length === 0 ? (
        <div className='glass-panel-strong rounded-[28px] px-6 py-10 text-center'>
          <p className='font-display text-2xl text-[#1b2235]'>No creations yet</p>
          <p className='mx-auto mt-3 max-w-md text-sm leading-6 text-[#6c7684]'>
            Upload your first image or generate one from the Create page, keep it private, or share it with the community when you like.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'>
          {posts.map((post) => (
            <Card
              key={post._id}
              {...post}
              badges={[
                post.isCommunity ? 'Public' : 'Private',
                post.sourceType === 'upload' ? 'User Uploaded' : 'AI Generated',
              ]}
              actionLabel={post.isCommunity ? 'Unshare' : 'Share'}
              actionDisabled={updatingPostId === post._id}
              actionBusyLabel='Updating...'
              onAction={() => toggleCommunityState(post)}
              tertiaryActionLabel='Delete'
              tertiaryActionDisabled={deletingPostId === post._id}
              tertiaryActionBusyLabel='Deleting...'
              tertiaryActionTone='danger'
              onTertiaryAction={() => deletePost(post._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MyCreations;
