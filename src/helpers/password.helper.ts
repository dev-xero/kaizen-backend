import bcrypt from 'bcrypt';

class PasswordHelper {
    private rounds: number;

    constructor(rounds: number) {
        this.rounds = rounds;
    }

    // Hashes plaintext
    public hash(plain: string): string {
        return bcrypt.hashSync(plain, this.rounds);
    }

    // Matches hashed string against plain text
    public matches(hash: string, plain: string): boolean {
        return bcrypt.compareSync(plain, hash);
    }
}

const passwordHelper = new PasswordHelper(8); // eight salt rounds

export default passwordHelper;
