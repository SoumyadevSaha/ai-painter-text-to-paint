import React from 'react';
import { download } from '../assets';
import { downloadImage } from '../utils';

const Card = ({
  _id,
  name,
  ownerName,
  prompt,
  photo,
  badgeText = 'Community Pick',
  actionLabel,
  actionDisabled = false,
  onAction,
}) => {
  const displayName = ownerName || name || 'Artist';

  return (
    <article className='card-shell card group relative overflow-hidden rounded-[28px] p-3 transition duration-300 hover:-translate-y-1'>
      <div className='card-media overflow-hidden rounded-[22px]'>
        <img
          src={photo}
          alt={prompt}
          className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]'
        />
      </div>

      <div className="card-overlay absolute inset-3 flex flex-col justify-end rounded-[22px] p-5 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100">
        <div className='mb-4 inline-flex w-fit rounded-full bg-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm'>
          {badgeText}
        </div>

        <p className='prompt max-h-24 overflow-y-auto text-sm leading-6 text-white/92'>
          {prompt}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#ffb347] text-sm font-bold uppercase text-[#1b2235]'>
              {displayName[0]}
            </div>
            <div>
              <p className='text-[11px] uppercase tracking-[0.2em] text-white/60'>Creator</p>
              <p className='text-sm font-medium text-white'>{displayName}</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {onAction && (
              <button
                type='button'
                onClick={onAction}
                disabled={actionDisabled}
                className='rounded-full bg-white/16 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/24 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {actionDisabled ? 'Updating...' : actionLabel}
              </button>
            )}

            <button
              type='button'
              onClick={() => downloadImage(_id, photo)}
              className='flex h-11 w-11 items-center justify-center rounded-full bg-white/16 backdrop-blur-sm transition hover:bg-white/24'
              aria-label={`Download ${prompt}`}
            >
              <img src={download} alt="download" className='h-5 w-5 object-contain invert' />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Card;
