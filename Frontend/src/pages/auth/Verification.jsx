import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { ClockIcon, ShieldCheckeredIcon } from "@phosphor-icons/react";
import { ResendOTP, VerifyOTP } from "../../redux/slices/auth";

const otpSchema = yup.object().shape({
  otp: yup
    .array()
    .of(yup.string().matches(/^\d$/, "Only digits allowed").required("Digit required"))
    .length(4, "OTP must be 4 digits"),
});

function Verification() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const email = new URLSearchParams(location.search).get("email");
  const isLoading = useSelector((state) => state.auth.isLoading);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: ["", "", "", ""],
    },
  });

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (resendDisabled) {
      const intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [resendDisabled]);

  const handleChangeInput = (e, index) => {
    const value = e.target.value;

    if (/^\d$/.test(value)) {
      setValue(`otp[${index}]`, value, { shouldValidate: true });
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (value === "") {
      setValue(`otp[${index}]`, "");
      if (index > 0 && e.nativeEvent.inputType === "deleteContentBackward") {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const onSubmit = (data) => {
    const otp = data.otp.join("");
    dispatch(VerifyOTP({ email, otp }, navigate));
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setTimer(60);
    dispatch(ResendOTP(email));
  };

  const timerMinutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const timerSeconds = String(timer % 60).padStart(2, "0");

  return (
    <div className="min-h-[100dvh] px-4 py-8 sm:px-8 sm:py-10">
      {/* Ambient background blurs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg items-center justify-center sm:min-h-[calc(100dvh-5rem)]">
        <div className="animate-page-in w-full">
          <div className="surface-card rounded-3xl p-6 shadow-2xl shadow-primary/10 sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-6 inline-flex">
                <Logo />
              </div>

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-400/10 ring-1 ring-primary/10">
                <ShieldCheckeredIcon
                  size={30}
                  weight="fill"
                  className="text-primary"
                />
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Almost There
              </p>
              <h1 className="font-display text-3xl font-bold text-black dark:text-white sm:text-4xl">
                Verify Your Account
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-body dark:text-bodydark">
                We sent a 4-digit verification code to{" "}
                <span className="font-semibold text-black dark:text-white">
                  {email || "your email"}
                </span>
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Controller
                    key={index}
                    name={`otp[${index}]`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        className={`h-16 w-16 rounded-2xl border-2 bg-white/80 text-center font-display text-2xl font-bold text-black transition-all duration-200 placeholder:text-bodydark2/30 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/10 dark:bg-form-input dark:text-white dark:focus:bg-boxdark-2 sm:h-18 sm:w-18 sm:text-3xl ${
                          errors.otp
                            ? "border-red/50 focus:border-red"
                            : "border-stroke/80 dark:border-form-strokedark"
                        }`}
                        placeholder="-"
                        onChange={(e) => handleChangeInput(e, index)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            getValues(`otp[${index}]`) === "" &&
                            index > 0
                          ) {
                            inputRefs.current[index - 1]?.focus();
                          }
                        }}
                      />
                    )}
                  />
                ))}
              </div>

              {errors.otp && (
                <p className="text-center text-xs font-semibold text-red">
                  {errors.otp.message}
                </p>
              )}

              {/* Resend Section */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-stroke/60 bg-gray-2/60 px-4 py-3.5 dark:border-strokedark dark:bg-meta-4/40">
                <div className="flex items-center gap-2 text-sm font-medium text-body dark:text-bodydark">
                  <ClockIcon size={16} weight="fill" className="shrink-0" />
                  <span>Didn&apos;t get the code?</span>
                </div>
                {resendDisabled ? (
                  <span className="font-display text-sm font-bold tabular-nums text-bodydark2">
                    {timerMinutes}:{timerSeconds}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all duration-200 hover:shadow-2xl hover:shadow-primary/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                type="submit"
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </button>

              {/* Security Note */}
              <p className="text-center text-xs font-semibold text-red">
                Don&apos;t share this code with anyone.
              </p>

              {/* Back Link */}
              <p className="text-center text-sm text-body dark:text-bodydark">
                Wrong email?{" "}
                <Link
                  to="/auth/signup"
                  className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  Go back
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verification;
