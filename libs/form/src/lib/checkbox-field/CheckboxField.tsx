import { Checkbox, FormControl, FormErrorMessage, FormHelperText, FormLabel } from "@chakra-ui/react";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export interface CheckboxFieldProps extends CommonFieldProps {
  size?: "xs" | "sm" | "md" | "lg";

  text: string;
}

export function CheckboxField({
  name,
  disabled,
  required,
  label,
  text,
  size,
  my,
  helpText,
}: CheckboxFieldProps) {
  const [field, meta] = useField(name);
  return (
    <FormControl
      isRequired={required}
      isInvalid={!!meta.error && meta.touched}
      isDisabled={disabled}
      my={my ?? 4}
    >
      <FormLabel>{label}</FormLabel>
      <Checkbox
        {...field}
        size={size}
      >
        { text }
      </Checkbox>
      { helpText && (
        <FormHelperText>
          { helpText }
        </FormHelperText>
      )}
      <FormErrorMessage>
        {meta.error}
      </FormErrorMessage>
    </FormControl>
  )
}
