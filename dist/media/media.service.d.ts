import { ConfigService } from '@nestjs/config';
export declare class MediaService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
}
