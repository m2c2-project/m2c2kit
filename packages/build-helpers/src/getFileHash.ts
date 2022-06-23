import { readFileSync } from "fs";
import { createHash } from "crypto";
import { Constants } from "./constants";

export function getFileHash(filePath: string): string {
  const buffer = readFileSync(filePath);
  const hash = createHash("md5").update(buffer).digest("hex");
  return hash.slice(0, Constants.HASH_CHARACTER_LENGTH);
}
