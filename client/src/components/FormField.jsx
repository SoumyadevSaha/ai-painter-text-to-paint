import React from 'react';

const FormField = ({
  labelName,
  type,
  name,
  placeholder,
  value,
  handleChange,
  isSurpriseMe,
  handleSurpriseMe,
  multiline = false,
  rows = 4,
  required = false,
  helperText = '',
}) => {
  const InputTag = multiline ? 'textarea' : 'input';

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
        <InputTag
          type={multiline ? undefined : type}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          rows={multiline ? rows : undefined}
          className={`block w-full bg-transparent px-0 py-3 text-[15px] text-[#1b2235] outline-none placeholder:text-[#8c8a86] ${
            multiline ? 'min-h-[120px] resize-none leading-7' : ''
          }`}
        />
      </div>

      {helperText && (
        <p className='text-sm leading-6 text-[#6b7280]'>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FormField;
