import { PublisherStatusEnum } from "@common/enums/publisher.enum";

export interface IAuthPayload {
    id: string;
    telegramId?: string;
    role: string;
    name: string;
    avatar: string;
    walletAddress?: string;
    sessionId: string;
    status?: PublisherStatusEnum;
}

export interface ITeleAuthPayload {
    userId?: string;
    firstName?: string;
    lastName?: string;
    isBot?: boolean;
    isPremium?: boolean;
    languageCode?: string;
    photoUrl?: string;
}
