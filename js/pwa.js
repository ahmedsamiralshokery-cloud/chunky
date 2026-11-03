if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
let dp;const ib=document.getElementById("inst"),sa=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;if(ib)ib.hidden=false});
addEventListener("appinstalled",()=>{if(ib)ib.hidden=true});
if(ib&&!sa&&/iphone|ipad|ipod/i.test(navigator.userAgent))ib.hidden=false;
if(ib)ib.addEventListener("click",async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;ib.hidden=true}else alert("من Safari: اضغط زر المشاركة (Share) ثم Add to Home Screen")});
