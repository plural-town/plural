import { UserSession } from "@plural/schema";
import { NextApiRequest, NextApiResponse } from "next";

export function requireSession(
  req: NextApiRequest,
  res: NextApiResponse,
): UserSession | false {
  const noscript = req.query["noscript"] === "true";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if((req as any).session.user === undefined) {
    if(noscript) {
      res.redirect("/login/");
      return false;
    }
    res.send({
      status: "failure",
      error: "NO_LOGIN",
    });
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session: UserSession = (req as any).session.user;
  return session;
}
