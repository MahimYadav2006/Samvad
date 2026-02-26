import User01 from "../../images/user/user-01.png";
import { CameraIcon } from "@phosphor-icons/react";
import SelectInput from "../../components/Form/SelectInput";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector, useDispatch } from "react-redux";
import { updateUserDetails, updateAvatar } from "../../redux/slices/user";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      jobTitle: "",
      bio: "",
      country: "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      jobTitle: user?.jobTitle || "",
      bio: user?.bio || "",
      country: user?.country || "",
    });
  }, [user, reset]);

  useEffect(() => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("avatar", selectedImage);
      dispatch(updateAvatar(formData));
    }
  }, [selectedImage, dispatch]);

  const onSubmit = async (data) => {
    await dispatch(updateUserDetails(data));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-6 rounded-2xl border border-stroke/70 bg-white/70 p-4 sm:flex-row sm:items-center dark:border-strokedark dark:bg-boxdark-2/60">
        <div className="relative">
          <img
            src={user.avatar || User01}
            alt="User avatar"
            className="h-28 w-28 rounded-3xl border border-stroke object-cover shadow-md dark:border-strokedark"
          />
          <label
            htmlFor="profile"
            className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            <CameraIcon size={18} />
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

        <div>
          <h2 className="font-display text-xl font-bold text-black dark:text-white">
            {user?.name || "Your Profile"}
          </h2>
          <p className="mt-1 text-sm text-body dark:text-bodydark">
            Upload a clear profile picture and keep your details updated.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-stroke/70 bg-white/75 p-4 shadow-sm dark:border-strokedark dark:bg-boxdark-2/70 sm:p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register("name")}
              className={`w-full rounded-xl border bg-transparent px-4 py-3 text-black dark:text-white ${
                errors.name
                  ? "border-red focus:border-red"
                  : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-semibold text-red">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
              Job Title
            </label>
            <input
              type="text"
              placeholder="Enter your job title"
              {...register("jobTitle")}
              className={`w-full rounded-xl border bg-transparent px-4 py-3 text-black dark:text-white ${
                errors.jobTitle
                  ? "border-red focus:border-red"
                  : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
              }`}
            />
            {errors.jobTitle && (
              <p className="mt-1.5 text-xs font-semibold text-red">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
              Bio
            </label>
            <textarea
              placeholder="Tell people something about you"
              rows={4}
              {...register("bio")}
              className={`w-full rounded-xl border bg-transparent px-4 py-3 text-black dark:text-white ${
                errors.bio
                  ? "border-red focus:border-red"
                  : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
              }`}
            />
            {errors.bio && (
              <p className="mt-1.5 text-xs font-semibold text-red">
                {errors.bio.message}
              </p>
            )}
          </div>

          <SelectInput register={register} errors={errors} />

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading || isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
