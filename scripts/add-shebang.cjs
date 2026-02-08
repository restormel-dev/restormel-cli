const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'index.js');
let content = fs.readFileSync(distPath, 'utf8');
if (!content.startsWith('#!')) {
  fs.writeFileSync(distPath, '#!/usr/bin/env node\n' + content);
}
