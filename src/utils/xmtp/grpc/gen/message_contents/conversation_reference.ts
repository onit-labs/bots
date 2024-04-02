// @generated by protobuf-ts 2.9.1
// @generated from protobuf file "message_contents/conversation_reference.proto" (package "xmtp.message_contents", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { InvitationV1_Context } from "./invitation";
/**
 * A light pointer for a conversation that contains no decryption keys
 *
 * @generated from protobuf message xmtp.message_contents.ConversationReference
 */
export interface ConversationReference {
    /**
     * @generated from protobuf field: string topic = 1;
     */
    topic: string;
    /**
     * @generated from protobuf field: string peer_address = 2;
     */
    peerAddress: string;
    /**
     * @generated from protobuf field: uint64 created_ns = 3;
     */
    createdNs: bigint;
    /**
     * @generated from protobuf field: xmtp.message_contents.InvitationV1.Context context = 4;
     */
    context?: InvitationV1_Context;
}
// @generated message type with reflection information, may provide speed optimized methods
class ConversationReference$Type extends MessageType<ConversationReference> {
    constructor() {
        super("xmtp.message_contents.ConversationReference", [
            { no: 1, name: "topic", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "peer_address", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "created_ns", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 4, name: "context", kind: "message", T: () => InvitationV1_Context }
        ]);
    }
    create(value?: PartialMessage<ConversationReference>): ConversationReference {
        const message = { topic: "", peerAddress: "", createdNs: 0n };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<ConversationReference>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ConversationReference): ConversationReference {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string topic */ 1:
                    message.topic = reader.string();
                    break;
                case /* string peer_address */ 2:
                    message.peerAddress = reader.string();
                    break;
                case /* uint64 created_ns */ 3:
                    message.createdNs = reader.uint64().toBigInt();
                    break;
                case /* xmtp.message_contents.InvitationV1.Context context */ 4:
                    message.context = InvitationV1_Context.internalBinaryRead(reader, reader.uint32(), options, message.context);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ConversationReference, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string topic = 1; */
        if (message.topic !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.topic);
        /* string peer_address = 2; */
        if (message.peerAddress !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.peerAddress);
        /* uint64 created_ns = 3; */
        if (message.createdNs !== 0n)
            writer.tag(3, WireType.Varint).uint64(message.createdNs);
        /* xmtp.message_contents.InvitationV1.Context context = 4; */
        if (message.context)
            InvitationV1_Context.internalBinaryWrite(message.context, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.ConversationReference
 */
export const ConversationReference = new ConversationReference$Type();
