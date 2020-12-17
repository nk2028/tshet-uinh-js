# Contributing

## Code Style

Please follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

## File Naming

Use the extension `*.js.txt` to lets the tools recognize a file as a data file instead of a JavaScript file.

## Build

See the [build script](.github/workflows/build.yml).

## Publish

Before releasing a new version, please confirm the following things:

1. Make sure the code passes linter
1. Make sure the code passes the tests
1. Update the documentation with `npm run docs`
1. Substitute all the occurrences of the version string
