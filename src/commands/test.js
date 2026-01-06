const ora = require('ora');
const shell = require('shelljs');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`
};

function test() {
  console.log('');
  const spinner = ora('Running tests...').start();

  // Check if daml is installed
  if (!shell.which('daml')) {
    spinner.fail(colors.red('Daml SDK not found!'));
    console.log('');
    console.log(colors.yellow('Install Daml SDK:'));
    console.log(colors.white('  curl -sSL https://get.daml.com/ | sh'));
    console.log('');
    process.exit(1);
  }

  // Run daml test
  const result = shell.exec('daml test', { silent: true });

  if (result.code !== 0) {
    spinner.fail(colors.red('Tests failed!'));
    console.log('');
    console.log(colors.red(result.stderr));
    process.exit(1);
  }

  spinner.succeed(colors.green('All tests passed!'));
  console.log('');
  console.log(colors.dim(result.stdout));
}

module.exports = test;
