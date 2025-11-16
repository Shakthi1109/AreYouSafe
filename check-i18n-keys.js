const fs = require('fs');
const path = require('path');

// Read translation files
const frContent = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'));
const enContent = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

// Extract all keys recursively
function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const frKeys = extractKeys(frContent);
const enKeys = extractKeys(enContent);

console.log('📊 Translation Keys Summary:');
console.log('FR keys:', frKeys.length);
console.log('EN keys:', enKeys.length);

// Find missing keys
const frSet = new Set(frKeys);
const enSet = new Set(enKeys);

const missingInEn = frKeys.filter(key => !enSet.has(key));
const missingInFr = enKeys.filter(key => !frSet.has(key));

if (missingInEn.length > 0) {
  console.log('\n❌ Keys missing in EN:');
  missingInEn.forEach(key => console.log('  -', key));
}

if (missingInFr.length > 0) {
  console.log('\n❌ Keys missing in FR:');
  missingInFr.forEach(key => console.log('  -', key));
}

if (missingInEn.length === 0 && missingInFr.length === 0) {
  console.log('\n✅ All keys are present in both languages!');
}

// Now check if all keys used in code exist in translations
const usedKeysPattern = /t\(['\"]([a-zA-Z0-9_.]+)['\"](?:,|\))/g;
const tsxFiles = [];

function findTsxFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findTsxFiles(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      tsxFiles.push(filePath);
    }
  }
}

findTsxFiles('src');

const usedKeys = new Set();
for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = usedKeysPattern.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

console.log('\n📝 Keys used in code:', usedKeys.size);

const missingKeys = [];
for (const key of usedKeys) {
  if (!frSet.has(key) || !enSet.has(key)) {
    missingKeys.push(key);
  }
}

if (missingKeys.length > 0) {
  console.log('\n❌ Keys used in code but missing in translations:');
  missingKeys.forEach(key => {
    const inFr = frSet.has(key) ? '✓' : '✗';
    const inEn = enSet.has(key) ? '✓' : '✗';
    console.log(`  - ${key} [FR: ${inFr}, EN: ${inEn}]`);
  });
} else {
  console.log('\n✅ All keys used in code have translations!');
}

process.exit(missingKeys.length > 0 ? 1 : 0);

