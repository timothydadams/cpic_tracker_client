//import tw, { css, theme } from 'twin.macro';
import React, { useEffect, useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { CameraIcon } from '@heroicons/react/24/solid';

export const CameraInput = ({ imageSrc = '', setImageSource }) => {
  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);
        setImageSource(newUrl);
      }
    }
  };

  return (
    <div className='sm:col-span-6'>
      <label
        htmlFor='photo'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        Profile Picture
      </label>
      <div className='mt-2 flex items-center'>
        {/* <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100"> */}
        {imageSrc == '' ? (
          <UserCircleIcon className='rounded-full border-dashed border-2 border-dark-blue w-24 h-24' />
        ) : (
          <div className='overflow-hidden rounded-full w-24 h-24 border-dark-blue border-2'>
            <img src={imageSrc} />
          </div>
        )}

        <label htmlFor='icon-button-file' className='p-4'>
          <div>
            <CameraIcon className='w-10 h-10 cursor-pointer' />
          </div>
        </label>
        <input
          accept='image/*'
          id='icon-button-file'
          type='file'
          capture='environment'
          onChange={(e) => handleCapture(e.target)}
          className='hidden'
        />
      </div>
    </div>
  );
};
