import bcrypt from 'bcrypt';

class PasswordHelper {
    private rounds: number;

    constructor(rounds: number) {
        this.rounds = rounds;
    }

    /**
     * Hashes a plain text and returns the result.
     *
     * @param plain Plain text to hash.
     * @returns Hashed variant of the plain text.
     */
    public hash(plain: string): string {
        return bcrypt.hashSync(plain, this.rounds);
    }

    /**
     * Compares a hash and plain text for matches.
     *
     * @param hash Hashed string to compare with.
     * @param plain Plain text variant.
     * @returns True if the plain text matches the hash, false otherwise.
     */
    public matches(hash: string, plain: string): boolean {
        return bcrypt.compareSync(plain, hash);
    }
}

const passwordHelper = new PasswordHelper(8); // eight salt rounds

export default passwordHelper;
