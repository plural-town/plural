import { Equals, IsMimeType, IsObject, IsOptional, IsRFC3339, IsString, isURL, IsUrl } from "class-validator";
import { instanceToPlain, Transform, TransformationType, TransformFnParams } from "class-transformer";
import { transformAndValidateSync } from "class-transformer-validator";
import { NotLiteral } from "./util/types";
import { ASLink, Link } from "./Link";

export type CollectionType
  = "Collection"
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function plainToClass(options: ObjectTransformationOptions, value: any, { key }: TransformFnParams) {
  if(value === null) {
    if(options.notNullable === true) {
      throw new Error(`Failed to parse - '${key}' not allowed to be null`);
    }
    return value;
  }
  if(typeof value === "string") {
    if(options.str === "url") {
      if(!isURL(value)) {
        throw new Error("Value must be a URL (or Object/Link)");
      }
      return value;
    }
    if(options.str !== true) {
      throw new Error("Object cannot be a string");
    }
    return value;
  }
  if(typeof value !== "object" || !value || !("type" in value) || typeof value.type !== "string") {
    throw new Error(`Failed to parse '${key}': value is not an Object`);
  }
  const { type } = value;
  let allowed: undefined | string[] = options.allowed;
  if(options.anyDocument) {
    allowed = [...(allowed ?? []), "Document", "Audio", "Image", "Video", "Page"];
  }
  if(options.anyCollection) {
    allowed = [...(allowed ?? []), "Collection", "OrderedCollection", "CollectionPage", "OrderedCollectionPage"];
  }
  if(Array.isArray(allowed) && !allowed.includes(type)) {
    throw new Error(`Field is not allowed to be a ${type}.`);
  }
  switch (type) {
    case "Image":
      return transformAndValidateSync(Image, value);
    case "Link":
      return transformAndValidateSync(Link, value);
    case "Note":
      return transformAndValidateSync(Note, value);
    default:
      return transformAndValidateSync(ASObject, value);
  }
}

export function t(options: ObjectTransformationOptions) {
  return function objectTransformationFunction(params: TransformFnParams) {
    const { type, value } = params;
    if(params.type === TransformationType.PLAIN_TO_CLASS) {
      if(Array.isArray(value)) {
        if(options.functional === true) {
          throw new Error("Cannot provide an array of values.");
        }
        return value.map(v => plainToClass(options, v, params));
      }
      return plainToClass(options, value, params);
    } else if(type === TransformationType.CLASS_TO_PLAIN) {
      return instanceToPlain(value);
    } else {
      throw new Error(`Unsupported transformation ${type}`);
    }
  }
}

export class ASObject<Type extends string> {

  @IsString()
  public readonly type: Type;

  @IsOptional()
  @IsString()
  @IsUrl()
  id?: string;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: include any Link
  attachment?: NotLiteral<string | ASObject<string> | ASLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: include any Link
  attributedTo?: NotLiteral<string | ASObject<string> | ASLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  audience?: NotLiteral<string | ASObject<string> | ASLink>;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  // TODO: Validate
  contentMap?: Record<string, string>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  context?: NotLiteral<string | ASObject<string>>;

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
  generator?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @Transform(t({ str: "url", allowed: [ "Image", "Link", "Mention" ]}))
  // TODO: Include any Link
  icon?: NotLiteral<string | Image>;

  @IsOptional()
  @Transform(t({ str: "url", anyDocument: true }))
  image?: NotLiteral<string | Document>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: include any Link
  inReplyTo?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  location?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  preview?: NotLiteral<string | ASObject<string>>;

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
  // TODO: Include any Link
  tag?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @IsRFC3339()
  updated?: string;

  @IsOptional()
  @Transform(t({ str: "url" }))
  url?: NotLiteral<string | ASLink>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  to?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  bto?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  cc?: NotLiteral<string | ASObject<string>>;

  @IsOptional()
  @Transform(t({ str: "url" }))
  // TODO: Include any Link
  bcc?: NotLiteral<string | ASObject<string>>;

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

export class ASCollection<
  Type extends CollectionType = CollectionType,
> extends ASObject<Type> {}
