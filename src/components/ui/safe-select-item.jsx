import React from 'react';
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check } from "lucide-react";

/**
 * A simplified implementation of SelectItem that ensures it always has a valid value
 * This component prevents the "A <Select.Item /> must have a value prop that is not an empty string" error
 */
const SafeSelectItem = React.forwardRef(({ value, children, ...props }, ref) => {
  // Generate a safe value if the provided value is empty or undefined
  const safeValue = (!value || value === "") 
    ? `item-${Date.now()}` // Simplified unique ID generation
    : value;
  
  return (
    <SelectPrimitive.Item
      ref={ref}
      value={safeValue}
      {...props}
    >
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

SafeSelectItem.displayName = "SafeSelectItem";

export { SafeSelectItem };
