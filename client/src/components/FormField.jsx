import React from 'react';

const FormField = ({ labelName, type, name, placeholder, value, handleChange, isSurpriseMe, handleSurpriseMe }) => {
  return (
    <div className='space-y-3'>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={name}
          className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#586578]"
        >
          {labelName}
        </label>

        {isSurpriseMe && (
          <button
            type='button'
            onClick={handleSurpriseMe}
            className='btn-ghost rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]'
          >
            Surprise me
          </button>
        )}
      </div>

      <div className='field-surface rounded-[22px] px-4 py-1.5 transition duration-200'>
        <input 
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required
          className="block w-full bg-transparent px-0 py-3 text-[15px] text-[#1b2235] outline-none placeholder:text-[#8c8a86]"
        />
      </div>
    </div>
  );
};

export default FormField;
