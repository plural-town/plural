import { PublishedNoteProfile } from "@plural/schema";
import { render } from "@testing-library/react";

import NoteCard from "./NoteCard";

const LIBRARY: PublishedNoteProfile = {
  id: "library",
  author: "FEATURED",
  display: {
    name: "New Town Library",
    displayName: "",
    bio: "",
  },
  displayId: "",
  fullUsername: `@newtownlib@example.com`,
  slug: "newtownlib",
  profileURL: "#newtownlib",
  isRoot: false,
  visibility: "PUBLIC",
  parent: "",
};

const DIRECTOR: PublishedNoteProfile = {
  id: "director",
  author: "BYLINE",
  display: {
    name: "Jones, Library Director",
    displayName: "",
    bio: "",
  },
  displayId: "",
  fullUsername: `@jones@newtownlib.example.com`,
  slug: "jones",
  profileURL: "#newtownlib.jones",
  isRoot: false,
  visibility: "PUBLIC",
  parent: "",
};

describe("NoteCard", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <NoteCard
        id="test1234"
        content="Hello World"
        profile={LIBRARY}
        profiles={[LIBRARY, DIRECTOR]}
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
