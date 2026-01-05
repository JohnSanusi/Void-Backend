import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

import { BlockedUser, BlockedUserSchema } from './schemas/blocked-user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: BlockedUser.name, schema: BlockedUserSchema },
        ]),
    ],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
