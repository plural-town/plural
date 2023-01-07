import type { Role } from "@prisma/client";
import * as Yup from "yup";

export const RoleSchema = Yup.mixed<Role>().oneOf(["OWNER", "ADMIN", "MOD", "USER"]);
