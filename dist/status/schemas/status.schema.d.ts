import { Document, Types } from 'mongoose';
export type StatusDocument = Status & Document;
declare class ViewerRecord {
    userId: Types.ObjectId;
    seenAt: Date;
}
export declare class Status {
    userId: Types.ObjectId;
    mediaUrl: string;
    type: string;
    viewers: {
        count: number;
        list: ViewerRecord[];
    };
    expiresAt: Date;
    createdAt: Date;
}
export declare const StatusSchema: import("mongoose").Schema<Status, import("mongoose").Model<Status, any, any, any, (Document<unknown, any, Status, any, import("mongoose").DefaultSchemaOptions> & Status & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Status, any, import("mongoose").DefaultSchemaOptions> & Status & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Status>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Status, Document<unknown, {}, Status, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Status, Document<unknown, {}, Status, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaUrl?: import("mongoose").SchemaDefinitionProperty<string, Status, Document<unknown, {}, Status, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, Status, Document<unknown, {}, Status, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    viewers?: import("mongoose").SchemaDefinitionProperty<{
        count: number;
        list: ViewerRecord[];
    }, Status, Document<unknown, {}, Status, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, Status, Document<unknown, {}, Status, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Status, Document<unknown, {}, Status, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Status & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Status>;
export {};
