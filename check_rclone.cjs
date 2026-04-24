const { execSync } = require('child_process');
try {
  console.log(execSync('rclone --version').toString());
} catch(e) {
  console.log('No rclone');
}
