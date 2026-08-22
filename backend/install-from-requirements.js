
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const file = path.join(__dirname, 'requirements.txt');
const lines = fs.readFileSync(file, 'utf8').split('\n');

const packages = lines
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split(/\s+#/)[0].trim())   
  .filter(Boolean)
  .map((l) => l.replace('==', '@'));        

if (packages.length === 0) {
  console.log('No packages found in requirements.txt.');
  process.exit(0);
}

console.log('Installing pinned packages:\n  ' + packages.join('\n  '));
execSync(`npm install ${packages.join(' ')} --save-exact`, { stdio: 'inherit', cwd: __dirname });
console.log('\nDone. Note: the database layer uses Node\'s built-in node:sqlite module,');
console.log('so no database package needs to be installed at all (Node >= 22.5 required).');
