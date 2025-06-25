import * as jspb from 'google-protobuf'



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

export class Channel extends jspb.Message {
  getId(): string;
  setId(value: string): Channel;

  getName(): string;
  setName(value: string): Channel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Channel.AsObject;
  static toObject(includeInstance: boolean, msg: Channel): Channel.AsObject;
  static serializeBinaryToWriter(message: Channel, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Channel;
  static deserializeBinaryFromReader(message: Channel, reader: jspb.BinaryReader): Channel;
}

export namespace Channel {
  export type AsObject = {
    id: string,
    name: string,
  }
}

export class ChannelListRes extends jspb.Message {
  getChannelsList(): Array<Channel>;
  setChannelsList(value: Array<Channel>): ChannelListRes;
  clearChannelsList(): ChannelListRes;
  addChannels(value?: Channel, index?: number): Channel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelListRes.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelListRes): ChannelListRes.AsObject;
  static serializeBinaryToWriter(message: ChannelListRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelListRes;
  static deserializeBinaryFromReader(message: ChannelListRes, reader: jspb.BinaryReader): ChannelListRes;
}

export namespace ChannelListRes {
  export type AsObject = {
    channelsList: Array<Channel.AsObject>,
  }
}

export class CreateReq extends jspb.Message {
  getName(): string;
  setName(value: string): CreateReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateReq): CreateReq.AsObject;
  static serializeBinaryToWriter(message: CreateReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateReq;
  static deserializeBinaryFromReader(message: CreateReq, reader: jspb.BinaryReader): CreateReq;
}

export namespace CreateReq {
  export type AsObject = {
    name: string,
  }
}

export class DeleteReq extends jspb.Message {
  getId(): string;
  setId(value: string): DeleteReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteReq.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteReq): DeleteReq.AsObject;
  static serializeBinaryToWriter(message: DeleteReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteReq;
  static deserializeBinaryFromReader(message: DeleteReq, reader: jspb.BinaryReader): DeleteReq;
}

export namespace DeleteReq {
  export type AsObject = {
    id: string,
  }
}

export class BoolRes extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): BoolRes;

  getMessage(): string;
  setMessage(value: string): BoolRes;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BoolRes.AsObject;
  static toObject(includeInstance: boolean, msg: BoolRes): BoolRes.AsObject;
  static serializeBinaryToWriter(message: BoolRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BoolRes;
  static deserializeBinaryFromReader(message: BoolRes, reader: jspb.BinaryReader): BoolRes;
}

export namespace BoolRes {
  export type AsObject = {
    ok: boolean,
    message: string,
  }
}

export class EnterHubReq extends jspb.Message {
  getToken(): string;
  setToken(value: string): EnterHubReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnterHubReq.AsObject;
  static toObject(includeInstance: boolean, msg: EnterHubReq): EnterHubReq.AsObject;
  static serializeBinaryToWriter(message: EnterHubReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EnterHubReq;
  static deserializeBinaryFromReader(message: EnterHubReq, reader: jspb.BinaryReader): EnterHubReq;
}

export namespace EnterHubReq {
  export type AsObject = {
    token: string,
  }
}

export class EnterHubRes extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): EnterHubRes;

  getMessage(): string;
  setMessage(value: string): EnterHubRes;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnterHubRes.AsObject;
  static toObject(includeInstance: boolean, msg: EnterHubRes): EnterHubRes.AsObject;
  static serializeBinaryToWriter(message: EnterHubRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EnterHubRes;
  static deserializeBinaryFromReader(message: EnterHubRes, reader: jspb.BinaryReader): EnterHubRes;
}

export namespace EnterHubRes {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

export class LogoutReq extends jspb.Message {
  getToken(): string;
  setToken(value: string): LogoutReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogoutReq.AsObject;
  static toObject(includeInstance: boolean, msg: LogoutReq): LogoutReq.AsObject;
  static serializeBinaryToWriter(message: LogoutReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogoutReq;
  static deserializeBinaryFromReader(message: LogoutReq, reader: jspb.BinaryReader): LogoutReq;
}

export namespace LogoutReq {
  export type AsObject = {
    token: string,
  }
}

export class LogoutRes extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): LogoutRes;

  getMessage(): string;
  setMessage(value: string): LogoutRes;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogoutRes.AsObject;
  static toObject(includeInstance: boolean, msg: LogoutRes): LogoutRes.AsObject;
  static serializeBinaryToWriter(message: LogoutRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogoutRes;
  static deserializeBinaryFromReader(message: LogoutRes, reader: jspb.BinaryReader): LogoutRes;
}

export namespace LogoutRes {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

