import tokenHelper from '@helpers/token.helper';

/**
 * Returns true only if this jwt is valid and matches the username.
 *
 * @param bearerToken JWT signed bearer token.
 * @param username Username to test against.
 */
export async function isPermitted(
    bearerToken: string,
    username: string
): Promise<boolean> {
    const decoded = await tokenHelper.verityToken(bearerToken);

    return decoded.username == username;
}
