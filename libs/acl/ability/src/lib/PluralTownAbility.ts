import {
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
  SubjectRawRule,
} from "@casl/ability";
import { Action } from "@plural-town/acl-models";
import { AdminDashboard } from "./subjects/AdminDashboard";

export type PluralTownSubject = InferSubjects<AdminDashboard>;

export type PluralTownRule = SubjectRawRule<
  Action,
  ExtractSubjectType<PluralTownSubject>,
  MongoQuery<Record<PropertyKey, unknown>>
>;

export type PluralTownAbility = MongoAbility<[Action, PluralTownSubject]>;
