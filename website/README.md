# website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Build

Before the website can be built, the m2c2kit library must be built. To build the website, run the following from the repository root (not this `website` directory):

```
npm install # if not run previously
npm run build
npm run build -w website
```

## Deployment

The GitHub Actions workflow in `/.github/workflows/deploy-docs.yml` will build and deploy the website to GitHub Pages at https://m2c2-project.github.io/m2c2kit when a commit is pushed to the `main` branch.

**Important**: The environment variable `BASE_URL` in `deploy-docs.yml` must be set to the correct subpath, which for GitHub Pages is the name of the repository. It currently assumes the repository is named `m2c2kit`.

## Local Development

Assuming the m2c2kit library has been built, the website can be run locally with the following command from this directory :

```
npm start
```
