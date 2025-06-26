import React from 'react';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {updatePassword} from "../../redux/slices/user";

const schema = yup.object().shape({
  currentPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  newPassword: yup
    .string()
    .min(6,"Password must be at least 6 characters long")
    .required("Password is required"),
});


export default function UpdatePasswordForm() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors , isSubmitting},
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

const onSubmit = async (data) => {
  console.log("Form submitted with:", data); // This should always show
  await dispatch(updatePassword(data));
};


  return (
    <div className='flex flex-col w-full p-4 space-y-8'>
      <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:max-w-150'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-5.5 p-6.5'>
            {/* Current Password */}
            <div>
              <label className='mb-3 text-black block dark:text-white'>
                Current Password
              </label>
              <input
                {...register('currentPassword')}
                type='password'
                placeholder='Enter your current password'
                className={`w-full rounded-lg border-[1.5px] bg-transparent py-3 px-5 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white ${
                      errors.currentPassword
                        ? "border-red-500 focus:border-red"
                        : "border-stroke dark:border-form-strokedark focus:border-primary dark:focus:border-primary"
                    }`}
              />
            {errors.currentPassword && (
              <p className='text-red-500 text-sm'>{errors.currentPassword.message}</p>
            )}
            </div>

            {/* New Password */}
            <div>
              <label className='mb-3 text-black block dark:text-white'>
                New Password
              </label>
              <input
                {...register('newPassword')}
                type='password'
                placeholder='Enter your new password'
                className={`w-full rounded-lg border-[1.5px] bg-transparent py-3 px-5 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white ${
                      errors.newPassword
                        ? "border-red-500 focus:border-red"
                        : "border-stroke dark:border-form-strokedark focus:border-primary dark:focus:border-primary"
                    }`}
              />
              {errors.newPassword && (
                <p className='text-red-500 text-sm'>{errors.newPassword.message}</p>
              )}
            </div>

            <button
              type='submit'
              disabled={isSubmitting || isLoading}
              className='w-full rounded-lg bg-primary cursor-pointer border border-primary py-3 px-6  text-center text-white transition hover:bg-opacity-90'
            >
              {isSubmitting || isLoading ? 'Submitting your data' : "Submit"}
              {/* Submit */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
