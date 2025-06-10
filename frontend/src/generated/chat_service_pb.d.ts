import * as jspb from 'google-protobuf'



export class Init extends jspb.Message {
  getToken(): string;
  setToken(value: string): Init;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Init.AsObject;
  static toObject(includeInstance: boolean, msg: Init): Init.AsObject;
  static serializeBinaryToWriter(message: Init, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Init;
  static deserializeBinaryFromReader(message: Init, reader: jspb.BinaryReader): Init;
}

export namespace Init {
  export type AsObject = {
    token: string,
  }
}

export class ChannelMsg extends jspb.Message {
  getChannel(): string;
  setChannel(value: string): ChannelMsg;

  getBody(): string;
  setBody(value: string): ChannelMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelMsg.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelMsg): ChannelMsg.AsObject;
  static serializeBinaryToWriter(message: ChannelMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelMsg;
  static deserializeBinaryFromReader(message: ChannelMsg, reader: jspb.BinaryReader): ChannelMsg;
}

export namespace ChannelMsg {
  export type AsObject = {
    channel: string,
    body: string,
  }
}

export class PrivateMsg extends jspb.Message {
  getRecipient(): string;
  setRecipient(value: string): PrivateMsg;

  getBody(): string;
  setBody(value: string): PrivateMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateMsg.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateMsg): PrivateMsg.AsObject;
  static serializeBinaryToWriter(message: PrivateMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateMsg;
  static deserializeBinaryFromReader(message: PrivateMsg, reader: jspb.BinaryReader): PrivateMsg;
}

export namespace PrivateMsg {
  export type AsObject = {
    recipient: string,
    body: string,
  }
}

export class ServerEnvelope extends jspb.Message {
  getNotice(): string;
  setNotice(value: string): ServerEnvelope;

  getPm(): PrivateMsg | undefined;
  setPm(value?: PrivateMsg): ServerEnvelope;
  hasPm(): boolean;
  clearPm(): ServerEnvelope;

  getCm(): ChannelMsg | undefined;
  setCm(value?: ChannelMsg): ServerEnvelope;
  hasCm(): boolean;
  clearCm(): ServerEnvelope;

  getHistoryRes(): HistoryRes | undefined;
  setHistoryRes(value?: HistoryRes): ServerEnvelope;
  hasHistoryRes(): boolean;
  clearHistoryRes(): ServerEnvelope;

  getPayloadCase(): ServerEnvelope.PayloadCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: ServerEnvelope): ServerEnvelope.AsObject;
  static serializeBinaryToWriter(message: ServerEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerEnvelope;
  static deserializeBinaryFromReader(message: ServerEnvelope, reader: jspb.BinaryReader): ServerEnvelope;
}

export namespace ServerEnvelope {
  export type AsObject = {
    notice: string,
    pm?: PrivateMsg.AsObject,
    cm?: ChannelMsg.AsObject,
    historyRes?: HistoryRes.AsObject,
  }

  export enum PayloadCase { 
    PAYLOAD_NOT_SET = 0,
    NOTICE = 1,
    PM = 2,
    CM = 3,
    HISTORY_RES = 4,
  }
}

export class JoinChannel extends jspb.Message {
  getName(): string;
  setName(value: string): JoinChannel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinChannel.AsObject;
  static toObject(includeInstance: boolean, msg: JoinChannel): JoinChannel.AsObject;
  static serializeBinaryToWriter(message: JoinChannel, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinChannel;
  static deserializeBinaryFromReader(message: JoinChannel, reader: jspb.BinaryReader): JoinChannel;
}

export namespace JoinChannel {
  export type AsObject = {
    name: string,
  }
}

export class LeaveChannel extends jspb.Message {
  getName(): string;
  setName(value: string): LeaveChannel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaveChannel.AsObject;
  static toObject(includeInstance: boolean, msg: LeaveChannel): LeaveChannel.AsObject;
  static serializeBinaryToWriter(message: LeaveChannel, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaveChannel;
  static deserializeBinaryFromReader(message: LeaveChannel, reader: jspb.BinaryReader): LeaveChannel;
}

export namespace LeaveChannel {
  export type AsObject = {
    name: string,
  }
}

export class ClientEnvelope extends jspb.Message {
  getInit(): Init | undefined;
  setInit(value?: Init): ClientEnvelope;
  hasInit(): boolean;
  clearInit(): ClientEnvelope;

  getJoin(): JoinChannel | undefined;
  setJoin(value?: JoinChannel): ClientEnvelope;
  hasJoin(): boolean;
  clearJoin(): ClientEnvelope;

  getLeave(): LeaveChannel | undefined;
  setLeave(value?: LeaveChannel): ClientEnvelope;
  hasLeave(): boolean;
  clearLeave(): ClientEnvelope;

  getCm(): ChannelMsg | undefined;
  setCm(value?: ChannelMsg): ClientEnvelope;
  hasCm(): boolean;
  clearCm(): ClientEnvelope;

  getPm(): PrivateMsg | undefined;
  setPm(value?: PrivateMsg): ClientEnvelope;
  hasPm(): boolean;
  clearPm(): ClientEnvelope;

  getPayloadCase(): ClientEnvelope.PayloadCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: ClientEnvelope): ClientEnvelope.AsObject;
  static serializeBinaryToWriter(message: ClientEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientEnvelope;
  static deserializeBinaryFromReader(message: ClientEnvelope, reader: jspb.BinaryReader): ClientEnvelope;
}

export namespace ClientEnvelope {
  export type AsObject = {
    init?: Init.AsObject,
    join?: JoinChannel.AsObject,
    leave?: LeaveChannel.AsObject,
    cm?: ChannelMsg.AsObject,
    pm?: PrivateMsg.AsObject,
  }

  export enum PayloadCase { 
    PAYLOAD_NOT_SET = 0,
    INIT = 1,
    JOIN = 2,
    LEAVE = 3,
    CM = 4,
    PM = 5,
  }
}

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class HistoryReq extends jspb.Message {
  getChannel(): string;
  setChannel(value: string): HistoryReq;

  getLimit(): number;
  setLimit(value: number): HistoryReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistoryReq.AsObject;
  static toObject(includeInstance: boolean, msg: HistoryReq): HistoryReq.AsObject;
  static serializeBinaryToWriter(message: HistoryReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistoryReq;
  static deserializeBinaryFromReader(message: HistoryReq, reader: jspb.BinaryReader): HistoryReq;
}

export namespace HistoryReq {
  export type AsObject = {
    channel: string,
    limit: number,
  }
}

export class HistoryRes extends jspb.Message {
  getItemsList(): Array<ChannelMsg>;
  setItemsList(value: Array<ChannelMsg>): HistoryRes;
  clearItemsList(): HistoryRes;
  addItems(value?: ChannelMsg, index?: number): ChannelMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistoryRes.AsObject;
  static toObject(includeInstance: boolean, msg: HistoryRes): HistoryRes.AsObject;
  static serializeBinaryToWriter(message: HistoryRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistoryRes;
  static deserializeBinaryFromReader(message: HistoryRes, reader: jspb.BinaryReader): HistoryRes;
}

export namespace HistoryRes {
  export type AsObject = {
    itemsList: Array<ChannelMsg.AsObject>,
  }
}

