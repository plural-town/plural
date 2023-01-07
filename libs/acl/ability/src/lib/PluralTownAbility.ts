import {
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
  SubjectRawRule,
} from "@casl/ability";
import { Action } from "@plural-town/acl-models";
import type { IdentityDoc } from "@plural/schema";
import type { AdminDashboard } from "./subjects/AdminDashboard";

export type PluralTownSubject = InferSubjects<AdminDashboard | IdentityDoc>;

export type PluralTownRule = SubjectRawRule<
  Action,
  ExtractSubjectType<PluralTownSubject>,
  MongoQuery<Record<PropertyKey, unknown>>
>;

export type PluralTownAbility = MongoAbility<[Action, PluralTownSubject]>;
