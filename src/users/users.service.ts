import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async updateRefreshToken(
    userId: string | Types.ObjectId,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash }).exec();
  }

  async updateLastSeen(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastSeen: new Date() })
      .exec();
  }

  async isUserBlocked(userId: string, targetId: string): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean();
    return (
      user?.blockedUsers?.some((id) => id.toString() === targetId.toString()) ||
      false
    );
  }

  async canMessage(senderId: string, recipientId: string): Promise<boolean> {
    const [sender, recipient] = await Promise.all([
      this.userModel.findById(senderId).select('blockedUsers').lean(),
      this.userModel.findById(recipientId).select('blockedUsers').lean(),
    ]);

    if (!sender || !recipient) return false;

    const senderBlockedRecipient = sender.blockedUsers?.some(
      (id) => id.toString() === recipientId.toString(),
    );
    const recipientBlockedSender = recipient.blockedUsers?.some(
      (id) => id.toString() === senderId.toString(),
    );

    return !senderBlockedRecipient && !recipientBlockedSender;
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean();
    return user?.blockedUsers?.map((id) => id.toString()) || [];
  }

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId)
      throw new BadRequestException('Cannot follow yourself');

    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) throw new NotFoundException('User not found');

    // Check blocking
    const blocked1 = await this.isUserBlocked(targetUserId, currentUserId);
    const blocked2 = await this.isUserBlocked(currentUserId, targetUserId);
    if (blocked1 || blocked2) {
      throw new BadRequestException('Cannot follow this user');
    }

    // Already following?
    if (targetUser.followers.some((id) => id.toString() === currentUserId)) {
      return { status: 'already_following' };
    }

    // Private account?
    if (targetUser.isPrivate) {
      // Check if already requested
      if (
        targetUser.followRequests.some((id) => id.toString() === currentUserId)
      ) {
        return { status: 'requested' };
      }

      await this.userModel.findByIdAndUpdate(targetUserId, {
        $addToSet: { followRequests: new Types.ObjectId(currentUserId) },
      });
      return { status: 'requested' };
    }

    // Public account - Follow immediately
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      await this.userModel.findByIdAndUpdate(
        targetUserId,
        {
          $addToSet: { followers: new Types.ObjectId(currentUserId) },
          $inc: { followersCount: 1 },
        },
        { session },
      );

      await this.userModel.findByIdAndUpdate(
        currentUserId,
        {
          $addToSet: { following: new Types.ObjectId(targetUserId) },
          $inc: { followingCount: 1 },
        },
        { session },
      );

      await session.commitTransaction();
      return { status: 'following' };
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      // Check if actually following to decrement counts correctly
      const wasFollowing = await this.userModel.findOne({
        _id: targetUserId,
        followers: new Types.ObjectId(currentUserId),
      });

      await this.userModel.findByIdAndUpdate(
        targetUserId,
        {
          $pull: {
            followers: new Types.ObjectId(currentUserId),
            followRequests: new Types.ObjectId(currentUserId),
          },
        },
        { session },
      );

      if (wasFollowing) {
        await this.userModel.findByIdAndUpdate(
          targetUserId,
          { $inc: { followersCount: -1 } },
          { session },
        );
        await this.userModel.findByIdAndUpdate(
          currentUserId,
          {
            $pull: { following: new Types.ObjectId(targetUserId) },
            $inc: { followingCount: -1 },
          },
          { session },
        );
      }

      await session.commitTransaction();
      return { status: 'unfollowed' };
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async handleFollowRequest(
    currentUserId: string,
    requesterId: string,
    accept: boolean,
  ) {
    const user = await this.userModel.findById(currentUserId);
    if (!user.followRequests.some((id) => id.toString() === requesterId)) {
      throw new NotFoundException('Request not found');
    }

    if (!accept) {
      await this.userModel.findByIdAndUpdate(currentUserId, {
        $pull: { followRequests: new Types.ObjectId(requesterId) },
      });
      return { status: 'rejected' };
    }

    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      await this.userModel.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { followRequests: new Types.ObjectId(requesterId) },
          $addToSet: { followers: new Types.ObjectId(requesterId) },
          $inc: { followersCount: 1 },
        },
        { session },
      );

      await this.userModel.findByIdAndUpdate(
        requesterId,
        {
          $addToSet: { following: new Types.ObjectId(currentUserId) },
          $inc: { followingCount: 1 },
        },
        { session },
      );

      await session.commitTransaction();
      return { status: 'following' };
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async searchUsers(query: string, limit = 20) {
    return this.userModel
      .find({
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
        ],
      })
      .select('fullName username avatarUrl isPrivate')
      .limit(limit)
      .exec();
  }

  async getProfile(viewerId: string, profileId: string) {
    const profile = await this.userModel
      .findById(profileId)
      .select('-password -refreshTokenHash -__v')
      .lean();

    if (!profile) throw new NotFoundException('User not found');

    const isMe = viewerId === profileId;
    const isFollowing = profile.followers.some(
      (id) => id.toString() === viewerId,
    );
    const isRequested = profile.followRequests.some(
      (id) => id.toString() === viewerId,
    );
    const isBlocked = await this.isUserBlocked(profileId, viewerId); // They blocked me

    if (isBlocked) throw new NotFoundException('User not found'); // Simulate block

    const canViewContent = isMe || !profile.isPrivate || isFollowing;

    return {
      ...profile,
      isFollowing,
      isRequested,
      canViewContent,
      followers: canViewContent ? profile.followers : [],
      following: canViewContent ? profile.following : [],
      postsCount: profile.postsCount || 0,
      followersCount: profile.followersCount || 0,
      followingCount: profile.followingCount || 0,
    };
  }

  async updateProfile(userId: string, data: Record<string, any>) {
    if (data.username) {
      const existing = await this.userModel.findOne({
        username: data.username,
        _id: { $ne: userId },
      });
      if (existing) throw new BadRequestException('Username already taken');
    }
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true },
    );
  }

  async getFollowRequests(userId: string) {
    return this.userModel
      .findById(userId)
      .populate('followRequests', 'fullName username avatarUrl')
      .select('followRequests')
      .exec();
  }
}
