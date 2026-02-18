const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const buf = fs.readFileSync(path.join(__dirname, '競合分析_一次リスト_マトリクス.csv'));
const content = iconv.decode(buf, 'shift_jis');

const lines = [];
let i = 0;
while (i < content.length) {
  let field = '';
  if (content[i] === '"') {
    i++;
    while (i < content.length) {
      if (content[i] === '"') {
        i++;
        if (content[i] === '"') { field += '"'; i++; }
        else break;
      } else { field += content[i]; i++; }
    }
    lines.push({ type: 'field', value: field });
  } else {
    while (i < content.length && content[i] !== ',' && content[i] !== '\r' && content[i] !== '\n') {
      field += content[i];
      i++;
    }
    lines.push({ type: 'field', value: field });
  }
  if (content[i] === ',') { lines.push({ type: 'comma' }); i++; }
  else if (content[i] === '\r') { lines.push({ type: 'newline' }); i += (content[i + 1] === '\n' ? 2 : 1); }
  else if (content[i] === '\n') { lines.push({ type: 'newline' }); i++; }
  else if (i >= content.length) break;
}

const rows = [];
let row = [];
for (const t of lines) {
  if (t.type === 'field') row.push(t.value);
  else if (t.type === 'newline') {
    if (row.length) { rows.push(row); row = []; }
  }
}
if (row.length) rows.push(row);

const COL_NO = 0, COL_TAISHO = 2, COL_BUNRUI = 3;
function empty(s) { return s == null || String(s).trim() === ''; }

console.log('Header:', rows[0].slice(0, 4));
console.log('--- Rows with empty 対象 or 分類 ---');
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const no = (row[COL_NO] || '').trim();
  const taisho = (row[COL_TAISHO] || '').trim();
  const bunrui = (row[COL_BUNRUI] || '').trim();
  const needTaisho = empty(taisho);
  const needBunrui = empty(bunrui);
  if (needTaisho || needBunrui) {
    console.log('Row', r, 'No=', no, '対象=[' + taisho + '] len=' + taisho.length, '分類=[' + bunrui + '] len=' + bunrui.length, 'cols=' + row.length);
  }
}
console.log('--- Rows where 対象 or 分類 is empty or row has < 5 cols ---');
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (row.length < 5) {
    console.log('Row', r, 'cols=' + row.length, 'No=', row[0], '→ 列不足のため対象/分類がずれている可能性');
    continue;
  }
  const no = (row[0] || '').trim();
  const taisho = (row[2] || '').trim();
  const bunrui = (row[3] || '').trim();
  if (taisho === '' || bunrui === '') {
    console.log('Row', r, no, '対象=[' + taisho + ']', '分類=[' + bunrui + ']');
  }
}
console.log('Total data rows:', rows.length - 1);
// 対象(2)・分類(3)の文字数と先頭1文字のコード
console.log('--- 対象・分類 の長さ（0なら空欄）---');
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const t = (row[2] || '');
  const b = (row[3] || '');
  if (t.length === 0 || b.length === 0) {
    console.log('Row', r, 'No=', row[0], '対象len=', t.length, '分類len=', b.length, '対象=', JSON.stringify(t), '分類=', JSON.stringify(b));
  }
}
const counts = {};
rows.forEach((row, r) => { const c = row.length; counts[c] = (counts[c] || 0) + 1; });
console.log('Column count distribution:', counts);
