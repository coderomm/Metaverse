export function generateRandomPassword(length: number = 12): string {
    const uppercase: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase: string = "abcdefghijklmnopqrstuvwxyz";
    const numbers: string = "0123456789";
    const specialCharacters: string = "!@#$%^&*()_+[]{}|;:,.<>?";

    // Combine all character sets
    const allCharacters: string = uppercase + lowercase + numbers + specialCharacters;

    // Ensure at least one character from each set
    let password: string = "";
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialCharacters.charAt(Math.floor(Math.random() * specialCharacters.length));

    // Fill the rest of the password length with random characters
    for (let i = password.length; i < length; i++) {
        password += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
    }

    // Shuffle the password to avoid predictable patterns
    password = password.split("").sort(() => Math.random() - 0.5).join("");

    return password;
}
