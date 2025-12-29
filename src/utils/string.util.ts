export function generateRefCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const timestamp = Date.now().toString(36);

    const timeComponent = timestamp.slice(-6);

    let randomComponent = "";
    for (let i = 0; i < 6; i++) {
        randomComponent += chars[Math.floor(Math.random() * chars.length)];
    }

    return timeComponent + randomComponent;
}

/**
 * Format Name
 *
 * Takes a string trims it and capitalizes every word
 */
export function formatName(title: string): string {
    return title
        .trim()
        .replace(/\n/g, " ")
        .replace(/\s\s+/g, " ")
        .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
}

export const slugify = (val: string) => {
    if (!val) return "";

    return String(val)
        .normalize("NFKD") // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
        .trim() // trim leading or trailing whitespace
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // remove consecutive hyphens
};

export function parseBankSms(raw: string) {
    const lines = raw
        .replace(/\r/g, "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const result: any = {};

    for (const line of lines) {
        // (TPBank): 29/12/25;13:58
        if (line.startsWith("(")) {
            const bankMatch = line.match(/\((.*?)\)/);
            const datetimeMatch = line.match(/(\d{2}\/\d{2}\/\d{2});(\d{2}:\d{2})/);

            if (bankMatch) result.bank = bankMatch[1];
            if (datetimeMatch) {
                result.date = datetimeMatch[1];
                result.time = datetimeMatch[2];
            }
        }

        // TK: xxxx3122000
        else if (line.startsWith("TK:")) {
            result.account = line.replace("TK:", "").trim();
        }

        // PS:-20.000VND
        else if (line.startsWith("PS:")) {
            result.amount = parseMoney(line.replace("PS:", ""));
        }

        // SD: 213.107VND
        else if (line.startsWith("SD:") && !line.includes("KHA")) {
            result.balance = parseMoney(line.replace("SD:", ""));
        }

        // SD KHA DUNG: 213.107VND
        else if (line.startsWith("SD KHA DUNG:")) {
            result.availableBalance = parseMoney(
                line.replace("SD KHA DUNG:", "")
            );
        }

        // ND: ...
        else if (line.startsWith("ND:")) {
            result.description = line.replace("ND:", "").trim();
        }

        // SO GD: ...
        else if (line.startsWith("SO GD:")) {
            result.transactionId = line.replace("SO GD:", "").trim();
        }
    }

    return result;
}
function parseMoney(value: string): number {
    return Number(
        value
            .replace("VND", "")
            .replace(/\./g, "")
            .trim()
    );
}