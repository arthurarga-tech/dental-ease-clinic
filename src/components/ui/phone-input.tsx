import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatBrazilianPhone } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatBrazilianPhone(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        className={cn(className)}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
