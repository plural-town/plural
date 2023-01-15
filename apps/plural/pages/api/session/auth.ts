import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { hydrateRequest } from "@plural-town/next-ability";

export async function sessionAuthHandler(req: NextApiRequest, res: NextApiResponse) {
  res.send({
    status: "ok",
    auth: hydrateRequest(req),
  });
}

export default withIronSessionApiRoute(sessionAuthHandler, SESSION_OPTIONS);
