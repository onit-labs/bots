import { uuidv7 } from "uuidv7";
import type { Uuidv7 } from "../lib/validators";

export const generateUuid7 = (...args: Parameters<typeof uuidv7>) =>
	uuidv7(...args) as Uuidv7;
