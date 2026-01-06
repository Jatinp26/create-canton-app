const ora = require('ora');
const shell = require('shelljs');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`
};

function compile() {
  console.log('');
  const spinner = ora('Compiling Daml contracts...').start();

  // Check if daml is installed
  if (!shell.which('daml')) {
    spinner.fail(colors.red('Daml SDK not found!'));
    console.log('');
    console.log(colors.yellow('Install Daml SDK:'));
    console.log(colors.white('  curl -sSL https://get.daml.com/ | sh'));
    console.log('');
    process.exit(1);
  }

  // Run daml build
  const result = shell.exec('daml build', { silent: true });

  if (result.code !== 0) {
    spinner.fail(colors.red('Compilation failed!'));
    console.log('');
    console.log(colors.red(result.stderr));
    process.exit(1);
  }

  spinner.succeed(colors.green('Contracts compiled successfully!'));
  console.log('');
}

module.exports = compile;
