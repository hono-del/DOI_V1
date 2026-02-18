const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const buf = fs.readFileSync(path.join(__dirname, '競合分析_一次リスト_マトリクス.csv'));
const s = iconv.decode(buf, 'shift_jis');
const lines = s.split(/\r?\n/);
const head = lines[0];
console.log('Header (first 4 cols):', head.split(',').slice(0, 4).join(' | '));
const show = (line) => {
  const cols = [];
  let i = 0, inq = false, f = '';
  for (let j = 0; j <= line.length; j++) {
    const c = line[j] || '';
    if (inq) {
      if (c === '"') { if (line[j+1] === '"') { f += '"'; j++; } else { inq = false; cols.push(f); f = ''; } }
      else f += c;
    } else if (c === '"') inq = true;
    else if (c === ',' || !c) { cols.push(f); f = ''; }
    else f += c;
  }
  if (f) cols.push(f);
  return cols;
};
let rowIdx = 0;
for (const line of lines) {
  const cols = show(line);
  const no = (cols[0] || '').trim();
  if (['D11','D12','I12','I13','I14','I15','P8','P9'].includes(no) || (rowIdx > 90 && cols[1])) {
    console.log(no || '(No)', '| 対象:', cols[2], '| 分類:', cols[3]);
  }
  rowIdx++;
}
