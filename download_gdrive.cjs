const { execSync } = require('child_process');
try {
  console.log(execSync('python3 -m pip install gdown').toString());
  console.log(execSync('python3 -m gdown --folder 18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP -O public/').toString());
} catch (e) {
  console.log(e.toString());
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.log(e.stderr.toString());
}
