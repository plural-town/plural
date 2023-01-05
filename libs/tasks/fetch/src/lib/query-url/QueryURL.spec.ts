import { Note, Person } from "@plural-town/activitystreams-validator";
import { PrismaClient, REField, RemoteEntity, RemoteNote, RemoteProfile } from "@prisma/client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { QueryURL } from "./QueryURL";

type ProfileEntity = RemoteEntity & {
  profile: RemoteProfile | null;
  fields: REField[];
};

type NoteEntity = RemoteEntity & {
  note: RemoteNote | null;
  fields: REField[];
};

describe("QueryURL", () => {
  let mock: MockAdapter;
  let task: QueryURL;
  let storeRemotePerson: jest.SpyInstance<
    Promise<ProfileEntity>,
    [PrismaClient, Person | string, boolean]
  >;
  let storeRemoteNote: jest.SpyInstance<
    Promise<NoteEntity>,
    [PrismaClient, Note | string, boolean]
  >;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  beforeEach(() => {
    task = new QueryURL({
      error: jest.fn(),
      trace: jest.fn(),
      warn: jest.fn(),
    });
    jest.spyOn(task, "updateRemoteQuery").mockImplementation();
    storeRemotePerson = jest.spyOn(task, "storeRemotePerson").mockImplementation();
    storeRemoteNote = jest.spyOn(task, "storeRemoteNote").mockImplementation();
  });

  afterEach(() => {
    mock.reset();
  });

  it("handles notes without authors", async () => {
    mock.onGet("https://example.com/note/123").reply(200, {
      type: "Note",
      id: "https://example.com/notes/123",
    });
    await task.execute("https://example.com/note/123", "1234");
    expect(storeRemoteNote).toHaveBeenCalledTimes(1);
    expect(storeRemotePerson).toHaveBeenCalledTimes(0);
  });

  it("handles notes with authors", async () => {
    mock.onGet("https://example.com/note/with-author").reply(200, {
      type: "Note",
      id: "https://example.com/notes/with-author",
      attributedTo: {
        type: "Person",
        id: "https://example.com/profiles/@test",
      },
    });
    await task.execute("https://example.com/note/with-author", "1234");
    expect(storeRemoteNote).toHaveBeenCalledTimes(1);
    expect(storeRemotePerson).toHaveBeenCalledTimes(1);
  });

  it("requires notes to have an 'id'", async () => {
    mock.onGet("https://example.com/note/no-id").reply(200, {
      type: "Note",
    });
    await expect(task.execute("https://example.com/note/no-id", "1234")).rejects.toThrow();
  });

  it("requires profiles to have an 'id'", async () => {
    mock.onGet("https://example.com/profile/no-id").reply(200, {
      type: "Person",
    });
    await expect(task.execute("https://example.com/profile/no-id", "1234")).rejects.toThrow();
  });

  it("verifies notes from the same server", async () => {
    mock.onGet("https://example.com/note/123").reply(200, {
      type: "Note",
      id: "https://example.com/note/123",
    });
    await task.execute("https://example.com/note/123", "1234");
    const [, , verified] = storeRemoteNote.mock.calls[0];
    expect(verified).toBe(true);
  });

  it("verifies profiles from the same server", async () => {
    mock.onGet("https://example.com/profile/123").reply(200, {
      type: "Person",
      id: "https://example.com/profile/123",
    });
    await task.execute("https://example.com/profile/123", "1234");
    const [, , verified] = storeRemotePerson.mock.calls[0];
    expect(verified).toBe(true);
  });

  it("verifies note authors from the same server", async () => {
    mock.onGet("https://example.com/note/123").reply(200, {
      type: "Note",
      id: "https://example.com/note/123",
      attributedTo: {
        type: "Person",
        id: "https://example.com/profiles/@test",
      },
    });
    await task.execute("https://example.com/note/123", "1234");
    const [, , verified] = storeRemotePerson.mock.calls[0];
    expect(verified).toBe(true);
  });

  it("does not verify external users", async () => {
    mock.onGet("https://example.com/profile/123").reply(200, {
      type: "Person",
      id: "https://external.com/profile/123",
    });
    await task.execute("https://example.com/profile/123", "1234");
    const [, , verified] = storeRemotePerson.mock.calls[0];
    expect(verified).toBe(false);
  });

  it("does not verify external notes", async () => {
    mock.onGet("https://example.com/note/123").reply(200, {
      type: "Note",
      id: "https://external.com/note/123",
    });
    await task.execute("https://example.com/note/123", "1234");
    const [, , verified] = storeRemoteNote.mock.calls[0];
    expect(verified).toBe(false);
  });

  it("does not verify external authors", async () => {
    mock.onGet("https://example.com/note/123").reply(200, {
      type: "Note",
      id: "https://example.com/note/123",
      attributedTo: {
        type: "Person",
        id: "https://external.com/profiles/@test",
      },
    });
    await task.execute("https://example.com/note/123", "1234");
    const [, , verified] = storeRemotePerson.mock.calls[0];
    expect(verified).toBe(false);
  });

  it.todo("handles server errors");

  it.todo("handles unparsable data");
});
