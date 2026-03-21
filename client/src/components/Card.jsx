import React, { useEffect, useState } from 'react';
import { download } from '../assets';
import { downloadImage } from '../utils';

const ThumbUpIcon = ({ active = false }) => (
  <svg
    viewBox='0 0 24 24'
    aria-hidden='true'
    className={`h-4.5 w-4.5 ${active ? 'scale-110' : ''}`}
    fill='none'
    stroke='currentColor'
    strokeWidth='1.9'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M7 22V10' />
    <path d='M14 10l1-5.2A2.1 2.1 0 0 0 12.9 2H12l-4 8v12h10.2a2 2 0 0 0 2-1.6l1.4-7.2A2 2 0 0 0 19.6 10H14z' />
  </svg>
);

const ThumbDownIcon = ({ active = false }) => (
  <svg
    viewBox='0 0 24 24'
    aria-hidden='true'
    className={`h-4.5 w-4.5 ${active ? 'scale-110' : ''}`}
    fill='none'
    stroke='currentColor'
    strokeWidth='1.9'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M17 2v12' />
    <path d='M10 14l-1 5.2A2.1 2.1 0 0 0 11.1 22H12l4-8V2H5.8a2 2 0 0 0-2 1.6L2.4 10.8A2 2 0 0 0 4.4 14H10z' />
  </svg>
);

const ReactionPill = ({ icon, count }) => (
  <span className='reaction-pill'>
    {icon}
    <span>{count}</span>
  </span>
);

const Card = ({
  _id,
  name,
  ownerName,
  prompt,
  photo,
  badgeText = 'Community Pick',
  likeCount = 0,
  dislikeCount = 0,
  viewerReaction = null,
  showReactionSummary = false,
  showReactionControls = false,
  reactionDisabled = false,
  onReact,
  actionLabel,
  actionDisabled = false,
  onAction,
  secondaryActionLabel,
  secondaryActionDisabled = false,
  secondaryActionTone = 'neutral',
  onSecondaryAction,
}) => {
  const displayName = ownerName || name || 'Artist';
  const [animatingReaction, setAnimatingReaction] = useState('');
  const hasPrimaryAction = Boolean(onAction);
  const hasSecondaryAction = Boolean(onSecondaryAction);

  useEffect(() => {
    if (!animatingReaction) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAnimatingReaction('');
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [animatingReaction, viewerReaction, likeCount, dislikeCount]);

  const handleReactionClick = (reaction) => {
    setAnimatingReaction(reaction);
    onReact?.(reaction);
  };

  return (
    <article className='card-shell card group relative overflow-hidden rounded-[28px] p-3 transition duration-300 hover:-translate-y-1'>
      <div className='card-media overflow-hidden rounded-[22px]'>
        <img
          src={photo}
          alt={prompt}
          className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]'
        />
      </div>

      <div className="card-overlay absolute inset-3 flex flex-col justify-between rounded-[22px] p-4 opacity-100 transition duration-300 sm:p-5 sm:opacity-0 sm:group-hover:opacity-100">
        <div className='space-y-3'>
          <div className='inline-flex w-fit rounded-full bg-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm'>
            {badgeText}
          </div>

          <p className='card-prompt prompt-clamp text-sm leading-6'>
            {prompt}
          </p>

          {showReactionSummary && !showReactionControls && (
            <div className='flex flex-wrap items-center gap-2'>
              <ReactionPill icon={<ThumbUpIcon />} count={likeCount} />
              <ReactionPill icon={<ThumbDownIcon />} count={dislikeCount} />
            </div>
          )}

          {showReactionControls && (
            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => handleReactionClick('like')}
                disabled={reactionDisabled}
                aria-label='Like this artwork'
                aria-pressed={viewerReaction === 'like'}
                className={`reaction-button ${animatingReaction === 'like' ? 'reaction-burst' : ''} ${
                  viewerReaction === 'like'
                    ? 'reaction-button-like-active'
                    : 'reaction-button-neutral'
                }`}
              >
                <ThumbUpIcon active={viewerReaction === 'like'} />
                <span className='reaction-count'>{likeCount}</span>
              </button>

              <button
                type='button'
                onClick={() => handleReactionClick('dislike')}
                disabled={reactionDisabled}
                aria-label='Dislike this artwork'
                aria-pressed={viewerReaction === 'dislike'}
                className={`reaction-button ${animatingReaction === 'dislike' ? 'reaction-burst' : ''} ${
                  viewerReaction === 'dislike'
                    ? 'reaction-button-dislike-active'
                    : 'reaction-button-neutral'
                }`}
              >
                <ThumbDownIcon active={viewerReaction === 'dislike'} />
                <span className='reaction-count'>{dislikeCount}</span>
              </button>
            </div>
          )}
        </div>

        {hasPrimaryAction ? (
          <div className='studio-card-footer mt-4'>
            <div className='studio-card-creator flex min-w-0 items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#ffb347] text-sm font-bold uppercase text-[#1b2235]'>
                {displayName[0]}
              </div>
              <div className='min-w-0'>
                <p className='text-[11px] uppercase tracking-[0.2em] text-white/60'>Creator</p>
                <p className='truncate text-sm font-medium text-white'>{displayName}</p>
              </div>
            </div>

            <div className='studio-card-download'>
              <button
                type='button'
                onClick={() => downloadImage(_id, photo)}
                className='studio-icon-button'
                aria-label={`Download ${prompt}`}
              >
                <img src={download} alt="download" className='h-5 w-5 object-contain invert' />
              </button>
            </div>

            <div className='studio-card-actions-right'>
              <button
                type='button'
                onClick={onAction}
                disabled={actionDisabled}
                className='studio-action-button studio-action-share'
              >
                {actionDisabled ? 'Updating...' : actionLabel}
              </button>

              {hasSecondaryAction && (
                <button
                  type='button'
                  onClick={onSecondaryAction}
                  disabled={secondaryActionDisabled}
                  className={`studio-action-button ${
                    secondaryActionTone === 'danger'
                      ? 'studio-action-delete'
                      : 'studio-action-neutral'
                  }`}
                >
                  {secondaryActionDisabled ? 'Deleting...' : secondaryActionLabel}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className='mt-4 flex items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#ffb347] text-sm font-bold uppercase text-[#1b2235]'>
                {displayName[0]}
              </div>
              <div className='min-w-0'>
                <p className='text-[11px] uppercase tracking-[0.2em] text-white/60'>Creator</p>
                <p className='truncate text-sm font-medium text-white'>{displayName}</p>
              </div>
            </div>

            <button
              type='button'
              onClick={() => downloadImage(_id, photo)}
              className='studio-icon-button'
              aria-label={`Download ${prompt}`}
            >
              <img src={download} alt="download" className='h-5 w-5 object-contain invert' />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default Card;
