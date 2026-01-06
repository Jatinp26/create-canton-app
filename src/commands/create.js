const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

async function create(projectName, options) {
  try {
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-canton-app'
        }
      ]);
      projectName = answers.projectName;
    }

    let template = options.template;
    if (!template) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Which template would you like to use?',
          choices: [
            { name: '🪙  Token Contract (fungible token like ERC20)', value: 'token' },
            { name: '🤝  Escrow Contract (multi-party escrow)', value: 'escrow' },
            { name: '📄  Empty Template (blank starter)', value: 'empty' }
          ]
        }
      ]);
      template = answers.template;
    }

    console.log('');
    const spinner = ora('Creating your Canton project...').start();

    const projectPath = path.join(process.cwd(), projectName);
    
    if (fs.existsSync(projectPath)) {
      spinner.fail(colors.red(`Folder ${projectName} already exists!`));
      process.exit(1);
    }

    fs.mkdirSync(projectPath);

    const templatePath = path.join(__dirname, '../templates', template);
    if (fs.existsSync(templatePath)) {
      fs.copySync(templatePath, projectPath);
    } else {
      spinner.warn(colors.yellow(`Template ${template} not found, creating empty structure...`));
      fs.mkdirSync(path.join(projectPath, 'daml'), { recursive: true });
    }

    fs.mkdirSync(path.join(projectPath, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'config'), { recursive: true });

    createScripts(projectPath);
    createConfig(projectPath, projectName);
    createReadme(projectPath, projectName, template);
    createGitignore(projectPath);

    spinner.succeed(colors.green('✨ Project created successfully!'));

    console.log('');
    console.log(colors.cyan(colors.bold('📚 Next steps:')));
    console.log('');
    console.log(colors.white(`  cd ${projectName}`));
    console.log(colors.white(`  daml build          ${colors.dim('# Compile your contracts')}`));
    console.log(colors.white(`  daml test           ${colors.dim('# Run tests')}`));
    console.log('');
    console.log(colors.dim('📖 Read README.md for more information'));
    console.log('');

  } catch (error) {
    console.error(colors.red('❌ Error creating project:'), error.message);
    process.exit(1);
  }
}

function createScripts(projectPath) {
  const compileScript = `#!/bin/bash
echo "🔨 Compiling Daml contracts..."
daml build
`;
  fs.writeFileSync(path.join(projectPath, 'scripts/compile.sh'), compileScript);

  const testScript = `#!/bin/bash
echo "🧪 Running tests..."
daml test
`;
  fs.writeFileSync(path.join(projectPath, 'scripts/test.sh'), testScript);

  try {
    shell.chmod('+x', path.join(projectPath, 'scripts/*.sh'));
  } catch (e) {}
}

function createConfig(projectPath, projectName) {
  // THE FIX: Added daml-script dependency!
  const damlConfig = `sdk-version: 3.4.9
name: ${projectName}
source: daml
version: 1.0.0
dependencies:
  - daml-prim
  - daml-stdlib
  - daml-script
`;
  fs.writeFileSync(path.join(projectPath, 'daml.yaml'), damlConfig);
}

function createGitignore(projectPath) {
  const gitignore = `.daml/
*.dar
*.log
node_modules/
.DS_Store
`;
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
}

function createReadme(projectPath, projectName, template) {
  const readme = `# ${projectName}

> A Canton Network dApp built with create-canton-app

## Template: ${template}

## Quick Start

\`\`\`bash
# Compile contracts
daml build

# Run tests
daml test
\`\`\`

## Learn More

- [Canton Docs](https://docs.digitalasset.com)
- [Daml Docs](https://docs.daml.com)
- [Canton Network](https://canton.network)
`;
  
  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

module.exports = create;
