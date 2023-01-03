import { Transform } from "class-transformer";
import { Equals, IsMimeType, IsNumber, IsObject, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { ASObject, t } from "./Object";
import { NotLiteral } from "./util/types";

export class ASLink<Type extends string = string> {

  @IsString()
  public readonly type: string;

  @IsOptional()
  @IsUrl()
  href?: string;

  @IsOptional()
  rel?: string | string[];

  @IsOptional()
  @IsMimeType()
  mediaType?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  // TODO: validate
  nameMap?: Record<string, string>;

  @IsOptional()
  @IsString()
  // TODO: Validate BCP47 Language-Tag
  hreflang?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @Transform(t({ str: "url" }))
  preview?: NotLiteral<string | ASLink | ASObject<string>>;

  public constructor(type: Type) {
    this.type = type;
  }

}

export class Link extends ASLink<"Link"> {

  @Equals("Link")
  public override readonly type: "Link";

  public constructor() {
    super("Link");
    this.type = "Link";
  }

}

export type AnyLink
  = ASLink<string>
  | Link;
