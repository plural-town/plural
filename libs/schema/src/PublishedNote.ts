import { AuthorType } from "@prisma/client";
import { ProfileSummary } from "./ProfileSummary";

export interface PublishedNoteProfile extends ProfileSummary {
  author: AuthorType;
}

/**
 * All the data needed to render a note.
 */
export interface PublishedNote {
  id: string;

  /**
   * The profile this note is being viewed on.
   */
  profile: PublishedNoteProfile;

  /**
   * All authoring profiles.
   */
  profiles: PublishedNoteProfile[];
}
