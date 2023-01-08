import { IdentitySessionContext, UserSessionContext } from "./AuthContext";

export interface ServerAuthHydration {
  users: null | UserSessionContext[];
  front: null | IdentitySessionContext[];
}
