import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { changePassword, deleteAccount, user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [dangerMessage, setDangerMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');
    setPasswordLoading(true);

    try {
      const data = await changePassword(passwordForm);
      setPasswordMessage(data.message || 'Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
      });
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setError('');
    setDangerMessage('');
    setDeleteLoading(true);

    try {
      await deleteAccount({ password: deletePassword });
      setDangerMessage('Account deleted successfully');
      navigate('/', { replace: true });
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className='grid gap-6 pb-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]'>
      <div className='glass-panel-strong rounded-[34px] px-6 py-8 sm:px-8'>
        <div className='chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]'>
          Your Profile
        </div>
        <h1 className='font-display gradient-text mt-5 pb-1 text-4xl leading-[1.08] sm:text-5xl'>
          Manage your account, password, and creator identity.
        </h1>
        <p className='mt-4 max-w-2xl text-sm leading-7 text-[#5f6776] sm:text-base'>
          Signed in as <span className='font-semibold text-[#1b2235]'>{user?.name}</span>. From here you can update your password or permanently delete your account and all related creations.
        </p>

        <div className='mt-8 grid gap-3 sm:grid-cols-3'>
          <div className='stat-tile rounded-[24px] px-4 py-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#7a6c5d]'>Identity</p>
            <p className='mt-2 text-sm text-[#5d6675]'>{user?.email}</p>
          </div>
          <div className='stat-tile rounded-[24px] px-4 py-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#7a6c5d]'>Password</p>
            <p className='mt-2 text-sm text-[#5d6675]'>Change it anytime.</p>
          </div>
          <div className='stat-tile rounded-[24px] px-4 py-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#7a6c5d]'>Deletion</p>
            <p className='mt-2 text-sm text-[#5d6675]'>Removes your posts everywhere.</p>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {error && (
          <p className='rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
            {error}
          </p>
        )}

        {passwordMessage && (
          <p className='rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700'>
            {passwordMessage}
          </p>
        )}

        {dangerMessage && (
          <p className='rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700'>
            {dangerMessage}
          </p>
        )}

        <form className='glass-panel rounded-[34px] px-6 py-8 sm:px-7' onSubmit={handlePasswordChange}>
          <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-[#7a6c5d]'>Password</p>
          <h2 className='font-display mt-4 pb-1 text-3xl leading-[1.08] text-[#1b2235]'>Change password</h2>

          <div className='mt-6 space-y-5'>
            <div className='field-surface rounded-[22px] px-4 py-1.5 transition duration-200'>
              <input
                type='password'
                placeholder='Current password'
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))}
                className='block w-full bg-transparent px-0 py-3 text-[15px] text-[#1b2235] outline-none placeholder:text-[#8c8a86]'
                required
              />
            </div>

            <div className='field-surface rounded-[22px] px-4 py-1.5 transition duration-200'>
              <input
                type='password'
                placeholder='New password'
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))}
                className='block w-full bg-transparent px-0 py-3 text-[15px] text-[#1b2235] outline-none placeholder:text-[#8c8a86]'
                required
              />
            </div>
          </div>

          <button type='submit' className='btn-primary mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold'>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <form className='glass-panel rounded-[34px] border border-red-200/60 px-6 py-8 sm:px-7' onSubmit={handleDeleteAccount}>
          <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-[#c05642]'>Danger Zone</p>
          <h2 className='font-display mt-4 pb-1 text-3xl leading-[1.08] text-[#1b2235]'>Delete account</h2>
          <p className='mt-4 text-sm leading-7 text-[#616b79]'>
            This removes your account, your private studio items, your community posts, and any removable hosted assets linked to those posts.
          </p>

          <div className='mt-6 field-surface rounded-[22px] px-4 py-1.5 transition duration-200'>
            <input
              type='password'
              placeholder='Confirm with your password'
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className='block w-full bg-transparent px-0 py-3 text-[15px] text-[#1b2235] outline-none placeholder:text-[#8c8a86]'
              required
            />
          </div>

          <button
            type='submit'
            className='mt-8 w-full rounded-full bg-[#c05642] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(192,86,66,0.22)] transition hover:-translate-y-[1px]'
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account Permanently'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Profile;
