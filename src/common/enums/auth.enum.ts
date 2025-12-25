export enum LoginTypeEnum {
    WEB2_GOOGLE_OAUTH2 = 0,
    WEB2_EMAIL_OTP = 1,
    WEB3_EVM = 2,
    WEB3_SOLANA = 3,
    WEB3_TON = 4,
    WEB3_APTOS = 5,
    KEYLESS_SOCIAL = 6,
    KEYLESS_EXTERNAL_WALLET = 7
}

export enum LoginStepEnum {
    REQUEST = "request",
    VERIFY = "verify"
}

export enum LoginProviderEnum {
    WEB2 = "web2",
    WEB3 = "web3",
    KEYLESS = "keyless"
}

export enum OAuthProvidersEnum {
    LOCAL = "local",
    GOOGLE = "google"
}

export enum TokenTypeEnum {
    ACCESS = "access",
    REFRESH = "refresh",
    ADMIN_ACCESS = "admin_access"
}
