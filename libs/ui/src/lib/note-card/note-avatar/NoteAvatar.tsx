import { Avatar, AvatarGroup } from "@chakra-ui/react";
import { ProfileSummary } from "@plural/schema";
import { getDisplayName } from "../../util/useDisplayName";

export interface NoteAvatarProps {
  profiles: ProfileSummary[];
}

export function NoteAvatar({
  profiles,
}: NoteAvatarProps) {
  if(profiles.length === 1) {
    return (
      <Avatar
        src={profiles[0].display.avatar?.src}
        name={getDisplayName(profiles[0].display) ?? ""}
      />
    );
  }
  return (
    <AvatarGroup max={3} spacing="-6">
      {profiles.map(profile => (
        <Avatar
          key={profile.id}
          src={profile.display.avatar?.src}
          name={getDisplayName(profile.display) ?? ""}
        />
      ))}
    </AvatarGroup>
  );
}

export default NoteAvatar;
