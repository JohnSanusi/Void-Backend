import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model, Types } from 'mongoose';

describe('ChatService', () => {
    let service: ChatService;
    let convModel: Model<ConversationDocument>;
    let msgModel: Model<MessageDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getModelToken(Conversation.name),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getModelToken(Message.name),
                    useValue: {
                        find: jest.fn(),
                        findById: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        convModel = module.get<Model<ConversationDocument>>(getModelToken(Conversation.name));
        msgModel = module.get<Model<MessageDocument>>(getModelToken(Message.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOrCreatePrivateConversation', () => {
        it('should return existing conversation if it exists', async () => {
            const user1 = new Types.ObjectId().toString();
            const user2 = new Types.ObjectId().toString();
            const mockConversation = {
                _id: 'convId',
                type: 'private',
                participants: [new Types.ObjectId(user1), new Types.ObjectId(user2)],
            } as unknown as ConversationDocument;

            jest.spyOn(convModel, 'findOne').mockResolvedValue(mockConversation as any);

            const result = await service.findOrCreatePrivateConversation(user1, user2);

            expect(result._id).toBe('convId');
        });
    });

    describe('getMessages', () => {
        it('should call messageModel.find with correct query', async () => {
            const convId = new Types.ObjectId().toString();
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            const findSpy = jest.spyOn(msgModel, 'find').mockReturnValue(mockFind as unknown as ReturnType<typeof msgModel.find>);

            await service.getMessages(convId);

            expect(findSpy).toHaveBeenCalledWith(expect.objectContaining({ conversationId: new Types.ObjectId(convId) }));
        });
    });
});
