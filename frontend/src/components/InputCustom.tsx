import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  unit?: string;
}

const InputCustom = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, unit, className, type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-semibold text-gray-300">
            {label}
          </label>
        )}

        <div className="relative w-full">
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "h-10 w-full rounded-full bg-[#1f1f1f] border border-[#2a2a2a] px-4 text-sm text-white placeholder-gray-400 outline-none transition-all duration-200",
              "hover:border-[#3a3a3a]",
              "disabled:cursor-not-allowed disabled:opacity-50 focus:bg-[#2a2a2a00]",
              className
            )}
            {...props}
          />

          {unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {unit}
            </span>
          )}
        </div>

        {error && (
          <span className="text-xs text-red-500 font-medium mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputCustom.displayName = "InputCustom";

export { InputCustom };
