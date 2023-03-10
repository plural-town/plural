import {
  Account,
  DisplayName,
  Identity,
  IdentityGrant,
  PrismaClient,
  Profile,
  Role,
} from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function createAccount(accountId: string, emailAddress: string, password: string) {
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
  role: Role = Role.USER,
): Promise<[Identity, IdentityGrant]> {
  const identity = await prisma.identity.create({
    data: {
      id,
      displayId: displayName.id,
      role,
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
  const [admin] = await createAccount("admin", "admin@example.com", "testing");
  const adminDisplay = await createDisplayName("Admin", {
    id: "admin-display",
  });
  const [adminIdentity] = await createIdentity("admin", adminDisplay, admin, Role.OWNER);

  const [mod] = await createAccount("mod", "mod@example.com", "testing");
  const modDisplay = await createDisplayName("Moderator", {
    id: "mod-display",
  });
  const [modIdentity] = await createIdentity("mod", modDisplay, mod, Role.MOD);

  const [account] = await createAccount("test", "test@example.com", "testing");

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

  const note = await prisma.note.create({
    data: {
      id: "note1",
    },
  });

  await prisma.noteAuthor.create({
    data: {
      noteId: note.id,
      authorId: system.id,
    },
  });

  const draft = await prisma.noteDraft.create({
    data: {
      id: "draft1",
      content: "Hello World",
      noteId: note.id,
    },
  });

  const systemItem = await prisma.item.create({
    data: {
      id: "systemItem1",
      profileId: systemProfile.id,
      localOnly: false,
      privacy: "PUBLIC",
      type: "NOTE",
      noteId: note.id,
      noteAuthor: "FEATURED",
    },
  });

  const [other] = await createAccount("other", "other@example.com", "testing");
  const otherDisplay = await createDisplayName("other");
  const [otherIdentity] = await createIdentity("other", otherDisplay, other);
  const [otherProfile] = await createProfile("other", "other", otherDisplay, otherIdentity);

  const [shared] = await createAccount("shared", "shared@example.com", "testing");
  const sharedDisplay = await createDisplayName("shared");
  const [sharedIdentity] = await createIdentity("shared", sharedDisplay, shared);
  await prisma.identityGrant.create({
    data: {
      accountId: account.id,
      identityId: sharedIdentity.id,
      permission: "VIEW",
    },
  });
  const [sharedProfile] = await createProfile("shared", "shared", sharedDisplay, sharedIdentity);
  await prisma.profileGrant.create({
    data: {
      identityId: system.id,
      profileId: sharedProfile.id,
      permission: "VIEW",
    },
  });

  console.log(
    adminIdentity,
    modIdentity,
    alter1Profile,
    alter2Profile,
    draft,
    systemItem,
    otherProfile,
  );
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
