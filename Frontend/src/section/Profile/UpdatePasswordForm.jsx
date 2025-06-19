import React from 'react'

export default function UpdatePasswordForm() {
  return (
    <div className='flex flex-col w-full p-4 space-y-8'>

        {/* Rest of the profile form */}
        <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:max-w-150'>
            <form action="">
                <div className='flex flex-col gap-5.5 p-6.5'>
                    {/* Current Pass */}
                    <div>
                        <label htmlFor="" className='mb-3 text-black block dark:text-white'>Current Password</label>
                        <input type="text" required placeholder='Enter your Password' className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary' />
                    </div>
                    {/* New Pass */}
                    <div>
                        <label htmlFor="" className='mb-3 text-black block dark:text-white'>New Password</label>
                        <input type="text" required placeholder='Choose your Password' className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary' />
                    </div>
                    {/* Submit Button */}
                    <button type='submit' className='w-full rounded-lg bg-primary cursor-pointer border border-primary py-3 px-6  text-center text-white transition hover:bg-opacity-90'>Submit</button>
                </div>
            </form>
        </div>
    </div>
  )
}
