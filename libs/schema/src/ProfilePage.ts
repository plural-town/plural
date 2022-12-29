import { Permission } from "@prisma/client";
import { ProfileSummary } from "./ProfileSummary";
import { PublishedNote } from "./PublishedNote";

export type FeedContent
  = PublishedNote;

export interface ProfilePage extends ProfileSummary {
  highestRole: Permission | "PUBLIC";

  posts: FeedContent[];

  postCount?: number;

  followingCount?: number;

  followerCount?: number;
}
