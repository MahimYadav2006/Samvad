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

  return (
    <div className="min-h-[100dvh] px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl items-center justify-center">
        <div className="surface-card w-full rounded-3xl p-6 shadow-2xl shadow-primary/10 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-5 inline-flex">
              <Logo />
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheckeredIcon size={28} weight="fill" />
            </div>
            <h1 className="font-display text-3xl font-bold text-black dark:text-white">
              Verify Your Account
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-body dark:text-bodydark">
              Enter the 4-digit code sent to{" "}
              <span className="font-semibold text-black dark:text-white">
                {email || "your email"}
              </span>
              .
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
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
                      maxLength={1}
                      className="h-13 w-full rounded-xl border border-stroke bg-white/70 px-2 text-center text-xl font-bold text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
              <p className="text-xs font-semibold text-red">{errors.otp.message}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stroke/70 bg-gray-2/80 px-4 py-3 text-sm dark:border-strokedark dark:bg-meta-4/60">
              <div className="flex items-center gap-2 font-medium text-body dark:text-bodydark">
                <ClockIcon size={16} weight="fill" />
                Didn&apos;t receive the code?
              </div>
              <button
                type="button"
                disabled={resendDisabled}
                onClick={handleResendOTP}
                className={`font-semibold ${
                  resendDisabled
                    ? "cursor-not-allowed text-bodydark2"
                    : "text-primary hover:underline"
                }`}
              >
                Resend {resendDisabled && `(${timer}s)`}
              </button>
            </div>

            <button
              className="flex w-full justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? "Verifying..." : "Verify Account"}
            </button>

            <p className="text-center text-xs font-semibold text-red">
              Don&apos;t share this code with anyone.
            </p>

            <p className="text-center text-sm text-body dark:text-bodydark">
              Wrong email?{" "}
              <Link to="/auth/signup" className="font-semibold text-primary hover:underline">
                Go back
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Verification;
