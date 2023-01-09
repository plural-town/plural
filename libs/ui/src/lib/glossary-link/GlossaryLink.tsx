import { ReactNode, useMemo } from "react";
import NextLink from "next/link";
import { Icon, Link } from "@chakra-ui/react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FaQuestionCircle } from "react-icons/fa";

interface BaseGlossaryLinkProps {
  children?: ReactNode;
  "same-tab"?: boolean;
  "no-icon"?: boolean;
  icon?: "external" | "question";
}

export interface ExternalGlossaryLinkProps extends BaseGlossaryLinkProps {
  href: string;
}

export interface InternalGlossaryLinkProps extends BaseGlossaryLinkProps {
  term: string;
}

export type GlossaryLinkProps = ExternalGlossaryLinkProps | InternalGlossaryLinkProps;

export function GlossaryLink({ icon, children, ...props }: GlossaryLinkProps) {
  const href = useMemo(() => {
    if ("href" in props) {
      return props.href;
    }
    // TODO: set a base URL for documentation/glossary in global context
    return `#${props.term}`;
  }, [props]);

  const TheIcon = useMemo(() => {
    if (icon === "external") {
      return RiExternalLinkLine;
    }
    return FaQuestionCircle;
  }, [icon]);

  // TODO: color link
  // TODO: include hover text to clarify the link as a glossary entry

  return (
    <NextLink href={href} passHref legacyBehavior>
      <Link as="a" isExternal={!props["same-tab"]}>
        {children} {!props["no-icon"] && <Icon fontSize="sm" as={TheIcon} />}
      </Link>
    </NextLink>
  );
}

export default GlossaryLink;
