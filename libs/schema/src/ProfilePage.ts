import { ProfileSummary } from "./ProfileSummary";

export interface ProfilePage extends ProfileSummary {
  postCount?: number;

  followingCount?: number;

  followerCount?: number;
}
