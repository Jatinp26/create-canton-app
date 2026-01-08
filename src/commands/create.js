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

function isDamlInstalled() {
  return shell.which('daml') !== null;
}

function getDamlVersion() {
  try {
    const result = shell.exec('daml version', { silent: true });
    const match = result.stdout.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function installDamlSDK() {
  console.log('');
  console.log(colors.yellow('⚠️  Daml SDK not found!'));
  console.log('');
  console.log(colors.white('Daml SDK is required to compile Canton smart contracts.'));
  console.log('');
  
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDaml',
      message: 'Would you like to install Daml SDK now? (Recommended)',
      default: true
    }
  ]);

  if (!answers.installDaml) {
    console.log('');
    console.log(colors.yellow('⚠️  Skipping Daml SDK installation.'));
    console.log(colors.dim('You can install it later with:'));
    console.log(colors.white('  curl -sSL https://get.daml.com/ | sh'));
    console.log('');
    return false;
  }

  console.log('');
  const spinner = ora('Installing Daml SDK (this may take a few minutes)...').start();

  try {
    const result = shell.exec('curl -sSL https://get.daml.com/ | sh', { silent: true });

    if (result.code !== 0) {
      spinner.fail(colors.red('Failed to install Daml SDK'));
      console.log('');
      console.log(colors.yellow('Please install manually:'));
      console.log(colors.white('  curl -sSL https://get.daml.com/ | sh'));
      console.log('');
      return false;
    }

    const damlPath = path.join(process.env.HOME, '.daml', 'bin');
    process.env.PATH = `${damlPath}:${process.env.PATH}`;

    spinner.succeed(colors.green('✨ Daml SDK installed successfully!'));
    
    console.log('');
    console.log(colors.cyan('📝 Important: Add Daml to your PATH permanently'));
    console.log(colors.dim('Add this line to your ~/.zshrc or ~/.bashrc:'));
    console.log('');
    console.log(colors.white(`  export PATH="$HOME/.daml/bin:$PATH"`));
    console.log('');

    return true;
  } catch (error) {
    spinner.fail(colors.red('Installation failed: ' + error.message));
    return false;
  }
}

async function create(projectName, options) {
  try {
    // Check prerequisites
    console.log('');
    console.log(colors.cyan('🔍 Checking prerequisites...'));
    console.log('');

    if (!isDamlInstalled()) {
      const installed = await installDamlSDK();
      if (!installed) {
        console.log(colors.yellow('⚠️  Continuing without Daml SDK...'));
        console.log('');
      }
    } else {
      const version = getDamlVersion();
      console.log(colors.green(`✅ Daml SDK found${version ? ` (v${version})` : ''}`));
    }

    if (!shell.which('java')) {
      console.log(colors.yellow('⚠️  Java not found (optional, needed for tests)'));
    } else {
      console.log(colors.green('✅ Java Runtime found'));
    }

    console.log('');

    // Get project name
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

    // FIXED: Always ask for template if not explicitly provided via CLI flag
    let template = options.template;
    
    // Check if template was explicitly provided (not just the default)
    const wasTemplateProvided = process.argv.includes('--template') || process.argv.includes('-t');
    
    if (!wasTemplateProvided) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Which template would you like to use?',
          choices: [
            { name: 'Bond Trading', value: 'bondtrading' },
            { name: 'Collateral Master', value: 'collateral' },
            { name: 'Empty Template (blank starter)', value: 'empty' }
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
    
    if (isDamlInstalled()) {
      console.log(colors.white(`  daml build          ${colors.dim('# Compile your contracts')}`));
      console.log(colors.white(`  daml test           ${colors.dim('# Run tests')}`));
    } else {
      console.log(colors.yellow(`  # First, install Daml SDK:`));
      console.log(colors.white(`  curl -sSL https://get.daml.com/ | sh`));
    }
    
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
