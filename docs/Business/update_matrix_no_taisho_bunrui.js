/**
 * 競合分析_一次リスト_マトリクス.csv の No / 対象 / 分類 を確認・更新する
 * 実行: node docs/Business/update_matrix_no_taisho_bunrui.js
 */
const fs = require('fs');
const path = require('path');
let iconv;
try { iconv = require('iconv-lite'); } catch (_) { iconv = require('../../node_modules/iconv-lite'); }

const csvPath = path.join(__dirname, '競合分析_一次リスト_マトリクス.csv');
const buf = fs.readFileSync(csvPath);
const content = iconv.decode(buf, 'shift_jis');
const lines = [];
let i = 0;
while (i < content.length) {
  let field = '';
  const start = i;
  if (content[i] === '"') {
    i++;
    while (i < content.length) {
      if (content[i] === '"') {
        i++;
        if (content[i] === '"') { field += '"'; i++; }
        else break;
      } else if (content[i] === '\r' || content[i] === '\n') {
        field += content[i];
        i++;
      } else {
        field += content[i];
        i++;
      }
    }
    lines.push({ raw: content.slice(start, i), type: 'field', value: field });
  } else {
    while (i < content.length && content[i] !== ',' && content[i] !== '\r' && content[i] !== '\n') {
      field += content[i];
      i++;
    }
    lines.push({ raw: content.slice(start, i), type: 'field', value: field });
  }
  if (content[i] === ',') { lines.push({ type: 'comma' }); i++; }
  else if (content[i] === '\r') { lines.push({ type: 'newline' }); i += (content[i + 1] === '\n' ? 2 : 1); }
  else if (content[i] === '\n') { lines.push({ type: 'newline' }); i++; }
  else if (i >= content.length) break;
}

// Build rows (array of columns)
const rows = [];
let row = [];
for (const t of lines) {
  if (t.type === 'field') row.push(t.value);
  else if (t.type === 'comma') continue;
  else if (t.type === 'newline') {
    if (row.length) { rows.push(row); row = []; }
  }
}
if (row.length) rows.push(row);

// Column indices: 0=No, 1=企業・サービス名, 2=対象, 3=分類, ...
const COL_NO = 0, COL_TAISHO = 2, COL_BUNRUI = 3;

// Header: 3列目=対象, 4列目=分類 に統一
if (rows[0].length > COL_BUNRUI) {
  rows[0][COL_TAISHO] = '対象';
  rows[0][COL_BUNRUI] = '分類';
}

for (let r = 1; r < rows.length; r++) {
  const no = (rows[r][COL_NO] || '').trim();
  const name = (rows[r][1] || '').trim();
  const taisho = (rows[r][COL_TAISHO] || '').trim();
  const bunrui = (rows[r][COL_BUNRUI] || '').trim();

  // D11, D12: 直接+AI UX -> 潜在+設計・製造・現場
  if (no === 'D11' && name.indexOf('Siemens') >= 0) {
    rows[r][COL_TAISHO] = '潜在';
    rows[r][COL_BUNRUI] = '設計・製造・現場';
  } else if (no === 'D12' && name.indexOf('Vuforia') >= 0) {
    rows[r][COL_TAISHO] = '潜在';
    rows[r][COL_BUNRUI] = '設計・製造・現場';
  }
  // I12–I15: 車載 -> 参考、分類を業種に
  else if (no === 'I12' && name.indexOf('Dyson') >= 0) {
    rows[r][COL_TAISHO] = '参考';
    rows[r][COL_BUNRUI] = '家電';
  } else if (no === 'I13' && name.indexOf('Canon') >= 0) {
    rows[r][COL_TAISHO] = '参考';
    rows[r][COL_BUNRUI] = '映像機器';
  } else if (no === 'I14' && name.indexOf('Shimano') >= 0) {
    rows[r][COL_TAISHO] = '参考';
    rows[r][COL_BUNRUI] = '自転車';
  } else if (no === 'I15' && (name.indexOf('TOTO') >= 0 || name.indexOf('LIXIL') >= 0)) {
    rows[r][COL_TAISHO] = '参考';
    rows[r][COL_BUNRUI] = '住宅・設備';
  }
  // 末尾2行: No 付与、対象=潜在
  else if (!no && name === 'Paligo') {
    rows[r][COL_NO] = 'P8';
    rows[r][COL_TAISHO] = '潜在';
    rows[r][COL_BUNRUI] = bunrui || 'CCMS';
  } else if (!no && name.indexOf('ThingWorx') >= 0) {
    rows[r][COL_NO] = 'P9';
    rows[r][COL_TAISHO] = '潜在';
    rows[r][COL_BUNRUI] = bunrui || 'IoT・設計';
  }
}

// Escape and join for CSV
function escapeCsv(s) {
  if (s == null) return '';
  const t = String(s);
  if (t.indexOf(',') >= 0 || t.indexOf('"') >= 0 || t.indexOf('\n') >= 0 || t.indexOf('\r') >= 0)
    return '"' + t.replace(/"/g, '""') + '"';
  return t;
}
const out = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
fs.writeFileSync(csvPath, iconv.encode(out, 'shift_jis'));
console.log('Updated:', csvPath);
console.log('No / 対象 / 分類 を反映しました。');
