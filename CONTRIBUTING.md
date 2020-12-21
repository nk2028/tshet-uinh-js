# Contributing

## Design

A detailed description is not available yet.

## Code Style

Please follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

## File Naming

Use the extension `*.js.txt` to let the tools recognize a file as a data file instead of a JavaScript file.

## Build

Prerequisites: Node.js, Python.

Install dependencies:

```sh
pip install -r requirements.txt
```

Prepare data:

```sh
build/A_prepare_data.sh
```

Build the library:

```sh
python build/B_generate.py
build/C_concat_files.sh
```

Lint:

```sh
npm run lint
```

Test:

```sh
npm test
```

Build documentation:

```sh
npm run docs
```

See the [build script](.github/workflows/build.yml) for details.

## Publish

Before releasing a new version, please confirm the following things:

1. Make sure the code passes linter
1. Make sure the code passes the tests
1. Rebuild the documentation
1. Substitute all the occurrences of the version string
