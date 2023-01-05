import {
  Equals,
  IsMimeType,
  IsObject,
  IsOptional,
  IsRFC3339,
  IsString,
  isURL,
  IsUrl,
} from "class-validator";
import {
  instanceToPlain,
  Transform,
  TransformationType,
  TransformFnParams,
} from "class-transformer";
import { transformAndValidateSync } from "class-transformer-validator";
import type { NotLiteral } from "./util/types";
import { Link } from "./Link";
import type { AnyLink } from "./Link";

export type CollectionType =
  | "Collection"
  | "OrderedCollection"
  | "CollectionPage"
  | "OrderedCollectionPage";

interface ObjectTransformationOptions {
  /**
   * By default, field is assumed to be an object instance, not a URL.
   * Provide `"url"` to allow values to be URL-formatted strings,
   * or `true` to allow any strings.
   */
  str?: boolean | "url";

  /**
   * Shortcut to add all {@link ASDocument} types to {@link allowed}.
   *
   * If {@link allowed} is not provided, it will be set to an array
   * and properties not listed in the array will be rejected.
   */
  anyDocument?: true;

  anyCollection?: true;

  /**
   * A set of {@link ASObject.type} values that can be transformed.
   * If omitted, any object may be used as a value.
   */
  allowed?: string[];

  /**
   * By default, all fields can be arrays.
   * Set `functional` to ensure the is are only a single value.
   */
  functional?: boolean;

  notNullable?: true;
}

function plainToClass(
  options: ObjectTransformationOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  { key }: TransformFnParams,
) {
  if (value === null) {
    if (options.notNullable === true) {
      throw new Error(`Failed to parse - '${key}' not allowed to be null`);
    }
    return value;
  }
  if (typeof value === "string") {
    if (options.str === "url") {
      if (!isURL(value)) {
        throw new Error("Value must be a URL (or Object/Link)");
      }
      return value;
    }
    if (options.str !== true) {
      throw new Error("Object cannot be a string");
    }
    return value;
  }
  if (typeof value !== "object" || !value || !("type" in value) || typeof value.type !== "string") {
    throw new Error(`Failed to parse '${key}': value is not an Object`);
  }
  const { type } = value;
  let allowed: undefined | string[] = options.allowed;
  if (options.anyDocument) {
    allowed = [...(allowed ?? []), "Document", "Audio", "Image", "Video", "Page"];
  }
  if (options.anyCollection) {
    allowed = [
      ...(allowed ?? []),
      "Collection",
      "OrderedCollection",
      "CollectionPage",
      "OrderedCollectionPage",
    ];
  }
  if (Array.isArray(allowed) && !allowed.includes(type)) {
    throw new Error(`Field is not allowed to be a ${type}.`);
  }
  switch (type) {
    case "Image":
      return transformAndValidateSync(Image, value);
    case "Link":
      return transformAndValidateSync(Link, value);
    case "Note":
      return transformAndValidateSync(Note, value);
    case "OrderedCollection":
      return transformAndValidateSync(OrderedCollection, value);
    case "Person":
      return transformAndValidateSync(Person, value);
    default:
      return transformAndValidateSync(ASObject, value);
  }
}

export function t(options: ObjectTransformationOptions) {
  return function objectTransformationFunction(params: TransformFnParams) {
    const { type, value } = params;
    if (params.type === TransformationType.PLAIN_TO_CLASS) {
      if (Array.isArray(value)) {
        if (options.functional === true) {
          throw new Error("Cannot provide an array of values.");
        }
        return value.map((v) => plainToClass(options, v, params));
      }
      return plainToClass(options, value, params);
    } else if (type === TransformationType.CLASS_TO_PLAIN) {
      return instanceToPlain(value);
    } else {
      throw new Error(`Unsupported transformation ${type}`);
    }
  };
}

export class ASObject<Type extends string> {
  @IsString()
  public readonly type: Type;

  /*
   * The following fields are defined by ActivityStreams:
   * https://www.w3.org/TR/activitystreams-vocabulary/#dfn-object
   */

  @IsOptional()
  @IsString()
  @IsUrl()
  id?: string;

  @IsOptional()
  @Transform(t({ str: "url" }))
  attachment?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  attributedTo?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  audience?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  // TODO: Validate
  contentMap?: Record<string, string>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  context?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  // TODO: Validate
  nameMap?: Record<string, string>;

  @IsOptional()
  @IsRFC3339()
  endTime?: string;

  @IsOptional()
  @Transform(t({ str: "url" }))
  generator?: NotLiteral<string | AnyObject>;

  @IsOptional()
  @Transform(t({ str: "url", allowed: ["Image", "Link", "Mention"] }))
  icon?: NotLiteral<string | Image | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url", anyDocument: true }))
  image?: NotLiteral<string | Document>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  inReplyTo?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  location?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  preview?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @IsRFC3339()
  published?: string;

  @IsOptional()
  @Transform(t({ str: "url", anyCollection: true, functional: true }))
  replies?: string | ASCollection;

  @IsOptional()
  @IsRFC3339()
  startTime?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  // TODO: validate
  summaryMap?: Record<string, string>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  tag?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @IsRFC3339()
  updated?: string;

  @IsOptional()
  @Transform(t({ str: "url" }))
  url?: NotLiteral<string | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  to?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  bto?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  cc?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  bcc?: NotLiteral<string | AnyObject | AnyLink>;

  @IsOptional()
  @IsMimeType()
  mediaType?: string;

  /**
   * When the object describes a time-bound resource, such as an audio or video, a meeting, etc,
   * the duration property indicates the object's approximate duration.
   * The value must be expressed as an xsd:duration as defined by [ xmlschema11-2], section 3.3.6
   * (e.g. a period of 5 seconds is represented as "PT5S").
   */
  @IsOptional()
  @IsString()
  duration?: string;

  /*
   * The following fields are defined by ActivityPub:
   * https://www.w3.org/TR/activitypub/#actor-objects
   */

  @IsOptional({
    groups: ["activitypub-actor", "activitypub"],
  })
  @Transform(t({ str: "url", allowed: ["OrderedCollection"], functional: true }), {
    groups: ["activitypub", "activitypub-actor"],
  })
  inbox?: string | OrderedCollection;

  @IsOptional({
    groups: ["activitypub-actor", "activitypub"],
  })
  @Transform(t({ str: "url", allowed: ["OrderedCollection"], functional: true }), {
    groups: ["activitypub", "activitypub-actor"],
  })
  outbox?: string | OrderedCollection;

  @IsOptional({
    groups: ["activitypub"],
  })
  @Transform(t({ str: "url", anyCollection: true, functional: true }), {
    groups: ["activitypub"],
  })
  following?: string | AnyCollection;

  @IsOptional({
    groups: ["activitypub"],
  })
  @Transform(t({ str: "url", anyCollection: true, functional: true }), {
    groups: ["activitypub"],
  })
  followers?: string | AnyCollection;

  @IsOptional({
    groups: ["activitypub"],
  })
  @Transform(t({ str: "url", anyCollection: true, functional: true }), {
    groups: ["activitypub"],
  })
  liked?: string | AnyCollection;

  @IsOptional({
    groups: ["activitypub"],
  })
  @IsString({ groups: ["activitypub"] })
  preferredUsername?: string;

  @IsOptional({
    groups: ["activitypub"],
  })
  @IsObject({ groups: ["activitypub"] })
  // TODO: validate
  preferredUsernameMap?: Record<string, string>;

  public constructor(type: Type) {
    this.type = type;
  }
}

export class Note extends ASObject<"Note"> {
  @Equals("Note")
  public override readonly type: "Note";

  public constructor() {
    super("Note");
    this.type = "Note";
  }
}

export class Person extends ASObject<"Person"> {
  @Equals("Person")
  public override readonly type: "Person";

  public constructor() {
    super("Person");
    this.type = "Person";
  }
}

export class ASDocument<
  Type extends "Document" | "Audio" | "Image" | "Video" | "Page",
> extends ASObject<Type> {}

export class Image extends ASDocument<"Image"> {
  @Equals("Image")
  public override readonly type: "Image";

  public constructor() {
    super("Image");
    this.type = "Image";
  }
}

export class ASCollection<Type extends CollectionType = CollectionType> extends ASObject<Type> {}

export class OrderedCollection extends ASCollection<"OrderedCollection"> {
  public override readonly type: "OrderedCollection";

  public constructor() {
    super("OrderedCollection");
    this.type = "OrderedCollection";
  }
}

export type AnyCollection = ASCollection<CollectionType> | OrderedCollection;

export type AnyObject = ASObject<string> | Note | Person | Image | OrderedCollection;
