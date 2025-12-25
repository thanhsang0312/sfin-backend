export interface IUser {
    _id?: string;
    email: string;
    userName: string;
    avatar: string;
    lastLoginDate?: Date;
}

export interface IResultPhotoUrl {
    photo_url: string;
}
