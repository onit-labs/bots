// @generated by protobuf-ts 2.9.1
// @generated from protobuf file "message_contents/invitation.proto" (package "xmtp.message_contents", syntax proto3)
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
import { Ciphertext } from "./ciphertext";
import { SignedPublicKeyBundle } from "./public_key";
/**
 * Unsealed invitation V1
 *
 * @generated from protobuf message xmtp.message_contents.InvitationV1
 */
export interface InvitationV1 {
    /**
     * topic name chosen for this conversation.
     * It MUST be randomly generated bytes (length >= 32),
     * then base64 encoded without padding
     *
     * @generated from protobuf field: string topic = 1;
     */
    topic: string;
    /**
     * A context object defining metadata
     *
     * @generated from protobuf field: xmtp.message_contents.InvitationV1.Context context = 2;
     */
    context?: InvitationV1_Context;
    /**
     * @generated from protobuf oneof: encryption
     */
    encryption: {
        oneofKind: "aes256GcmHkdfSha256";
        /**
         * Specify the encryption method to process the key material properly.
         *
         * @generated from protobuf field: xmtp.message_contents.InvitationV1.Aes256gcmHkdfsha256 aes256_gcm_hkdf_sha256 = 3;
         */
        aes256GcmHkdfSha256: InvitationV1_Aes256gcmHkdfsha256;
    } | {
        oneofKind: undefined;
    };
}
/**
 * Supported encryption schemes
 * AES256-GCM-HKDF-SHA256
 *
 * @generated from protobuf message xmtp.message_contents.InvitationV1.Aes256gcmHkdfsha256
 */
export interface InvitationV1_Aes256gcmHkdfsha256 {
    /**
     * @generated from protobuf field: bytes key_material = 1;
     */
    keyMaterial: Uint8Array; // randomly generated key material (32 bytes)
}
/**
 * The context type
 *
 * @generated from protobuf message xmtp.message_contents.InvitationV1.Context
 */
export interface InvitationV1_Context {
    /**
     * Expected to be a URI (ie xmtp.org/convo1)
     *
     * @generated from protobuf field: string conversation_id = 1;
     */
    conversationId: string;
    /**
     * Key value map of additional metadata that would be exposed to
     * application developers and could be used for filtering
     *
     * @generated from protobuf field: map<string, string> metadata = 2;
     */
    metadata: {
        [key: string]: string;
    };
}
/**
 * Sealed Invitation V1 Header
 * Header carries information that is unencrypted, thus readable by the network
 * it is however authenticated as associated data with the AEAD scheme used
 * to encrypt the invitation body, thus providing tamper evidence.
 *
 * @generated from protobuf message xmtp.message_contents.SealedInvitationHeaderV1
 */
export interface SealedInvitationHeaderV1 {
    /**
     * @generated from protobuf field: xmtp.message_contents.SignedPublicKeyBundle sender = 1;
     */
    sender?: SignedPublicKeyBundle;
    /**
     * @generated from protobuf field: xmtp.message_contents.SignedPublicKeyBundle recipient = 2;
     */
    recipient?: SignedPublicKeyBundle;
    /**
     * @generated from protobuf field: uint64 created_ns = 3;
     */
    createdNs: bigint;
}
/**
 * Sealed Invitation V1
 * Invitation encrypted with key material derived from the sender's and
 * recipient's public key bundles using simplified X3DH where
 * the sender's ephemeral key is replaced with sender's pre-key.
 *
 * @generated from protobuf message xmtp.message_contents.SealedInvitationV1
 */
export interface SealedInvitationV1 {
    /**
     * encoded SealedInvitationHeaderV1 used as associated data for Ciphertext
     *
     * @generated from protobuf field: bytes header_bytes = 1;
     */
    headerBytes: Uint8Array;
    /**
     * Ciphertext.payload MUST contain encrypted InvitationV1.
     *
     * @generated from protobuf field: xmtp.message_contents.Ciphertext ciphertext = 2;
     */
    ciphertext?: Ciphertext;
}
/**
 * Versioned Sealed Invitation
 *
 * @generated from protobuf message xmtp.message_contents.SealedInvitation
 */
export interface SealedInvitation {
    /**
     * @generated from protobuf oneof: version
     */
    version: {
        oneofKind: "v1";
        /**
         * @generated from protobuf field: xmtp.message_contents.SealedInvitationV1 v1 = 1;
         */
        v1: SealedInvitationV1;
    } | {
        oneofKind: undefined;
    };
}
// @generated message type with reflection information, may provide speed optimized methods
class InvitationV1$Type extends MessageType<InvitationV1> {
    constructor() {
        super("xmtp.message_contents.InvitationV1", [
            { no: 1, name: "topic", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "context", kind: "message", T: () => InvitationV1_Context },
            { no: 3, name: "aes256_gcm_hkdf_sha256", kind: "message", oneof: "encryption", T: () => InvitationV1_Aes256gcmHkdfsha256 }
        ]);
    }
    create(value?: PartialMessage<InvitationV1>): InvitationV1 {
        const message = { topic: "", encryption: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<InvitationV1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: InvitationV1): InvitationV1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string topic */ 1:
                    message.topic = reader.string();
                    break;
                case /* xmtp.message_contents.InvitationV1.Context context */ 2:
                    message.context = InvitationV1_Context.internalBinaryRead(reader, reader.uint32(), options, message.context);
                    break;
                case /* xmtp.message_contents.InvitationV1.Aes256gcmHkdfsha256 aes256_gcm_hkdf_sha256 */ 3:
                    message.encryption = {
                        oneofKind: "aes256GcmHkdfSha256",
                        aes256GcmHkdfSha256: InvitationV1_Aes256gcmHkdfsha256.internalBinaryRead(reader, reader.uint32(), options, (message.encryption as any).aes256GcmHkdfSha256)
                    };
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
    internalBinaryWrite(message: InvitationV1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string topic = 1; */
        if (message.topic !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.topic);
        /* xmtp.message_contents.InvitationV1.Context context = 2; */
        if (message.context)
            InvitationV1_Context.internalBinaryWrite(message.context, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* xmtp.message_contents.InvitationV1.Aes256gcmHkdfsha256 aes256_gcm_hkdf_sha256 = 3; */
        if (message.encryption.oneofKind === "aes256GcmHkdfSha256")
            InvitationV1_Aes256gcmHkdfsha256.internalBinaryWrite(message.encryption.aes256GcmHkdfSha256, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.InvitationV1
 */
export const InvitationV1 = new InvitationV1$Type();
// @generated message type with reflection information, may provide speed optimized methods
class InvitationV1_Aes256gcmHkdfsha256$Type extends MessageType<InvitationV1_Aes256gcmHkdfsha256> {
    constructor() {
        super("xmtp.message_contents.InvitationV1.Aes256gcmHkdfsha256", [
            { no: 1, name: "key_material", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<InvitationV1_Aes256gcmHkdfsha256>): InvitationV1_Aes256gcmHkdfsha256 {
        const message = { keyMaterial: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<InvitationV1_Aes256gcmHkdfsha256>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: InvitationV1_Aes256gcmHkdfsha256): InvitationV1_Aes256gcmHkdfsha256 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes key_material */ 1:
                    message.keyMaterial = reader.bytes();
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
    internalBinaryWrite(message: InvitationV1_Aes256gcmHkdfsha256, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes key_material = 1; */
        if (message.keyMaterial.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.keyMaterial);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.InvitationV1.Aes256gcmHkdfsha256
 */
export const InvitationV1_Aes256gcmHkdfsha256 = new InvitationV1_Aes256gcmHkdfsha256$Type();
// @generated message type with reflection information, may provide speed optimized methods
class InvitationV1_Context$Type extends MessageType<InvitationV1_Context> {
    constructor() {
        super("xmtp.message_contents.InvitationV1.Context", [
            { no: 1, name: "conversation_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value?: PartialMessage<InvitationV1_Context>): InvitationV1_Context {
        const message = { conversationId: "", metadata: {} };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<InvitationV1_Context>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: InvitationV1_Context): InvitationV1_Context {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string conversation_id */ 1:
                    message.conversationId = reader.string();
                    break;
                case /* map<string, string> metadata */ 2:
                    this.binaryReadMap2(message.metadata, reader, options);
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
    private binaryReadMap2(map: InvitationV1_Context["metadata"], reader: IBinaryReader, options: BinaryReadOptions): void {
        let len = reader.uint32(), end = reader.pos + len, key: keyof InvitationV1_Context["metadata"] | undefined, val: InvitationV1_Context["metadata"][any] | undefined;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.string();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field xmtp.message_contents.InvitationV1.Context.metadata");
            }
        }
        map[key ?? ""] = val ?? "";
    }
    internalBinaryWrite(message: InvitationV1_Context, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string conversation_id = 1; */
        if (message.conversationId !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.conversationId);
        /* map<string, string> metadata = 2; */
        for (let k of Object.keys(message.metadata))
            writer.tag(2, WireType.LengthDelimited).fork().tag(1, WireType.LengthDelimited).string(k).tag(2, WireType.LengthDelimited).string(message.metadata[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.InvitationV1.Context
 */
export const InvitationV1_Context = new InvitationV1_Context$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SealedInvitationHeaderV1$Type extends MessageType<SealedInvitationHeaderV1> {
    constructor() {
        super("xmtp.message_contents.SealedInvitationHeaderV1", [
            { no: 1, name: "sender", kind: "message", T: () => SignedPublicKeyBundle },
            { no: 2, name: "recipient", kind: "message", T: () => SignedPublicKeyBundle },
            { no: 3, name: "created_ns", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ }
        ]);
    }
    create(value?: PartialMessage<SealedInvitationHeaderV1>): SealedInvitationHeaderV1 {
        const message = { createdNs: 0n };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SealedInvitationHeaderV1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SealedInvitationHeaderV1): SealedInvitationHeaderV1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.message_contents.SignedPublicKeyBundle sender */ 1:
                    message.sender = SignedPublicKeyBundle.internalBinaryRead(reader, reader.uint32(), options, message.sender);
                    break;
                case /* xmtp.message_contents.SignedPublicKeyBundle recipient */ 2:
                    message.recipient = SignedPublicKeyBundle.internalBinaryRead(reader, reader.uint32(), options, message.recipient);
                    break;
                case /* uint64 created_ns */ 3:
                    message.createdNs = reader.uint64().toBigInt();
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
    internalBinaryWrite(message: SealedInvitationHeaderV1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.message_contents.SignedPublicKeyBundle sender = 1; */
        if (message.sender)
            SignedPublicKeyBundle.internalBinaryWrite(message.sender, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* xmtp.message_contents.SignedPublicKeyBundle recipient = 2; */
        if (message.recipient)
            SignedPublicKeyBundle.internalBinaryWrite(message.recipient, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* uint64 created_ns = 3; */
        if (message.createdNs !== 0n)
            writer.tag(3, WireType.Varint).uint64(message.createdNs);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.SealedInvitationHeaderV1
 */
export const SealedInvitationHeaderV1 = new SealedInvitationHeaderV1$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SealedInvitationV1$Type extends MessageType<SealedInvitationV1> {
    constructor() {
        super("xmtp.message_contents.SealedInvitationV1", [
            { no: 1, name: "header_bytes", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "ciphertext", kind: "message", T: () => Ciphertext }
        ]);
    }
    create(value?: PartialMessage<SealedInvitationV1>): SealedInvitationV1 {
        const message = { headerBytes: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SealedInvitationV1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SealedInvitationV1): SealedInvitationV1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes header_bytes */ 1:
                    message.headerBytes = reader.bytes();
                    break;
                case /* xmtp.message_contents.Ciphertext ciphertext */ 2:
                    message.ciphertext = Ciphertext.internalBinaryRead(reader, reader.uint32(), options, message.ciphertext);
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
    internalBinaryWrite(message: SealedInvitationV1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes header_bytes = 1; */
        if (message.headerBytes.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.headerBytes);
        /* xmtp.message_contents.Ciphertext ciphertext = 2; */
        if (message.ciphertext)
            Ciphertext.internalBinaryWrite(message.ciphertext, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.SealedInvitationV1
 */
export const SealedInvitationV1 = new SealedInvitationV1$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SealedInvitation$Type extends MessageType<SealedInvitation> {
    constructor() {
        super("xmtp.message_contents.SealedInvitation", [
            { no: 1, name: "v1", kind: "message", oneof: "version", T: () => SealedInvitationV1 }
        ]);
    }
    create(value?: PartialMessage<SealedInvitation>): SealedInvitation {
        const message = { version: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SealedInvitation>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SealedInvitation): SealedInvitation {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.message_contents.SealedInvitationV1 v1 */ 1:
                    message.version = {
                        oneofKind: "v1",
                        v1: SealedInvitationV1.internalBinaryRead(reader, reader.uint32(), options, (message.version as any).v1)
                    };
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
    internalBinaryWrite(message: SealedInvitation, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.message_contents.SealedInvitationV1 v1 = 1; */
        if (message.version.oneofKind === "v1")
            SealedInvitationV1.internalBinaryWrite(message.version.v1, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.SealedInvitation
 */
export const SealedInvitation = new SealedInvitation$Type();
