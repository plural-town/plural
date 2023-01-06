/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

import { FrontSession, UserSession } from "@plural-town/next-ability";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as IronSession from "iron-session";

declare module "iron-session" {
  interface IronSessionData {

    /**
     * Cache for the registration/onboarding flow.
     */
    registration?: {
      id: string;
    };

    users?: UserSession[];
    front?: FrontSession[];
  }
}
