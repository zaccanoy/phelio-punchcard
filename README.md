# Phelio Punchcard

Phelio Punchcard is a lightweight (as in vanilla) TypeScript library for creating punchcards. It's primary usage is currently for [Source Optics](https://sourceoptics.io/) to create punchcards to track developers' behavior in repositories.

## Installation

Currently, this package is not on NPM or Yarn, so you'll have to clone the repository to use it:

```
git clone https://github.com/zaccanoy/phelio-punchcard.git
npm install
```

Once you have cloned the repository and installed dependencies, run the `build` script in the root directory.

```
npm run build
```

This will create a bundle in `dist/phelio-punchcard.min.js` that you can use in your projects. You can also simply import the library using module syntax in TypeScript.

## Usage

> 🚧 Work in progress

You can import `PunchcardBuilder` and start creating punchcards right away:

```typescript

import { PunchcardsBuilder, convertDateData } from './libs/phelio-punchcard';

// ...

const punchcardsBuilder = new PunchcardsBuilder(
  sourceData,
  { converterFunction: convertDateData },
);
```

## Features

* No external dependencies outside of development. `"dependencies": {}` in `package.json`.
* Ability to add individual entries for data or data with associated values.
* Lots of customization to fit your needs.
* Runs in browser or Node.

## Examples

Run the included example app by running:

```
npm run serve-example
```

and open `localhost:8080`.

## Contributing

Contributions are welcome! Feel free to make a pull request. No contribution guide is currently in place, so please use discretion and best practices.

## License

[MIT](LICENSE.md)

❤️
