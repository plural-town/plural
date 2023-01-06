import { MongoAbility } from "@casl/ability";
import { Action } from "@plural-town/acl-models";

export type PluralTownAbility = MongoAbility<[Action, "AdminDashboard"]>;
