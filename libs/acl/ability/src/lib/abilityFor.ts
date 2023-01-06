import { createMongoAbility } from "@casl/ability";
import { PluralTownAbility, PluralTownRule } from "./PluralTownAbility";

export function abilityFor(rules: PluralTownRule[]) {
  return createMongoAbility<PluralTownAbility>(rules, {
    detectSubjectType: (s) => s.kind,
  });
}
