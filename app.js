const SUBJECTS = [
{ id: 1,  name: '国語', color: '#E53935', bg: '#FFEBEE', on: true },
{ id: 2,  name: '数学', color: '#1E88E5', bg: '#E3F2FD', on: true },
{ id: 3,  name: '英語', color: '#E91E8C', bg: '#FCE4F3', on: true },
{ id: 4,  name: '物理', color: '#F9A825', bg: '#FFFDE7', on: true },
{ id: 5,  name: '化学', color: '#43A047', bg: '#E8F5E9', on: true },
{ id: 6,  name: '地理', color: '#7B1FA2', bg: '#F3E5F5', on: true },
{ id: 7,  name: '生物', color: '#00ACC1', bg: '#E0F7EE', on: true },
{ id: 8,  name: '地学', color: '#2E7D32', bg: '#C8E6C9', on: true },
{ id: 9,  name: '歴史', color: '#212121', bg: '#F5F5F5', on: true },
{ id: 10, name: '公共', color: '#757575', bg: '#EEEEEE', on: true },
];

function load(k, def) {
try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
catch(e) { return def; }
}
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

let todos    = load('ms_todos', []);
let subjects = load('ms_subjects', SUBJECTS);
let filter   = null;
let pendingDelId = null;
let editSubs = [];

const $ = id => document.getElementById(id);

const fbar    = $('filterBar');
const tlist   = $('todoList');
const tinput  = $('todoInput');
const ainput  = $('amountInput');
const isel    = $('subjectSelect');
const bzone   = $('bulkZone');

function enabled() { return subjects.filter(s => s.on); }
function getSub(id) { return subjects.find(s => s.id === id); }

function renderFilter() {
fbar.innerHTML = '';
const all = document.createElement('button');
all.className = 'fchip' + (filter === null ? ' on' : '');
all.textContent = 'すべて';
all.style.background = filter === null ? '#1a1a2e' : '#fff';
all.style.color = filter === null ? '#fff' : '#555';
all.style.borderColor = filter === null ? 'transparent' : '#ddd';
all.onclick = () => { filter = null; render(); };
fbar.appendChild(all);

enabled().forEach(s => {
const b = document.createElement('button');
b.className = 'fchip' + (filter === s.id ? ' on' : '');
b.textContent = s.name;
b.style.borderColor = s.color;
b.style.color  = filter === s.id ? '#fff' : s.color;
b.style.background = filter === s.id ? s.color : '#fff';
b.onclick = () => { filter = filter === s.id ? null : s.id; render(); };
fbar.appendChild(b);
});
}

function renderSelect() {
const cur = isel.value;
isel.innerHTML = '';
enabled().forEach(s => {
const o = document.createElement('option');
o.value = s.id;
o.textContent = s.name;
isel.appendChild(o);
});
if (cur) isel.value = cur;
}

function renderList() {
tlist.innerHTML = '';
const list = filter ? todos.filter(t => t.subjectId === filter) : todos;

if (!list.length) {
tlist.innerHTML = '<div class="empty"><div class="empty-i">📝</div>タスクがありません</div>';
return;
}

list.forEach(t => {
const sub = getSub(t.subjectId);
const el = document.createElement('div');
el.className = 'titem' + (t.done ? ' done' : '');
el.style.borderLeftColor = sub ? sub.color : '#ddd';


const chk = document.createElement('div');
chk.className = 'chk' + (t.done ? ' on' : '');
chk.onclick = () => toggleDone(t.id);

const tw = document.createElement('div');
tw.className = 'twrap';

const tx = document.createElement('div');
tx.className = 'ttxt';
tx.textContent = t.text;

tw.appendChild(tx);

if (t.amount) {
  const am = document.createElement('div');
  am.className = 'tamt';
  am.textContent = '📋 ' + t.amount;
  tw.appendChild(am);
}

if (sub) {
  const badge = document.createElement('span');
  badge.className = 'sbadge';
  badge.textContent = sub.name;
  badge.style.background = sub.bg;
  badge.style.color = sub.color;
  tw.appendChild(badge);
}

const del = document.createElement('button');
del.className = 'delbtn';
del.textContent = '✕';
del.onclick = () => confirmRowDel(t.id, t.text);

el.appendChild(chk);
el.appendChild(tw);
el.appendChild(del);
tlist.appendChild(el);


});
}

function render() {
renderFilter();
renderSelect();
renderList();
bzone.style.display = todos.length ? 'flex' : 'none';
}

function addTodo() {
const text = tinput.value.trim();
const amount = ainput.value.trim();
const sid = Number(isel.value);
if (!text || !sid) return;
todos.unshift({ id: Date.now(), text, amount, subjectId: sid, done: false });
save('ms_todos', todos);
tinput.value = '';
ainput.value = '';
render();
}

function toggleDone(id) {
todos = todos.map(t => t.id === id ? {...t, done: !t.done} : t);
save('ms_todos', todos);
render();
}

function confirmRowDel(id, text) {
pendingDelId = id;
$('rowDelDesc').textContent = '「' + text + '」を削除しますか？';
$('rowDelModal').style.display = 'flex';
}

function deleteRow() {
if (!pendingDelId) return;
todos = todos.filter(t => t.id !== pendingDelId);
save('ms_todos', todos);
pendingDelId = null;
$('rowDelModal').style.display = 'none';
render();
}

function openSettings() {
editSubs = subjects.map(s => ({...s}));
const wrap = $('subjectSettings');
wrap.innerHTML = '';
editSubs.forEach((s, i) => {
const row = document.createElement('div');
row.className = 'srow';


const dot = document.createElement('div');
dot.className = 'sdot';
dot.style.background = s.color;

const ni = document.createElement('input');
ni.className = 'sname';
ni.value = s.name;
ni.maxLength = 12;
ni.oninput = e => editSubs[i].name = e.target.value;

const lbl = document.createElement('label');
lbl.className = 'tgl';
const cb = document.createElement('input');
cb.type = 'checkbox';
cb.checked = s.on;
cb.onchange = () => editSubs[i].on = cb.checked;
const sl = document.createElement('span');
sl.className = 'tslider';
lbl.appendChild(cb);
lbl.appendChild(sl);

row.appendChild(dot);
row.appendChild(ni);
row.appendChild(lbl);
wrap.appendChild(row);


});
$('settingsModal').style.display = 'flex';
}

function saveSettings() {
subjects = editSubs.map(s => ({...s}));
save('ms_subjects', subjects);
if (filter && !subjects.find(s => s.id === filter && s.on)) filter = null;
$('settingsModal').style.display = 'none';
render();
}

$('addBtn').onclick = addTodo;
tinput.onkeydown = e => { if (e.key === 'Enter') addTodo(); };
ainput.onkeydown = e => { if (e.key === 'Enter') addTodo(); };

$('settingsBtn').onclick = openSettings;
$('settingsCancel').onclick = () => $('settingsModal').style.display = 'none';
$('settingsSave').onclick = saveSettings;
$('settingsModal').onclick = e => { if (e.target === $('settingsModal')) $('settingsModal').style.display = 'none'; };

$('bulkDelBtn').onclick = () => {
$('confirmInput').value = '';
$('bulkConfirm').disabled = true;
$('confirmInput').classList.remove('hit');
$('bulkModal').style.display = 'flex';
setTimeout(() => $('confirmInput').focus(), 50);
};
$('bulkCancel').onclick = () => $('bulkModal').style.display = 'none';
$('bulkModal').onclick = e => { if (e.target === $('bulkModal')) $('bulkModal').style.display = 'none'; };
$('confirmInput').oninput = function() {
const ok = this.value === '削除';
$('bulkConfirm').disabled = !ok;
this.classList.toggle('hit', ok);
};
$('bulkConfirm').onclick = () => {
todos = [];
save('ms_todos', todos);
$('bulkModal').style.display = 'none';
render();
};

$('rowDelCancel').onclick = () => { pendingDelId = null; $('rowDelModal').style.display = 'none'; };
$('rowDelConfirm').onclick = deleteRow;
$('rowDelModal').onclick = e => { if (e.target === $('rowDelModal')) { pendingDelId = null; $('rowDelModal').style.display = 'none'; } };

render();