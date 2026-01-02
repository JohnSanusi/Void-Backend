import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string | Types.ObjectId): Promise<UserDocument | null>;
    findByGoogleId(googleId: string): Promise<UserDocument | null>;
    create(userData: Partial<User>): Promise<UserDocument>;
    updateRefreshToken(userId: string | Types.ObjectId, refreshTokenHash: string | null): Promise<void>;
    updateLastSeen(userId: string | Types.ObjectId): Promise<void>;
}
