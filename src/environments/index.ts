import { OAuthProvidersEnum } from "@common/enums/auth.enum";
import dotenv from "dotenv";

// Load env based on NODE_ENV if provided, otherwise fall back to .env
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
dotenv.config({ path: envFile });
dotenv.config(); // fallback to default .env if specific file is missing

const {
    PORT,
    NODE_ENV,
    CORS_ORIGINS,
    API_URL,
    CLIENT_URL,
    API_VERSION,
    REDIS_URL,
    REDIS_GLOBAL_PREFIX,
    SERVICE_NAME,
    MONGODB_URI,
    MONGO_DB_NAME,
    API_TIMEOUT,
    THROTTLE_TTL,
    THROTTLE_LIMIT,
    TONCENTER_API_URL,
    TONCENTER_API_KEY,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL,
    GOOGLE_PUBLISHER_REDIRECT_URL,
    GOOGLE_AUTHORIZATION_URL,
    GOOGLE_TOKEN_URL,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_AUTH,
    TELEGRAM_BOT_ENDPOINT,
    JWT_ACCESS_SECRET,
    JWT_EXPIRES_IN,
    OTP_LENGTH,
    OTP_LIFE,
    CRYPTO_PRIVATE_KEY,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASSWORD,
    BULL_PREFIX,
    BLOOM_FILTER_SIZE,
    BLOOM_FILTER_FALSE_POSITIVE_RATE,
    DIGITAL_OCEAN_PUBLIC_BUCKET,
    DIGITAL_OCEAN_REGION,
    DIGITAL_OCEAN_ENDPOINT,
    DIGITAL_OCEAN_ACCESS_KEY_ID,
    DIGITAL_OCEAN_ACCESS_KEY,
    CDN_URL,
    NFT_KAIA_PUBLISH_API_URL,
    NFT_BSC_PUBLISH_API_URL,
    NFT_SOMNIA_PUBLISH_API_URL,
    NFT_PUBLISH_API_TOKEN,
    NFT_API_URL,
    NFT_API_TOKEN,

    HATCHERS_API_URL,
    HATCHERS_API_KEY,

    CAT_WORLD_PAYMENT_PRICES_URL,
    CAT_WORLD_PAYMENT_DEPOSIT_URL,
    TON_TOKEN_ADDRESS,
    CATGOLD_TOKEN_ADDRESS,
    GAME_ID,
    CAT_WORLD_AUTH_BEARER_TOKEN,
    CAT_WORLD_PAYMENT_DEPOSIT_API_KEY,

    APTOS_SIGNIN_DOMAIN,
    APTOS_SIGNIN_URI,
    APTOS_SIGNIN_CHAIN_ID,
    APTOS_SIGNIN_VERSION
} = process.env;

enum EnvEnum {
    STAGING = "staging",
    PRODUCTION = "production",
    DEVELOPMENT = "development"
}

if (NODE_ENV && !["staging", "production", "development"].includes(NODE_ENV)) {
    throw new Error("NODE_ENV must be either production, staging or development");
}

if (!CORS_ORIGINS) {
    throw new Error("CORS_ORIGINS env is not define");
}

if (!PORT) {
    throw new Error("PORT env is not define");
}

if (!API_URL || !CLIENT_URL || !API_VERSION) {
    throw new Error("API_URL || CLIENT_URL env is not define");
}

if (!SERVICE_NAME) {
    throw new Error("SERVICE_NAME env is not define");
}


// if (!MONGODB_URI || !MONGO_DB_NAME) {
//     throw new Error("MONGODB_URI || MONGO_DB_NAME || MONGO_DB_NFT_NAME env is not define");
// }

// if (!TELEGRAM_BOT_ENDPOINT || !TELEGRAM_BOT_AUTH || !TELEGRAM_BOT_TOKEN) {
//     throw new Error("TELEGRAM_BOT_ENDPOINT || TELEGRAM_BOT_AUTH || TELEGRAM_BOT_TOKEN env is not define");
// }



if (!JWT_ACCESS_SECRET || !JWT_EXPIRES_IN) {
    throw new Error("JWT_ACCESS_SECRET || JWT_EXPIRES_IN env is not define");
}

if (!OTP_LENGTH || !OTP_LIFE) {
    throw new Error("OTP_LENGTH || OTP_LIFE env is not define");
}

if (!CRYPTO_PRIVATE_KEY) {
    throw new Error("CRYPTO_PRIVATE_KEY env is not define");
}

// if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_SECURE || !EMAIL_USER || !EMAIL_PASSWORD) {
//     throw new Error("EMAIL_HOST || EMAIL_PORT || EMAIL_SECURE || EMAIL_USER || EMAIL_PASSWORD env is not define");
// }

if (!BULL_PREFIX) {
    throw new Error("BULL_PREFIX env is not define");
}

// if (!DIGITAL_OCEAN_PUBLIC_BUCKET || !DIGITAL_OCEAN_REGION || !DIGITAL_OCEAN_ENDPOINT || !DIGITAL_OCEAN_ACCESS_KEY_ID || !DIGITAL_OCEAN_ACCESS_KEY || !CDN_URL) {
//     throw new Error(
//         "DIGITAL_OCEAN_PUBLIC_BUCKET || DIGITAL_OCEAN_REGION || DIGITAL_OCEAN_ENDPOINT || DIGITAL_OCEAN_ACCESS_KEY_ID || DIGITAL_OCEAN_ACCESS_KEY || CDN_URL env is not define"
//     );
// }

// if (!NFT_KAIA_PUBLISH_API_URL || !NFT_BSC_PUBLISH_API_URL || !NFT_SOMNIA_PUBLISH_API_URL || !NFT_PUBLISH_API_TOKEN || !NFT_API_URL || !NFT_API_TOKEN) {
//     throw new Error("NFT_KAIA_PUBLISH_API_URL || NFT_BSC_PUBLISH_API_URL || NFT_SOMNIA_PUBLISH_API_URL || NFT_PUBLISH_API_TOKEN || NFT_API_URL || NFT_API_TOKEN env is not define");
// }

export const env = {
    // Service env
    SERVICE_NAME,
    NODE_ENV,
    PORT,
    API_URL,
    CLIENT_URL,
    API_VERSION,
    API_TIMEOUT: Number(API_TIMEOUT),

    // Cors env
    corsConfig: {
        ORIGINS: CORS_ORIGINS,
        CREDENTIALS: NODE_ENV === "production"
    },

    // Redis
    redis: {
        URL: REDIS_URL,
        GLOBAL_PREFIX: REDIS_GLOBAL_PREFIX
    },

    // Mongodb
    db: {
        MONGODB_URI,
        MONGO_DB_NAME
    },

    rateLimit: {
        THROTTLE_TTL: Number(THROTTLE_TTL),
        THROTTLE_LIMIT: Number(THROTTLE_LIMIT)
    },

    jwt: {
        access: {
            SECRET: process.env.JWT_ACCESS_SECRET,
            EXPIRES_IN: process.env.JWT_EXPIRES_IN
        }
    },


    cookie: {
        REFRESH_COOKIE: process.env.REFRESH_COOKIE,
        COOKIE_SECRET: process.env.COOKIE_SECRET
    },

    email: {
        HOST: EMAIL_HOST,
        PORT: parseInt(EMAIL_PORT, 10),
        SECURE: EMAIL_SECURE === "true",
        auth: {
            USER: EMAIL_USER,
            PASS: EMAIL_PASSWORD
        }
    },

    oauth2: {
        [OAuthProvidersEnum.GOOGLE]: {
            CLIENT_ID: GOOGLE_CLIENT_ID,
            CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
            USER_REDIRECT_URL: GOOGLE_REDIRECT_URL,
            PUBLISHER_REDIRECT_URL: GOOGLE_PUBLISHER_REDIRECT_URL,
            AUTHORIZATION_URL: GOOGLE_AUTHORIZATION_URL,
            TOKEN_URL: GOOGLE_TOKEN_URL
        }
    },

    otp: {
        LENGTH: parseInt(OTP_LENGTH, 10),
        LIFE: parseInt(OTP_LIFE, 10)
    },

    IS_TESTING: NODE_ENV !== EnvEnum.PRODUCTION,

    TONCENTER_API_URL,
    TONCENTER_API_KEY,

    crypto: {
        PRIVATE_KEY: CRYPTO_PRIVATE_KEY
    },

    bull: {
        BULL_PREFIX: BULL_PREFIX,
        REDIS_URL
    },

    bloomFilter: {
        SIZE: parseInt(BLOOM_FILTER_SIZE, 10) | 100000,
        FALSE_POSITIVE_RATE: parseFloat(BLOOM_FILTER_FALSE_POSITIVE_RATE) || 0.001
    },

    digitalOcean: {
        PUBLIC_BUCKET: DIGITAL_OCEAN_PUBLIC_BUCKET,
        REGION: DIGITAL_OCEAN_REGION,
        ENDPOINT: DIGITAL_OCEAN_ENDPOINT,
        ACCESS_KEY_ID: DIGITAL_OCEAN_ACCESS_KEY_ID,
        ACCESS_KEY: DIGITAL_OCEAN_ACCESS_KEY,
        CDN_URL
    },

    nftPublish: {
        KAIA_API_URL: NFT_KAIA_PUBLISH_API_URL,
        SOMNIA_API_URL: NFT_SOMNIA_PUBLISH_API_URL,
        BSC_API_URL: NFT_BSC_PUBLISH_API_URL,
        API_TOKEN: NFT_PUBLISH_API_TOKEN
    },
    nft: {
        API_URL: NFT_API_URL,
        API_TOKEN: NFT_API_TOKEN
    },
    telegram: {
        BOT_TOKEN: TELEGRAM_BOT_TOKEN,
        BOT_AUTH: TELEGRAM_BOT_AUTH,
        BOT_ENDPOINT: TELEGRAM_BOT_ENDPOINT
    },
    hatchers: {
        API_URL: HATCHERS_API_URL,
        API_KEY: HATCHERS_API_KEY
    },
    catWorldPayment: {
        PRICES_URL: CAT_WORLD_PAYMENT_PRICES_URL,
        DEPOSIT_URL: CAT_WORLD_PAYMENT_DEPOSIT_URL,
        TON_TOKEN_ADDRESS: TON_TOKEN_ADDRESS,
        CATGOLD_TOKEN_ADDRESS: CATGOLD_TOKEN_ADDRESS,
        GAME_ID: GAME_ID,
        AUTH_BEARER_TOKEN: CAT_WORLD_AUTH_BEARER_TOKEN,
        DEPOSIT_API_KEY: CAT_WORLD_PAYMENT_DEPOSIT_API_KEY
    },
    aptosSignIn: {
        DOMAIN: APTOS_SIGNIN_DOMAIN,
        URI: APTOS_SIGNIN_URI,
        CHAIN_ID: APTOS_SIGNIN_CHAIN_ID,
        VERSION: APTOS_SIGNIN_VERSION
    }
} as const;
