const { execSync } = require('child_process');
try {
  console.log(execSync('python3 -m ensurepip').toString());
} catch(e) {
  console.log(e.toString());
}
