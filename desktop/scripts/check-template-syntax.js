const { spawnSync } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname, '..');
const result = spawnSync('grep', ['-rn', '${{', 'src', '--include=*.ts'], { cwd, encoding: 'utf8' });

if (result.status === 0 && result.stdout.trim()) {
  console.error('ERROR: Se encontró "${{" en templates. Usá "{{\'$\' + variable}}" en su lugar.');
  console.error(result.stdout);
  process.exit(1);
}

if (result.status !== 0 && result.status !== 1) {
  console.error('Error inesperado en check-template-syntax:', result.stderr);
  process.exit(1);
}
