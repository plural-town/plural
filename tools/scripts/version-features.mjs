import { readFileSync, writeFileSync } from "fs";

// Execute with: node path/to/version-features.mjs {target release}
const [, , version] = process.argv;

const file = "features.todo";

const existing = readFileSync(file, "utf8");

const date = new Date();
const y = date.getFullYear().toString().slice(2);
const m = date.getMonth() + 1;
const d = date.getDate();

const updated = existing
  .replace(/<VERSION>/g, `${version}`)
  .replace(/<BRANCH>/g, `${y}-${m}-${d}`);

writeFileSync(file, updated);
