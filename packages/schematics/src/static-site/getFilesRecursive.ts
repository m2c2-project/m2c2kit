import * as fs from "fs";
import * as path from "path";

/**
 * Get all filepaths in a directory, recursively
 *
 * @param dirPath - The directory path
 * @param arrayOfFiles - An array of files to add to
 * @returns array of filepaths
 */
export function getFilesRecursive(
  dirPath: string,
  arrayOfFiles: string[] = [],
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getFilesRecursive(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath.replace(/\\/g, "/"));
    }
  });

  return arrayOfFiles;
}
