import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';

const CreatePainting = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: '',
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if(form.prompt) {
      try {
        setGeneratingImg(true);
        // const response = await fetch('https://ai-painter-backend.onrender.com/api/v1/dalle', {
        const response = await fetch('http://localhost:8080/api/v1/dalle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: form.prompt }),
        });
        const data = await response.json();
        // setForm({...form, photo: `data:image/jpeg;base64,${data.photo}` });
        setForm({...form, photo: `${data.photo}` });

      } catch (error) {
        alert(error);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert('Please enter a prompt');
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(form.prompt && form.photo) {
      setLoading(true);

      try {
        // const response = await fetch('https://ai-painter-backend.onrender.com/api/v1/post', {
        const response = await fetch('http://localhost:8080/api/v1/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form),
        });

        await response.json();
        navigate('/');

      } catch (error) {
        alert(error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter a prompt and generate an image');
    }
  }

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }

  const handleSurpriseMe = () => {
    const randomPropmt = getRandomPrompt(form.prompt);
    setForm({...form, prompt: randomPropmt})
  }

  return (
    <section className='max-w-7xl mx-auto'>
      <div>
        <h1 className='font-extrabold text-[#222328] text-[32px]'>
          Create Something Amazing !
        </h1>
        <p className='mt-2 text[#66e75] text-[14px] max-w[500px]'>
          Create your own unique piece of art, push the limits of your imagination !!
        </p>
      </div>

      <form className='mt-16 max-w-3xl' onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField 
            labelName="Your name"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            handleChange={handleChange}
          />

          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="Enter your prompt"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe={true}
            handleSurpriseMe={handleSurpriseMe}
          />

          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
          focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items center">
            {form.photo ? (
              <img 
                src={form.photo}
                alt={form.prompt}
                className='w-full h-full object-contain'
              />
            ) : (
              <img 
                src={preview}
                className='w-9/12 h-9/12 object-contain opacity-80'
              />
            )}

            {generatingImg && (
              <div className='absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg'>
                <Loader />
              </div>  
            )}

          </div>
        </div>

        <div className="flex gap-5 mt-5">
          <button
            type='button'
            onClick={generateImage}
            className='text-white bg-green-600 py-3 px-5 rounded-[5px] text-sm font-semibold hover:bg-green-800 hover:shadow-lg'
          >
             {generatingImg ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        <div className="mt-10">
          <p className='mt-2 text-[#666e75] text-[14px]'>🎉 You might want to share your creation with the community 👇</p>
          <button
            type='submit'
            className='mt-5 text-white bg-blue-400 py-3 px-5 rounded-[5px] text-sm font-semibold hover:bg-blue-600 hover:shadow-lg'
          >
            {loading ? 'Posting...' : 'Share with Community'}
          </button>
        </div>

      </form>
    </section>
  )
}

export default CreatePainting
