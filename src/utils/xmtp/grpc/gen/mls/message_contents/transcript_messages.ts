// @generated by protobuf-ts 2.9.1
// @generated from protobuf file "mls/message_contents/transcript_messages.proto" (package "xmtp.mls.message_contents", syntax proto3)
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
/**
 * A group member and affected installation IDs
 *
 * @generated from protobuf message xmtp.mls.message_contents.MembershipChange
 */
export interface MembershipChange {
    /**
     * @generated from protobuf field: repeated bytes installation_ids = 1;
     */
    installationIds: Uint8Array[];
    /**
     * @generated from protobuf field: string account_address = 2;
     */
    accountAddress: string;
    /**
     * @generated from protobuf field: string initiated_by_account_address = 3;
     */
    initiatedByAccountAddress: string;
}
/**
 * The group membership change proto
 *
 * protolint:disable REPEATED_FIELD_NAMES_PLURALIZED
 *
 * @generated from protobuf message xmtp.mls.message_contents.GroupMembershipChanges
 */
export interface GroupMembershipChanges {
    /**
     * Members that have been added in the commit
     *
     * @generated from protobuf field: repeated xmtp.mls.message_contents.MembershipChange members_added = 1;
     */
    membersAdded: MembershipChange[];
    /**
     * Members that have been removed in the commit
     *
     * @generated from protobuf field: repeated xmtp.mls.message_contents.MembershipChange members_removed = 2;
     */
    membersRemoved: MembershipChange[];
    /**
     * Installations that have been added in the commit, grouped by member
     *
     * @generated from protobuf field: repeated xmtp.mls.message_contents.MembershipChange installations_added = 3;
     */
    installationsAdded: MembershipChange[];
    /**
     * Installations removed in the commit, grouped by member
     *
     * @generated from protobuf field: repeated xmtp.mls.message_contents.MembershipChange installations_removed = 4;
     */
    installationsRemoved: MembershipChange[];
}
// @generated message type with reflection information, may provide speed optimized methods
class MembershipChange$Type extends MessageType<MembershipChange> {
    constructor() {
        super("xmtp.mls.message_contents.MembershipChange", [
            { no: 1, name: "installation_ids", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "account_address", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "initiated_by_account_address", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<MembershipChange>): MembershipChange {
        const message = { installationIds: [], accountAddress: "", initiatedByAccountAddress: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<MembershipChange>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: MembershipChange): MembershipChange {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated bytes installation_ids */ 1:
                    message.installationIds.push(reader.bytes());
                    break;
                case /* string account_address */ 2:
                    message.accountAddress = reader.string();
                    break;
                case /* string initiated_by_account_address */ 3:
                    message.initiatedByAccountAddress = reader.string();
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
    internalBinaryWrite(message: MembershipChange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated bytes installation_ids = 1; */
        for (let i = 0; i < message.installationIds.length; i++)
            writer.tag(1, WireType.LengthDelimited).bytes(message.installationIds[i]);
        /* string account_address = 2; */
        if (message.accountAddress !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.accountAddress);
        /* string initiated_by_account_address = 3; */
        if (message.initiatedByAccountAddress !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.initiatedByAccountAddress);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.message_contents.MembershipChange
 */
export const MembershipChange = new MembershipChange$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GroupMembershipChanges$Type extends MessageType<GroupMembershipChanges> {
    constructor() {
        super("xmtp.mls.message_contents.GroupMembershipChanges", [
            { no: 1, name: "members_added", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MembershipChange },
            { no: 2, name: "members_removed", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MembershipChange },
            { no: 3, name: "installations_added", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MembershipChange },
            { no: 4, name: "installations_removed", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MembershipChange }
        ]);
    }
    create(value?: PartialMessage<GroupMembershipChanges>): GroupMembershipChanges {
        const message = { membersAdded: [], membersRemoved: [], installationsAdded: [], installationsRemoved: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GroupMembershipChanges>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GroupMembershipChanges): GroupMembershipChanges {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated xmtp.mls.message_contents.MembershipChange members_added */ 1:
                    message.membersAdded.push(MembershipChange.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated xmtp.mls.message_contents.MembershipChange members_removed */ 2:
                    message.membersRemoved.push(MembershipChange.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated xmtp.mls.message_contents.MembershipChange installations_added */ 3:
                    message.installationsAdded.push(MembershipChange.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated xmtp.mls.message_contents.MembershipChange installations_removed */ 4:
                    message.installationsRemoved.push(MembershipChange.internalBinaryRead(reader, reader.uint32(), options));
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
    internalBinaryWrite(message: GroupMembershipChanges, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated xmtp.mls.message_contents.MembershipChange members_added = 1; */
        for (let i = 0; i < message.membersAdded.length; i++)
            MembershipChange.internalBinaryWrite(message.membersAdded[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* repeated xmtp.mls.message_contents.MembershipChange members_removed = 2; */
        for (let i = 0; i < message.membersRemoved.length; i++)
            MembershipChange.internalBinaryWrite(message.membersRemoved[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* repeated xmtp.mls.message_contents.MembershipChange installations_added = 3; */
        for (let i = 0; i < message.installationsAdded.length; i++)
            MembershipChange.internalBinaryWrite(message.installationsAdded[i], writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        /* repeated xmtp.mls.message_contents.MembershipChange installations_removed = 4; */
        for (let i = 0; i < message.installationsRemoved.length; i++)
            MembershipChange.internalBinaryWrite(message.installationsRemoved[i], writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message xmtp.mls.message_contents.GroupMembershipChanges
 */
export const GroupMembershipChanges = new GroupMembershipChanges$Type();
