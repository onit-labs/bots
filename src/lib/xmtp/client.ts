import { libxmtpDbPath } from "../../db";
import { createClient } from "./cli";

export const bot = await createClient(libxmtpDbPath);