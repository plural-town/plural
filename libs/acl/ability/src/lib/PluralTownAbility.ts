import { InferSubjects, MongoAbility, RawRuleOf } from "@casl/ability";
import { Action, IdentityAction } from "@plural-town/acl-models";
import type { AccountDoc, IdentityDoc } from "@plural/schema";
import type { AdminDashboard } from "./subjects/AdminDashboard";

type AccountAbility = [Action, InferSubjects<AccountDoc>];
type IdentityAbility = [IdentityAction, InferSubjects<IdentityDoc>];
type AdminDashboardAbility = [Action, InferSubjects<AdminDashboard>];

type PluralTownRawAbility = AccountAbility | IdentityAbility | AdminDashboardAbility;

export type PluralTownAbility = MongoAbility<PluralTownRawAbility>;

export type PluralTownRule = RawRuleOf<PluralTownAbility>;
