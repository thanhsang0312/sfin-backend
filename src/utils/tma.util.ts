import * as crypto from "crypto";

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomIntTma = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate date for testing auth
 */

// Helper function to compute HMAC-SHA256 hash
const computeHash = (initDataString: string, token: string) => {
    return crypto.createHmac("sha256", token).update(initDataString).digest("hex");
};

export const generateInitDataWithHash = (token: string) => {
    const query_id = "AAFSUlFTAgAAAFJSUVMQm168";
    const user = {
        id: 5261096904,
        first_name: "Jr",
        last_name: "Muston",
        language_code: "vi",
        photo_url: "https://tma-storage.sgp1.cdn.digitaloceanspaces.com/userAvatar/5261096904.png",
        allows_write_to_pm: true,
        username: "Jr Muston",
        walletAddress: "0xd9a6c4df1153725e8c63ef6e292378aedf65ece2"
    };
    const auth_date = Math.floor(Date.now() / 1000); // Current timestamp

    // URL-encode the user data
    const userEncoded = encodeURIComponent(JSON.stringify(user));

    // Combine fields into a single string
    const initDataString = `query_id=${query_id}&user=${userEncoded}&auth_date=${auth_date}`;

    // Compute the hash
    const hash = computeHash(initDataString, token);

    // Construct the final init data
    return `${initDataString}&hash=${hash}`;
};

export function validateNumberString(input: string): boolean {
    const regex = /^\d+$/; // Kiểm tra xem chuỗi chỉ chứa các chữ số
    return regex.test(input);
}
