import { client } from "./client";
import * as schema from "@/db/schema";
import {
	ContentTypeGroupUpdated,
	type Conversation,
	type DecodedMessage,
} from "@xmtp/mls-client";
import type { GroupUpdated } from "@xmtp/proto/ts/dist/types/mls/message_contents/transcript_messages.pb";
import {
	type LinkedGroupWallet,
	LinkGroupWalletContentType,
} from "./content-types/link-wallet";
import { storeGroupWallets } from "@/actions/store-group-wallets";
import { db } from "@/db";

export async function setupListeners() {
	console.log("Setting up listeners");
	// sync the conversations in the local libxmtp database
	await client.conversations.sync();

	await fullResync();

	// TODO: add a resync function to get the latest since last sync

	await Promise.all([streamConversations(), streamMessages()]);
}

async function streamConversations() {
	while (true) {
		try {
			for await (const group of client.conversations.stream()) {
				if (!group) continue;
				if (process?.env?.NODE_ENV === "development") {
					console.log("incoming group", group);
					console.log("incoming message", group.messages());
				}
				await db
					.insert(schema.groups)
					.values({ id: group.id })
					.onConflictDoNothing();
				// handleConversation(version, conversation);
			}
		} catch (e) {
			console.log("Restart conversation stream:", e);
		}
	}
}

async function streamMessages() {
	while (true) {
		const stream = await client.conversations.streamAllMessages();
		try {
			for await (const message of stream) {
				if (!message) continue;

				// biome-ignore lint/style/noNonNullAssertion: a message from an existing conversation so it should exist
				const conversation = client.conversations.getConversationById(
					message.conversationId,
				)!;

				handleMessage(message, conversation);
			}
		} catch (e) {
			console.log("Restart stream:", e);
		}
	}
}

async function fullResync(shouldSync = false) {
	if (shouldSync) await client.conversations.sync();
	const groups = await client.conversations.list();

	await Promise.all(
		groups.map(async (group) => {
			const messages = group.messages();
			const linkedWalletsToStore = messages
				.filter((msg) => isLinkGroupWalletMessage(msg))
				.map((msg) => {
					const { content: linkedWallet } = msg;
					return { groupId: group.id, linkedWallet };
				});

			if (linkedWalletsToStore.length > 0)
				await storeGroupWallets(linkedWalletsToStore);
		}),
	);
}

async function handleMessage(
	message: Omit<DecodedMessage, "content"> & { content: unknown },
	group: Conversation,
) {
	if (process?.env?.NODE_ENV === "development")
		console.log(
			`incoming_${message?.contentType.typeId}:`,
			typeof message?.content === "string"
				? message // ?.content
				: message?.contentType.typeId,
		);

	switch (true) {
		case isLinkGroupWalletMessage(message): {
			const { content: linkedWallet } = message as {
				content: LinkedGroupWallet;
			};
			await storeGroupWallets([{ groupId: group.id, linkedWallet }]);
			console.log("link-wallet", linkedWallet);
			break;
		}

		case isGroupUpdatedMessage(message): {
			const { content } = message as { content: GroupUpdated };
			console.log("group-updated", content);
			break;
		}

		default:
			console.log("unknown message", message);
			break;
	}
}

function isGroupUpdatedMessage(
	message: Omit<DecodedMessage, "content"> & { content: unknown },
): message is DecodedMessage & { content: GroupUpdated } {
	return ContentTypeGroupUpdated.sameAs(message.contentType);
}

function isLinkGroupWalletMessage(
	message: Omit<DecodedMessage, "content"> & { content: unknown },
): message is DecodedMessage & { content: LinkedGroupWallet } {
	return LinkGroupWalletContentType.sameAs(message.contentType);
}
