import React, { useState } from 'react'
import { CaretDownIcon, GlobeIcon } from '@phosphor-icons/react'

export default function SelectInput() {
    const [selectedOption,setSelectedOption] = useState('');
    const [isOptionSelected,setIsOptionSelected] = useState(false);

    const changeTextColor = () => {
        setIsOptionSelected(true);
    }
  return (
    <div>
      <label htmlFor="" className='mb-3 block text-black dark:text-white'>Select Country</label>
      <div className='relative z-20 bg-white dark:bg-form-input'>

        <span className='absolute top-1/2 left-4 -translate-y-1/2'>
            <GlobeIcon size={20}></GlobeIcon>
        </span>

        <select value={selectedOption} onChange={(e)=>{
            setSelectedOption(e.target.value);
            changeTextColor();
        }} className={ `relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? "text-black dark:text-white" : ""} `}>
            <option disabled className='text-body dark:text-bodydark' value="">Select Country</option>
            <option className='text-body dark:text-bodydark' value="India">India</option>
            <option className='text-body dark:text-bodydark' value="USA">USA</option>
            <option className='text-body dark:text-bodydark' value="UK">UK</option>
        </select>

        <span className='absolute top-1/2 right-4 z-10 -translate-y-1/2'>
            <CaretDownIcon size={20}></CaretDownIcon>
        </span>
      </div>
    </div>
  )
}
