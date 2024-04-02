// @generated by protobuf-ts 2.9.1
// @generated from protobuf file "message_contents/content.proto" (package "xmtp.message_contents", syntax proto3)
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
import { Signature } from "./signature";
import { SignedPublicKeyBundle } from "./public_key";
/**
 * ContentTypeId is used to identify the type of content stored in a Message.
 *
 * @generated from protobuf message xmtp.message_contents.ContentTypeId
 */
export interface ContentTypeId {
    /**
     * @generated from protobuf field: string authority_id = 1;
     */
    authorityId: string; // authority governing this content type
    /**
     * @generated from protobuf field: string type_id = 2;
     */
    typeId: string; // type identifier
    /**
     * @generated from protobuf field: uint32 version_major = 3;
     */
    versionMajor: number; // major version of the type
    /**
     * @generated from protobuf field: uint32 version_minor = 4;
     */
    versionMinor: number; // minor version of the type
}
/**
 * EncodedContent bundles the content with metadata identifying its type
 * and parameters required for correct decoding and presentation of the content.
 *
 * @generated from protobuf message xmtp.message_contents.EncodedContent
 */
export interface EncodedContent {
    /**
     * content type identifier used to match the payload with
     * the correct decoding machinery
     *
     * @generated from protobuf field: xmtp.message_contents.ContentTypeId type = 1;
     */
    type?: ContentTypeId;
    /**
     * optional encoding parameters required to correctly decode the content
     *
     * @generated from protobuf field: map<string, string> parameters = 2;
     */
    parameters: {
        [key: string]: string;
    };
    /**
     * optional fallback description of the content that can be used in case
     * the client cannot decode or render the content
     *
     * @generated from protobuf field: optional string fallback = 3;
     */
    fallback?: string;
    /**
     * optional compression; the value indicates algorithm used to
     * compress the encoded content bytes
     *
     * @generated from protobuf field: optional xmtp.message_contents.Compression compression = 5;
     */
    compression?: Compression;
    /**
     * encoded content itself
     *
     * @generated from protobuf field: bytes content = 4;
     */
    content: Uint8Array;
}
/**
 * SignedContent attaches a signature to EncodedContent.
 *
 * @generated from protobuf message xmtp.message_contents.SignedContent
 */
export interface SignedContent {
    /**
     * MUST contain EncodedContent
     *
     * @generated from protobuf field: bytes payload = 1;
     */
    payload: Uint8Array;
    /**
     * @generated from protobuf field: xmtp.message_contents.SignedPublicKeyBundle sender = 2;
     */
    sender?: SignedPublicKeyBundle;
    /**
     * MUST be a signature of a concatenation of
     * the message header bytes and the payload bytes,
     * signed by the sender's pre-key.
     *
     * @generated from protobuf field: xmtp.message_contents.Signature signature = 3;
     */
    signature?: Signature;
}
/**
 * Recognized compression algorithms
 * protolint:disable ENUM_FIELD_NAMES_ZERO_VALUE_END_WITH
 *
 * @generated from protobuf enum xmtp.message_contents.Compression
 */
export enum Compression {
    /**
     * @generated from protobuf enum value: COMPRESSION_DEFLATE = 0;
     */
    DEFLATE = 0,
    /**
     * @generated from protobuf enum value: COMPRESSION_GZIP = 1;
     */
    GZIP = 1
}
// @generated message type with reflection information, may provide speed optimized methods
class ContentTypeId$Type extends MessageType<ContentTypeId> {
    constructor() {
        super("xmtp.message_contents.ContentTypeId", [
            { no: 1, name: "authority_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "type_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "version_major", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "version_minor", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value?: PartialMessage<ContentTypeId>): ContentTypeId {
        const message = { authorityId: "", typeId: "", versionMajor: 0, versionMinor: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<ContentTypeId>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ContentTypeId): ContentTypeId {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string authority_id */ 1:
                    message.authorityId = reader.string();
                    break;
                case /* string type_id */ 2:
                    message.typeId = reader.string();
                    break;
                case /* uint32 version_major */ 3:
                    message.versionMajor = reader.uint32();
                    break;
                case /* uint32 version_minor */ 4:
                    message.versionMinor = reader.uint32();
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
    internalBinaryWrite(message: ContentTypeId, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string authority_id = 1; */
        if (message.authorityId !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.authorityId);
        /* string type_id = 2; */
        if (message.typeId !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.typeId);
        /* uint32 version_major = 3; */
        if (message.versionMajor !== 0)
            writer.tag(3, WireType.Varint).uint32(message.versionMajor);
        /* uint32 version_minor = 4; */
        if (message.versionMinor !== 0)
            writer.tag(4, WireType.Varint).uint32(message.versionMinor);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.ContentTypeId
 */
export const ContentTypeId = new ContentTypeId$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EncodedContent$Type extends MessageType<EncodedContent> {
    constructor() {
        super("xmtp.message_contents.EncodedContent", [
            { no: 1, name: "type", kind: "message", T: () => ContentTypeId },
            { no: 2, name: "parameters", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 3, name: "fallback", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "compression", kind: "enum", opt: true, T: () => ["xmtp.message_contents.Compression", Compression, "COMPRESSION_"] },
            { no: 4, name: "content", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<EncodedContent>): EncodedContent {
        const message = { parameters: {}, content: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<EncodedContent>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EncodedContent): EncodedContent {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.message_contents.ContentTypeId type */ 1:
                    message.type = ContentTypeId.internalBinaryRead(reader, reader.uint32(), options, message.type);
                    break;
                case /* map<string, string> parameters */ 2:
                    this.binaryReadMap2(message.parameters, reader, options);
                    break;
                case /* optional string fallback */ 3:
                    message.fallback = reader.string();
                    break;
                case /* optional xmtp.message_contents.Compression compression */ 5:
                    message.compression = reader.int32();
                    break;
                case /* bytes content */ 4:
                    message.content = reader.bytes();
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
    private binaryReadMap2(map: EncodedContent["parameters"], reader: IBinaryReader, options: BinaryReadOptions): void {
        let len = reader.uint32(), end = reader.pos + len, key: keyof EncodedContent["parameters"] | undefined, val: EncodedContent["parameters"][any] | undefined;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.string();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field xmtp.message_contents.EncodedContent.parameters");
            }
        }
        map[key ?? ""] = val ?? "";
    }
    internalBinaryWrite(message: EncodedContent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.message_contents.ContentTypeId type = 1; */
        if (message.type)
            ContentTypeId.internalBinaryWrite(message.type, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* map<string, string> parameters = 2; */
        for (let k of Object.keys(message.parameters))
            writer.tag(2, WireType.LengthDelimited).fork().tag(1, WireType.LengthDelimited).string(k).tag(2, WireType.LengthDelimited).string(message.parameters[k]).join();
        /* optional string fallback = 3; */
        if (message.fallback !== undefined)
            writer.tag(3, WireType.LengthDelimited).string(message.fallback);
        /* optional xmtp.message_contents.Compression compression = 5; */
        if (message.compression !== undefined)
            writer.tag(5, WireType.Varint).int32(message.compression);
        /* bytes content = 4; */
        if (message.content.length)
            writer.tag(4, WireType.LengthDelimited).bytes(message.content);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.EncodedContent
 */
export const EncodedContent = new EncodedContent$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SignedContent$Type extends MessageType<SignedContent> {
    constructor() {
        super("xmtp.message_contents.SignedContent", [
            { no: 1, name: "payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "sender", kind: "message", T: () => SignedPublicKeyBundle },
            { no: 3, name: "signature", kind: "message", T: () => Signature }
        ]);
    }
    create(value?: PartialMessage<SignedContent>): SignedContent {
        const message = { payload: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SignedContent>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SignedContent): SignedContent {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes payload */ 1:
                    message.payload = reader.bytes();
                    break;
                case /* xmtp.message_contents.SignedPublicKeyBundle sender */ 2:
                    message.sender = SignedPublicKeyBundle.internalBinaryRead(reader, reader.uint32(), options, message.sender);
                    break;
                case /* xmtp.message_contents.Signature signature */ 3:
                    message.signature = Signature.internalBinaryRead(reader, reader.uint32(), options, message.signature);
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
    internalBinaryWrite(message: SignedContent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes payload = 1; */
        if (message.payload.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.payload);
        /* xmtp.message_contents.SignedPublicKeyBundle sender = 2; */
        if (message.sender)
            SignedPublicKeyBundle.internalBinaryWrite(message.sender, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* xmtp.message_contents.Signature signature = 3; */
        if (message.signature)
            Signature.internalBinaryWrite(message.signature, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.message_contents.SignedContent
 */
export const SignedContent = new SignedContent$Type();
