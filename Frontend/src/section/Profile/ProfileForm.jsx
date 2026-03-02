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
    <div className="space-y-5">
      <div className="flex flex-col items-start gap-5 rounded-xl border border-stroke/40 bg-white/50 p-4 sm:flex-row sm:items-center dark:border-strokedark/30 dark:bg-boxdark-2/40">
        <div className="relative">
          <img
            src={user.avatar || User01}
            alt="User avatar"
            className="h-24 w-24 rounded-2xl object-cover shadow-md"
          />
          <label
            htmlFor="profile"
            className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary/90"
          >
            <CameraIcon size={15} />
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
          <h2 className="text-base font-bold text-black dark:text-white">
            {user?.name || "Your Profile"}
          </h2>
          <p className="mt-0.5 text-sm text-body/60 dark:text-bodydark/50">
            Upload a photo and update your details.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-stroke/40 bg-white/50 p-4 dark:border-strokedark/30 dark:bg-boxdark-2/40 sm:p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-body/70 dark:text-bodydark/60">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register("name")}
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-black outline-none transition-colors dark:text-white ${
                errors.name
                  ? "border-danger focus:border-danger"
                  : "border-stroke/70 focus:border-primary/50 dark:border-strokedark/60 dark:focus:border-primary/50"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-body/70 dark:text-bodydark/60">
              Job Title
            </label>
            <input
              type="text"
              placeholder="Enter your job title"
              {...register("jobTitle")}
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-black outline-none transition-colors dark:text-white ${
                errors.jobTitle
                  ? "border-danger focus:border-danger"
                  : "border-stroke/70 focus:border-primary/50 dark:border-strokedark/60 dark:focus:border-primary/50"
              }`}
            />
            {errors.jobTitle && (
              <p className="mt-1 text-xs text-danger">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-body/70 dark:text-bodydark/60">
              Bio
            </label>
            <textarea
              placeholder="Tell people something about you"
              rows={3}
              {...register("bio")}
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-black outline-none transition-colors dark:text-white ${
                errors.bio
                  ? "border-danger focus:border-danger"
                  : "border-stroke/70 focus:border-primary/50 dark:border-strokedark/60 dark:focus:border-primary/50"
              }`}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-danger">
                {errors.bio.message}
              </p>
            )}
          </div>

          <SelectInput register={register} errors={errors} />

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading || isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
