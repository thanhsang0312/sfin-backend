
function decodeBase64(data: string) {
    return Buffer.from(
        data.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
    ).toString('utf-8');
}
export function extractBody(body: any) {
    return decodeBase64(body.data);
}