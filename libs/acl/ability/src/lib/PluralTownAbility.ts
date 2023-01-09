import { InferSubjects, MongoAbility, RawRuleOf } from "@casl/ability";
import { Action, IdentityAction } from "@plural-town/acl-models";
import type { IdentityDoc } from "@plural/schema";
import type { AdminDashboard } from "./subjects/AdminDashboard";

type IdentityAbility = [IdentityAction, InferSubjects<IdentityDoc>];
type AdminDashboardAbility = [Action, InferSubjects<AdminDashboard>];

type PluralTownRawAbility = IdentityAbility | AdminDashboardAbility;

export type PluralTownAbility = MongoAbility<PluralTownRawAbility>;

export type PluralTownRule = RawRuleOf<PluralTownAbility>;
