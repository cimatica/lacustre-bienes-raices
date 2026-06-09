const fs = require('fs');

const path = 'c:/xampp/htdocs/ViveCoding/bienes-raices/app/data/mockProperties.ts';
let content = fs.readFileSync(path, 'utf8');

// Update interface
content = content.replace('price: string;', 'price: number;');

// Update instances
// Example: price: "120.000 UF",
content = content.replace(/price:\s*"[^"]+"/g, (match) => {
  const numStr = match.replace(/[^0-9]/g, '');
  return `price: ${numStr}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Updated mockProperties.ts');
