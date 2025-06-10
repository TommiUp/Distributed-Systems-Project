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

export class ChannelListResponse extends jspb.Message {
  getChannelsList(): Array<Channel>;
  setChannelsList(value: Array<Channel>): ChannelListResponse;
  clearChannelsList(): ChannelListResponse;
  addChannels(value?: Channel, index?: number): Channel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelListResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelListResponse): ChannelListResponse.AsObject;
  static serializeBinaryToWriter(message: ChannelListResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelListResponse;
  static deserializeBinaryFromReader(message: ChannelListResponse, reader: jspb.BinaryReader): ChannelListResponse;
}

export namespace ChannelListResponse {
  export type AsObject = {
    channelsList: Array<Channel.AsObject>,
  }
}

export class EnterHubRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): EnterHubRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnterHubRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EnterHubRequest): EnterHubRequest.AsObject;
  static serializeBinaryToWriter(message: EnterHubRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EnterHubRequest;
  static deserializeBinaryFromReader(message: EnterHubRequest, reader: jspb.BinaryReader): EnterHubRequest;
}

export namespace EnterHubRequest {
  export type AsObject = {
    token: string,
  }
}

export class EnterHubResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): EnterHubResponse;

  getMessage(): string;
  setMessage(value: string): EnterHubResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnterHubResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EnterHubResponse): EnterHubResponse.AsObject;
  static serializeBinaryToWriter(message: EnterHubResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EnterHubResponse;
  static deserializeBinaryFromReader(message: EnterHubResponse, reader: jspb.BinaryReader): EnterHubResponse;
}

export namespace EnterHubResponse {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

export class LogoutRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): LogoutRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogoutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LogoutRequest): LogoutRequest.AsObject;
  static serializeBinaryToWriter(message: LogoutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogoutRequest;
  static deserializeBinaryFromReader(message: LogoutRequest, reader: jspb.BinaryReader): LogoutRequest;
}

export namespace LogoutRequest {
  export type AsObject = {
    token: string,
  }
}

export class LogoutResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): LogoutResponse;

  getMessage(): string;
  setMessage(value: string): LogoutResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogoutResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LogoutResponse): LogoutResponse.AsObject;
  static serializeBinaryToWriter(message: LogoutResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogoutResponse;
  static deserializeBinaryFromReader(message: LogoutResponse, reader: jspb.BinaryReader): LogoutResponse;
}

export namespace LogoutResponse {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

