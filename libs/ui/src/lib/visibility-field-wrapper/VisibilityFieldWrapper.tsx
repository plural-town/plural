import { Flex } from "@chakra-ui/react";
import { VisibilitySelectField } from "@plural/form";
import { ReactNode } from "react";

export interface VisibilityFieldWrapperProps {
  /**
   * The name of the visibility field, e.g. `nameVisibility`
   */
  name: string;

  /**
   * A form control for the field
   */
  children?: ReactNode;
}

export function VisibilityFieldWrapper({
  name,
  children,
}: VisibilityFieldWrapperProps) {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      border="1px solid"
      borderColor="accent.200"
      borderRadius="sm"
      p={2}
      my={4}
    >
      <Flex flex={{ md: 8 }} mx={{ md: 3, lg: 5 }}>
        { children }
      </Flex>
      <Flex flex={{ md: 4 }} mx={{ md: 3, lg: 5 }}>
        <VisibilitySelectField
          name={name}
          label="Visibility"
          placeholder="Select Visibility"
          my={{ md: 0 }}
        />
      </Flex>
    </Flex>
  );
}

export default VisibilityFieldWrapper;
