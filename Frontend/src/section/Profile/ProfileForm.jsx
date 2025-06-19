import React from 'react'
import User01 from '../../images/user/user-01.png'
import { CameraIcon } from '@phosphor-icons/react'
import SelectInput from '../../components/Form/SelectInput'


export default function ProfileForm() {
  return (
    <div className='flex flex-col w-full p-4 space-y-8'>
        {/* Image Picker */}
        <div className="relative z-30 w-full rounded-full p-1 backdrop-blur sm:max-w-36 sm:p-3">
            <div className='relative drop-shadow-2'>
                <img src={User01} alt="" className='rounded-full object-center object-cover' />
                <label htmlFor="profile" className='absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2 p-2'>
                    <CameraIcon size={20}></CameraIcon>
                    <input type="file" className='sr-only' name='profile' id='profile' />
                </label>
            </div>
        </div>

        {/* Rest of the profile form */}
        <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:max-w-150'>
            <form action="">
                <div className='flex flex-col gap-5.5 p-6.5'>
                    
                    {/* Name */}
                    <div>
                        <label htmlFor="" className='mb-3 text-black block dark:text-white'>Name</label>
                        <input type="text" placeholder='Enter your name' className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary' />
                    </div>

                    {/* Job Title */}
                    <div>
                        <label htmlFor="" className='mb-3 text-black block dark:text-white'>Job Title</label>
                        <input type="text" placeholder='Enter your job title' className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary' />
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="" className='mb-3 text-black block dark:text-white'>Bio</label>
                        <textarea name="" id="" placeholder='Enter your bio' className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary'></textarea>
                    </div>

                    {/* Country */}
                    <div>
                        <SelectInput></SelectInput>
                    </div>

                    {/* Submit Button */}
                    <button type='submit' className='w-full rounded-lg bg-primary cursor-pointer border border-primary py-3 px-6  text-center text-white transition hover:bg-opacity-90'>Submit</button>
                </div>
            </form>
        </div>
    </div>
  )
}
