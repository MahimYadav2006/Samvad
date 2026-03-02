import Logo from "../../components/Logo";
import { Link, useNavigate } from "react-router-dom";
import {
  EnvelopeSimpleIcon,
  LockIcon,
  ShieldCheckeredIcon,
  SparkleIcon,
  ChatCircleDotsIcon,
} from "@phosphor-icons/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { GoogleAuthUser, LoginUser } from "../../redux/slices/auth";
import { requestGoogleAccessToken } from "../../utils/googleAuth";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const highlights = [
  {
    icon: <ChatCircleDotsIcon size={18} weight="fill" />,
    label: "Instant conversations with your people",
  },
  {
    icon: <SparkleIcon size={18} weight="fill" />,
    label: "Rich media sharing with a cleaner interface",
  },
  {
    icon: <ShieldCheckeredIcon size={18} weight="fill" />,
    label: "Secure login with email or Google",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    dispatch(LoginUser(data, navigate));
  };

  const handleGoogleSignIn = async () => {
    try {
      const accessToken = await requestGoogleAccessToken();
      await dispatch(GoogleAuthUser(accessToken, navigate));
    } catch (error) {
      toast.error(error?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="animate-page-in relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8 font-satoshi sm:px-8 sm:py-12">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[380px] w-[380px] rounded-full bg-sky-400/[0.09] blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[80px]" />

      {/* Main card */}
      <div className="relative z-10 grid w-full max-w-[1080px] overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-black/[0.04] backdrop-blur-xl dark:border-strokedark/60 dark:bg-boxdark/70 dark:shadow-black/20 lg:grid-cols-[1.05fr_1fr]">

        {/* ── Left: Hero Section (hidden on mobile) ── */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col">
          {/* Inner gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-sky-400/[0.06]" />
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-sky-400/20 blur-[80px]" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <Logo />

            <div className="space-y-7">
              <div>
                <span className="mb-3.5 inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Welcome Back
                </span>
                <h1 className="font-display text-[2.1rem] font-bold leading-[1.2] tracking-tight text-black dark:text-white">
                  Continue the
                  <br />
                  conversation
                </h1>
                <p className="mt-3.5 max-w-sm text-[13px] leading-relaxed text-body dark:text-bodydark">
                  Your messages, calls, and media -- all in one place.
                  Pick up right where you left off.
                </p>
              </div>

              <div className="space-y-2.5">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-stroke/50 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-strokedark/50 dark:bg-boxdark-2/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-semibold text-black dark:text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-[11px] text-body/60 dark:text-bodydark/40">
              Samvad &mdash; Real-time messaging
            </p>
          </div>
        </section>

        {/* ── Right: Login Form ── */}
        <section className="flex items-center justify-center border-l-0 p-6 sm:p-10 lg:border-l lg:border-stroke/40 lg:p-12 dark:lg:border-strokedark/40">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>

            {/* Header */}
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Start Connecting
              </p>
              <h2 className="mt-2 font-display text-[1.75rem] font-bold tracking-tight text-black dark:text-white">
                Sign In
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-body dark:text-bodydark">
                Login to chat with your friends and continue where you left off.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email field */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-black dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-white/50 py-3 pl-4 pr-11 text-[13px] text-black outline-none backdrop-blur-sm transition-colors dark:bg-boxdark-2/50 dark:text-white ${
                      errors.email
                        ? "border-red focus:border-red"
                        : "border-stroke/70 hover:border-stroke focus:border-primary dark:border-form-strokedark/70 dark:hover:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bodydark2">
                    <EnvelopeSimpleIcon size={18} />
                  </span>
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs font-semibold text-red">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-black dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border bg-white/50 py-3 pl-4 pr-11 text-[13px] text-black outline-none backdrop-blur-sm transition-colors dark:bg-boxdark-2/50 dark:text-white ${
                      errors.password
                        ? "border-red focus:border-red"
                        : "border-stroke/70 hover:border-stroke focus:border-primary dark:border-form-strokedark/70 dark:hover:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bodydark2">
                    <LockIcon size={18} />
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-semibold text-red">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 py-3 text-[13px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg disabled:hover:brightness-100"
              >
                {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-stroke/60 dark:bg-strokedark/60" />
                <span className="text-[11px] font-medium text-body/70 dark:text-bodydark/50">
                  or
                </span>
                <div className="h-px flex-1 bg-stroke/60 dark:bg-strokedark/60" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isLoading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stroke/70 bg-white/60 px-4 py-3 text-[13px] font-semibold text-black backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] active:scale-[0.98] dark:border-strokedark/70 dark:bg-meta-4/50 dark:text-white dark:hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
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
                  {isSubmitting || isLoading ? "Please wait..." : "Sign In with Google"}
                </span>
              </button>

              {/* Sign up link */}
              <p className="pt-1 text-center text-[13px] text-body dark:text-bodydark">
                Don&apos;t have an account?{" "}
                <Link to="/auth/signup" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
