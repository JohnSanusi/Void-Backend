/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Types, Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

const mockUser = (id: string, username: string, isPrivate = false) => ({
  _id: id,
  username,
  isPrivate,
  followers: [],
  following: [],
  followRequests: [],
  followersCount: 0,
  followingCount: 0,
  blockedUsers: [],
  save: jest.fn(),
});

describe('UsersService Social Features', () => {
  let service: UsersService;
  let userModel: Model<User>;

  const mockUserModel = {
    findById: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn(),
      populate: jest.fn().mockReturnThis(), // In case populate is used
      exec: jest.fn(), // In case exec is used
    })),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    db: {
      startSession: jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should follow a public user successfully', async () => {
      const user1Id = new Types.ObjectId().toString();
      const user2Id = new Types.ObjectId().toString();
      const targetUser = mockUser(user2Id, 'target', false);

      // Mock permissions
      const blockedUsersMock = { blockedUsers: [] };
      (userModel.findById as jest.Mock).mockImplementation((id) => {
        if (id === user1Id)
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(blockedUsersMock),
            }),
          }; // Current user checks target
        if (id === user2Id)
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(blockedUsersMock),
            }),
            ...targetUser,
          }; // Target user found + checked
        return {
          select: jest.fn().mockReturnThis(),
          lean: jest.fn(),
          ...targetUser,
        };
      });
      // Specific overrides for the strict calls if needed, but the implementation above handles the logic flow:
      // 1. followUser -> findById(target) -> returns user object
      // 2. isUserBlocked(target, current) -> findById(target).select().lean()
      // 3. isUserBlocked(current, target) -> findById(current).select().lean()

      // To make it cleaner, let's just mock the resolved values of the chain
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ blockedUsers: [] }),
        }),
        // The first call in followUser just awaits findById
        then: (resolve: (val: any) => void) => resolve(targetUser),
      } as any);

      const result = await service.followUser(user1Id, user2Id);
      expect(result).toEqual({ status: 'following' });
      expect(userModel.findByIdAndUpdate as jest.Mock).toHaveBeenCalledTimes(2); // One for target, one for current
    });

    it('should request to follow a private user', async () => {
      const user1Id = new Types.ObjectId().toString();
      const user2Id = new Types.ObjectId().toString();
      const targetUser = mockUser(user2Id, 'target', true);

      // Mock findById to handle both direct await (target lookup) and chainable calls (blocking check)
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ blockedUsers: [] }),
        }),
        then: (resolve: (val: any) => void) => resolve(targetUser),
      } as any);

      const result = await service.followUser(user1Id, user2Id);
      expect(result).toEqual({ status: 'requested' });
      expect(userModel.findByIdAndUpdate as jest.Mock).toHaveBeenCalledWith(
        user2Id,
        expect.objectContaining({
          $addToSet: { followRequests: new Types.ObjectId(user1Id) },
        }),
      );
    });

    it('should throw error if blocked', async () => {
      const user1Id = new Types.ObjectId().toString();
      const user2Id = new Types.ObjectId().toString();
      const targetUser = mockUser(user2Id, 'target', false);

      (userModel.findById as jest.Mock).mockImplementation((id) => {
        if (id === user2Id) {
          // Target user lookup
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue({
                blockedUsers: [new Types.ObjectId(user1Id)],
              }),
            }),
            then: (resolve: (val: any) => void) => resolve(targetUser),
          };
        }
        // Current user lookup (for blocking check) or any other
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ blockedUsers: [] }), // Current user blocks no one
          }),
          then: (resolve: (val: any) => void) => resolve({ blockedUsers: [] }),
        };
      });

      await expect(service.followUser(user1Id, user2Id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user and decrement counts if following', async () => {
      const user1Id = new Types.ObjectId().toString();
      const user2Id = new Types.ObjectId().toString();

      // Mock finding "wasFollowing"
      (userModel.findOne as jest.Mock).mockResolvedValue({ _id: user2Id }); // Truthy, means was following

      const result = await service.unfollowUser(user1Id, user2Id);
      expect(result).toEqual({ status: 'unfollowed' });
      // Expect decrements
      expect(userModel.findByIdAndUpdate as jest.Mock).toHaveBeenCalledWith(
        user2Id,
        expect.objectContaining({ $inc: { followersCount: -1 } }),
        expect.anything(),
      );
    });
  });

  describe('handleFollowRequest', () => {
    it('should accept a follow request', async () => {
      const user1Id = new Types.ObjectId().toString(); // Me
      const user2Id = new Types.ObjectId().toString(); // Requester

      const me = mockUser(user1Id, 'me', true);
      me.followRequests = [new Types.ObjectId(user2Id)];

      // findById logic required by handleFollowRequest depends on implementation.
      // It calls: const user = await this.userModel.findById(currentUserId);
      // Then uses user.followRequests.
      // It does NOT call select().lean() in the shown code snippet for handleFollowRequest?
      // Wait, let me double check usage in service.
      // handleFollowRequest: const user = await this.userModel.findById(currentUserId); if (!user.followRequests...)

      // So simple mockResolvedValue IS fine for handleFollowRequest, BUT if the mock was globally changed to expect chaining, we might need consistency.
      // However, for this specific test, if we mockResolvedValue(me), it returns a promise. Awaiting it gives 'me'.
      // 'me' has followRequests property. This SHOULD work.
      // Error was: TypeError: Cannot read properties of undefined (reading 'some')
      // This implies user.followRequests is undefined.
      // The mockUser helper creates an object with followRequests: [].
      // In the test: me.followRequests = [new Types.ObjectId(user2Id)];
      // So it should have it.
      // Maybe the issue is mockResolvedValue vs mockReturnValue with thenable mismatch if we messed with the global mock?
      // Let's use standard mockResolvedValue, assuming global mock reset in beforeEach clears specific implementations.

      (userModel.findById as jest.Mock).mockResolvedValue(me);

      const result = await service.handleFollowRequest(user1Id, user2Id, true);
      expect(result).toEqual({ status: 'following' });
      // Should pull request, add follower, inc counts
      expect(userModel.findByIdAndUpdate as jest.Mock).toHaveBeenCalledWith(
        user1Id,
        expect.objectContaining({
          $pull: { followRequests: new Types.ObjectId(user2Id) },
          $addToSet: { followers: new Types.ObjectId(user2Id) },
        }),
        expect.anything(),
      );
    });
    it('should reject a follow request', async () => {
      const user1Id = new Types.ObjectId().toString(); // Me
      const user2Id = new Types.ObjectId().toString(); // Requester
      const me = mockUser(user1Id, 'me', true);
      me.followRequests = [new Types.ObjectId(user2Id)];
      (userModel.findById as jest.Mock).mockResolvedValue(me);

      const result = await service.handleFollowRequest(user1Id, user2Id, false);
      expect(result).toEqual({ status: 'rejected' });
      expect(userModel.findByIdAndUpdate as jest.Mock).toHaveBeenCalledWith(
        user1Id,
        expect.objectContaining({
          $pull: { followRequests: new Types.ObjectId(user2Id) },
        }),
      );
    });
  });
});
