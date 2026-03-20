import React, { useEffect, useState } from 'react';

import { Card, FormField, Loader } from '../components';
import { API_URL } from '../config';

const RenderCards = ({ data, title }) => {
  if (data?.length > 0) {
    return data.map((post) => <Card key={post._id} {...post} />);
  } else {
    return (
      <div className='glass-panel-strong rounded-[28px] px-6 py-10 text-center'>
        <p className='font-display text-2xl text-[#1b2235]'>{title}</p>
        <p className='mx-auto mt-3 max-w-md text-sm leading-6 text-[#6c7684]'>
          Start crafting a fresh prompt and share something unexpected with the gallery.
        </p>
      </div>
    );
  }
};

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedResults, setSearchedResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}/api/v1/post`, {
          method: 'GET',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load posts');
        }
        setAllPosts(data.data || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const normalizedSearch = searchText.trim().toLowerCase();

      if (!normalizedSearch) {
        setSearchedResults([]);
        return;
      }

      setSearchedResults(
        allPosts.filter((post) =>
          (post.ownerName || post.name).toLowerCase().includes(normalizedSearch) ||
          post.prompt.toLowerCase().includes(normalizedSearch)
        )
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [allPosts, searchText]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const stats = [
    { label: 'Creations shared', value: allPosts.length },
    { label: 'Search results', value: searchText ? searchedResults.length : allPosts.length },
    { label: 'AI modes', value: 3 },
  ];

  return (
    <section className='space-y-8 pb-4'>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]'>
        <div className='glass-panel-strong rounded-[34px] px-6 py-8 sm:px-8 sm:py-10'>
          <div className='chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]'>
            Curated AI Gallery
          </div>
          <h1 className='font-display gradient-text mt-5 max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl'>
            Popular creations with a warmer, editorial feel.
          </h1>
          <p className='mt-5 max-w-2xl text-sm leading-7 text-[#5f6776] sm:text-base'>
            Explore community-made scenes, dreamy concepts, and experimental prompts from a gallery that feels more like a design wall than a dashboard.
          </p>

          <div className='mt-8 grid gap-3 sm:grid-cols-3'>
            {stats.map((item) => (
              <div key={item.label} className='stat-tile rounded-[24px] px-4 py-4'>
                <p className='text-[11px] uppercase tracking-[0.24em] text-[#7a6c5d]'>{item.label}</p>
                <p className='mt-3 font-display text-3xl text-[#1b2235]'>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='glass-panel rounded-[34px] px-6 py-8 sm:px-7'>
          <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-[#7a6c5d]'>Find a mood</p>
          <h2 className='font-display mt-4 text-3xl text-[#1b2235]'>Search by creator or prompt</h2>
          <p className='mt-3 text-sm leading-7 text-[#616b79]'>
            Narrow the board instantly and uncover the exact image style, aesthetic, or artist mood you want to revisit.
          </p>

          <div className='mt-6'>
            <FormField 
              labelName="Search Posts"
              type="text"
              name="text"
              placeholder="Try: neon city, cat astronaut, cinematic portrait..."
              value={searchText}
              handleChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {error && (
          <p className="rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="glass-panel-strong flex min-h-[260px] items-center justify-center rounded-[30px]">
            <Loader />
          </div>
        ) : (
          <>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <p className='text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a6c5d]'>Gallery Wall</p>
                <h2 className='font-display mt-2 text-3xl text-[#1b2235]'>
                  {searchText ? 'Filtered results' : 'Latest shared frames'}
                </h2>
              </div>

              {searchText && (
                <p className="chip w-fit rounded-full px-4 py-2 text-sm font-medium">
                  Showing results for <span className='font-semibold text-[#1b2235]'>{searchText}</span>
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'>
              {searchText ? (
                <RenderCards data={searchedResults} title='No search results found' />
              ) : (
                <RenderCards data={allPosts} title='No posts found' />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;
