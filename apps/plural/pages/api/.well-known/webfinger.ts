import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const SUB = process.env.SUBACCOUNT_CHARACTER;
  const USERNAME = process.env.USERNAME_REGEX;
  const SUBDOMAIN_ACCOUNTS = process.env.SUBDOMAIN_ACCOUNTS === "true";
  const BASE_DOMAIN = process.env.BASE_DOMAIN;

  const host = req.headers.host;
  const { resource } = req.query;

  if(!resource || typeof resource !== "string") {
    throw new Error("Must request a 'resource'");
  }

  const ACCOUNT_RESOURCE = new RegExp(`acct:(${USERNAME})@${BASE_DOMAIN}`);
  const SUB_ACCOUNT_RESOURCE = new RegExp(`acct:(${USERNAME})${SUB}(${USERNAME})@${BASE_DOMAIN}`);
  const SUB_ACCOUNT_SUBDOMAIN = new RegExp(`acct:(${USERNAME})@(${USERNAME}).${BASE_DOMAIN}`);

  const directAccount = resource.match(ACCOUNT_RESOURCE);
  const subAccount = resource.match(SUB_ACCOUNT_RESOURCE);
  const subdomainAccount = resource.match(SUB_ACCOUNT_SUBDOMAIN);

  if(directAccount) {
    const subject = directAccount[1];
    res.status(200).json({
      subject: `acct:${subject}@${BASE_DOMAIN}`,
      aliases: [
        `https://${BASE_DOMAIN}/@${subject}`,
        `https://${BASE_DOMAIN}/api/account/${subject}/activity`,
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
          href: `https://${BASE_DOMAIN}/api/account/${subject}/activity`,
        },
      ],
    });
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
  } else {
    throw new Error("Unknown resource format");
  }

  res.status(200).json({ name: "John Doe", host });
}
