import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { FormField } from '../components';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const redirectPath = location.state?.from?.pathname || '/my-creations';

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(form);
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }

      navigate(redirectPath, { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='grid gap-6 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]'>
      <div className='glass-panel-strong rounded-[34px] px-6 py-8 sm:px-8'>
        <div className='chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]'>
          Creator Access
        </div>
        <h1 className='font-display gradient-text mt-5 pb-1 text-4xl leading-[1.08] sm:text-5xl'>
          Sign in to save your work, keep drafts private, and publish when you are ready.
        </h1>
        <p className='mt-5 max-w-2xl text-sm leading-7 text-[#5f6776] sm:text-base'>
          Every creation is tied to your account. You can keep pieces private in your studio, then push selected posts to the public gallery later.
        </p>

        <div className='mt-8 grid gap-3 sm:grid-cols-3'>
          <div className='stat-tile rounded-[24px] px-4 py-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#7a6c5d]'>Private drafts</p>
            <p className='mt-2 text-sm text-[#5d6675]'>Create first, publish later.</p>
          </div>
          <div className='stat-tile rounded-[24px] px-4 py-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#7a6c5d]'>JWT sessions</p>
            <p className='mt-2 text-sm text-[#5d6675]'>Protected requests with signed tokens.</p>
          </div>
          <div className='stat-tile rounded-[24px] px-4 py-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-[#7a6c5d]'>Ownership</p>
            <p className='mt-2 text-sm text-[#5d6675]'>Only you can manage your own posts.</p>
          </div>
        </div>
      </div>

      <form className='glass-panel rounded-[34px] px-6 py-8 sm:px-7' onSubmit={handleSubmit}>
        <div className='flex gap-3 rounded-full bg-white/55 p-1'>
          {['login', 'register'].map((type) => (
            <button
              key={type}
              type='button'
              onClick={() => setMode(type)}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition ${
                mode === type ? 'bg-[#1b2235] text-white' : 'text-[#425164]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {error && (
          <p className='mt-6 rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
            {error}
          </p>
        )}

        <div className='mt-8 space-y-6'>
          {mode === 'register' && (
            <FormField
              labelName='Display name'
              type='text'
              name='name'
              placeholder='Soumyadev'
              value={form.name}
              handleChange={handleChange}
            />
          )}

          <FormField
            labelName='Email'
            type='email'
            name='email'
            placeholder='youremail@gmail.com'
            value={form.email}
            handleChange={handleChange}
          />

          <FormField
            labelName='Password'
            type='password'
            name='password'
            placeholder='Enter your password'
            value={form.password}
            handleChange={handleChange}
          />
        </div>

        <button type='submit' className='btn-primary mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold'>
          {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};

export default Auth;
