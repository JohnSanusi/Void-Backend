import { StatusService } from './status.service';
export declare class StatusController {
    private readonly statusService;
    constructor(statusService: StatusService);
    createStatus(req: any, data: {
        mediaUrl: string;
        type: string;
    }): Promise<import("./schemas/status.schema").StatusDocument>;
    getActiveStatuses(req: any): Promise<import("./schemas/status.schema").StatusDocument[]>;
    viewStatus(req: any, id: string): Promise<void>;
    getMyStatuses(req: any): Promise<import("./schemas/status.schema").StatusDocument[]>;
}
