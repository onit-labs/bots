// @generated by protobuf-ts 2.9.1
// @generated from protobuf file "mls/database/intents.proto" (package "xmtp.mls.database", syntax proto3)
// tslint:disable
//
// V3 invite message structure
//
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
/**
 * The data required to publish a message
 *
 * @generated from protobuf message xmtp.mls.database.SendMessageData
 */
export interface SendMessageData {
    /**
     * @generated from protobuf oneof: version
     */
    version: {
        oneofKind: "v1";
        /**
         * @generated from protobuf field: xmtp.mls.database.SendMessageData.V1 v1 = 1;
         */
        v1: SendMessageData_V1;
    } | {
        oneofKind: undefined;
    };
}
/**
 * V1 of SendMessagePublishData
 *
 * @generated from protobuf message xmtp.mls.database.SendMessageData.V1
 */
export interface SendMessageData_V1 {
    /**
     * @generated from protobuf field: bytes payload_bytes = 1;
     */
    payloadBytes: Uint8Array;
}
/**
 * Wrapper around a list af repeated EVM Account Addresses
 *
 * @generated from protobuf message xmtp.mls.database.AccountAddresses
 */
export interface AccountAddresses {
    /**
     * @generated from protobuf field: repeated string account_addresses = 1;
     */
    accountAddresses: string[];
}
/**
 * Wrapper around a list of repeated Installation IDs
 *
 * @generated from protobuf message xmtp.mls.database.InstallationIds
 */
export interface InstallationIds {
    /**
     * @generated from protobuf field: repeated bytes installation_ids = 1;
     */
    installationIds: Uint8Array[];
}
/**
 * One of an EVM account address or Installation ID
 *
 * @generated from protobuf message xmtp.mls.database.AddressesOrInstallationIds
 */
export interface AddressesOrInstallationIds {
    /**
     * @generated from protobuf oneof: addresses_or_installation_ids
     */
    addressesOrInstallationIds: {
        oneofKind: "accountAddresses";
        /**
         * @generated from protobuf field: xmtp.mls.database.AccountAddresses account_addresses = 1;
         */
        accountAddresses: AccountAddresses;
    } | {
        oneofKind: "installationIds";
        /**
         * @generated from protobuf field: xmtp.mls.database.InstallationIds installation_ids = 2;
         */
        installationIds: InstallationIds;
    } | {
        oneofKind: undefined;
    };
}
/**
 * The data required to add members to a group
 *
 * @generated from protobuf message xmtp.mls.database.AddMembersData
 */
export interface AddMembersData {
    /**
     * @generated from protobuf oneof: version
     */
    version: {
        oneofKind: "v1";
        /**
         * @generated from protobuf field: xmtp.mls.database.AddMembersData.V1 v1 = 1;
         */
        v1: AddMembersData_V1;
    } | {
        oneofKind: undefined;
    };
}
/**
 * V1 of AddMembersPublishData
 *
 * @generated from protobuf message xmtp.mls.database.AddMembersData.V1
 */
export interface AddMembersData_V1 {
    /**
     * @generated from protobuf field: xmtp.mls.database.AddressesOrInstallationIds addresses_or_installation_ids = 1;
     */
    addressesOrInstallationIds?: AddressesOrInstallationIds;
}
/**
 * The data required to remove members from a group
 *
 * @generated from protobuf message xmtp.mls.database.RemoveMembersData
 */
export interface RemoveMembersData {
    /**
     * @generated from protobuf oneof: version
     */
    version: {
        oneofKind: "v1";
        /**
         * @generated from protobuf field: xmtp.mls.database.RemoveMembersData.V1 v1 = 1;
         */
        v1: RemoveMembersData_V1;
    } | {
        oneofKind: undefined;
    };
}
/**
 * V1 of RemoveMembersPublishData
 *
 * @generated from protobuf message xmtp.mls.database.RemoveMembersData.V1
 */
export interface RemoveMembersData_V1 {
    /**
     * @generated from protobuf field: xmtp.mls.database.AddressesOrInstallationIds addresses_or_installation_ids = 1;
     */
    addressesOrInstallationIds?: AddressesOrInstallationIds;
}
/**
 * Generic data-type for all post-commit actions
 *
 * @generated from protobuf message xmtp.mls.database.PostCommitAction
 */
export interface PostCommitAction {
    /**
     * @generated from protobuf oneof: kind
     */
    kind: {
        oneofKind: "sendWelcomes";
        /**
         * @generated from protobuf field: xmtp.mls.database.PostCommitAction.SendWelcomes send_welcomes = 1;
         */
        sendWelcomes: PostCommitAction_SendWelcomes;
    } | {
        oneofKind: undefined;
    };
}
/**
 * An installation
 *
 * @generated from protobuf message xmtp.mls.database.PostCommitAction.Installation
 */
export interface PostCommitAction_Installation {
    /**
     * @generated from protobuf field: bytes installation_key = 1;
     */
    installationKey: Uint8Array;
    /**
     * @generated from protobuf field: bytes hpke_public_key = 2;
     */
    hpkePublicKey: Uint8Array;
}
/**
 * SendWelcome message
 *
 * @generated from protobuf message xmtp.mls.database.PostCommitAction.SendWelcomes
 */
export interface PostCommitAction_SendWelcomes {
    /**
     * @generated from protobuf field: repeated xmtp.mls.database.PostCommitAction.Installation installations = 1;
     */
    installations: PostCommitAction_Installation[];
    /**
     * @generated from protobuf field: bytes welcome_message = 2;
     */
    welcomeMessage: Uint8Array;
}
// @generated message type with reflection information, may provide speed optimized methods
class SendMessageData$Type extends MessageType<SendMessageData> {
    constructor() {
        super("xmtp.mls.database.SendMessageData", [
            { no: 1, name: "v1", kind: "message", oneof: "version", T: () => SendMessageData_V1 }
        ]);
    }
    create(value?: PartialMessage<SendMessageData>): SendMessageData {
        const message = { version: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SendMessageData>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SendMessageData): SendMessageData {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.SendMessageData.V1 v1 */ 1:
                    message.version = {
                        oneofKind: "v1",
                        v1: SendMessageData_V1.internalBinaryRead(reader, reader.uint32(), options, (message.version as any).v1)
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
    internalBinaryWrite(message: SendMessageData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.SendMessageData.V1 v1 = 1; */
        if (message.version.oneofKind === "v1")
            SendMessageData_V1.internalBinaryWrite(message.version.v1, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.SendMessageData
 */
export const SendMessageData = new SendMessageData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SendMessageData_V1$Type extends MessageType<SendMessageData_V1> {
    constructor() {
        super("xmtp.mls.database.SendMessageData.V1", [
            { no: 1, name: "payload_bytes", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<SendMessageData_V1>): SendMessageData_V1 {
        const message = { payloadBytes: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SendMessageData_V1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SendMessageData_V1): SendMessageData_V1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes payload_bytes */ 1:
                    message.payloadBytes = reader.bytes();
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
    internalBinaryWrite(message: SendMessageData_V1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes payload_bytes = 1; */
        if (message.payloadBytes.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.payloadBytes);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.SendMessageData.V1
 */
export const SendMessageData_V1 = new SendMessageData_V1$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AccountAddresses$Type extends MessageType<AccountAddresses> {
    constructor() {
        super("xmtp.mls.database.AccountAddresses", [
            { no: 1, name: "account_addresses", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<AccountAddresses>): AccountAddresses {
        const message = { accountAddresses: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<AccountAddresses>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AccountAddresses): AccountAddresses {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated string account_addresses */ 1:
                    message.accountAddresses.push(reader.string());
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
    internalBinaryWrite(message: AccountAddresses, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated string account_addresses = 1; */
        for (let i = 0; i < message.accountAddresses.length; i++)
            writer.tag(1, WireType.LengthDelimited).string(message.accountAddresses[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.AccountAddresses
 */
export const AccountAddresses = new AccountAddresses$Type();
// @generated message type with reflection information, may provide speed optimized methods
class InstallationIds$Type extends MessageType<InstallationIds> {
    constructor() {
        super("xmtp.mls.database.InstallationIds", [
            { no: 1, name: "installation_ids", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<InstallationIds>): InstallationIds {
        const message = { installationIds: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<InstallationIds>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: InstallationIds): InstallationIds {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated bytes installation_ids */ 1:
                    message.installationIds.push(reader.bytes());
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
    internalBinaryWrite(message: InstallationIds, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated bytes installation_ids = 1; */
        for (let i = 0; i < message.installationIds.length; i++)
            writer.tag(1, WireType.LengthDelimited).bytes(message.installationIds[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.InstallationIds
 */
export const InstallationIds = new InstallationIds$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AddressesOrInstallationIds$Type extends MessageType<AddressesOrInstallationIds> {
    constructor() {
        super("xmtp.mls.database.AddressesOrInstallationIds", [
            { no: 1, name: "account_addresses", kind: "message", oneof: "addressesOrInstallationIds", T: () => AccountAddresses },
            { no: 2, name: "installation_ids", kind: "message", oneof: "addressesOrInstallationIds", T: () => InstallationIds }
        ]);
    }
    create(value?: PartialMessage<AddressesOrInstallationIds>): AddressesOrInstallationIds {
        const message = { addressesOrInstallationIds: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<AddressesOrInstallationIds>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddressesOrInstallationIds): AddressesOrInstallationIds {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.AccountAddresses account_addresses */ 1:
                    message.addressesOrInstallationIds = {
                        oneofKind: "accountAddresses",
                        accountAddresses: AccountAddresses.internalBinaryRead(reader, reader.uint32(), options, (message.addressesOrInstallationIds as any).accountAddresses)
                    };
                    break;
                case /* xmtp.mls.database.InstallationIds installation_ids */ 2:
                    message.addressesOrInstallationIds = {
                        oneofKind: "installationIds",
                        installationIds: InstallationIds.internalBinaryRead(reader, reader.uint32(), options, (message.addressesOrInstallationIds as any).installationIds)
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
    internalBinaryWrite(message: AddressesOrInstallationIds, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.AccountAddresses account_addresses = 1; */
        if (message.addressesOrInstallationIds.oneofKind === "accountAddresses")
            AccountAddresses.internalBinaryWrite(message.addressesOrInstallationIds.accountAddresses, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* xmtp.mls.database.InstallationIds installation_ids = 2; */
        if (message.addressesOrInstallationIds.oneofKind === "installationIds")
            InstallationIds.internalBinaryWrite(message.addressesOrInstallationIds.installationIds, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.AddressesOrInstallationIds
 */
export const AddressesOrInstallationIds = new AddressesOrInstallationIds$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AddMembersData$Type extends MessageType<AddMembersData> {
    constructor() {
        super("xmtp.mls.database.AddMembersData", [
            { no: 1, name: "v1", kind: "message", oneof: "version", T: () => AddMembersData_V1 }
        ]);
    }
    create(value?: PartialMessage<AddMembersData>): AddMembersData {
        const message = { version: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<AddMembersData>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddMembersData): AddMembersData {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.AddMembersData.V1 v1 */ 1:
                    message.version = {
                        oneofKind: "v1",
                        v1: AddMembersData_V1.internalBinaryRead(reader, reader.uint32(), options, (message.version as any).v1)
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
    internalBinaryWrite(message: AddMembersData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.AddMembersData.V1 v1 = 1; */
        if (message.version.oneofKind === "v1")
            AddMembersData_V1.internalBinaryWrite(message.version.v1, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.AddMembersData
 */
export const AddMembersData = new AddMembersData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AddMembersData_V1$Type extends MessageType<AddMembersData_V1> {
    constructor() {
        super("xmtp.mls.database.AddMembersData.V1", [
            { no: 1, name: "addresses_or_installation_ids", kind: "message", T: () => AddressesOrInstallationIds }
        ]);
    }
    create(value?: PartialMessage<AddMembersData_V1>): AddMembersData_V1 {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<AddMembersData_V1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddMembersData_V1): AddMembersData_V1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.AddressesOrInstallationIds addresses_or_installation_ids */ 1:
                    message.addressesOrInstallationIds = AddressesOrInstallationIds.internalBinaryRead(reader, reader.uint32(), options, message.addressesOrInstallationIds);
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
    internalBinaryWrite(message: AddMembersData_V1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.AddressesOrInstallationIds addresses_or_installation_ids = 1; */
        if (message.addressesOrInstallationIds)
            AddressesOrInstallationIds.internalBinaryWrite(message.addressesOrInstallationIds, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.AddMembersData.V1
 */
export const AddMembersData_V1 = new AddMembersData_V1$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RemoveMembersData$Type extends MessageType<RemoveMembersData> {
    constructor() {
        super("xmtp.mls.database.RemoveMembersData", [
            { no: 1, name: "v1", kind: "message", oneof: "version", T: () => RemoveMembersData_V1 }
        ]);
    }
    create(value?: PartialMessage<RemoveMembersData>): RemoveMembersData {
        const message = { version: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<RemoveMembersData>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RemoveMembersData): RemoveMembersData {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.RemoveMembersData.V1 v1 */ 1:
                    message.version = {
                        oneofKind: "v1",
                        v1: RemoveMembersData_V1.internalBinaryRead(reader, reader.uint32(), options, (message.version as any).v1)
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
    internalBinaryWrite(message: RemoveMembersData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.RemoveMembersData.V1 v1 = 1; */
        if (message.version.oneofKind === "v1")
            RemoveMembersData_V1.internalBinaryWrite(message.version.v1, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.RemoveMembersData
 */
export const RemoveMembersData = new RemoveMembersData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RemoveMembersData_V1$Type extends MessageType<RemoveMembersData_V1> {
    constructor() {
        super("xmtp.mls.database.RemoveMembersData.V1", [
            { no: 1, name: "addresses_or_installation_ids", kind: "message", T: () => AddressesOrInstallationIds }
        ]);
    }
    create(value?: PartialMessage<RemoveMembersData_V1>): RemoveMembersData_V1 {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<RemoveMembersData_V1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RemoveMembersData_V1): RemoveMembersData_V1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.AddressesOrInstallationIds addresses_or_installation_ids */ 1:
                    message.addressesOrInstallationIds = AddressesOrInstallationIds.internalBinaryRead(reader, reader.uint32(), options, message.addressesOrInstallationIds);
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
    internalBinaryWrite(message: RemoveMembersData_V1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.AddressesOrInstallationIds addresses_or_installation_ids = 1; */
        if (message.addressesOrInstallationIds)
            AddressesOrInstallationIds.internalBinaryWrite(message.addressesOrInstallationIds, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.RemoveMembersData.V1
 */
export const RemoveMembersData_V1 = new RemoveMembersData_V1$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PostCommitAction$Type extends MessageType<PostCommitAction> {
    constructor() {
        super("xmtp.mls.database.PostCommitAction", [
            { no: 1, name: "send_welcomes", kind: "message", oneof: "kind", T: () => PostCommitAction_SendWelcomes }
        ]);
    }
    create(value?: PartialMessage<PostCommitAction>): PostCommitAction {
        const message = { kind: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PostCommitAction>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PostCommitAction): PostCommitAction {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* xmtp.mls.database.PostCommitAction.SendWelcomes send_welcomes */ 1:
                    message.kind = {
                        oneofKind: "sendWelcomes",
                        sendWelcomes: PostCommitAction_SendWelcomes.internalBinaryRead(reader, reader.uint32(), options, (message.kind as any).sendWelcomes)
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
    internalBinaryWrite(message: PostCommitAction, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* xmtp.mls.database.PostCommitAction.SendWelcomes send_welcomes = 1; */
        if (message.kind.oneofKind === "sendWelcomes")
            PostCommitAction_SendWelcomes.internalBinaryWrite(message.kind.sendWelcomes, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.PostCommitAction
 */
export const PostCommitAction = new PostCommitAction$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PostCommitAction_Installation$Type extends MessageType<PostCommitAction_Installation> {
    constructor() {
        super("xmtp.mls.database.PostCommitAction.Installation", [
            { no: 1, name: "installation_key", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "hpke_public_key", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PostCommitAction_Installation>): PostCommitAction_Installation {
        const message = { installationKey: new Uint8Array(0), hpkePublicKey: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PostCommitAction_Installation>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PostCommitAction_Installation): PostCommitAction_Installation {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes installation_key */ 1:
                    message.installationKey = reader.bytes();
                    break;
                case /* bytes hpke_public_key */ 2:
                    message.hpkePublicKey = reader.bytes();
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
    internalBinaryWrite(message: PostCommitAction_Installation, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes installation_key = 1; */
        if (message.installationKey.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.installationKey);
        /* bytes hpke_public_key = 2; */
        if (message.hpkePublicKey.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.hpkePublicKey);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.PostCommitAction.Installation
 */
export const PostCommitAction_Installation = new PostCommitAction_Installation$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PostCommitAction_SendWelcomes$Type extends MessageType<PostCommitAction_SendWelcomes> {
    constructor() {
        super("xmtp.mls.database.PostCommitAction.SendWelcomes", [
            { no: 1, name: "installations", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => PostCommitAction_Installation },
            { no: 2, name: "welcome_message", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<PostCommitAction_SendWelcomes>): PostCommitAction_SendWelcomes {
        const message = { installations: [], welcomeMessage: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PostCommitAction_SendWelcomes>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PostCommitAction_SendWelcomes): PostCommitAction_SendWelcomes {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated xmtp.mls.database.PostCommitAction.Installation installations */ 1:
                    message.installations.push(PostCommitAction_Installation.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* bytes welcome_message */ 2:
                    message.welcomeMessage = reader.bytes();
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
    internalBinaryWrite(message: PostCommitAction_SendWelcomes, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated xmtp.mls.database.PostCommitAction.Installation installations = 1; */
        for (let i = 0; i < message.installations.length; i++)
            PostCommitAction_Installation.internalBinaryWrite(message.installations[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* bytes welcome_message = 2; */
        if (message.welcomeMessage.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.welcomeMessage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.database.PostCommitAction.SendWelcomes
 */
export const PostCommitAction_SendWelcomes = new PostCommitAction_SendWelcomes$Type();
