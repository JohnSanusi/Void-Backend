import { Model } from 'mongoose';
import { StatusDocument } from './schemas/status.schema';
export declare class StatusService {
    private statusModel;
    constructor(statusModel: Model<StatusDocument>);
    createStatus(userId: string, data: {
        mediaUrl: string;
        type: string;
    }): Promise<StatusDocument>;
    getActiveStatuses(followedUserIds: string[]): Promise<StatusDocument[]>;
    viewStatus(statusId: string, userId: string): Promise<void>;
    getMyStatuses(userId: string): Promise<StatusDocument[]>;
}
