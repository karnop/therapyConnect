import crypto from "crypto";

// REMOVED THE SELF-IMPORT LINE HERE

// In production, this MUST be set in .env.local
// Ensure it is exactly 32 characters long for aes-256-cbc
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "default_secret_key_32_chars_long!!";
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text) {
  if (!text) return text;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Format: "iv:encryptedData"
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (e) {
    console.error("Encryption failed:", e);
    return text; // Fail safe: Save unencrypted rather than losing data
  }
}

export function decrypt(text) {
  if (!text) return text;

  // Legacy Check: If text doesn't contain a colon, or fails hex check, assume it's plain text (old data)
  const textParts = text.split(":");
  if (textParts.length !== 2) return text;

  try {
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    // If decryption fails (wrong key or actually plain text), return original
    return text;
  }
}
