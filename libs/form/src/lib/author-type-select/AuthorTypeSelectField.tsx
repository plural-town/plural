import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Select } from "@chakra-ui/react";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export function AuthorTypeSelectField({
  name,
  disabled,
  required,
  label,
  placeholder,
  my,
  helpText,
  ...props
}: CommonFieldProps) {
  const [ field, meta ] = useField(name);

  return (
    <FormControl
      isRequired={required}
      isInvalid={!!meta.error && meta.touched}
      isDisabled={disabled}
      my={my ?? 4}
    >
      <FormLabel>{label}</FormLabel>
      <Select
        {...field}
        placeholder={placeholder}
      >
        <option value="FEATURED">Featured</option>
        <option value="BYLINE">Byline</option>
        <option value="NAMED">Named</option>
        <option value="PRIVATE">Private</option>
      </Select>
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
