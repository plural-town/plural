import { readFileSync, writeFileSync } from "fs";
import path from "path";

// Execute with: node path/to/version-features.mjs {target release}
const [, , version] = process.argv;

const file = path.join(__dirname, "../../features.todo");

const existing = readFileSync(file, "utf8");

const date = new Date();
const y = date.getFullYear().slice(2);
const m = date.getMonth();
const d = date.getDate();

const updated = existing
  .replace(/<VERSION>/g, `v${version}`)
  .replace(/<BRANCH>/g, `${y}-${m}-${d}`);

fileWriteSync(file, updated);