export interface CommonFieldProps {
  /**
   * The name of the field (according to Formik)
   */
   name: string;

   label: string;

   placeholder?: string;

   my?: number;

   helpText?: string;

   disabled?: boolean;

   required?: boolean;
}
