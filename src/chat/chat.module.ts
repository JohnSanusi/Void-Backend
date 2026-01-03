import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { UsersModule } from '../users/users.module';

import { ChatGateway } from './chat.gateway';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Conversation.name, schema: ConversationSchema },
            { name: Message.name, schema: MessageSchema },
        ]),
        UsersModule,
        JwtModule.register({}),
        ConfigModule,
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
