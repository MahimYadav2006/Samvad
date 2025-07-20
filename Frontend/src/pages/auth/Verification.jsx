import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { ResendOTP, VerifyOTP } from "../../redux/slices/auth";

// create otp schema
const otpSchema = yup.object().shape({
otp: yup.array()
  .of(yup.string().matches(/^\d$/, "Only digits allowed").required("Digit required"))
  .length(4, "OTP must be 4 digits"),
})

function Verification() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [resendDisabled,setResendDisabled] = useState(true);
  const [timer,setTimer] = useState(60);
  const inputRefs = useRef([]);
  const email = new URLSearchParams(location.search).get("email");
  const isLoading = useSelector((state) => state.auth.isLoading);

  const {control,handleSubmit,setValue,getValues,formState:{errors,isSubmitting}} = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: ["","","",""],
    },
  });

  // Automatically focus on the first input field
  useEffect(()=>{
    if(inputRefs.current[0]){
      inputRefs.current[0].focus(); 
    }
  },[])

  // Timer effect for disabling the resend button
  useEffect(()=>{
    if(resendDisabled){
      const intervalId = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return ()=> clearInterval(intervalId);
    }
  },[resendDisabled])

  // Handle Input change
  const handleChangeInput = (e, index) => {
    const value = e.target.value;

    if (/^\d$/.test(value)) {
      // Valid single digit
      setValue(`otp[${index}]`, value, { shouldValidate: true });
      if (index < 3) {
        inputRefs.current[index + 1]?.focus(); // Focus next input
      }
    } else if (value === "") {
      // User cleared the input (e.g., Backspace)
      setValue(`otp[${index}]`, "");
      if (
        index > 0 &&
        e.nativeEvent.inputType === "deleteContentBackward"
      ) {
        inputRefs.current[index - 1]?.focus(); // Focus previous input
      }
    }
  };


  //  OnSubmit Form
  const onSubmit = (data)=>{
    const otp = data.otp.join("");
    console.log("OTP Submitted: ", otp);
    try{
      dispatch(VerifyOTP({email, otp}, navigate));
    }catch(error){
      console.error("Error submitting OTP: ", error);
    }
  }

  // Handle Resend OTP
  const handleResendOTP = async ()=>{
    // Reset the timer and disable the button
    setResendDisabled(true);
    setTimer(60);
    try{
      dispatch(ResendOTP(email));
      console.log("Writing from Verification.jsx: OTP Sent Successfully!");
    }catch(error){
      console.error("Error resending OTP", error);
    }
  }

  return (
    <div className="overflow-hidden px-4 dark:bg-boxdark-2 sm:px-8">
      <div className="flex h-screen flex-col items-center justify-center overflow-hidden">
        <div className="no-scrollbar overflow-y-auto py-20">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="text-center justify-center align-middle flex flex-col items-center gap-2">
              <Link to="/">
                <Logo></Logo>
              </Link>

              <div className="bg-white p-4 shadow-14 rounded-xl dark:bg-boxdark lg:p-7.5 xl:p-12.5">
                <h1 className="mb-2.5 text-3xl font-extrabold leading-[48px] text-black dark:text-white capitalize">
                  Verify your Account
                </h1>
                <p className="mb-7.5 font-medium">
                  Enter the 4 digit code sent to the registered email address.
                </p>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex items-center gap-4.5">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Controller key={index} name={`otp[${index}]`} control={control} render={({field})=>(
                        <input
                          {...field}
                          ref={(el)=> (inputRefs.current[index] = el)} // Assigning refs to input
                          key={index}
                          maxLength={1} // Limit input to 1 character
                          className="w-full rounded-md border-[1.5px] border-stroke bg-transparent px-5 py-3 text-center text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          onChange={(e) => handleChangeInput(e, index)}
                          onKeyDown={(e) => {
                            if(e.key === "Backspace" && getValues(`otp[${index}]`) === "" && index > 0) {
                              inputRefs.current[index - 1]?.focus(); // Move focus to the previous input
                            }
                          }}
                        />
                      )}/>
                    ))}
                  </div>
                  {errors.otp && <p className="mt-2 text-red">{errors.otp.message}</p>}

                  <p>
                    <div className="mb-5 mt-4 text-left gap-2 font-medium text-black dark:text-white space-x-2 flex flex-row items-center">
                      Did not receive the code?{" "}
                      <button type="button" disabled={resendDisabled} onClick={handleResendOTP}  className={`${resendDisabled? "text-gray": "text-primary"}`}>Resend {resendDisabled && `(${timer})s`}</button>
                    </div>
                  </p>

                  <button
                    className="flex w-full justify-center rounded-md bg-primary p-[13px] font-bold text-gray hover:bg-opacity-90"
                    type="submit" disabled={isLoading || isSubmitting} 
                  >
                    {isLoading || isSubmitting ? "Submitting.." : 'Verify'}
                  </button>
                  <span className="mt-5 block text-red">
                    Don't share this code with anyone!
                  </span>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Verification;
