# create-canton-app
Scaffold Canton Network Daml projects in seconds. A CLI tool to quickly bootstrap Canton Network dApp.

## Adding Custom Templates

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
  { name: 'Token Contract', value: 'token' },

  { name: 'Escrow Contract', value: 'escrow' },

  { name: 'My Template', value: 'my-template' }, // ADD THIS

  { name: '📄 Empty Template', value: 'empty' }
]
```

4. Test it

```bash
cd test-my-template
daml build
daml test
```

## Template Checklist

- [ ] Compiles with `daml build`
- [ ] Tests pass with `daml test`
- [ ] Includes inline comments
- [ ] Has clear use case
- [ ] daml.yaml includes `daml-script` dependency

## Requirements
- Node.js v16+
- Daml SDK v3.4.9+
- Java Runtime (for tests)