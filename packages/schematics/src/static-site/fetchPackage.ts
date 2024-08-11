/**
 * Fetches a package tarball from a URL
 *
 * @param url - the URL to fetch the package from
 * @param tokenEnvironmentVariable - the environment variable that holds the
 * authorization token for the registry, if required
 * @returns
 */
export async function fetchPackage(
  url: string,
  tokenEnvironmentVariable?: string,
): Promise<Buffer> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: tokenEnvironmentVariable
          ? `Bearer ${process.env[tokenEnvironmentVariable]}`
          : "",
      },
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Package tarball download failed from ${url} with status: ${response.status}\n` +
            `This is likely an authentication/authorization problem.\n- Does the registry need a token?\n- Is tokenEnvironmentVariable in the runner configuration JSON set to the environment variable with the token?\n- Does the token have the appropriate permissions/scopes?\n- Is the token expired?`,
        );
      } else {
        throw new Error(
          `Package tarball download failed from ${url} with status: ${response.status}`,
        );
      }
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error: unknown) {
    throw new Error(
      `Error downloading package tarball from from ${url}: ${(error as Error).message}`,
    );
  }
}
