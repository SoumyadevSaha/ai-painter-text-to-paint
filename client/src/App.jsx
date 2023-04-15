import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

import { logo } from './assets';
import { CreatePainting, Home } from './pages';

const App = () => {
  const currYear = new Date().getFullYear();

  return (
    <BrowserRouter>
      <header className='w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]'>
        <Link to='/'>
          <img src={logo} alt='logo' className='w-36 object-contain' />
        </Link>

        <Link to='/create-new' className='font-inter font-medium bg-[#01b86f] text-white px-4 py-2 rounded-md hover:bg-[#0f9b63]'>
          Create 🎨
        </Link>
      </header>

      <main className='sm:p-8 px-4 py-4 w-full bg-[#eff2ff] min-h-[calc(100vh - 73px)]'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/create-new' element={<CreatePainting />} />
        </Routes>
      </main>

      <footer className='w-full flex justify-center items-center bg-white sm:px-8 px-4 py-4 border-t border-b-[#e6ebf4]'>
        <p className='text-[#222328] text-[14px] font-inter font-medium hover:scale-105 hover:duration-300'>
          Made with <span className='text-red-600'>❤️</span> by <a href='https://soumyadev-portfolio-1.netlify.app/' target='_blank' rel='noreferrer' className='text-[#00b3ff]'>Soumyadev's Creations &copy; {currYear}</a>
        </p>
      </footer>
    </BrowserRouter>
  )
}

export default App
