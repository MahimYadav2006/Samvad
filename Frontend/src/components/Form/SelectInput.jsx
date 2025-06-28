import React, { useState } from 'react'
import { CaretDownIcon, GlobeIcon } from '@phosphor-icons/react'

export default function SelectInput({register,errors}) {
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

        <select
            // value={selectedOption}
            // onChange={(e) => {
            //     setSelectedOption(e.target.value);
            //     changeTextColor();
            // }}
            defaultValue={""}
            {...register("country")}
            className={ `relative z-20 w-full appearance-none rounded border bg-transparent px-12 py-3 outline-none transition dark:bg-form-input ${isOptionSelected ? "text-black dark:text-white" : ""}  ${errors.country ? "border-red-500 focus:border-red": "border-stroke dark:border-form-strokedark focus:border-primary dark:focus:border-primary"}`}
        >
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
