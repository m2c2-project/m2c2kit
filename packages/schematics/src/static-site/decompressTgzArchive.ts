import * as tar from "tar-stream";
import * as zlib from "zlib";

export interface ExtractedFile {
  /** Filepath as stored in the archive. */
  filepath: string;
  /** `Buffer` containing the file's contents. */
  buffer: Buffer;
}

/**
 * Decompresses a `.tgz` archive and returns the extracted files.
 *
 * @param buffer - the tgz file buffer
 * @returns extracted files
 */
export async function decompressTgzArchive(
  buffer: Buffer,
): Promise<ExtractedFile[]> {
  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    const files: ExtractedFile[] = [];

    extract.on("entry", (header, stream, next) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        files.push({ filepath: header.name, buffer: Buffer.concat(chunks) });
        next();
      });
      stream.on("error", reject);
    });

    extract.on("finish", () => resolve(files));
    extract.on("error", () =>
      reject(new Error("Error extracting tar portion of .tgz file")),
    );

    const gunzip = zlib.createGunzip();
    gunzip.on("error", () =>
      reject(new Error("Error unzipping gz portion of .tgz file")),
    );

    gunzip.pipe(extract);
    gunzip.end(buffer);
  });
}
