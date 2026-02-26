import Logo from "../../components/Logo";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeSimpleIcon,
  LockIcon,
  RocketLaunchIcon,
  UsersThreeIcon,
  ClockCountdownIcon,
} from "@phosphor-icons/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GoogleAuthUser, RegisterUser } from "../../redux/slices/auth";
import { requestGoogleAccessToken } from "../../utils/googleAuth";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const benefits = [
  {
    icon: <UsersThreeIcon size={18} weight="fill" />,
    title: "Build closer circles",
  },
  {
    icon: <RocketLaunchIcon size={18} weight="fill" />,
    title: "Fast chat, voice, and media",
  },
  {
    icon: <ClockCountdownIcon size={18} weight="fill" />,
    title: "Continue anytime across devices",
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.auth.isLoading);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    dispatch(RegisterUser(data, navigate));
  };

  const handleGoogleSignup = async () => {
    try {
      const accessToken = await requestGoogleAccessToken();
      await dispatch(GoogleAuthUser(accessToken, navigate));
    } catch (error) {
      toast.error(error?.message || "Google sign-up failed");
    }
  };

  return (
    <div className="min-h-[100dvh] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-7xl overflow-hidden rounded-3xl border border-stroke/70 bg-white/80 shadow-2xl shadow-primary/10 backdrop-blur dark:border-strokedark dark:bg-boxdark/80 lg:grid-cols-[1fr_1.08fr]">
        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md rounded-3xl border border-stroke/70 bg-white p-6 shadow-xl dark:border-strokedark dark:bg-boxdark-2 sm:p-8">
            <div className="mb-7">
              <div className="mb-5 lg:hidden">
                <Logo />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Create Account
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-black dark:text-white">
                Sign Up
              </h2>
              <p className="mt-2 text-sm text-body dark:text-bodydark">
                Join Samvad and start your modern chat experience.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Your full name"
                    className={`w-full rounded-xl border bg-transparent py-3.5 pl-4 pr-11 text-black dark:text-white ${
                      errors.name
                        ? "border-red focus:border-red"
                        : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bodydark2">
                    <UserIcon size={20} />
                  </span>
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs font-semibold text-red">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-transparent py-3.5 pl-4 pr-11 text-black dark:text-white ${
                      errors.email
                        ? "border-red focus:border-red"
                        : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bodydark2">
                    <EnvelopeSimpleIcon size={20} />
                  </span>
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs font-semibold text-red">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Choose a password"
                    className={`w-full rounded-xl border bg-transparent py-3.5 pl-4 pr-11 text-black dark:text-white ${
                      errors.password
                        ? "border-red focus:border-red"
                        : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bodydark2">
                    <LockIcon size={20} />
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-semibold text-red">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Re-enter password"
                    className={`w-full rounded-xl border bg-transparent py-3.5 pl-4 pr-11 text-black dark:text-white ${
                      errors.confirmPassword
                        ? "border-red focus:border-red"
                        : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bodydark2">
                    <LockIcon size={20} />
                  </span>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-red">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting || isLoading ? "Creating account..." : "Sign Up"}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isSubmitting || isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-stroke bg-gray-2 px-4 py-3.5 text-sm font-semibold text-black hover:border-primary/50 hover:bg-primary/5 dark:border-strokedark dark:bg-meta-4 dark:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_191_13499)">
                    <path
                      d="M19.999 10.2217C20.0111 9.53428 19.9387 8.84788 19.7834 8.17737H10.2031V11.8884H15.8266C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.9986 13.2661 19.9986 10.2217"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.2055 19.9999C12.9605 19.9999 15.2734 19.111 16.9629 17.5777L13.7429 15.1331C12.8813 15.7221 11.7248 16.1333 10.2055 16.1333C8.91513 16.1259 7.65991 15.7205 6.61791 14.9745C5.57592 14.2286 4.80007 13.1801 4.40044 11.9777L4.28085 11.9877L1.13101 14.3765L1.08984 14.4887C1.93817 16.1456 3.24007 17.5386 4.84997 18.5118C6.45987 19.4851 8.31429 20.0004 10.2059 19.9999"
                      fill="#34A853"
                    />
                    <path
                      d="M4.39899 11.9777C4.1758 11.3411 4.06063 10.673 4.05807 9.99996C4.06218 9.32799 4.1731 8.66075 4.38684 8.02225L4.38115 7.88968L1.19269 5.4624L1.0884 5.51101C0.372763 6.90343 0 8.4408 0 9.99987C0 11.5589 0.372763 13.0963 1.0884 14.4887L4.39899 11.9777Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10.2059 3.86663C11.668 3.84438 13.0822 4.37803 14.1515 5.35558L17.0313 2.59996C15.1843 0.901848 12.7383 -0.0298855 10.2059 -3.6784e-05C8.31431 -0.000477834 6.4599 0.514732 4.85001 1.48798C3.24011 2.46124 1.9382 3.85416 1.08984 5.51101L4.38946 8.02225C4.79303 6.82005 5.57145 5.77231 6.61498 5.02675C7.65851 4.28118 8.9145 3.87541 10.2059 3.86663Z"
                      fill="#EB4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_191_13499">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>
                  {isSubmitting || isLoading ? "Please wait..." : "Sign Up with Google"}
                </span>
              </button>

              <p className="pt-1 text-center text-sm text-body dark:text-bodydark">
                Already have an account?{" "}
                <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </section>

        <section className="relative hidden overflow-hidden px-12 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute left-[-130px] top-[-90px] h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
          <div className="absolute right-[-90px] bottom-[-120px] h-72 w-72 rounded-full bg-primary/25 blur-3xl" />

          <div className="relative z-10 flex justify-end">
            <Logo />
          </div>

          <div className="relative z-10 space-y-8">
            <div>
              <p className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Let&apos;s Get Started
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight text-black dark:text-white">
                Build your space,
                <br />
                connect naturally
              </h1>
              <p className="mt-4 max-w-lg text-sm text-body dark:text-bodydark">
                Create your account once, verify quickly, and start conversations
                with a refined messaging experience.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-stroke/70 bg-white/70 px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark-2/70"
                >
                  <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
                    {item.icon}
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
