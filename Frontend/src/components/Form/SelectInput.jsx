import { CaretDownIcon, GlobeIcon } from "@phosphor-icons/react";

export default function SelectInput({ register, errors }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
        Country
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark2">
          <GlobeIcon size={18} />
        </span>

        <select
          defaultValue=""
          {...register("country")}
          className={`w-full appearance-none rounded-xl border bg-transparent py-3 pl-10 pr-10 text-black dark:text-white ${
            errors.country
              ? "border-red focus:border-red"
              : "border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
          }`}
        >
          <option disabled value="">
            Select Country
          </option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
        </select>

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bodydark2">
          <CaretDownIcon size={18} />
        </span>
      </div>
      {errors.country && (
        <p className="mt-1.5 text-xs font-semibold text-red">
          {errors.country.message}
        </p>
      )}
    </div>
  );
}
