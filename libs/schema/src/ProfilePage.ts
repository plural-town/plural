import { Permission } from "@prisma/client";
import { ProfileSummary } from "./ProfileSummary";

export interface ProfilePage extends ProfileSummary {
  highestRole: Permission | "PUBLIC";

  postCount?: number;

  followingCount?: number;

  followerCount?: number;
}
