import { IronSessionOptions } from "iron-session";

export const SESSION_OPTIONS: IronSessionOptions = {
  cookieName: process.env.COOKIE_NAME,
  password: process.env.COOKIE_PASSWORD,
  cookieOptions: {
    secure: process.env.COOKIE_SECURE !== "false",
  },
};
