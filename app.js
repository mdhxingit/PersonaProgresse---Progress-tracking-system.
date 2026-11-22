'use strict';
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const LIB={Chest:['Bench Press','Incline Dumbbell Press','Chest Fly','Push-up','Cable Fly'],Back:['Deadlift','Lat Pulldown','Seated Row','Pull-up','Cable Row','Barbell Row'],Shoulders:['Shoulder Press','Lateral Raise','Rear Delt Fly','Face Pull'],Biceps:['Bicep Curl','Hammer Curl','Preacher Curl'],Triceps:['Triceps Pushdown','Overhead Triceps Extension','Skull Crusher','Dips'],Legs:['Squat','Leg Press','Leg Curl','Leg Extension','Calf Raise','Lunges'],Glutes:['Hip Thrust','Glute Bridge','Romanian Deadlift'],Core:['Plank','Crunch','Hanging Leg Raise','Russian Twist'],'Full Body':['Burpee','Clean and Press'],Cardio:['Treadmill','Cycling','Rowing Machine','Jump Rope']};
const IC={home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',dumb:'<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="M5 13l4 4L19 7"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',dn:'<path d="M12 5v14M6 13l6 6 6-6"/>',scale:'<path d="M5 4h14l2 16H3zM9 9a3 3 0 016 0"/>',dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',cal:'<path d="M4 6h16v14H4zM4 11h16M9 3v4M15 3v4"/>'};
const I=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24">${IC[n]}</svg>`;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dstr=d=>d.toLocaleDateString('en-CA'),td=()=>dstr(new Date()),wd=()=>(new Date().getDay()+6)%7,uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const addD=(s,n)=>{const d=new Date(s+'T12:00');d.setDate(d.getDate()+n);return dstr(d)},r1=n=>Math.round(n*10)/10,sg=n=>(n>0?'+':'')+r1(n);
const clone=o=>JSON.parse(JSON.stringify(o)),tm=s=>{s=Math.max(0,Math.floor(s));return(s>=3600?Math.floor(s/3600)+':':'')+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const fresh=()=>({height:null,weights:[],routine:DAYS.map(()=>({name:'',rest:false,ex:[]})),ver:1,sessions:[],active:null,custom:[]});
let S=fresh(),idb,V={p:0,wr:'1M',pr:'1M',cmp:'7',cd:0,pe:''};
const open=()=>new Promise(r=>{try{const q=indexedDB.open('fit',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{idb=q.result;r()};q.onerror=()=>r()}catch(e){r()}});
const load=()=>new Promise(r=>{if(!idb)return r(null);try{const g=idb.transaction('kv').objectStore('kv').get('s');g.onsuccess=()=>r(g.result||null);g.onerror=()=>r(null)}catch(e){r(null)}});
const save=()=>{try{idb&&idb.transaction('kv','readwrite').objectStore('kv').put(S,'s')}catch(e){}};
const bump=()=>{S.ver++};
function toast(t){const m=$('#msg');m.textContent=t;m.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>m.style.display='none',2200)}
const anim=()=>{document.body.classList.add('anim');clearTimeout(anim.t);anim.t=setTimeout(()=>document.body.classList.remove('anim'),1000)};
const wsorted=()=>[...S.weights].sort((a,b)=>a.date<b.date?-1:1);
const st=(l,v)=>`<div class="st"><small>${l}</small><b>${v}</b></div>`;
const sets=e=>e.sets.filter(x=>+x.r>0),setTxt=x=>(+x.w>0?x.w+' kg':'BW')+' × '+x.r;
const prevRef=(n,dow)=>{const ss=S.sessions.filter(s=>s.date<td()).sort((a,b)=>a.date<b.date?1:-1),has=s=>s.exercises.some(e=>e.name===n&&sets(e).length),f=ss.find(s=>new Date(s.date+'T12:00').getDay()===dow&&has(s))||ss.find(has);return f?{date:f.date,sets:sets(f.exercises.find(e=>e.name===n))}:null};
const pl=(lp,n,k,d)=>lp&&lp.sets[n]?lp.sets[n][k]||d:d;
function rng(k,f,t){const m={'7':7,'14':14,'1M':30,'3M':90,'6M':182,'1Y':365,'All':0};if(k==='Custom')return[f||'0000-01-01',t||'9999-12-31'];return[m[k]?addD(td(),-m[k]):'0000-01-01','9999-12-31']}
const opts=(o,c)=>o.map(([v,l])=>`<option value="${v}" ${v===c?'selected':''}>${l}</option>`).join('');
const RO=[['7','7 Days'],['14','14 Days'],['1M','1 Month'],['3M','3 Months'],['6M','6 Months'],['1Y','1 Year'],['All','All Time'],['Custom','Custom']];
const WO=[['7','Last 7 days'],['1M','Last month'],['3M','Last 3 months'],['6M','Last 6 months'],['1Y','Last year'],['All','All time'],['Custom','Custom']];
const dates=(p,k)=>V[p]==='Custom'?`<input type="date" data-f="${k}f" value="${V[k+'f']||''}"><input type="date" data-f="${k}t" value="${V[k+'t']||''}">`:'';
const ring=pc=>`<svg class="ring" viewBox="0 0 80 80"><circle class="rt" cx="40" cy="40" r="34"/><circle class="rf" cx="40" cy="40" r="34" style="stroke-dasharray:${pc*2.136} 214" transform="rotate(-90 40 40)"/><text x="40" y="46" text-anchor="middle">${pc}%</text></svg>`;
function lib(){const o=[];for(const g in LIB)LIB[g].forEach(n=>o.push(`<option value="${esc(n)}">${g}</option>`));S.custom.forEach(n=>o.push(`<option value="${esc(n)}">Custom</option>`));return`<datalist id="lib">${o.join('')}</datalist>`}

function home(){
const ws=wsorted(),l=ws.at(-1),p=ws.at(-2),mon=addD(td(),-wd()),wk=S.sessions.filter(s=>s.date>=mon).length,plan=S.routine.filter(d=>!d.rest&&d.ex.length).length,pc=plan?Math.min(100,Math.round(wk/plan*100)):0,h=new Date().getHours(),dy=S.routine[wd()];
return`<div class="card hero"><div><div class="mu">${h<12?'Good morning':h<17?'Good afternoon':'Good evening'}</div><div class="big">${dy.rest?'Rest day':esc(dy.name)||DAYS[wd()]}</div><div class="mu">${dy.rest?'Recover and refuel':dy.ex.length+' exercises lined up today'}</div></div>${ring(pc)}</div>
<div class="g">${st('Weight',l?l.kg+' kg':'—')}${st('Change',l&&p?sg(l.kg-p.kg)+' kg':'—')}<div class="st"><small>Height cm</small><input type="number" step="0.1" data-f="h" value="${S.height||''}" placeholder="—"></div>${st('This week',wk+' / '+plan)}</div>
<div class="card"><div class="lab">${I('scale')}Log weight</div><div class="row"><input type="date" id="wd" value="${td()}"><input type="number" step="0.1" id="wk" placeholder="kg"><input id="wn" placeholder="Note (optional)"><button class="b y" data-a="addw">${I('plus')}Log</button></div></div>${lib()}
${S.routine.map((d,i)=>`<div class="card"><div class="row"><b style="width:92px">${DAYS[i]}</b><input data-f="rn" data-d="${i}" value="${esc(d.name)}" placeholder="Split name (e.g. Chest)" ${d.rest?'disabled':''}><span class="mu">Rest</span><input type="checkbox" data-f="rest" data-d="${i}" ${d.rest?'checked':''}></div>
${d.rest?'':d.ex.map((x,j)=>`<div class="ex"><span class="nm"><input list="lib" data-f="ex" data-k="name" data-d="${i}" data-i="${j}" value="${esc(x.name)}"></span><input type="number" data-f="ex" data-k="sets" data-d="${i}" data-i="${j}" value="${x.sets}" title="Sets"><input type="number" data-f="ex" data-k="reps" data-d="${i}" data-i="${j}" value="${x.reps}" title="Reps"><input type="number" step="0.5" data-f="ex" data-k="w" data-d="${i}" data-i="${j}" value="${x.w||''}" placeholder="kg"><button class="b sm" data-a="up" data-d="${i}" data-i="${j}">${I('up')}</button><button class="b sm" data-a="dn" data-d="${i}" data-i="${j}">${I('dn')}</button><button class="b sm" data-a="rm" data-d="${i}" data-i="${j}">${I('x')}</button></div>`).join('')+`<div class="row" style="margin-top:8px"><input list="lib" id="add${i}" placeholder="Search or add exercise…"><button class="b sm y" data-a="addex" data-d="${i}">${I('plus')}Add</button></div>`}</div>`).join('')}
<div class="row"><button class="b sm" data-a="exp">${I('dl')}Export JSON</button><span class="mu">Routine v${S.ver}</span></div>`}

function today(){
const A=S.active,i=A?A.day:wd(),day=S.routine[i],done=S.sessions.find(s=>s.date===td()),name=A?A.split:(day.name||DAYS[i]),names=A?A.exercises.map(e=>e.name):day.ex.map(e=>e.name),dn=A?A.exercises.filter(e=>e.done).length:0;
const hero=`<div class="card hero"><div><div class="mu">${new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})} · ${A?'Live session':done?'Completed ✓':day.rest?'Rest day':'Ready'}</div><div class="big">${DAYS[i]} · ${esc(name)}</div><div class="mu">${names.length} exercises scheduled</div></div>${A?`<div class="clock" id="tm">${tm((Date.now()-A.start)/1000)}</div><div class="tube"><i style="width:${Math.round(dn/A.exercises.length*100)}%"></i></div>`:''}</div>`;
const ref=names.length&&!done&&!(day.rest&&!A)?`<div class="card"><div class="lab">${I('cal')}Last ${DAYS[i]} · beat these</div>${names.map(n=>{const r=prevRef(n,(i+1)%7);return`<div class="ref"><b>${esc(n)}</b><span class="mu">${r?r.sets.length+' sets · '+r.date:'first time — set your baseline'}</span><div class="chips">${r?r.sets.map(x=>`<i>${setTxt(x)}</i>`).join(''):''}</div></div>`}).join('')}</div>`:'';
if(!A){if(done)return hero+`<div class="card"><b>Workout complete.</b> <span class="mu">${tm(done.dur)} · ${done.exercises.length} exercises. Full breakdown is in Reports.</span></div>`;
if(day.rest)return hero+`<div class="card"><div class="big">Recovery mode 😴</div><div class="mu">Muscles grow while you rest. Nothing is scheduled today.</div></div>`;
if(!day.ex.length)return hero+`<div class="card"><p>No exercises set for today yet.</p><button class="b y" data-a="go">${I('home')}Build your routine</button></div>`;
return hero+ref+`<button class="b y wide" data-a="start">${I('dumb')}Start workout</button>`}
return hero+ref+A.exercises.map((e,j)=>{const lp=prevRef(e.name,(i+1)%7);return`<div class="card"><div class="row"><b>${esc(e.name)}</b><span class="mu">target ${e.ts}×${e.tr}${e.tw?' @ '+e.tw+' kg':''}</span><span class="sp"></span><button class="b sm ${e.done?'y':''}" data-a="done" data-i="${j}">${I('check')}${e.done?'Done':'Mark done'}</button></div>
<table><tr><th>Set</th><th>Weight (kg)</th><th>Reps</th><th></th></tr>${e.sets.map((s,n)=>`<tr><td>${n+1}</td><td><input type="number" step="0.5" data-f="sw" data-e="${j}" data-s="${n}" value="${s.w}" placeholder="${pl(lp,n,'w',e.tw||'BW')}"></td><td><input type="number" data-f="sr" data-e="${j}" data-s="${n}" value="${s.r}" placeholder="${pl(lp,n,'r',e.tr)}"></td><td><button class="b sm" data-a="rmset" data-i="${j}" data-d="${n}">${I('x')}</button></td></tr>`).join('')}</table>
<div class="row" style="margin-top:8px"><button class="b sm" data-a="addset" data-i="${j}">${I('plus')}Set</button><input data-f="en" data-i="${j}" placeholder="Notes" value="${esc(e.notes)}"></div></div>`}).join('')+
`<div class="row"><button class="b y sp" data-a="finish">${I('check')}Finish workout</button><button class="b" data-a="disc">${V.cd==='disc'?'Tap again to discard':'Discard'}</button></div>`}

const agg=ss=>{let ex=0,n=0,reps=0,vol=0,bw=0,dur=0;ss.forEach(s=>{dur+=s.dur||0;s.exercises.forEach(e=>{const t=sets(e);if(!t.length)return;ex++;t.forEach(x=>{n++;reps+=+x.r;if(+x.w>0)vol+=x.w*x.r;else bw+=+x.r})})});return{w:ss.length,ex,n,reps,vol,bw,avg:ss.length?dur/ss.length:0}};
const best=a=>a.reduce((b,x)=>!b||x.w>b.w||(x.w===b.w&&x.r>b.r)?x:b,null);
function chart(ws){if(!ws.length)return'<p class="mu">No weight entries in this range yet.</p>';
const W=600,H=220,p=34,t0=+new Date(ws[0].date),t1=+new Date(ws.at(-1).date),mn=Math.min(...ws.map(w=>w.kg))-.5,mx=Math.max(...ws.map(w=>w.kg))+.5,x=d=>t1===t0?W/2:p+(new Date(d)-t0)/(t1-t0)*(W-2*p),y=v=>H-p-(v-mn)/(mx-mn)*(H-2*p);
return`<svg viewBox="0 0 ${W} ${H}" style="width:100%"><line class="gl" x1="${p}" x2="${W-p}" y1="${y(mn)}" y2="${y(mn)}"/><line class="gl" x1="${p}" x2="${W-p}" y1="${y(mx)}" y2="${y(mx)}"/><text class="lb" x="2" y="${y(mx)+4}">${r1(mx)}</text><text class="lb" x="2" y="${y(mn)+4}">${r1(mn)}</text><text class="lb" x="${p}" y="${H-8}">${ws[0].date}</text><text class="lb" x="${W-p}" y="${H-8}" text-anchor="end">${ws.at(-1).date}</text><polyline class="ln" points="${ws.map(w=>x(w.date)+','+y(w.kg)).join(' ')}"/>${ws.map(w=>`<circle class="pt" data-a="pt" data-k="${w.date}" cx="${x(w.date)}" cy="${y(w.kg)}" r="6"/>`).join('')}</svg>`}
function reports(){
const all=wsorted(),[a,b]=rng(V.wr,V.wf,V.wt),ws=all.filter(w=>w.date>=a&&w.date<=b);
let sel='';if(V.pt0){const i=all.findIndex(w=>w.date===V.pt0);if(i>=0)sel=`<div class="st" style="margin-top:8px"><small>${all[i].date}</small><b>${all[i].kg} kg</b> <span class="${i&&all[i].kg-all[i-1].kg>0?'dn':'up'}">${i?sg(all[i].kg-all[i-1].kg)+' kg vs previous':'first entry'}</span></div>`}
const wst=ws.length?`<div class="g">${st('Starting',ws[0].kg+' kg')}${st('Latest',ws.at(-1).kg+' kg')}${st('Highest',Math.max(...ws.map(w=>w.kg))+' kg')}${st('Lowest',Math.min(...ws.map(w=>w.kg))+' kg')}${st('Net change',sg(ws.at(-1).kg-ws[0].kg)+' kg')}${st('Average',r1(ws.reduce((s,w)=>s+w.kg,0)/ws.length)+' kg')}</div>`:'';
const [c,d]=rng(V.pr,V.prf,V.prt),ss=S.sessions.filter(s=>s.date>=c&&s.date<=d).sort((x,y)=>x.date<y.date?1:-1),g=agg(ss),days=V.pr==='Custom'?Math.max(1,(new Date(d)-new Date(c))/864e5+1):V.pr==='All'?Math.max(7,(Date.now()-new Date(ss.at(-1)?.date||td()))/864e5+1):({'7':7,'1M':30,'3M':90,'6M':182,'1Y':365})[V.pr],planned=S.routine.filter(x=>!x.rest&&x.ex.length).length*days/7;
const names=[...new Set(S.sessions.flatMap(s=>s.exercises.filter(e=>sets(e).length).map(e=>e.name)))].sort(),pe=names.includes(V.pe)?V.pe:names[0];
return`<div class="card"><div class="lab">${I('scale')}Body weight</div><div class="row"><select data-f="wr">${opts(RO,V.wr)}</select>${dates('wr','w')}</div>${chart(ws)}${sel}</div>${wst}
<div class="card"><div class="lab">${I('dumb')}Training</div><div class="row"><select data-f="pr">${opts(WO,V.pr)}</select>${dates('pr','pr')}</div><div class="g">${st('Workouts',g.w)}${st('Exercises',g.ex)}${st('Sets',g.n)}${st('Total reps',g.reps)}${st('Volume',Math.round(g.vol)+' kg')}${st('Bodyweight reps',g.bw)}${st('Avg duration',tm(g.avg))}${st('Consistency',planned?Math.min(100,Math.round(g.w/planned*100))+'%':'—')}</div>
<div class="mu" style="font-size:12px">Volume = Σ weight × reps for weighted sets; bodyweight sets count as reps. Consistency compares against your current plan.</div></div>
${ss.map(s=>`<details class="card"><summary><b>${s.date}</b> · ${esc(s.split)} · ${tm(s.dur)}</summary>${s.exercises.map(e=>`<details style="margin-left:10px"><summary>${esc(e.name)}${e.done?' ✓':''}</summary>${sets(e).map((x,n)=>`<div class="mu">Set ${n+1}: ${setTxt(x)}</div>`).join('')||'<div class="mu">No sets logged</div>'}${e.notes?`<div class="mu">Note: ${esc(e.notes)}</div>`:''}</details>`).join('')}<button class="b sm" data-a="dels" data-k="${s.id}" style="margin-top:8px">${V.cd===s.id?'Tap again to delete':'Delete session'}</button></details>`).join('')}
<div class="card"><div class="lab">${I('chart')}Progressive overload</div>${names.length?`<select data-f="pe">${opts(names.map(n=>[n,n]),pe)}</select>${prog(pe)}`:'<p class="mu">Finish a workout to unlock exercise progression.</p>'}</div>`}
function prog(n){
const rows=S.sessions.filter(s=>s.exercises.some(e=>e.name===n&&sets(e).length)).sort((a,b)=>a.date<b.date?-1:1).map(s=>{const w=sets(s.exercises.find(e=>e.name===n)).map(x=>({w:+x.w||0,r:+x.r}));return{date:s.date,t:w,top:best(w),vol:w.reduce((q,x)=>q+x.w*x.r,0)}});
const tr=(p,c)=>{if(!p||(p.top.w>0)!==(c.top.w>0))return'–';const k=c.top.w!==p.top.w?c.top.w-p.top.w:c.top.r-p.top.r;return k>0?'<span class="up">▲</span>':k<0?'<span class="dn">▼</span>':'='};
const all=rows.flatMap(r=>r.t.map(x=>({...x,date:r.date}))),pw=best(all),pr=all.reduce((b,x)=>!b||x.r>b.r?x:b,null),pv=all.reduce((b,x)=>!b||x.w*x.r>b.w*b.r?x:b,null),L=x=>x?`${setTxt(x)} (${x.date})`:'—';
const N=+V.cmp,cur=rows.filter(r=>r.date>addD(td(),-N)),prv=rows.filter(r=>r.date<=addD(td(),-N)&&r.date>addD(td(),-2*N)),bc=best(cur.flatMap(r=>r.t)),bp=best(prv.flatMap(r=>r.t));
return`<div class="g">${st('Heaviest',L(pw))}${st('Most reps',L(pr))}${st('Best set volume',pv&&pv.w>0?`${r1(pv.w*pv.r)} kg`:'—')}</div>
<div class="sc"><table><tr><th>Date</th><th>Top set</th><th>Sets</th><th>Volume</th><th></th></tr>${rows.map((r,i)=>`<tr><td>${r.date}</td><td>${setTxt(r.top)}</td><td>${r.t.length}</td><td>${r.vol?Math.round(r.vol)+' kg':'BW'}</td><td>${tr(rows[i-1],r)}</td></tr>`).join('')}</table></div>
<div class="row" style="margin-top:10px"><select data-f="cmp">${opts([['7','This week vs previous'],['30','This month vs previous']],V.cmp)}</select></div><p>${bc?`Now: <b>${setTxt(bc)}</b>`:'No sessions this period.'} · ${bp?`Before: <b>${setTxt(bp)}</b>`:'No sessions in the previous period.'}</p><div class="mu" style="font-size:12px">Trend compares top-set weight, then reps at equal weight. More total volume alone isn’t treated as progression.</div>`}

const TB=[['home','Home'],['dumb','Workout'],['chart','Reports']],pg=$('#pager');
$('#top').innerHTML=TB.map((t,i)=>`<button class="tab" data-t="${i}">${I(t[0])}<span>${t[1]}</span></button>`).join('')+'<i id="led" title="Offline-ready"></i>';
const tabs=()=>document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('on',i===V.p));
function render(){$('#p0').innerHTML='<div>'+home()+'</div>';$('#p1').innerHTML='<div>'+today()+'</div>';$('#p2').innerHTML='<div>'+reports()+'</div>';tabs()}
pg.addEventListener('scroll',()=>{const i=Math.round(pg.scrollLeft/pg.clientWidth);if(i!==V.p){V.p=i;tabs();anim()}},{passive:true});
document.addEventListener('click',e=>{const tb=e.target.closest('[data-t]');if(tb){pg.scrollTo({left:+tb.dataset.t*pg.clientWidth,behavior:'smooth'});return}
const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,d=+b.dataset.d,i=+b.dataset.i,k=b.dataset.k,A=S.active;
if(!['dels','disc'].includes(a))V.cd=0;
switch(a){
case'go':pg.scrollTo({left:0,behavior:'smooth'});return;
case'addw':{const date=$('#wd').value,kg=+$('#wk').value;if(!date||!(kg>0)){toast('Enter a valid date and weight');return}const o=S.weights.find(w=>w.date===date),n=$('#wn').value;if(o){o.kg=kg;o.note=n}else S.weights.push({id:uid(),date,kg,note:n});toast(o?'Entry for that date updated':'Weight logged ✓');break}
case'addex':{const n=$('#add'+d).value.trim();if(!n)return;if(!Object.values(LIB).flat().includes(n)&&!S.custom.includes(n))S.custom.push(n);S.routine[d].ex.push({name:n,sets:3,reps:10,w:0});bump();break}
case'rm':S.routine[d].ex.splice(i,1);bump();break;
case'up':case'dn':{const x=S.routine[d].ex,j=a==='up'?i-1:i+1;if(j<0||j>=x.length)return;[x[i],x[j]]=[x[j],x[i]];bump();break}
case'start':{const dy=S.routine[wd()];S.active={id:uid(),date:td(),day:wd(),split:dy.name||DAYS[wd()],start:Date.now(),ver:S.ver,snap:clone(dy),exercises:dy.ex.map(x=>({name:x.name,ts:x.sets,tr:x.reps,tw:x.w,notes:'',done:false,sets:Array.from({length:Math.max(1,x.sets)},()=>({w:'',r:''}))}))};break}
case'addset':A.exercises[i].sets.push({w:'',r:''});break;
case'rmset':A.exercises[i].sets.splice(d,1);break;
case'done':A.exercises[i].done=!A.exercises[i].done;break;
case'disc':if(V.cd==='disc'){S.active=null;V.cd=0}else V.cd='disc';break;
case'finish':{if(!A.exercises.some(x=>sets(x).length)){toast('Log at least one set first');return}
if(!S.sessions.some(s=>s.id===A.id)){const end=Date.now();S.sessions.push({id:A.id,date:A.date,split:A.split,ver:A.ver,snap:A.snap,start:A.start,end,dur:Math.round((end-A.start)/1000),exercises:A.exercises.map(x=>({name:x.name,notes:x.notes,done:x.done,sets:sets(x).map(s=>({w:+s.w||0,r:+s.r}))}))})}S.active=null;toast('Workout saved 💪');break}
case'pt':V.pt0=k;break;
case'dels':if(V.cd===k){S.sessions=S.sessions.filter(s=>s.id!==k);V.cd=0}else V.cd=k;break;
case'exp':{const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download='fitness-data.json';l.click();return}}
save();render()});
document.addEventListener('change',e=>{const t=e.target,f=t.dataset.f;if(!f)return;const d=+t.dataset.d,i=+t.dataset.i,k=t.dataset.k,A=S.active;let rr=0;
if(f==='h')S.height=+t.value||null;
else if(f==='rn'){S.routine[d].name=t.value;bump()}
else if(f==='rest'){S.routine[d].rest=t.checked;bump();rr=1}
else if(f==='ex'){const x=S.routine[d].ex[i];if(k==='name'){x.name=t.value.trim()||x.name;if(!Object.values(LIB).flat().includes(x.name)&&!S.custom.includes(x.name))S.custom.push(x.name)}else x[k]=Math.max(0,+t.value||0);bump()}
else if(f==='sw')A.exercises[+t.dataset.e].sets[+t.dataset.s].w=t.value===''?'':+t.value;
else if(f==='sr')A.exercises[+t.dataset.e].sets[+t.dataset.s].r=t.value===''?'':+t.value;
else if(f==='en')A.exercises[i].notes=t.value;
else{V[f]=t.value;rr=1}
save();if(rr)render()});
setInterval(()=>{const e=$('#tm');if(e&&S.active)e.textContent=tm((Date.now()-S.active.start)/1000)},1000);
const led=()=>$('#led').classList.toggle('on',navigator.onLine||!!navigator.serviceWorker?.controller);addEventListener('online',led);addEventListener('offline',led);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
(async()=>{await open();const s=await load();if(s)S={...fresh(),...s};render();anim();led()})();