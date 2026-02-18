const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const dir = __dirname;
const csvName = '競合分析_一次リスト_マトリクス.csv';
const csvPath = path.join(dir, csvName);

let content = fs.readFileSync(csvPath, 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
const buf = iconv.encode(content, 'shift_jis');
fs.writeFileSync(csvPath, buf);
console.log('Converted to Shift-JIS:', csvPath);
