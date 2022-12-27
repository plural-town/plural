import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export interface InputFieldProps extends CommonFieldProps {
  type?: "password" | "number" | "email" | "url";

  size?: "xs" | "sm" | "md" | "lg";

  bg?: string;

  borderColor?: string;
}

export function InputField({
  name,
  type,
  disabled,
  required,
  label,
  placeholder,
  my,
  helpText,
  ...props
}: InputFieldProps) {
  const [ field, meta ] = useField(name);
  return (
    <FormControl
      isRequired={required}
      isInvalid={!!meta.error && meta.touched}
      isDisabled={disabled}
      my={my ?? 4}
    >
      <FormLabel>{label}</FormLabel>
      <Input
        {...field}
        type={type}
        placeholder={placeholder}
        size={props.size}
        borderColor={props.borderColor}
        bg={props.bg}
      />
      { helpText && (
        <FormHelperText>
          { helpText }
        </FormHelperText>
      )}
      <FormErrorMessage>
        {meta.error}
      </FormErrorMessage>
    </FormControl>
  );
}

export default InputField;
