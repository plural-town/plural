import { MongoAbility, MongoQuery, SubjectRawRule } from "@casl/ability";
import { Action } from "@plural-town/acl-models";

export type PluralTownSubject = "AdminDashboard" | "AdminSiteSettings";

export type PluralTownRule = SubjectRawRule<
  Action,
  PluralTownSubject,
  MongoQuery<Record<PropertyKey, unknown>>
>;

export type PluralTownAbility = MongoAbility<[Action, PluralTownSubject]>;
