import resolve, { AsyncOpts, PackageJSON } from "resolve";

export interface ResolveAsyncResult {
  /** Absolute path to resolved package */
  path: string;
  /** package.json of resolved package */
  package: PackageJSON;
}

/**
 * Resolves a package asynchronously.
 *
 * @remarks This is a wrapper around https://www.npmjs.com/package/resolve
 * that returns a promise, rather than using the callback style.
 *
 * @param id - Identifier to resolve
 * @param options - Options to use for resolving, optional.
 * @returns Promise of {@link ResolveAsyncResult}
 */
export async function resolveAsync(
  id: string,
  options: AsyncOpts,
): Promise<ResolveAsyncResult> {
  return new Promise((resolvePromise, rejectPromise) => {
    resolve(id, options, (err, resolved, pkg) => {
      if (err || !resolved || !pkg) {
        rejectPromise(
          err ?? new Error("resolveAsync could not resolve package."),
        );
      } else
        resolvePromise({
          path: resolved,
          package: pkg,
        });
    });
  });
}
