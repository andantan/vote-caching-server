// @generated by protobuf-ts 2.11.0 with parameter client_grpc1,server_grpc1,output_legacy_commonjs
// @generated from protobuf file "blockchain_event/block_event_message.proto" (package "block_event_message", syntax proto3)
// tslint:disable
import { CreatedBlockEventService } from "./block_event_message";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { ReportBlockEventResponse } from "./block_event_message";
import type { CreatedBlockEvent } from "./block_event_message";
import * as grpc from "@grpc/grpc-js";
/**
 * @generated from protobuf service block_event_message.CreatedBlockEventService
 */
export interface ICreatedBlockEventServiceClient {
    /**
     * @generated from protobuf rpc: ReportCreatedBlockEvent
     */
    reportCreatedBlockEvent(input: CreatedBlockEvent, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void): grpc.ClientUnaryCall;
    reportCreatedBlockEvent(input: CreatedBlockEvent, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void): grpc.ClientUnaryCall;
    reportCreatedBlockEvent(input: CreatedBlockEvent, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void): grpc.ClientUnaryCall;
    reportCreatedBlockEvent(input: CreatedBlockEvent, callback: (err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void): grpc.ClientUnaryCall;
}
/**
 * @generated from protobuf service block_event_message.CreatedBlockEventService
 */
export class CreatedBlockEventServiceClient extends grpc.Client implements ICreatedBlockEventServiceClient {
    private readonly _binaryOptions: Partial<BinaryReadOptions & BinaryWriteOptions>;
    constructor(address: string, credentials: grpc.ChannelCredentials, options: grpc.ClientOptions = {}, binaryOptions: Partial<BinaryReadOptions & BinaryWriteOptions> = {}) {
        super(address, credentials, options);
        this._binaryOptions = binaryOptions;
    }
    /**
     * @generated from protobuf rpc: ReportCreatedBlockEvent
     */
    reportCreatedBlockEvent(input: CreatedBlockEvent, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: ReportBlockEventResponse) => void)): grpc.ClientUnaryCall {
        const method = CreatedBlockEventService.methods[0];
        return this.makeUnaryRequest<CreatedBlockEvent, ReportBlockEventResponse>(`/${CreatedBlockEventService.typeName}/${method.name}`, (value: CreatedBlockEvent): Buffer => Buffer.from(method.I.toBinary(value, this._binaryOptions)), (value: Buffer): ReportBlockEventResponse => method.O.fromBinary(value, this._binaryOptions), input, (metadata as any), (options as any), (callback as any));
    }
}
