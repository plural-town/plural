import { Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import { ReactNode } from "react";
import { IdentitySwitcher } from "../identity-switcher/IdentitySwitcher";
import { switchingModalContext, SwitchingModalContext } from "./SwitchingModalContext";

export interface SwitchingModalProviderProps {
  children?: ReactNode;
}

export function SwitchingModalProvider({ children }: SwitchingModalProviderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const ctx: SwitchingModalContext = {
    available: true,
    open: onOpen,
  };

  return (
    <>
      <switchingModalContext.Provider value={ctx}>{children}</switchingModalContext.Provider>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <IdentitySwitcher modal />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default SwitchingModalProvider;
