import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

import { logo } from './assets';
import { ProtectedRoute } from './components';
import { useAuth } from './context/AuthContext';
import { Auth, CreatePainting, Home, MyCreations } from './pages';

const AppLayout = () => {
  const footerYear = 2026;
  const { isAuthenticated, logout, user } = useAuth();
  const navigationLinks = [
    { label: 'Gallery', to: '/' },
    ...(isAuthenticated
      ? [
          { label: 'My Creations', to: '/my-creations' },
          { label: 'Create', to: '/create-new' },
        ]
      : [{ label: 'Sign In', to: '/auth' }]),
  ];

  return (
    <div className='app-shell flex min-h-screen flex-col'>
      <header className='px-4 py-4 sm:px-6 lg:px-8'>
        <div className='glass-panel mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] px-5 py-4 sm:px-7 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6'>
          <NavLink to='/' className='flex items-center gap-3 sm:gap-4'>
            <img
              src={logo}
              alt='AI Painter logo'
              className='h-16 w-auto object-contain drop-shadow-[0_16px_26px_rgba(27,34,53,0.12)] sm:h-20 lg:h-24'
            />
          </NavLink>

          <div className='hidden lg:flex items-center justify-center px-4'>
            <p className='font-display text-[1.35rem] leading-none text-center text-[#7a6c5d]'>
              💡 Imagination, framed beautifully ✨
            </p>
          </div>

          <nav className='flex flex-wrap items-center gap-3 lg:justify-end'>
            {navigationLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'bg-[#1b2235] text-white shadow-[0_18px_35px_rgba(27,34,53,0.18)]'
                      : 'btn-ghost'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <div className='chip rounded-full px-4 py-2 text-sm font-medium'>
                  {user?.name}
                </div>
                <button
                  type='button'
                  onClick={logout}
                  className='btn-ghost rounded-full px-4 py-2 text-sm font-medium'
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className='flex-1 px-4 pb-8 pt-2 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auth' element={<Auth />} />
            <Route
              path='/create-new'
              element={(
                <ProtectedRoute>
                  <CreatePainting />
                </ProtectedRoute>
              )}
            />
            <Route
              path='/my-creations'
              element={(
                <ProtectedRoute>
                  <MyCreations />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </div>
      </main>

      <footer className='px-4 pb-6 pt-2 sm:px-6 lg:px-8'>
        <div className='glass-panel mx-auto flex max-w-7xl items-center justify-center rounded-[24px] px-5 py-4 text-center'>
          <p className='text-sm font-medium text-[#435062] sm:text-[15px]'>
            Made with <span className='text-red-600'>❤️</span> by{' '}
            <a
              href='https://soumyadev-portfolio-1.netlify.app/'
              target='_blank'
              rel='noreferrer'
              className='font-semibold text-[#157a78] hover:text-[#e66a4f]'
            >
              Soumyadev&apos;s Creations
            </a>{' '}
            &copy; {footerYear}
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
