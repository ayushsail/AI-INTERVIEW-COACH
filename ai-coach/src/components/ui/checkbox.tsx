import * as React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
        className={`h-5 w-5 rounded border-border text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 accent-primary transition-all cursor-pointer ${className}`}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
