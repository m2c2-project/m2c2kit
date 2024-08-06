import * as tar from "tar-stream";
import * as zlib from "zlib";

interface ExtractedFile {
  filepath: string;
  buffer: Buffer;
}

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
    extract.on("error", reject);

    const gunzip = zlib.createGunzip();
    gunzip.on("error", reject);

    gunzip.pipe(extract);
    gunzip.end(buffer);
  });
}
