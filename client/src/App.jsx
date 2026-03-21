import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

import { logo } from './assets';
import { ProtectedRoute } from './components';
import { useAuth } from './context/AuthContext';
import { Auth, CreatePainting, Home, MyCreations, Profile } from './pages';

const AppLayout = () => {
  const footerYear = 2026;
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const navigationLinks = [
    { label: 'Gallery', to: '/' },
    ...(isAuthenticated
      ? [
          { label: 'My Creations', to: '/my-creations' },
          { label: 'Create', to: '/create-new' },
        ]
      : [{ label: 'Sign In', to: '/auth' }]),
  ];
  const initials = user?.name?.trim()?.[0]?.toUpperCase() || 'V';

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedMobileMenu = mobileMenuRef.current?.contains(event.target);
      const clickedDesktopMenu = desktopMenuRef.current?.contains(event.target);

      if (!clickedMobileMenu && !clickedDesktopMenu) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='app-shell flex min-h-screen flex-col'>
      <header className='relative z-[80] px-4 py-4 sm:px-6 lg:px-8'>
        <div className='glass-panel mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] px-5 py-4 sm:px-7 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6'>
          <div className='flex items-start justify-between gap-3 lg:contents'>
            <NavLink to='/' className='flex items-center gap-3 self-start sm:gap-4'>
              <img
                src={logo}
                alt='VinciForge logo'
                className='h-16 w-auto object-contain drop-shadow-[0_16px_26px_rgba(27,34,53,0.12)] sm:h-20 lg:h-24'
              />
            </NavLink>

            {isAuthenticated && (
              <div ref={mobileMenuRef} className='relative ml-3 lg:hidden'>
                <button
                  type='button'
                  onClick={() => setMenuOpen((current) => !current)}
                  className='profile-avatar'
                  aria-label='Open account menu'
                  aria-expanded={menuOpen}
                >
                  <span>{initials}</span>
                </button>

                {menuOpen && (
                  <div className='glass-panel profile-menu absolute right-0 top-[calc(100%+0.8rem)] z-[120] min-w-[220px] rounded-[24px] p-2'>
                    <div className='rounded-[18px] bg-white/55 px-4 py-3'>
                      <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a6c5d]'>Signed in as</p>
                      <p className='mt-2 text-sm font-semibold text-[#1b2235]'>{user?.name}</p>
                      <p className='mt-1 text-xs text-[#5f6776]'>{user?.email}</p>
                    </div>

                    <div className='mt-2 grid gap-2'>
                      <NavLink
                        to='/profile'
                        onClick={() => setMenuOpen(false)}
                        className='profile-menu-item'
                      >
                        Your Profile
                      </NavLink>
                      <button
                        type='button'
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className='profile-menu-item text-left'
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='hidden lg:flex items-center justify-center px-4'>
            <p className='font-display text-[1.35rem] leading-none text-center text-[#7a6c5d]'>
              💡 Imagination, framed beautifully ✨
            </p>
          </div>

          <nav className={`flex w-full flex-wrap items-center gap-2 pt-1 sm:gap-3 lg:w-auto lg:justify-end lg:pt-0 ${
            isAuthenticated ? 'justify-start' : 'justify-between sm:justify-start'
          }`}>
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
              <div ref={desktopMenuRef} className='relative ml-auto hidden lg:block'>
                <button
                  type='button'
                  onClick={() => setMenuOpen((current) => !current)}
                  className='profile-avatar'
                  aria-label='Open account menu'
                  aria-expanded={menuOpen}
                >
                  <span>{initials}</span>
                </button>

                {menuOpen && (
                  <div className='glass-panel profile-menu absolute right-0 top-[calc(100%+0.8rem)] z-[120] min-w-[220px] rounded-[24px] p-2'>
                    <div className='rounded-[18px] bg-white/55 px-4 py-3'>
                      <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a6c5d]'>Signed in as</p>
                      <p className='mt-2 text-sm font-semibold text-[#1b2235]'>{user?.name}</p>
                      <p className='mt-1 text-xs text-[#5f6776]'>{user?.email}</p>
                    </div>

                    <div className='mt-2 grid gap-2'>
                      <NavLink
                        to='/profile'
                        onClick={() => setMenuOpen(false)}
                        className='profile-menu-item'
                      >
                        Your Profile
                      </NavLink>
                      <button
                        type='button'
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className='profile-menu-item text-left'
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            <Route
              path='/profile'
              element={(
                <ProtectedRoute>
                  <Profile />
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
