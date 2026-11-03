const { spawn } = require('child_process');

const mode = process.argv[2] === 'real' ? 'real' : 'mock';
const env = { ...process.env, AI_MODE: mode };

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const backend = run('backend', 'npm', ['--prefix', 'backend', 'start']);
const student = run('student', 'npm', ['--prefix', 'frontend/studentMobile', 'start']);

function shutdown() {
  backend.kill('SIGTERM');
  student.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
