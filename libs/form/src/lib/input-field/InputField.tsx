import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export interface InputFieldProps extends CommonFieldProps {
  type?: "password" | "number" | "email" | "url";

  size?: "xs" | "sm" | "md" | "lg";

  bg?: string;

  borderColor?: string;

  textarea?: boolean;
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
  textarea,
  ...props
}: InputFieldProps) {
  const [ field, meta ] = useField(name);
  const InputType = textarea ? Textarea : Input;
  return (
    <FormControl
      isRequired={required}
      isInvalid={!!meta.error && meta.touched}
      isDisabled={disabled}
      my={my ?? 4}
    >
      <FormLabel>{label}</FormLabel>
      <InputType
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
