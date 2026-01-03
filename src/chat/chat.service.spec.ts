import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { Types } from 'mongoose';

describe('ChatService', () => {
    let service: ChatService;
    let convModel: jest.Mocked<any>;
    let msgModel: jest.Mocked<any>;

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
        convModel = module.get(getModelToken(Conversation.name));
        msgModel = module.get(getModelToken(Message.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOrCreatePrivateConversation', () => {
        it('should return existing conversation if it exists', async () => {
            const user1 = new Types.ObjectId().toString();
            const user2 = new Types.ObjectId().toString();
            jest.spyOn(convModel, 'findOne').mockResolvedValue({ _id: 'convId' } as any);

            const result = await service.findOrCreatePrivateConversation(user1, user2);

            expect(convModel.findOne).toHaveBeenCalled();
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
            jest.spyOn(msgModel, 'find').mockReturnValue(mockFind as any);

            await service.getMessages(convId);

            expect(msgModel.find).toHaveBeenCalledWith(expect.objectContaining({ conversationId: new Types.ObjectId(convId) }));
        });
    });
});
