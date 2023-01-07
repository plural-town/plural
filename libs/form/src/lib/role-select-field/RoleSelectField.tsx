import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Select } from "@chakra-ui/react";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export function RoleSelectField({
  name,
  disabled,
  required,
  label,
  placeholder,
  my,
  helpText,
  ...props
}: CommonFieldProps) {
  const [field, meta] = useField(name);

  return (
    <FormControl
      isRequired={required}
      isInvalid={!!meta.error && meta.touched}
      isDisabled={disabled}
      my={my ?? 4}
    >
      <FormLabel>{label}</FormLabel>
      <Select {...field} placeholder={placeholder}>
        <option value="USER">User</option>
        <option value="MOD">Moderator</option>
        <option value="ADMIN">Administrator</option>
        <option value="OWNER">Server Owner</option>
      </Select>
      {helpText && <FormHelperText>{helpText}</FormHelperText>}
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
}
