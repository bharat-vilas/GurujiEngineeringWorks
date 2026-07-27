import * as React from "react";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

interface DatePickerProps {
  value?: dayjs.Dayjs | null;
  onChange?: (date: dayjs.Dayjs | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, placeholder = "Select date", className, disabled }, ref) => {
    const inputValue = value ? value.format("YYYY-MM-DD") : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;
      if (e.target.value) {
        onChange(dayjs(e.target.value));
      } else {
        onChange(null);
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={inputValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
