import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { Status, StatusSchema } from './schemas/status.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Status.name, schema: StatusSchema }]),
    ],
    controllers: [StatusController],
    providers: [StatusService],
    exports: [StatusService],
})
export class StatusModule { }
