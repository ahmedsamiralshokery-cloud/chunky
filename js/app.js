const BLOBS={"logo": "img/logo.jpg", "wm": "img/wm.png", "bg": "img/bg.jpg", "m1": "img/menu-1.jpg", "m2": "img/menu-2.jpg", "IMG": {"pa": "img/th/pa.jpg", "fz": "img/th/fz.jpg", "tk": "img/th/tk.jpg", "mc": "img/th/mc.jpg", "cu": "img/th/cu.jpg", "mix": "img/th/mix.jpg", "ch": "img/th/ch.jpg", "jar": "img/th/jar.jpg", "cf": "img/th/cf.jpg", "cs": "img/th/cs.jpg", "wg": "img/th/wg.jpg", "on": "img/th/on.jpg", "cb": "img/th/cb.jpg", "O1": "img/offers/O1.jpg", "O2": "img/offers/O2.jpg", "O3": "img/offers/O3.jpg"}, "CIMG": {"st": "img/cat/st.jpg", "br": "img/cat/br.jpg", "tw": "img/cat/tw.jpg", "bc": "img/cat/bc.jpg", "bf": "img/cat/bf.jpg"}};
const $=s=>document.querySelector(s),ar=s=>String(s).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const cart=new Map();
document.querySelectorAll("[data-b]").forEach(e=>{e.src=BLOBS[e.dataset.b]});$(".hero").style.backgroundImage="url("+BLOBS.bg+")";
const IMG=BLOBS.IMG,CAT={"وجبات البروست":"br","وجبات الستريبس":"st","برجر بيف":"bf","برجر تشيكن":"bc","تويستر":"tw"},PIC={"ميكس بوكس":"mix","تشانكي بوكس":"ch","تشيكن باستا":"pa","فتة زنجر":"fz","تشك تشيكن":"tk","ماك أند تشيز":"mc","بافلو وينجز 6 قطع":"wg","بافلو وينجز 12 قطعة":"wg","تشيز ستريبس":"cs","تشيز فرايز":"cf","فرنش فرايز":"cf","كرنكل فرايز":"cu","جار جبنة سايحة":"jar","أونيون رينجز":"on","كومبو بطاطس وحاجة ساقعة":"cb"};
const pic=(n,c,im)=>{const u=im?(BLOBS[im]||BLOBS.IMG[im]||im):(CAT[c]?"":BLOBS.IMG[PIC[n]]);return u?`<img class="th" src="${u}" alt="" loading="lazy">`:""};
let pend;
const addCart=(k,p)=>{const i=cart.get(k)||{n:k,p,q:0};i.q++;cart.set(k,i);draw()};
const WS=["باربيكيو","بافلو"],WP=["عليهم","برا"];
function openPick(P){pend=P;pkDraw();$("#saD").showModal()}
function add(D){const p=+D.p,s=+D.s||0,ing=D.r?D.r.split("+").map(x=>x.trim()).filter(Boolean):[];
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
  x=P.list.map(v=>{
   const count=P.sel.filter(item=>item===v).length;
   const on=count>0;
   return `<button class="chip" data-sa="${esc(v)}" aria-pressed="${on}">${esc(v)}${count>0?` (${ar(count)})`:""}</button>`;
  }).join("");ok=c>=need}
 $("#saT").textContent=ar(t);$("#saL").innerHTML=x;$("#saOk").disabled=!ok}
const HINT={"وجبات البروست":"💡 البروست فراخ بالعضم، والستريبس فراخ من غير عضم.","وجبات الستريبس":"💡 البروست فراخ بالعضم، والستريبس فراخ من غير عضم."};
function show(c){cur=c;const ck=CAT[c];
 let cImgUrl=ck&&BLOBS.CIMG[ck]?BLOBS.CIMG[ck]:"";
 if(S.customCIMG&&S.customCIMG[c])cImgUrl=S.customCIMG[c];
 $("#catHead").innerHTML=cImgUrl?`<figure class="cimg"><img src="${cImgUrl}" alt="${esc(c)}"></figure>`+(HINT[c]?`<p class="hint">${HINT[c]}</p>`:""):(HINT[c]?`<p class="hint">${HINT[c]}</p>`:"");
 document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.textContent===c));
 $("#list").innerHTML=S.menu[c].map(([n,d,p,s,ing,g,sp,im])=>`<li>${pic(n,c,im)}<div><b>${ar(n)}</b>${d?`<small>${ar(d)}</small>`:""}</div><span class="pr">${ar(p)} جنيه</span><button class="add" data-n="${esc(n)}" data-p="${p}" data-s="${s||0}" data-g="${g||""}" data-r="${esc(ing||"")}" data-sp="${sp?1:0}" aria-label="أضف ${n}">+</button></li>`).join("");
}
let cur,S=JSON.parse(JSON.stringify(window.MENU_DATA||{}));
for(const k of["offers","sauces","msauces","areas"])S[k]=S[k]||[];S.menu=S.menu||{};S.customCIMG=S.customCIMG||{};S.customBLOBS=S.customBLOBS||{};
for(const k in S.customBLOBS){if(BLOBS[k])BLOBS[k]=S.customBLOBS[k];}
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const feeOf=()=>{const o=$("#area").selectedOptions[0];return o&&o.dataset.f!==undefined?+o.dataset.f:null};
function init(){
 document.querySelectorAll("[data-b]").forEach(e=>{e.src=BLOBS[e.dataset.b]});
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
const src=o=>BLOBS.IMG[o.img]||o.img;
function offersDraw(){$("#offers").hidden=!S.offers.length;$("#offerList").innerHTML=S.offers.map(o=>`<article class="offer">${o.img?`<img src="${src(o)}" alt="${esc(o.n)}" loading="lazy">`:""}<div><b>${ar(esc(o.n))}</b><b class="pr">${ar(+o.p\vert{}\vert{}0)} جنيه</b></div>${o.d?`<div><span>${ar(esc(o.d))}</span></div>`:""}<div><button class="btn add-o" data-n="${esc(o.n)}" data-p="${+o.p||0}" data-s="${+o.s||0}" data-sp="${+o.sp||0}">أضف للطلب</button></div></article>`).join("")}
const AR="مناطق التوصيل",OF="العروض",SA="صوصات الاكسترا",MSA="صوصات الوجبات",SI="صور الموقع والمنيو الورقي",GH="إعدادات GitHub";let adm;
const rows=()=>adm===GH||adm===SI?[]:adm===AR?S.areas:adm===SA?S.sauces:adm===MSA?S.msauces:adm===OF?S.offers:S.menu[adm];
const rd=f=>new Promise(r=>{const R=new FileReader();R.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,640/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.78))};i.src=R.result};R.readAsDataURL(f)});
function admDraw(){
 adm=adm||Object.keys(S.menu)[0];
 $("#admTabs").innerHTML=[...Object.keys(S.menu),OF,MSA,SA,AR,SI,GH].map(c=>`<button aria-selected="${c===adm}" data-c="${esc(c)}">${c}</button>`).join("");
 if(adm===GH){const c=ghCfg();$("#admBody").innerHTML='<p>التعديلات بتتحفظ على GitHub (ملف js/menu-data.js). ادخل البيانات مرة واحدة، وبتتحفظ على جهازك بس.</p>'+[["ghOwner","اسم حساب GitHub (owner)",c.owner],["ghRepo","اسم المستودع (repo)",c.repo],["ghBranch","الفرع (branch)",c.branch]].map(([id,l,v])=>`<label for="${id}">${l}</label><input id="${id}" value="${esc(v)}" autocomplete="off">`).join("")+'<label for="ghToken">التوكن (Fine-grained، صلاحية Contents: Read and write)</label><input id="ghToken" type="password" value="'+esc(c.token)+'" autocomplete="off">';return}
 if(adm===SI){
  let h='<p>تعديل صور بانرات الأقسام وصور المنيو الورقي:</p>';
  Object.keys(S.menu).forEach(cat=>{
   const curImg=S.customCIMG&&S.customCIMG[cat]?S.customCIMG[cat]:(CAT[cat]?BLOBS.CIMG[CAT[cat]]:"");
   h+=`<div class="of"><b>قسم: ${cat}</b><br>${curImg?`<img class="th" src="${curImg}" alt="">`:""}<input type="file" accept="image/*" data-catimg="${cat}">${curImg?`<button data-rmcatimg="${cat}">حذف بانر القسم</button>`:""}</div>`;
  });
  ["m1","m2"].forEach(mKey=>{
   const mImg=BLOBS[mKey]||"";
   h+=`<div class="of"><b>صورة المنيو الورقي (${mKey}):</b><br>${mImg?`<img class="th" src="${mImg}" alt="">`:""}<input type="file" accept="image/*" data-blobimg="${mKey}"></div>`;
  });
  $("#admBody").innerHTML=h;return;
 }
 const f=(i,k,v,x="")=>`<input data-i="${i}" data-k="${k}" value="${esc(v)}"${x}>`,N=' type="number"';
 $("#admBody").innerHTML=(adm===OF?S.offers.map((o,i)=>`<div class="of">${o.img?`<img class="th" src="${src(o)}" alt="">`:""}<div class="ar">${f(i,"n",o.n,' placeholder="اسم العرض"')}${f(i,"p",o.p,N+' placeholder="السعر"')}${f(i,"s",o.s||0,N+' placeholder="عدد الصوص"')}${f(i,"sp",o.sp||0,N+' placeholder="سبايسي؟ (1=نعم)"')}</div><div class="ar">${f(i,"d",o.d||"",' placeholder="الوصف"')}</div><div class="ar"><input type="file" accept="image/*" data-up="${i}">${o.img?`<button data-rm="${i}">شيل الصورة</button>`:""}<button data-del="${i}">حذف العرض</button></div></div>`).join(""):rows().map((r,i)=>`<div class="ar">${adm!==AR&&adm!==SA&&adm!==MSA?pic(r[0],adm,r[7]):""}${f(i,0,r[0],' placeholder="الاسم"')}${adm===AR?f(i,1,r[1],N+' placeholder="الرسوم"'):adm===SA||adm===MSA?"":f(i,1,r[1],' placeholder="الوصف"')+f(i,2,r[2],N+' placeholder="السعر"')+f(i,3,r[3]||0,N+' placeholder="صوص (-1 = حر)" title="عدد الصوصات المضمنة. -1 = الزبون يختار أي عدد والسعر لكل صوص"')+f(i,4,r[4]||"",' placeholder="مكونات بفاصلة + (مثل جبنة + بصل)"')+f(i,6,r[6]||0,N+' placeholder="سبايسي؟ (1=نعم)"')+`<input type="file" accept="image/*" data-up="${i}">`+(r[7]?`<button data-rm="${i}">شيل الصورة</button>`:"")}<button data-del="${i}" aria-label="حذف">×</button></div>`).join(""))+'<button class="btn" data-new="1">+ إضافة</button>';
}
$("#admBody").oninput=e=>{const t=e.target;if(t.id&&t.id.startsWith("gh")){try{localStorage.setItem(t.id,t.value)}catch(_){}return}const r=rows()[t.dataset.i];if(r)r[t.dataset.k]=t.type==="number"?+t.value:t.value};
$("#admBody").onchange=async e=>{
 const t=e.target;
 if(t.dataset.up!==undefined&&t.files[0]){const im=await rd(t.files[0]);if(adm===OF)S.offers[+t.dataset.up].img=im;else rows()[+t.dataset.up][7]=im;admDraw()}
 else if(t.dataset.catimg&&t.files[0]){const im=await rd(t.files[0]);S.customCIMG=S.customCIMG||{};S.customCIMG[t.dataset.catimg]=im;if(CAT[t.dataset.catimg])BLOBS.CIMG[CAT[t.dataset.catimg]]=im;admDraw()}
 else if(t.dataset.blobimg&&t.files[0]){const im=await rd(t.files[0]);S.customBLOBS=S.customBLOBS||{};S.customBLOBS[t.dataset.blobimg]=im;BLOBS[t.dataset.blobimg]=im;document.querySelectorAll("[data-b]").forEach(el=>{if(el.dataset.b===t.dataset.blobimg)el.src=im});admDraw()}
};
$("#admD").onclick=e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.c){adm=b.dataset.c;admDraw()}
 else if(b.dataset.del){rows().splice(+b.dataset.del,1);admDraw()}
 else if(b.dataset.rm){if(adm===OF)S.offers[+b.dataset.rm].img="";else rows()[+b.dataset.rm][7]="";admDraw()}
 else if(b.dataset.rmcatimg){const cat=b.dataset.rmcatimg;if(S.customCIMG)delete S.customCIMG[cat];admDraw()}
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
 const body={message:"Update menu from admin panel",content:u8b64
