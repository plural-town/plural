import { transformAndValidate } from "class-transformer-validator";
import { readFile } from "fs/promises";
import path = require("path");
import { Link } from "./Link";
import { Image, Note, Person } from "./Object";

const SIMPLE_NOTE = {
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Note",
  id: "http://example.com/note/123",
};

const SIMPLE_ICON = {
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Image",
  name: "Note Icon",
  url: "http://example.org/icon.png",
  width: 16,
  height: 16,
};

describe("Object types", () => {
  describe("transformAndValidate", () => {
    describe("Person", () => {
      // TODO: Figure out how to make inbox required only for activitypub.
      // Adding '@IsDefined({ groups })` made it required for all.
      it.skip("requires inbox if using activitypub", async () => {
        const transform = transformAndValidate(
          Person,
          {
            type: "Person",
            id: "https://example.com/user/test",
          },
          {
            transformer: {
              groups: ["activitypub-actor"],
            },
            validator: {
              groups: ["activitypub-actor"],
            },
          },
        );
        await expect(transform).rejects.toHaveProperty("message", "asdf");
      });
    });

    describe("Note", () => {
      it("validates simple notes", async () => {
        const note = await transformAndValidate(Note, SIMPLE_NOTE);
        expect(note).toBeInstanceOf(Note);
        expect(note.type).toBe("Note");
      });

      it("validates attached notes", async () => {
        const note = await transformAndValidate(Note, {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          id: "http://example.com/note/123",
          attachment: SIMPLE_NOTE,
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.attachment).toBeInstanceOf(Note);
      });

      it("validates attachment provided as URL", async () => {
        const note = await transformAndValidate(Note, {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          id: "http://example.com/note/123",
          attachment: SIMPLE_NOTE.id,
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.attachment).toBe("http://example.com/note/123");
      });

      it("validates an attachment array", async () => {
        const note = await transformAndValidate(Note, {
          ...SIMPLE_NOTE,
          attachment: [SIMPLE_NOTE, SIMPLE_NOTE, "http://example.com/note/1234"],
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.attachment).toHaveLength(3);
        const attachments = note.attachment ?? [];
        if (!Array.isArray(attachments)) {
          throw new Error("not array");
        }
        expect(attachments[0]).toBeInstanceOf(Note);
        expect(attachments[1]).toBeInstanceOf(Note);
        expect(attachments[2]).toBe("http://example.com/note/1234");
      });

      it("validates image icons", async () => {
        const note = await transformAndValidate(Note, {
          ...SIMPLE_NOTE,
          icon: SIMPLE_ICON,
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.icon).toBeInstanceOf(Image);
      });

      it("rejects Note icon", () => {
        expect(
          transformAndValidate(Note, {
            ...SIMPLE_NOTE,
            icon: SIMPLE_NOTE,
          }),
        ).rejects.toHaveProperty("message", "Field is not allowed to be a Note.");
      });

      it("allows document images", async () => {
        const note = await transformAndValidate(Note, {
          ...SIMPLE_NOTE,
          // TODO: Add additional document examples
          image: [SIMPLE_ICON],
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.image).toHaveLength(1);
        const images = note.image ?? [];
        if (!Array.isArray(images)) {
          throw new Error("not array");
        }
        expect(images[0]).toBeInstanceOf(Image);
      });

      it("parses a plain URL", async () => {
        const note = await transformAndValidate(Note, {
          ...SIMPLE_NOTE,
          url: "https://example.com/presentation.pdf",
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.url).toBe("https://example.com/presentation.pdf");
      });

      it("parses a Link url", async () => {
        const note = await transformAndValidate(Note, {
          ...SIMPLE_NOTE,
          url: {
            type: "Link",
            href: "https://example.com/presentation.pdf",
          },
        });
        expect(note).toBeInstanceOf(Note);
        expect(note.url).toBeInstanceOf(Link);
        const url = note.url;
        if (typeof url !== "object" || Array.isArray(url)) {
          throw new Error("URL isn't object");
        }
        expect(url.type).toBe("Link");
        expect(url.href).toBe("https://example.com/presentation.pdf");
      });

      it("parses a Link url with a preview", async () => {
        const note = await transformAndValidate(Note, {
          ...SIMPLE_NOTE,
          url: {
            type: "Link",
            href: "https://example.com/presentation.pdf",
            preview: SIMPLE_NOTE,
          },
        });
        expect(note.url).toBeInstanceOf(Link);
        const url = note.url;
        if (typeof url !== "object" || Array.isArray(url)) {
          throw new Error("URL isn't object");
        }
        expect(url.preview).toBeInstanceOf(Note);
      });

      describe("parses real examples", () => {
        it.each([
          // https://mastodon.social/@Gargron/109610768945818122
          ["Mastodon post", "109610768945818122.json"],
        ])("parses %p (%p)", async (desc, filename) => {
          const file = await readFile(
            path.join(__dirname, "../test/fixtures/note", filename),
            "utf8",
          );
          const data = JSON.parse(file);
          const note = await transformAndValidate(Note, data);
          expect(note).toBeInstanceOf(Note);
        });
      });
    });
  });
});
