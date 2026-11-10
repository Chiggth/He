const files = [
  'tailieu_phan1 .pdf', 'tailieu_phan2 (1).pdf', 'tailieu_phan3 (1).pdf',
  'tailieu_phan4 (1).pdf', 'tailieu_phan5 (1).pdf', 'tailieu_phan6 (1).pdf',
  'tailieu_phan7 (1).pdf', 'tailieu_phan8 (1).pdf'
];
const colors = ['#e8f0e7','#f3ead5','#f1e4dc','#e2edf0','#e7e5f0','#e9eee1','#f2e5e7','#e3ece8'];
const keyProgress = 'hienhoc-progress-v1', keyNotes = 'hienhoc-notes-v1';
let progress = JSON.parse(localStorage.getItem(keyProgress) || '[]');
let notes = JSON.parse(localStorage.getItem(keyNotes) || '[]');
let currentLesson = 0;
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const label = n => `Phần ${String(n+1).padStart(2,'0')}`;
$('#today').textContent = new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
function renderCards(target, query='') {
  const host = $(target); if (!host) return;
  const entries = files.map((file,i)=>({file,i})).filter(({i})=>label(i).toLowerCase().includes(query.toLowerCase()) || `tài liệu phần ${i+1}`.includes(query.toLowerCase()));
  host.innerHTML = entries.map(({i})=>`<article class="lesson-card ${progress.includes(i)?'done':''}" data-lesson="${i}" tabindex="0" role="button" aria-label="Mở ${label(i)}"><div class="lesson-top"><span class="lesson-number" style="color:${progress.includes(i)?'#3f8056':'#71917a'}">${String(i+1).padStart(2,'0')}</span><span class="lesson-tag">${progress.includes(i)?'Đã hoàn thành':'Tài liệu PDF'}</span></div><h3>${label(i)}</h3><p>Tài liệu gốc trong bộ học tập · Mở để đọc và ghi chú.</p><div class="lesson-bottom"><span>${progress.includes(i)?'Đã học':'Sẵn sàng học'}</span><b>${progress.includes(i)?'✓':'Đọc tài liệu ↗'}</b></div></article>`).join('') || '<div class="empty-note">Không tìm thấy phần tài liệu phù hợp.</div>';
  $$('.lesson-card',host).forEach(card=>{card.addEventListener('click',()=>openReader(+card.dataset.lesson));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openReader(+card.dataset.lesson)}})});
}
function render() {
  renderCards('#home-lessons'); renderCards('#all-lessons',$('#search-input')?.value||'');
  $('#completed-count').innerHTML=`${progress.length} <em>/ 8 phần</em>`;
  $('#note-count').innerHTML=`${notes.length} <em>ghi chú</em>`;
  const options=files.map((_,i)=>`<option value="${i}">${label(i)}</option>`).join('');
  $('#note-chapter').innerHTML='<option value="">Chọn phần tài liệu</option>'+options;
  $('#review-items').innerHTML=progress.length===8?'<p class="review-empty">Bạn đã hoàn thành cả tám phần. Hãy chọn một phần và tự kể lại những ý chính bạn nhớ được.</p>': files.map((_,i)=>i).filter(i=>!progress.includes(i)).slice(0,4).map(i=>`<div class="review-row"><span>${label(i)}</span><button data-review-open="${i}">Ôn phần này ↗</button></div>`).join('');
  $$('#review-items [data-review-open]').forEach(b=>b.onclick=()=>openReader(+b.dataset.reviewOpen));
  renderNotes();
}
function openReader(i){currentLesson=i;$('#reader-title').textContent=label(i);$('#pdf-frame').src=`input/${encodeURIComponent(files[i])}`;$('#mark-done').classList.toggle('checked',progress.includes(i));$('#mark-done').textContent=progress.includes(i)?'✓ Đã hoàn thành':'○ Đánh dấu đã học';$('#reader').classList.add('open');$('#reader').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeReader(){ $('#reader').classList.remove('open');$('#reader').setAttribute('aria-hidden','true');$('#pdf-frame').src='about:blank';document.body.style.overflow=''; }
$('#close-reader').onclick=closeReader;$('#reader').addEventListener('click',e=>{if(e.target===$('#reader'))closeReader()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeReader()});
$('#mark-done').onclick=()=>{progress=progress.includes(currentLesson)?progress.filter(i=>i!==currentLesson):[...progress,currentLesson];localStorage.setItem(keyProgress,JSON.stringify(progress));render();$('#mark-done').classList.toggle('checked',progress.includes(currentLesson));$('#mark-done').textContent=progress.includes(currentLesson)?'✓ Đã hoàn thành':'○ Đánh dấu đã học'};
function showView(name){if(!['home','lessons','notes','review'].includes(name))return;$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));$$('.nav-item').forEach(v=>v.classList.toggle('active',v.dataset.view===name));$('#crumb').textContent={home:'Tổng quan',lessons:'Tài liệu học',notes:'Ghi chú',review:'Ôn tập'}[name];closeReader();if(name==='lessons')renderCards('#all-lessons',$('#search-input').value)}
document.addEventListener('click',e=>{const nav=e.target.closest('[data-view]');if(nav){e.preventDefault();showView(nav.dataset.view)}});
$('[data-open-first]').onclick=()=>openReader(0);$('#search-input').addEventListener('input',()=>renderCards('#all-lessons',$('#search-input').value));
$('#save-note').onclick=()=>{const title=$('#note-title').value.trim(),body=$('#note-body').value.trim();if(!title||!body){(!title?$('#note-title'):$('#note-body')).focus();return}notes.unshift({id:Date.now(),title,body,chapter:$('#note-chapter').value,date:new Date().toLocaleDateString('vi-VN')});localStorage.setItem(keyNotes,JSON.stringify(notes));$('#note-title').value='';$('#note-body').value='';$('#note-chapter').value='';render()};
function renderNotes(){const host=$('#note-list');if(!notes.length){host.innerHTML='<div class="empty-note">Chưa có ghi chú nào.<br>Hãy lưu lại điều bạn muốn nhớ sau khi học.</div>';return}host.innerHTML=notes.map(n=>`<article class="note-item"><button class="delete-note" data-delete-note="${n.id}">Xoá</button><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.body)}</p><div class="note-meta">${n.chapter!==''?label(+n.chapter)+' · ':''}${n.date}</div></article>`).join('');$$('[data-delete-note]').forEach(b=>b.onclick=()=>{notes=notes.filter(n=>n.id!==+b.dataset.deleteNote);localStorage.setItem(keyNotes,JSON.stringify(notes));render()})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#theme-toggle').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('hienhoc-dark',document.body.classList.contains('dark'))};if(localStorage.getItem('hienhoc-dark')==='true')document.body.classList.add('dark');
render();
