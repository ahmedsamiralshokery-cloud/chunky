const BLOBS={"logo": "img/logo.jpg", "wm": "img/wm.png", "bg": "img/bg.jpg", "m1": "img/menu-1.jpg", "m2": "img/menu-2.jpg", "IMG": {"pa": "img/th/pa.jpg", "fz": "img/th/fz.jpg", "tk": "img/th/tk.jpg", "mc": "img/th/mc.jpg", "cu": "img/th/cu.jpg", "mix": "img/th/mix.jpg", "ch": "img/th/ch.jpg", "jar": "img/th/jar.jpg", "cf": "img/th/cf.jpg", "cs": "img/th/cs.jpg", "wg": "img/th/wg.jpg", "on": "img/th/on.jpg", "cb": "img/th/cb.jpg", "O1": "img/offers/O1.jpg", "O2": "img/offers/O2.jpg", "O3": "img/offers/O3.jpg"}, "CIMG": {"st": "img/cat/st.jpg", "br": "img/cat/br.jpg", "tw": "img/cat/tw.jpg", "bc": "img/cat/bc.jpg", "bf": "img/cat/bf.jpg"}};
const $=s=>document.querySelector(s),ar=s=>String(s).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const cart=new Map();
document.querySelectorAll("[data-b]").forEach(e=>{e.src=BLOBS[e.dataset.b]});$(".hero").style.backgroundImage="url("+BLOBS.bg+")";
const IMG=BLOBS.IMG,CAT={"وجبات البروست":"br","وجبات الستريبس":"st","برجر بيف":"bf","برجر تشيكن":"bc","تويستر":"tw"},PIC={"ميكس بوكس":"mix","تشانكي بوكس":"ch","تشيكن باستا":"pa","فتة زنجر":"fz","تشك تشيكن":"tk","ماك أند تشيز":"mc","بافلو وينجز 6 قطع":"wg","بافلو وينجز 12 قطعة":"wg","تشيز ستريبس":"cs","تشيز فرايز":"cf","فرنش فرايز":"cf","كرنكل فرايز":"cu","جار جبنة سايحة":"jar","أونيون رينجز":"on","كومبو بطاطس وحاجة ساقعة":"cb"};
const pic=(n,c)=>{const k=CAT[c]?"":PIC[n];return k?`<img class="th" src="${IMG[k]}" alt="" loading="lazy">`:""};
let pend;
const addCart=(k,p)=>{const i=cart.get(k)||{n:k,p,q:0};i.q++;cart.set(k,i);draw()};
const WS=["باربيكيو","بافلو"],WP=["عليهم","برا"];
function openPick(P){pend=P;pkDraw();$("#saD").showModal()}
function add(D){const p=+D.p,s=+D.s||0,ing=D.r?D.r.split("،").filter(Boolean):[];
 const go=pre=>{const n=D.n+(pre?" ("+pre+")":"");
  if(D.g==="w")openPick({n,p,mode:"w",s,slots:Array.from({length:s},()=>({}))});
  else if(s<0)openPick({n,p,mode:"x",s,sel:[],list:S.sauces.map(x=>x[0])});
  else if(s>0)openPick({n,p,mode:"m",s,sel:[],list:S.msauces.map(x=>x[0])});
  else if(ing.length)openPick({n,p,mode:"r",s:0,sel:[],list:ing});
  else addCart(n,p)};
 if(D.sp==="1")openPick({n:D.n,p,mode:"s",sel:[],list:["عادي","سبايسي"],next:go});else go("")}
function pkDraw(){const P=pend,m=P.mode;let t,ok,x="";
 if(m==="w"){t=P.n+" — اختار "+P.slots.length+" صوص";P.slots.forEach((o,k)=>{x+=`<div class="sl"><b>صوص ${ar(k+1)}</b><div class="sa">`+WS.map(v=>`<button class="chip" data-w="${k}|s|${v}" aria-pressed="${o.s===v}">${v}</button>`).join("")+WP.map(v=>`<button class="chip" data-w="${k}|p|${v}" aria-pressed="${o.p===v}">${v}</button>`).join("")+`</div></div>`});ok=P.slots.every(o=>o.s&&o.p)}
 else{const need=m==="m"?Math.min(P.s,P.list.length):m==="x"||m==="s"?1:0,c=P.sel.length;
  t=m==="s"?P.n+" — عادي ولا سبايسي؟":m==="r"?P.n+" — عايز تشيل حاجة؟ (اختياري)":m==="x"?P.n+" — اختار أي عدد، "+P.p+" جنيه لكل صوص ("+c+" = "+c*P.p+" جنيه)":P.n+" — اختار "+need+" صوص ("+c+"/"+need+")";
  x=P.list.map(v=>{const on=P.sel.includes(v);return `<button class="chip" data-sa="${esc(v)}" aria-pressed="${on}"${m==="m"&&!on&&c>=need?" disabled":""}>${m==="r"?"من غير ":""}${esc(v)}</button>`}).join("");ok=c>=need}
 $("#saT").textContent=ar(t);$("#saL").innerHTML=x;$("#saOk").disabled=!ok}
const HINT={"وجبات البروست":"💡 البروست فراخ بالعضم، والستريبس فراخ من غير عضم.","وجبات الستريبس":"💡 البروست فراخ بالعضم، والستريبس فراخ من غير عضم."};
function show(c){cur=c;const ck=CAT[c];$("#catHead").innerHTML=ck?`<figure class="cimg"><img src="${BLOBS.CIMG[ck]}" alt="${esc(c)}"></figure>`+(HINT[c]?`<p class="hint">${HINT[c]}</p>`:""):"";
 document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.textContent===c));
 $("#list").innerHTML=S.menu[c].map(([n,d,p,s,ing,g,sp])=>`<li>${pic(n,c)}<div><b>${ar(n)}</b>${d?`<small>${ar(d)}</small>`:""}</div><span class="pr">${ar(p)} جنيه</span><button class="add" data-n="${esc(n)}" data-p="${p}" data-s="${s||0}" data-g="${g||""}" data-r="${esc(ing||"")}" data-sp="${sp?1:0}" aria-label="أضف ${n}">+</button></li>`).join("");
}
let cur,S=JSON.parse(JSON.stringify(window.MENU_DATA||{}));
for(const k of["offers","sauces","msauces","areas"])S[k]=S[k]||[];S.menu=S.menu||{};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const feeOf=()=>{const o=$("#area").selectedOptions[0];return o&&o.dataset.f!==undefined?+o.dataset.f:null};
function init(){
 $("#tabs").innerHTML="";
 Object.keys(S.menu).forEach(c=>{const b=document.createElement("button");b.textContent=c;b.role="tab";b.onclick=()=>show(c);$("#tabs").append(b)});
 const k=$("#area").value||"x";
 $("#area").innerHTML='<option value="x" disabled selected>اختار منطقتك</option>'+S.areas.map(([n,f])=>`<option value="${esc(n)}" data-n="${esc(n)}" data-f="${+f||0}">${ar(esc(n))} — ${ar(+f||0)} جنيه</option>`).join("")+'<option value="" data-n="منطقة تانية">منطقة تانية (التوصيل هنتفق عليه)</option>';
 $("#area").value=[...$("#area").options].some(o=>o.value===k)?k:"x";
 show(S.menu[cur]?cur:Object.keys(S.menu)[0]);offersDraw();draw();
}
function adrFx(){const o=$("#area").value==="",a=$("#ad");a.classList.toggle("hl",o);a.rows=o?3:2;a.placeholder=o?"اكتب اسم المنطقة وعنوانك بالتفصيل":"العنوان بالتفصيل (الشارع، رقم العمارة...)";$("#adH").hidden=!o;if(o)a.focus()}
$("#area").onchange=()=>{draw();adrFx()};
$("#noteBtn").onclick=()=>{const n=$("#note");n.hidden=!n.hidden;if(!n.hidden)n.focus()};
const src=o=>IMG[o.img]||o.img;
function offersDraw(){$("#offers").hidden=!S.offers.length;$("#offerList").innerHTML=S.offers.map(o=>`<article class="offer">${o.img?`<img src="${src(o)}" alt="${esc(o.n)}" loading="lazy">`:""}<div><b>${ar(esc(o.n))}</b><b class="pr">${ar(+o.p||0)} جنيه</b></div>${o.d?`<div><span>${ar(esc(o.d))}</span></div>`:""}<div><button class="btn add-o" data-n="${esc(o.n)}" data-p="${+o.p||0}" data-s="${+o.s||0}" data-sp="${+o.sp||0}">أضف للطلب</button></div></article>`).join("")}
const AR="مناطق التوصيل",OF="العروض",SA="صوصات الاكسترا",MSA="صوصات الوجبات",GH="إعدادات GitHub";let adm;
const rows=()=>adm===GH?[]:adm===AR?S.areas:adm===SA?S.sauces:adm===MSA?S.msauces:adm===OF?S.offers:S.menu[adm];
const rd=f=>new Promise(r=>{const R=new FileReader();R.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,640/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.78))};i.src=R.result};R.readAsDataURL(f)});
function admDraw(){
 adm=adm||Object.keys(S.menu)[0];
 $("#admTabs").innerHTML=[...Object.keys(S.menu),OF,MSA,SA,AR,GH].map(c=>`<button aria-selected="${c===adm}" data-c="${esc(c)}">${c}</button>`).join("");
 if(adm===GH){const c=ghCfg();$("#admBody").innerHTML='<p>التعديلات بتتحفظ على GitHub (ملف js/menu-data.js). ادخل البيانات مرة واحدة، وبتتحفظ على جهازك بس.</p>'+[["ghOwner","اسم حساب GitHub (owner)",c.owner],["ghRepo","اسم المستودع (repo)",c.repo],["ghBranch","الفرع (branch)",c.branch]].map(([id,l,v])=>`<label for="${id}">${l}</label><input id="${id}" value="${esc(v)}" autocomplete="off">`).join("")+'<label for="ghToken">التوكن (Fine-grained، صلاحية Contents: Read and write)</label><input id="ghToken" type="password" value="'+esc(c.token)+'" autocomplete="off">';return}
 const f=(i,k,v,x="")=>`<input data-i="${i}" data-k="${k}" value="${esc(v)}"${x}>`,N=' type="number"';
 $("#admBody").innerHTML=(adm===OF?S.offers.map((o,i)=>`<div class="of">${o.img?`<img class="th" src="${src(o)}" alt="">`:""}<div class="ar">${f(i,"n",o.n,' placeholder="اسم العرض"')}${f(i,"p",o.p,N+' placeholder="السعر"')}${f(i,"s",o.s||0,N+' placeholder="عدد الصوص"')}${f(i,"sp",o.sp||0,N+' placeholder="سبايسي؟ (1=نعم)"')}</div><div class="ar">${f(i,"d",o.d||"",' placeholder="الوصف"')}</div><div class="ar"><input type="file" accept="image/*" data-up="${i}">${o.img?`<button data-rm="${i}">شيل الصورة</button>`:""}<button data-del="${i}">حذف العرض</button></div></div>`).join(""):rows().map((r,i)=>`<div class="ar">${f(i,0,r[0],' placeholder="الاسم"')}${adm===AR?f(i,1,r[1],N+' placeholder="الرسوم"'):adm===SA||adm===MSA?"":f(i,1,r[1],' placeholder="الوصف"')+f(i,2,r[2],N+' placeholder="السعر"')+f(i,3,r[3]||0,N+' placeholder="صوص (-1 = حر)" title="عدد الصوصات المضمنة. -1 = الزبون يختار أي عدد والسعر لكل صوص"')+f(i,4,r[4]||"",' placeholder="مكونات يقدر الزبون يشيلها (بفاصلة ،)"')+f(i,6,r[6]||0,N+' placeholder="سبايسي؟ (1=نعم)"')}<button data-del="${i}" aria-label="حذف">×</button></div>`).join(""))+'<button class="btn" data-new="1">+ إضافة</button>';
}
$("#admBody").oninput=e=>{const t=e.target;if(t.id&&t.id.startsWith("gh")){try{localStorage.setItem(t.id,t.value)}catch(_){}return}const r=rows()[t.dataset.i];if(r)r[t.dataset.k]=t.type==="number"?+t.value:t.value};
$("#admBody").onchange=async e=>{const t=e.target;if(t.dataset.up!==undefined&&t.files[0]){S.offers[+t.dataset.up].img=await rd(t.files[0]);admDraw()}};
$("#admD").onclick=e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.c){adm=b.dataset.c;admDraw()}
 else if(b.dataset.del){rows().splice(+b.dataset.del,1);admDraw()}
 else if(b.dataset.rm){S.offers[+b.dataset.rm].img="";admDraw()}
 else if(b.dataset.new){rows().push(adm===AR?["",0]:adm===SA||adm===MSA?[""]:adm===OF?{n:"",d:"",p:0,s:0,sp:0,img:""}:["","",0,0,""]);admDraw()}};
const lsGet=k=>{try{return localStorage.getItem(k)||""}catch(e){return ""}};
function ghCfg(){const m=location.hostname.match(/^([^.]+)\.github\.io$/),seg=location.pathname.split("/").filter(Boolean)[0];
 return{owner:lsGet("ghOwner")||(m?m[1]:""),repo:lsGet("ghRepo")||(m?(seg&&!/\.html?$/.test(seg)?seg:m[1]+".github.io"):""),branch:lsGet("ghBranch")||"main",token:lsGet("ghToken")}}
const ghClean=c=>{let o=String(c.owner||"").trim(),r=String(c.repo||"").trim().replace(/^https?:\/\/github\.com\//i,"").replace(/\.git$/,"").replace(/\/+$/,"");const p=r.split("/").filter(Boolean);if(p.length>=2){o=p[0];r=p[1]}else r=p[0]||"";
 return{owner:o.replace(/\s+/g,""),repo:r.replace(/\s+/g,""),branch:String(c.branch||"main").trim()||"main",token:String(c.token||"").replace(/\s+/g,"")}};
const u8b64=s=>{const b=new TextEncoder().encode(s);let x="";for(let i=0;i<b.length;i+=32768)x+=String.fromCharCode.apply(null,b.subarray(i,i+32768));return btoa(x)};
async function ghSave(){const c=ghClean(ghCfg());if(!c.owner||!c.repo||!c.token)throw new Error("اكمل إعدادات GitHub (الحساب، المستودع، التوكن)");
 const api="https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/js/menu-data.js",H={Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"};
 let sha;const g=await fetch(api+"?ref="+encodeURIComponent(c.branch),{headers:H});
 if(g.ok)sha=(await g.json()).sha;else if(g.status!==404)throw new Error("GitHub "+g.status+(g.status===401?" (التوكن غلط أو منتهي)":g.status===403?" (التوكن من غير صلاحية Contents)":""));
 const body={message:"Update menu from admin panel",content:u8b64("window.MENU_DATA="+JSON.stringify(S)+";\n"),branch:c.branch};if(sha)body.sha=sha;
 const p=await fetch(api,{method:"PUT",headers:{...H,"Content-Type":"application/json"},body:JSON.stringify(body)});
 if(!p.ok)throw new Error("GitHub "+p.status+(p.status===404?" (اسم المستودع أو الفرع غلط)":p.status===403||p.status===401?" (راجع صلاحيات التوكن)":""))}
async function ghFixSite(){const c=ghClean(ghCfg());if(location.protocol!=="https:"||/^(localhost|127\.)/.test(location.hostname))return false;
 const base=location.origin+location.pathname.replace(/[^/]*$/,""),api="https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/index.html",H={Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"};
 const g=await fetch(api+"?ref="+encodeURIComponent(c.branch),{headers:H});if(!g.ok)return false;const j=await g.json();
 const txt=new TextDecoder().decode(Uint8Array.from(atob(String(j.content).replace(/\s/g,"")),x=>x.charCodeAt(0)));
 if(!txt.includes("__SITE_URL__"))return false;
 const p=await fetch(api,{method:"PUT",headers:{...H,"Content-Type":"application/json"},body:JSON.stringify({message:"Set site URL for link previews",content:u8b64(txt.split("__SITE_URL__").join(base)),sha:j.sha,branch:c.branch})});return p.ok}
$("#admSave").onclick=async()=>{
 const m=$("#admMsg");
 for(const c in S.menu)S.menu[c]=S.menu[c].filter(r=>String(r[0]).trim());
 S.areas=S.areas.filter(r=>String(r[0]).trim());S.sauces=S.sauces.filter(r=>String(r[0]).trim());S.msauces=S.msauces.filter(r=>String(r[0]).trim());S.offers=S.offers.filter(o=>String(o.n).trim());
 init();m.textContent="بنحفظ على GitHub…";
 try{await ghSave();const fx=await ghFixSite().catch(()=>false);m.textContent="اتحفظ على GitHub. التعديل هيظهر لكل الزباين خلال دقيقة تقريبًا."+(fx?" وتم ضبط رابط صورة معاينة اللينك.":"")}catch(e){m.textContent="الحفظ مشتغلش: "+(e&&e.name==="TypeError"?"مقدرتش أوصل لـ GitHub. اتأكد إن خانة المستودع فيها اسم المستودع بس (chunky) من غير اسم الحساب، وإن النت شغال، ومفيش VPN أو مانع إعلانات.":e.message)}
};
$("#admX").onclick=()=>$("#admD").close();
const PH="5c2be6f638d471f666ab5dd0604d28336ebe976967ba4914319689e4d2f3928f",sha=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,"0")).join("");
$("#admBtn").onclick=()=>{$("#pw").value="";$("#pwE").textContent="";$("#pwD").showModal();$("#pw").focus()};
const enter=async()=>{let g="";try{g=await sha($("#pw").value)}catch(e){}if(g===PH){$("#pwD").close();admDraw();$("#admD").showModal()}else $("#pwE").textContent="الباسورد غلط."};
$("#saOk").onclick=()=>{const P=pend;if(P.mode==="s"){const nx=P.next,v=P.sel[0];$("#saD").close();nx(v);return}let k=P.n,pr=P.p;if(P.mode==="w")k+=" ["+P.slots.map(o=>o.s+" ("+o.p+")").join("، ")+"]";else if(P.mode==="r"){if(P.sel.length)k+=" [من غير: "+P.sel.join("، ")+"]"}else{k+=" ["+P.sel.join("، ")+"]";if(P.mode==="x")pr=P.p*P.sel.length}addCart(k,pr);$("#saD").close()};$("#saX").onclick=()=>$("#saD").close();
$("#pwOk").onclick=enter;$("#pw").onkeydown=e=>{if(e.key==="Enter")enter()};

init();
function draw(){
 const a=[...cart.values()],n=a.reduce((s,i)=>s+i.q,0),t=a.reduce((s,i)=>s+i.q*i.p,0);
 const f=feeOf(),x=$("#area").value==="x";$("#cnt").textContent=ar(n);$("#tot").textContent=ar(t+(f||0));$("#sub").textContent=ar(t);$("#fee").textContent=x?"اختار منطقتك":f==null?"هنتفق عليه":ar(f)+" جنيه";$("#sum").textContent=ar(t+(f||0));$("#fab").hidden=!n;
 $("#lines").innerHTML=a.length?a.map(i=>`<li><span>${ar(i.n)}</span><span class="q"><button data-q="${i.n}" data-d="-1" aria-label="أقل">−</button> ${ar(i.q)} <button data-q="${i.n}" data-d="1" aria-label="أكتر">+</button></span><b>${ar(i.q*i.p)}</b></li>`).join(""):"<li>السلة فاضية. ضيف حاجة من المنيو.</li>";
 if(!n&&$("#cartD").open)$("#cartD").close();
}
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.w){const[k,f,v]=b.dataset.w.split("|");pend.slots[+k][f]=v;pkDraw()}
 else if(b.dataset.sa){const P=pend,x=b.dataset.sa;if(P.mode==="s")P.sel=[x];else{const k=P.sel.indexOf(x);k<0?P.sel.push(x):P.sel.splice(k,1)}pkDraw()}
 else if(b.dataset.p){add(b.dataset)}
 else if(b.dataset.q){const i=cart.get(b.dataset.q);i.q+=+b.dataset.d;if(i.q<1)cart.delete(b.dataset.q);draw()}
 else if(b.dataset.zoom){$("#zimg").src=BLOBS[b.dataset.zoom];$("#zoomD").showModal()}
});
$("#zoomD").onclick=()=>$("#zoomD").close();
$("#fab").onclick=()=>$("#cartD").showModal();
$("#close").onclick=()=>$("#cartD").close();
$("#send").onclick=()=>{
 const a=[...cart.values()],t=a.reduce((s,i)=>s+i.q*i.p,0),nm=$("#nm").value.trim(),ph=$("#ph").value.trim(),ad=$("#ad").value.trim();
 const f=feeOf(),nt=$("#note").value.trim();if($("#area").value==="x"){$("#err").textContent="اختار منطقة التوصيل.";return}if(!nm||!ph||!ad){$("#err").textContent="اكتب الاسم ورقم التليفون والعنوان.";return}
 $("#err").textContent="";
 const L=a.map((i,k)=>`${k+1}) ${i.n} × ${i.q} = ${i.q*i.p} جنيه`).join("\n");
 const msg=ar(`طلب جديد من موقع تشانكي\n\n${L}\n\nالمنتجات: ${t} جنيه\nالتوصيل (${$("#area").selectedOptions[0].dataset.n}): ${f==null?"هنتفق عليه":f+" جنيه"}\nالإجمالي: ${t+(f||0)} جنيه\n\n${nm?"الاسم: "+nm+"\n":""}التليفون: ${ph}\nالعنوان: ${ad}${nt?"\nملاحظات: "+nt:""}`);
 window.open("https://wa.me/201211211424?text="+encodeURIComponent(msg),"_blank");
};
document.querySelectorAll(".add-o").forEach(b=>b.classList.add("add-o"));
