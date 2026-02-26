import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector, useDispatch } from "react-redux";
import { LockKeyIcon } from "@phosphor-icons/react";
import { updatePassword } from "../../redux/slices/user";

const schema = yup.object().shape({
  currentPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password is required"),
});

export default function UpdatePasswordForm() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);

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
    await dispatch(updatePassword(data));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stroke/70 bg-white/70 p-4 dark:border-strokedark dark:bg-boxdark-2/60">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LockKeyIcon size={21} weight="fill" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-black dark:text-white">
              Password Security
            </h2>
            <p className="text-sm text-body dark:text-bodydark">
              Update your password regularly to keep your account secure.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stroke/70 bg-white/75 p-4 shadow-sm dark:border-strokedark dark:bg-boxdark-2/70 sm:p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
              Current Password
            </label>
            <input
              {...register("currentPassword")}
              type="password"
              placeholder="Enter your current password"
              className={`w-full rounded-xl border bg-transparent px-4 py-3 text-black dark:text-white ${
                errors.currentPassword
                  ? "border-red focus:border-red"
                  : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
              }`}
            />
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs font-semibold text-red">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
              New Password
            </label>
            <input
              {...register("newPassword")}
              type="password"
              placeholder="Enter your new password"
              className={`w-full rounded-xl border bg-transparent px-4 py-3 text-black dark:text-white ${
                errors.newPassword
                  ? "border-red focus:border-red"
                  : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
              }`}
            />
            {errors.newPassword && (
              <p className="mt-1.5 text-xs font-semibold text-red">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
