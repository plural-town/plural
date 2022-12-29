import { Account, DisplayName, Identity, IdentityGrant, PrismaClient, Profile } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function createAccount(
  accountId: string,
  emailAddress: string,
  password: string,
) {
  const email = await prisma.email.create({
    data: {
      email: emailAddress,
      code: "",
      verifiedAt: new Date(),
    },
  });

  const account = await prisma.account.create({
    data: {
      id: accountId,
      password: await hash(password, 5),
    },
  });

  await prisma.email.update({
    where: {
      id: email.id,
    },
    data: {
      accountId: account.id,
    },
  });

  return [account, email] as const;
}

async function createDisplayName(
  name: string,
  options: Partial<DisplayName> = {},
): Promise<DisplayName> {
  return prisma.displayName.create({
    data: {
      name,
      nameVisibility: options.nameVisibility ?? "PUBLIC",
      displayName: options.displayName ?? "",
      displayNameVisibility: options.displayNameVisibility ?? "PUBLIC",
    },
  });
}

async function createIdentity(
  id: string,
  displayName: DisplayName,
  owner: Account,
): Promise<[Identity, IdentityGrant]> {
  const identity = await prisma.identity.create({
    data: {
      id,
      displayId: displayName.id,
    },
  });

  const grant = await prisma.identityGrant.create({
    data: {
      accountId: owner.id,
      identityId: identity.id,
      permission: "OWNER",
    },
  });

  return [identity, grant];
}

async function createProfile(
  id: string,
  slug: string,
  display: DisplayName,
  owner: Identity,
  options: Partial<Profile> = {},
) {
  const profile = await prisma.profile.create({
    data: {
      id,
      displayId: display.id,
      visibility: options.visibility ?? "PUBLIC",
      slug,
      subdomain: options.subdomain,
      parentId: options.parentId,
    },
  });

  const grant = await prisma.profileGrant.create({
    data: {
      identityId: owner.id,
      profileId: profile.id,
      permission: "OWNER",
    },
  });

  return [profile, grant] as const;
}

async function main() {
  const [account] = await createAccount("test", "test@example.com", "testing");
  await createAccount("other", "other@example.com", "testing");

  const systemDisplay = await createDisplayName("Test", {
    id: "system-display",
    displayName: "Test System",
  });
  const [system] = await createIdentity("system", systemDisplay, account);

  const alter1Display = await createDisplayName("Jay");
  const [alter1] = await createIdentity("alter1", alter1Display, account);

  const alter2Display = await createDisplayName("Sam", {
    displayName: "Sam Doe",
    displayNameVisibility: "FOLLOWERS",
  });
  const [alter2] = await createIdentity("alter2", alter2Display, account);

  const [systemProfile] = await createProfile("systemProfile", "test", systemDisplay, system);

  const [alter1Profile] = await createProfile("alter1", "jay", alter1Display, alter1, {
    parentId: systemProfile.id,
  });

  const [alter2Profile] = await createProfile("alter2", "sam", alter2Display, alter2, {
    parentId: systemProfile.id,
  });

  console.log(alter1Profile, alter2Profile);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
