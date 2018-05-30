# Evolve Salon Systems

## Getting started

1.  Install npm dependencies using `yarn`
2.  In your root directory:

* `yarn` # install npm dependencies
* `marketplace-kit sync <env>` # update assets/views/graphql/translations in database if they change
* `yarn start` # start watching source files by webpack

Assets will be built into: `marketplace_builder/assets` (in this document later called `${BUILD_DIR}` - it is set up inside `package.json` file)

### Building assets

Before pushing/deploying your changes it is a good practice to generate production assets.

    yarn build

To start webpack in watch mode use

    yarn start
