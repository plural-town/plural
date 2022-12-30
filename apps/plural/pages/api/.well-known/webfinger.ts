import { PrismaClient } from "@prisma/client";
import { getLogger } from "@plural/log";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const log = getLogger("webfinger");
  const SUB = process.env.SUBACCOUNT_CHARACTER;
  const USERNAME = process.env.USERNAME_REGEX;
  const SUBDOMAIN_ACCOUNTS = process.env.SUBDOMAIN_ACCOUNTS === "true";
  const BASE_DOMAIN = process.env.BASE_DOMAIN;

  const host = req.headers.host;
  const { resource } = req.query;

  if(!resource || typeof resource !== "string") {
    res.status(500).send("Must request a 'resource'");
    log.warn({ resource, req, res }, ".webfinger lacks 'resource'");
    return;
  }

  const ACCOUNT_RESOURCE = new RegExp(`acct:(${USERNAME})@${BASE_DOMAIN}`);
  const SUB_ACCOUNT_RESOURCE = new RegExp(`acct:(${USERNAME})${SUB}(${USERNAME})@${BASE_DOMAIN}`);
  const SUB_ACCOUNT_SUBDOMAIN = new RegExp(`acct:(${USERNAME})@(${USERNAME}).${BASE_DOMAIN}`);

  const directAccount = resource.match(ACCOUNT_RESOURCE);
  const subAccount = resource.match(SUB_ACCOUNT_RESOURCE);
  const subdomainAccount = resource.match(SUB_ACCOUNT_SUBDOMAIN);

  const prisma = new PrismaClient();

  if(directAccount) {
    const subject = directAccount[1];

    const profile = await prisma.profile.findFirst({
      where: {
        slug: subject,
        parentId: null,
      },
    });

    if(!profile) {
      res.status(404).json("Profile not found.");
      log.warn({ req, res, subject }, "webfinger requested non-existent user.");
      return;
    }

    // TODO: Handle profile visibility/privacy

    res.status(200).json({
      subject: `acct:${subject}@${BASE_DOMAIN}`,
      aliases: [
        `https://${BASE_DOMAIN}/@${subject}`,
        `https://${BASE_DOMAIN}/api/ap/profile/${profile.id}`,
      ],
      links: [
        {
          rel: "http://webfinger.net/rel/profile-page",
          type: "text/html",
          href: `https://${BASE_DOMAIN}/@${subject}`,
        },
        {
          rel: "self",
          type: "application/activity+json",
          href: `https://${BASE_DOMAIN}/api/ap/profile/${profile.id}`,
        },
      ],
    });
    log.trace({ req, res, subject }, "webfinger found profile");
    return;
  } else if(subAccount) {
    const subject = subAccount[1];
    const profile = subAccount[2];
    res.status(200).json({
      subject: `acct:${subject}${SUB}${profile}@${BASE_DOMAIN}`,
      aliases: [
        `https://${BASE_DOMAIN}/@${subject}/@${profile}`,
        `https://${BASE_DOMAIN}/api/account/${subject}/profile/${profile}/activity`,
      ],
      links: [
        {
          rel: "http://webfinger.net/rel/profile-page",
          type: "text/html",
          href: `https://${BASE_DOMAIN}/@${subject}/@${profile}`,
        },
        {
          rel: "self",
          type: "application/activity+json",
          href: `https://${BASE_DOMAIN}/api/account/${subject}/profile/${profile}/activity`,
        },
      ],
    });
    log.trace({ req, res, subject }, "webfinger found sub-account");
    return;
  } else if(SUBDOMAIN_ACCOUNTS && subdomainAccount) {
    const subject = subdomainAccount[2];
    const profile = subdomainAccount[1];
    res.status(200).json({
      subject: `acct:${profile}@${subject}.${BASE_DOMAIN}`,
      aliases: [
        `https://${subject}.${BASE_DOMAIN}/@${profile}`,
        `https://${BASE_DOMAIN}/api/account/${subject}/profile/${profile}/activity`,
      ],
      links: [
        {
          rel: "http://webfinger.net/rel/profile-page",
          type: "text/html",
          href: `https://${subject}.${BASE_DOMAIN}/@${profile}`,
        },
        {
          rel: "self",
          type: "application/activity+json",
          href: `https://${BASE_DOMAIN}/api/account/${subject}/profile/${profile}/activity`,
        },
      ],
    });
    log.trace({ req, res, subject }, "webfinger found sub-account (as subdomain)");
    return;
  } else {
    res.status(400).send("Unknown resource format.");
    log.warn({ req, res, resource }, "webfinger submitted an unsupported resource format");
    return;
  }
}
