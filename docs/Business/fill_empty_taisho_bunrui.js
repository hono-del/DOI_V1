/**
 * 競合分析_一次リスト_マトリクス.csv の 対象・分類 の空欄を埋める
 * 実行: node docs/Business/fill_empty_taisho_bunrui.js
 */
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const csvPath = path.join(__dirname, '競合分析_一次リスト_マトリクス.csv');
const buf = fs.readFileSync(csvPath);
const content = iconv.decode(buf, 'shift_jis');

// Parse CSV (handle quoted fields with newlines)
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
      } else {
        field += content[i];
        i++;
      }
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

const COL_NO = 0, COL_NAME = 1, COL_TAISHO = 2, COL_BUNRUI = 3;

// 空欄: 未定義・null・空文字・空白のみ・要追記・要追加・－・TBD
function empty(s) {
  if (s == null) return true;
  const t = String(s).trim().replace(/\s/g, '');
  if (t === '' || t === '\u3000') return true;
  const v = String(s).trim();
  if (/^[－\-−―]$/.test(v) || /^要追記$|^要追加$|^TBD$/i.test(v)) return true;
  return false;
}

// 対象を No から推定: D→直接, I→間接 or 参考, P→潜在
function defaultTaisho(no, name) {
  if (!no) return '潜在';
  const n = no.toUpperCase();
  if (n.startsWith('D')) return '直接';
  if (n.startsWith('I')) {
    if (/^(I12|I13|I14|I15)$/.test(n)) return '参考';
    return '間接';
  }
  if (n.startsWith('P')) return '潜在';
  return '潜在';
}

// 分類を No・名前・概要から推定
function defaultBunrui(no, name, row) {
  const n = (no || '').toUpperCase();
  const nm = (name || '').toLowerCase();
  const summary = (row[4] || row[5] || '').toLowerCase();

  if (n.startsWith('D')) {
    if (/kore|servicenow|coveo|salesforce/i.test(nm)) return 'AI UX';
    if (/hansem|manual|web/i.test(nm) || /ivi|web|manual/i.test(summary)) return 'Digital Manual';
    if (/quark|msx|pubfoundry|documoto|rws|contenta|veryon|paligo/i.test(nm)) return 'CCMS';
    if (/siemens|vuforia|ptc|thingworx|ar|iot|設計|製造|現場/i.test(nm + summary)) return '設計・製造・現場';
    return 'CCMS';
  }
  if (n.startsWith('I')) {
    if (/^(I12|I13|I14|I15)$/.test(n)) {
      if (/dyson/i.test(nm)) return '家電';
      if (/canon/i.test(nm)) return '映像機器';
      if (/shimano/i.test(nm)) return '自転車';
      if (/toto|lixil/i.test(nm)) return '住宅・設備';
    }
    if (/agent|音声|ai|assistant/i.test(nm + summary)) return 'AI UX';
    if (/manual|取説|owner|digital|html|pdf/i.test(nm + summary)) return 'Digital Manual';
    if (/platform|library|infotainment|onstar/i.test(nm + summary)) return 'Platform';
    return 'Digital Manual';
  }
  if (n.startsWith('P')) {
    if (/paligo/i.test(nm)) return 'CCMS';
    if (/thingworx|iot|ar/i.test(nm + summary)) return 'IoT・設計';
    if (/arbortext|ptc/i.test(nm) && /document|技術文書|ccms/i.test(summary)) return 'CCMS';
    if (/aws|microsoft|google|apple|here|denso|android|carplay/i.test(nm)) return 'Platform';
    return 'Platform';
  }
  return 'Platform';
}

// 行を9列に揃える（不足分は空文字）
const NUM_COLS = 9;
for (let r = 0; r < rows.length; r++) {
  while (rows[r].length < NUM_COLS) rows[r].push('');
}
// ヘッダの5列目が「対象」の重複なら「概要」に統一
if (rows[0].length > 4 && rows[0][4] === '対象') rows[0][4] = '概要';

let filled = 0;
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const no = (row[COL_NO] || '').trim();
  const name = (row[COL_NAME] || '').trim();

  if (empty(row[COL_TAISHO])) {
    row[COL_TAISHO] = defaultTaisho(no, name);
    filled++;
  }
  if (empty(row[COL_BUNRUI])) {
    row[COL_BUNRUI] = defaultBunrui(no, name, row);
    filled++;
  }
}

function escapeCsv(s) {
  if (s == null) return '';
  const t = String(s);
  if (t.indexOf(',') >= 0 || t.indexOf('"') >= 0 || t.indexOf('\n') >= 0 || t.indexOf('\r') >= 0)
    return '"' + t.replace(/"/g, '""') + '"';
  return t;
}

const out = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');

// Shift-JIS で保存（従来どおり）
fs.writeFileSync(csvPath, iconv.encode(out, 'shift_jis'));
console.log('対象・分類の空欄を', filled, '件埋めました。', csvPath);

// UTF-8 BOM 版を出力（Excelで文字化けしない）
const utf8Path = path.join(__dirname, '競合分析_一次リスト_マトリクス_utf8.csv');
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
fs.writeFileSync(utf8Path, Buffer.concat([BOM, Buffer.from(out, 'utf8')]));
console.log('UTF-8版（Excel用）:', utf8Path);
