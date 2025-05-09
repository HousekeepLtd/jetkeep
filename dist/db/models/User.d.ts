import mongoose from 'mongoose';
export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    apiKey?: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
