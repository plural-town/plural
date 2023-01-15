import { NewEmailRequestSchema } from "@plural/schema";
import { SESSION_OPTIONS } from "../../lib/session";
import { compare } from "bcrypt";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@plural/prisma";

export async function emailLoginHandler(req: NextApiRequest, res: NextApiResponse) {
  const { registration } = req.query;
  const { email, password } = NewEmailRequestSchema.validateSync(req.body);

  const address = await prisma.email.findFirst({
    where: {
      email,
      verifiedAt: {
        not: null,
      },
    },
    include: {
      account: true,
    },
  });

  const hashed = address?.account.password ?? "sample";

  try {
    const verified = await compare(password, hashed);
    if (!verified) {
      throw new Error();
    }

    if (Array.isArray(req.session.users)) {
      req.session.users.push({
        id: address.account.id,
      });
    } else {
      req.session.users = [
        {
          id: address.account.id,
        },
      ];
    }

    if (registration === "true") {
      req.session.registration = {
        id: address.account.id,
      };
    }

    await req.session.save();
    return res.send({
      status: "ok",
      id: address.account.id,
    });
  } catch (e) {
    res.status(404).send({
      status: "failed",
    });
  }
}

export default withIronSessionApiRoute(emailLoginHandler, SESSION_OPTIONS);
