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
      <div className="rounded-xl border border-stroke/40 bg-white/50 p-4 dark:border-strokedark/30 dark:bg-boxdark-2/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary dark:bg-primary/12">
            <LockKeyIcon size={18} weight="fill" />
          </div>
          <div>
            <h2 className="text-base font-bold text-black dark:text-white">
              Password Security
            </h2>
            <p className="text-sm text-body/60 dark:text-bodydark/50">
              Update your password regularly.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stroke/40 bg-white/50 p-4 dark:border-strokedark/30 dark:bg-boxdark-2/40 sm:p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-body/70 dark:text-bodydark/60">
              Current Password
            </label>
            <input
              {...register("currentPassword")}
              type="password"
              placeholder="Enter your current password"
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-black outline-none transition-colors dark:text-white ${
                errors.currentPassword
                  ? "border-danger focus:border-danger"
                  : "border-stroke/70 focus:border-primary/50 dark:border-strokedark/60 dark:focus:border-primary/50"
              }`}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-danger">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-body/70 dark:text-bodydark/60">
              New Password
            </label>
            <input
              {...register("newPassword")}
              type="password"
              placeholder="Enter your new password"
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-black outline-none transition-colors dark:text-white ${
                errors.newPassword
                  ? "border-danger focus:border-danger"
                  : "border-stroke/70 focus:border-primary/50 dark:border-strokedark/60 dark:focus:border-primary/50"
              }`}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-danger">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting || isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
