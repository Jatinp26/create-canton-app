# create-canton-app
Scaffold Canton Network Daml projects in seconds. A CLI tool to quickly bootstrap Canton Network dApp.

[![npm version](https://img.shields.io/npm/v/create-canton-app.svg)](https://www.npmjs.com/package/create-canton-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Jatinp26/create-canton-app/pulls)


## Requirements
- Node.js v16+
- Java Runtime (for tests)

## Quick Start

### Create Your First Canton dApp

```bash
npx create-canton-app
```

> Follow the Instructions and select the desired template.

### Build and Test

```bash
cd my-first-dapp
daml build
daml test
```

**That's it!** You now have a working Canton smart contract.

## Contributing

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-template`)

3. Commit your changes (`git commit -m 'Add amazing template'`)

4. Push to the branch (`git push origin feature/amazing-template`)

5. Open a Pull Request

### Adding Custom Templates

1. Create Your Template folder with a 'daml' subdir (rename 'my-template' as your desired template name)

```bash
mkdir -p src/templates/my-template/daml
```

2. Add your Daml contract

Create `src/templates/my-template/daml/MyContract.daml`

3. Update CLI choices

Edit `src/commands/create.js` line 43:

```javascript
choices: [
  { name: 'Bond Trading', value: 'bondtrading' },

  { name: 'Collateral Master', value: 'collateral' },

  { name: 'My Template', value: 'my-template' }, // ADD THIS

  { name: '📄 Empty Template', value: 'empty' }
]
```

4. Try it

```bash
daml build
daml test
```

## Template Checklist

- [ ] Compiles with `daml build`
- [ ] Tests pass with `daml test`
- [ ] Includes inline comments
- [ ] Has clear use case
- [ ] daml.yaml includes `daml-script` dependency

<div align="center">

**[⬆ back to top](#create-canton-app)**

Made with 💜 for [Canton](https://canton.network)

</div>