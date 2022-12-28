import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Select } from "@chakra-ui/react";
import { ProfileSummary } from "@plural/schema";
import { useField } from "formik";
import { CommonFieldProps } from "../util/CommonFieldProps";

export interface ProfileSelectFieldProps extends CommonFieldProps {
  profiles: ProfileSummary[];

  field?: "id" | "displayId";
}

export function ProfileSelectField({
  name,
  disabled,
  required,
  label,
  placeholder,
  profiles,
  my,
  helpText,
  ...props
}: ProfileSelectFieldProps) {
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
        { profiles.map(profile => (
          <option
            key={profile.id}
            value={profile[props.field ?? "id"]}
          >
            { nonEmpty(profile.display.displayName) ?? profile.display.name }
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
