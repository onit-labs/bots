import { t } from "elysia";

export const HexLiteral = t.TemplateLiteral("0x${string}");
export const AddressLiteral = t.TemplateLiteral("0x${string}");
export const ChainAwareAddressLiteral = t.TemplateLiteral(
	"${string}:0x${string}",
);

export const WalletAddressLiteral = t.Union([
	AddressLiteral,
	ChainAwareAddressLiteral,
]);
