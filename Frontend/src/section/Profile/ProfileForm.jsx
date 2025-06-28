import React from "react";
import User01 from "../../images/user/user-01.png";
import { CameraIcon } from "@phosphor-icons/react";
import SelectInput from "../../components/Form/SelectInput";

import * as yup from "yup";
import { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateUserDetails } from "../../redux/slices/user";
import { updateAvatar } from "../../redux/slices/user";



const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  jobTitle: yup.string().required("Job Title is required"),
  bio: yup.string().required("Bio is required"),
  country: yup.string().required("Country name is required"),
});

export default function ProfileForm() {
const [selectedImage, setSelectedImage] = useState(null);
const dispatch = useDispatch();
const { isLoading, user } = useSelector((state) => state.user);

useEffect(() => {
  if (selectedImage) {
    const formData = new FormData();
    formData.append("avatar", selectedImage);
    dispatch(updateAvatar(formData));
  }
}, [selectedImage, dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data) => {
    console.log("Form submitted with:", data); // This should always show
    await dispatch(updateUserDetails(data));
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-8">
      {/* Image Picker */}
      <div className="relative z-30 w-full rounded-full p-1 backdrop-blur sm:max-w-36 sm:p-3">
        <div className="relative drop-shadow-2">
          <img
            src={user.avatar || User01}
            alt="User avatar"
            className="rounded-full object-cover w-32 h-32"
          />

          <label
            htmlFor="profile"
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2 p-2"
          >
            <CameraIcon size={20}></CameraIcon>
            <input
              type="file"
              className="sr-only"
              name="profile"
              id="profile"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedImage(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Rest of the profile form */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:max-w-150">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5.5 p-6.5">
            {/* Name */}
            <div>
              <label
                htmlFor=""
                className="mb-3 text-black block dark:text-white"
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                {...register("name")}
                className={`w-full rounded-lg border-[1.5px]  bg-transparent py-3 px-5 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter  dark:bg-form-input dark:text-white   ${
                  errors.name
                    ? "border-red-500 focus:border-red"
                    : "border-stroke dark:border-form-strokedark focus:border-primary dark:focus:border-primary"
                } `}
              />
            </div>

            {/* Job Title */}
            <div>
              <label
                htmlFor=""
                className="mb-3 text-black block dark:text-white"
              >
                Job Title
              </label>
              <input
                type="text"
                placeholder="Enter your job title"
                {...register("jobTitle")}
                className={`w-full rounded-lg border-[1.5px]  bg-transparent py-3 px-5 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter  dark:bg-form-input dark:text-white   ${
                  errors.jobTitle
                    ? "border-red-500 focus:border-red"
                    : "border-stroke dark:border-form-strokedark focus:border-primary dark:focus:border-primary"
                } `}
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor=""
                className="mb-3 text-black block dark:text-white"
              >
                Bio
              </label>
              <textarea
                name=""
                id=""
                placeholder="Enter your bio"
                {...register("bio")}
                className={`w-full rounded-lg border-[1.5px]  bg-transparent py-3 px-5 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter  dark:bg-form-input dark:text-white   ${
                  errors.bio
                    ? "border-red-500 focus:border-red"
                    : "border-stroke dark:border-form-strokedark focus:border-primary dark:focus:border-primary"
                } `}
              ></textarea>
            </div>

            {/* Country */}
            <div>
              <SelectInput register={register} errors={errors}></SelectInput>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full rounded-lg bg-primary cursor-pointer border border-primary py-3 px-6  text-center text-white transition hover:bg-opacity-90"
            >
              {isLoading || isSubmitting ? "Submitting your data" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
