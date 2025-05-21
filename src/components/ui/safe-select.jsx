import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select";
import { createSafeSelectItemValue } from "../../lib/selectHelpers";

/**
 * A wrapper for SelectItem that ensures it always has a valid value
 */
export const SafeSelectItem = ({ value, children, ...props }) => {
  const safeValue = createSafeSelectItemValue(value, 'item');
  
  return (
    <SelectItem value={safeValue} {...props}>
      {children}
    </SelectItem>
  );
};

/**
 * Re-export all the original Select components along with our safe versions
 */
export {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue
};
