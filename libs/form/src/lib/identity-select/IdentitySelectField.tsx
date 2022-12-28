import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Select } from "@chakra-ui/react";
import { IdentitySummary } from "@plural/schema";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export interface IdentitySelectFieldProps extends CommonFieldProps {
  identities: IdentitySummary[];

  field?: "id" | "displayId";
}

export function IdentitySelectField({
  name,
  disabled,
  required,
  label,
  placeholder,
  identities,
  my,
  helpText,
  ...props
}: IdentitySelectFieldProps) {
  const [ field, meta ] = useField(name);

  const nonEmpty = (str?: string) => {
    if(typeof str === "string" && str.length > 0) {
      return str;
    }
    return undefined;
  }

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
        { identities.map(identity => (
          <option
            key={identity.id}
            value={identity[props.field ?? "id"]}
          >
            { nonEmpty(identity.display.displayName) ?? identity.display.name }
          </option>
        ))}
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
