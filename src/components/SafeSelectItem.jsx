import React from 'react';
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * A direct implementation of SelectItem that ensures it always has a valid value
 * This component prevents the "A <Select.Item /> must have a value prop that is not an empty string" error
 */
const SafeSelectItem = React.forwardRef(({ value, children, className, ...props }, ref) => {
  // Generate a safe value if the provided value is empty or undefined
  const safeValue = (!value || value === "") 
    ? `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    : value;
  
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      value={safeValue}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

SafeSelectItem.displayName = "SafeSelectItem";

export default SafeSelectItem;
