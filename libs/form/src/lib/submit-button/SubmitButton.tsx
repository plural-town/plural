import { Button, ButtonProps } from "@chakra-ui/react";
import { useFormikContext } from "formik";

export interface SubmitButtonProps extends ButtonProps {
  submittingVariant?: ButtonProps["variant"];
}

export function SubmitButton({ disabled, submittingVariant, my, ...props }: SubmitButtonProps) {
  const { isSubmitting, isValid } = useFormikContext();
  return (
    <Button
      {...props}
      type="submit"
      variant={
        isSubmitting
          ? (submittingVariant ?? "outline")
          : props.variant
      }
      isLoading={isSubmitting}
      disabled={!!disabled || (!isValid || isSubmitting)}
      my={my ?? 2}
    />
  );
}

export default SubmitButton;
