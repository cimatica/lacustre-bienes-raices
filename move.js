const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'components', 'property');
const destDir = path.join(__dirname, 'app', 'propiedad', 'components');

fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir);
for (const file of files) {
  fs.renameSync(path.join(srcDir, file), path.join(destDir, file));
}

// Remove empty directories
fs.rmdirSync(srcDir);

const layoutDir = path.join(__dirname, 'components', 'layout');
if (fs.existsSync(layoutDir)) {
  fs.rmdirSync(layoutDir);
}

const compDir = path.join(__dirname, 'components');
if (fs.existsSync(compDir) && fs.readdirSync(compDir).length === 0) {
  fs.rmdirSync(compDir);
}

console.log('Archivos movidos correctamente.');
