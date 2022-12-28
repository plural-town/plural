import { InputProps } from "@chakra-ui/react";

export interface CommonFieldProps {
  /**
   * The name of the field (according to Formik)
   */
   name: string;

   label: string;

   placeholder?: string;

   my?: InputProps["my"];

   helpText?: string;

   disabled?: boolean;

   required?: boolean;
}
