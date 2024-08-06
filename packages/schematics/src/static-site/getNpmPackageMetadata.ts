interface NpmPackageMetadata {
  name: string;
  "dist-tags": {
    latest: string;
  };
  versions: {
    [version: string]: {
      name: string;
      version: string;
      dist: {
        tarball: string;
      };
      dependencies: {
        [dependency: string]: string;
      };
      devDependencies: {
        [devDependency: string]: string;
      };
    };
  };
}

export async function getNpmPackageMetadata(
  registryUrl: string,
  packageName: string,
  tokenEnvironmentVariable?: string,
) {
  const url = `${registryUrl}/${packageName}`;
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
          `Metadata download failed for ${packageName} from ${url} with status: ${response.status}\n` +
            `This is likely an authentication/authorization problem.\n- Does the registry need a token?\n- Is tokenEnvironmentVariable in the runner configuration JSON set to the environment variable with the token?\n- Does the token have the appropriate permissions/scopes?\n- Is the token expired?`,
        );
      } else {
        throw new Error(
          `Metadata download failed for ${packageName} from ${url} with status: ${response.status}`,
        );
      }
    }
    const data = (await response.json()) as NpmPackageMetadata;
    return data;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching metadata for ${packageName} from ${url}: ${(error as Error).message}`,
    );
  }
}
