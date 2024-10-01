import type { Hex } from "viem";
import { ContentTypeId } from "@xmtp/content-type-primitives";
import type {
	ContentCodec,
	EncodedContent,
} from "@xmtp/content-type-primitives";
import type { WalletAddress } from "@/db/schema";

export const LinkGroupWalletContentType: ContentTypeId = new ContentTypeId({
	authorityId: "chat.onit",
	typeId: "linkGroupWallet",
	versionMajor: 1,
	versionMinor: 0,
});

export interface LinkGroupWallet {
	address: WalletAddress;
	factory?: WalletAddress;
	factoryData?: Hex;
}

export class LinkedGroupWallet {
	constructor(
		public address: WalletAddress,
		public factory: WalletAddress | undefined = undefined,
		public factoryData: Hex | undefined = undefined,
	) {}
}

export class LinkGroupWalletContentTypeCodec
	implements ContentCodec<LinkedGroupWallet>
{
	get contentType() {
		return LinkGroupWalletContentType;
	}

	encode(decoded: LinkedGroupWallet): EncodedContent {
		return {
			type: LinkGroupWalletContentType,
			parameters: {
				address: decoded.address,
				...(decoded.factory && { factory: decoded.factory }),
				...(decoded.factoryData && { factoryData: decoded.factoryData }),
			},
			content: new Uint8Array(),
		};
	}

	decode(encoded: EncodedContent): LinkedGroupWallet {
		const { address, factory, factoryData } = encoded.parameters;
		return new LinkedGroupWallet(
			address as WalletAddress,
			factory as WalletAddress | undefined,
			factoryData as Hex | undefined,
		);
	}

	fallback(content: LinkedGroupWallet): string {
		return `This app doesn't support linking group wallets. 

    The wallet ${content.address} was linked to this chat.

    Download https://onit.chat to manage the group wallet from your group chat!`;
	}

	shouldPush(_content: LinkedGroupWallet): boolean {
		return true;
	}
}
