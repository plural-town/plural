import { FieldLanguage, PrismaClient, REField, RemoteEntity } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { storeRemoteFields } from "./storeRemoteFields";

const NOTE: RemoteEntity = {
  id: "1234",
  protocol: "ACTIVITYSTREAMS",
  type: "NOTE",
  url: "https://example.com/notes/123",
  firstSeenAt: new Date(),
  updatedAt: new Date(),
};

const DEFAULT_NAME: REField = {
  id: "name123",
  entityId: NOTE.id,
  field: "NAME",
  lang: null,
  value: "Jay",
  verified: true,
};

const DEFAULT_URL: REField = {
  id: "url123",
  entityId: NOTE.id,
  field: "URL",
  lang: null,
  value: "https://example.com/notes/123",
  verified: true,
};

const EN_NAME: REField = {
  ...DEFAULT_NAME,
  lang: "EN",
};

const UPDATE_EN = {
  en: "Hello World",
} as const;

describe("storeRemoteFields", () => {
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
  });

  describe.each([
    ["without any existing fields", []],
    ["with existing fields for other properties", [DEFAULT_URL]],
  ])("%s", (desc, fields) => {
    const missingValue: RemoteEntity & { fields: REField[] } = {
      ...NOTE,
      fields,
    };

    it.each(["verified", "unverified"])("will insert %p default values", async (v) => {
      await storeRemoteFields(prisma, missingValue, "NAME", v === "verified", "Hello World");
      expect(prisma.rEField.create).toBeCalledWith({
        data: {
          entityId: NOTE.id,
          field: "NAME",
          verified: v === "verified",
          value: "Hello World",
        },
      });
      expect(prisma.rEField.create).toHaveBeenCalledTimes(1);
      expect(prisma.rEField.update).not.toHaveBeenCalled();
    });

    it.each(["verified", "unverified"])("will insert %p translations", async (v) => {
      await storeRemoteFields(prisma, missingValue, "NAME", v === "verified", undefined, UPDATE_EN);
      expect(prisma.rEField.create).toBeCalledWith({
        data: {
          entityId: NOTE.id,
          field: "NAME",
          lang: FieldLanguage.EN,
          verified: v === "verified",
          value: UPDATE_EN.en,
        },
      });
      expect(prisma.rEField.create).toHaveBeenCalledTimes(1);
      expect(prisma.rEField.update).not.toHaveBeenCalled();
    });

    it.each(["verified", "unverified"])(
      "will insert both default and translated %p values",
      async (v) => {
        await storeRemoteFields(prisma, missingValue, "NAME", v === "verified", "Hello", UPDATE_EN);
        expect(prisma.rEField.create).toBeCalledWith({
          data: {
            entityId: NOTE.id,
            field: "NAME",
            verified: v === "verified",
            value: "Hello",
          },
        });
        expect(prisma.rEField.create).toBeCalledWith({
          data: {
            entityId: NOTE.id,
            field: "NAME",
            lang: FieldLanguage.EN,
            verified: v === "verified",
            value: UPDATE_EN.en,
          },
        });
        expect(prisma.rEField.create).toHaveBeenCalledTimes(2);
        expect(prisma.rEField.update).not.toHaveBeenCalled();
      },
    );
  });

  describe("with existing verified default", () => {
    const verifiedDefault: RemoteEntity & { fields: REField[] } = {
      ...NOTE,
      fields: [DEFAULT_NAME],
    };

    it("will update with verified data", async () => {
      await storeRemoteFields(prisma, verifiedDefault, "NAME", true, "Hello World");
      expect(prisma.rEField.update).toBeCalledWith({
        where: {
          id: DEFAULT_NAME.id,
        },
        data: {
          value: "Hello World",
        },
      });
      expect(prisma.rEField.update).toBeCalledTimes(1);
      expect(prisma.rEField.create).not.toHaveBeenCalled();
    });

    it("will add new verified translations", async () => {
      await storeRemoteFields(prisma, verifiedDefault, "NAME", true, undefined, UPDATE_EN);
      expect(prisma.rEField.create).toBeCalledWith({
        data: {
          entityId: NOTE.id,
          field: "NAME",
          lang: FieldLanguage.EN,
          verified: true,
          value: UPDATE_EN.en,
        },
      });
      expect(prisma.rEField.create).toBeCalledTimes(1);
      expect(prisma.rEField.update).not.toHaveBeenCalled();
    });

    it("will reject unverified defaults", async () => {
      await storeRemoteFields(prisma, verifiedDefault, "NAME", false, "Hello World");
      expect(prisma.rEField.create).not.toHaveBeenCalled();
      expect(prisma.rEField.update).not.toHaveBeenCalled();
    });

    it("will reject unverified translations", async () => {
      await storeRemoteFields(prisma, verifiedDefault, "NAME", false, undefined, UPDATE_EN);
      expect(prisma.rEField.create).not.toHaveBeenCalled();
      expect(prisma.rEField.update).not.toHaveBeenCalled();
    });

    it("will update defaults and store translations, if provided both", async () => {
      await storeRemoteFields(prisma, verifiedDefault, "NAME", true, "Hello", UPDATE_EN);
      expect(prisma.rEField.update).toBeCalledWith({
        where: {
          id: DEFAULT_NAME.id,
        },
        data: {
          value: "Hello",
        },
      });
      expect(prisma.rEField.create).toBeCalledWith({
        data: {
          entityId: NOTE.id,
          field: "NAME",
          lang: FieldLanguage.EN,
          verified: true,
          value: UPDATE_EN.en,
        },
      });
      expect(prisma.rEField.update).toHaveBeenCalledTimes(1);
      expect(prisma.rEField.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("with existing verified translations", () => {
    const verifiedTranslation: RemoteEntity & { fields: REField[] } = {
      ...NOTE,
      fields: [EN_NAME],
    };

    it("will update translation with verified data", async () => {
      await storeRemoteFields(prisma, verifiedTranslation, "NAME", true, undefined, UPDATE_EN);
      expect(prisma.rEField.update).toBeCalledWith({
        where: {
          id: EN_NAME.id,
        },
        data: {
          value: UPDATE_EN.en,
        },
      });
      expect(prisma.rEField.update).toBeCalledTimes(1);
      expect(prisma.rEField.create).not.toBeCalled();
    });

    it("will insert verified defaults", async () => {
      await storeRemoteFields(prisma, verifiedTranslation, "NAME", true, "Hello World");
      expect(prisma.rEField.create).toBeCalledWith({
        data: {
          entityId: NOTE.id,
          field: "NAME",
          verified: true,
          value: "Hello World",
        },
      });
    });

    it("will ignore unknown languages", async () => {
      await storeRemoteFields(prisma, verifiedTranslation, "NAME", true, undefined, {
        not_lang: "Hello",
      });
      expect(prisma.rEField.update).not.toBeCalled();
      expect(prisma.rEField.create).not.toBeCalled();
    });

    it("will ignore unchanged values", async () => {
      await storeRemoteFields(prisma, verifiedTranslation, "NAME", true, undefined, {
        [FieldLanguage.EN]: EN_NAME.value,
      });
      expect(prisma.rEField.update).not.toBeCalled();
      expect(prisma.rEField.create).not.toBeCalled();
    });
  });
});
