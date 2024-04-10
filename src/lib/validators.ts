import { t } from "elysia";
import * as z from "zod";

export const uuid25Schema = z.string().length(25).brand("Uuid25");
export const uuidv7Schema = z.string().length(36).brand("Uuidv7");

export type Uuidv7 = z.infer<typeof uuidv7Schema>;
export type Uuid25 = z.infer<typeof uuid25Schema>;

export const HexLiteral = t.TemplateLiteral("0x${string}");
export const AddressLiteral = t.TemplateLiteral("0x${string}");
export const ChainAwareAddressLiteral = t.TemplateLiteral(
	"${string}:0x${string}",
);

export const AddressOrChainAwareAddress = t.Union([
	AddressLiteral,
	ChainAwareAddressLiteral,
]);
