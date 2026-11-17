const KEY="agendaProEventsV1",DONE="agendaProDoneV1";
const $=id=>document.getElementById(id);
const safeRead=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key));return x??fallback}catch{return fallback}};
let events=safeRead(KEY,[]),done=safeRead(DONE,{}),ctx=null,osc=null,gain=null,pulse=null,timer=null,active=null,unlocked=false;
const persist=()=>localStorage.setItem(KEY,JSON.stringify(events));
const persistDone=()=>localStorage.setItem(DONE,JSON.stringify(done));
const pad=x=>String(x).padStart(2,"0");
const localDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const when=e=>new Date(`${e.date}T${e.time}:00`).getTime();
const key=(e,kind)=>`${e.id}:${e.date}:${e.time}:${kind}`;
$("date").value=localDate(new Date());
function render(){
 const now=Date.now(),today=localDate(new Date());
 $("todayCount").textContent=events.filter(e=>e.date===today).length;
 $("upcomingCount").textContent=events.filter(e=>when(e)>now).length;
 $("totalCount").textContent=events.length;
 const list=$("list");list.replaceChildren();
 for(const e of [...events].sort((a,b)=>when(a)-when(b))){
  const item=document.createElement("div");item.className="entry";
  const h=document.createElement("h3");h.textContent=e.title;item.append(h);
  const p=document.createElement("p");p.textContent=`📅 ${e.date} · ${e.time}  📍 ${e.location||"Sin lugar"}`;item.append(p);
  if(e.notes){const n=document.createElement("p");n.textContent=e.notes;item.append(n)}
  const edit=document.createElement("button");edit.textContent="Editar";edit.onclick=()=>{
   for(const id of ["id","title","date","time","location","reminder","notes"])$(id).value=e[id]??"";
   window.scrollTo({top:0,behavior:"smooth"});
  };
  const del=document.createElement("button");del.className="secondary";del.textContent="Eliminar";del.onclick=()=>{
   if(confirm("¿Eliminar este compromiso?")){events=events.filter(x=>x.id!==e.id);persist();render()}
  };item.append(edit,del);list.append(item);
 }
}
$("form").onsubmit=ev=>{
 ev.preventDefault();
 const data={};for(const id of ["id","title","date","time","location","reminder","notes"])data[id]=$(id).value.trim();
 if(!data.id)data.id=crypto.randomUUID?.()||String(Date.now());
 if(!Number.isFinite(when(data))){$("status").textContent="Fecha u hora inválida.";return}
 const index=events.findIndex(x=>x.id===data.id);
 if(index>=0)events[index]=data;else events.push(data);
 persist();$("form").reset();$("id").value="";$("date").value=localDate(new Date());render();check();
};
$("reset").onclick=()=>{$("form").reset();$("id").value="";$("date").value=localDate(new Date())};
$("export").onclick=()=>{
 const blob=new Blob([JSON.stringify({version:1,events},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Agenda-PRO-respaldo.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$("import").onchange=async ev=>{
 const file=ev.target.files?.[0];if(!file)return;
 try{const data=JSON.parse(await file.text());
 if(!Array.isArray(data.events)||!data.events.every(e=>typeof e.id==="string"&&typeof e.title==="string"&&typeof e.date==="string"&&typeof e.time==="string"))throw Error("Formato no válido");
 if(confirm("¿Reemplazar los compromisos actuales con el respaldo?")){events=data.events;persist();render()}
 }catch(error){$("status").textContent="No se pudo importar: "+error.message}
 ev.target.value="";
};
async function enable(){
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error("Audio no disponible");
 ctx=new C();await ctx.resume();unlocked=true;$("enable").textContent="✓ Sonido habilitado";$("enable").disabled=true;
 $("status").textContent="Sonido habilitado para esta sesión. Mantén la aplicación abierta y el volumen del teléfono activado.";
 }catch(e){$("status").textContent="No se pudo activar el audio: "+e.message}
}
$("enable").onclick=enable;
function silence(){
 clearInterval(pulse);clearTimeout(timer);pulse=timer=null;
 try{osc?.stop()}catch{}osc=null;if(gain){gain.gain.value=0;gain=null}
}
function play(){
 silence();if(!unlocked||!ctx)return;
 ctx.resume().catch(()=>{});
 osc=ctx.createOscillator();gain=ctx.createGain();osc.type="square";gain.gain.value=0;
 osc.connect(gain).connect(ctx.destination);osc.start();
 let high=false;pulse=setInterval(()=>{
  high=!high;osc.frequency.setValueAtTime(high?880:660,ctx.currentTime);
  gain.gain.setValueAtTime(high?.28:0,ctx.currentTime);
 },250);
 timer=setTimeout(silence,30000);
}
function ring(e,kind){
 active={e,kind};$("alarmText").textContent=`${e.title} — ${e.time}${e.location?" — "+e.location:""}`;
 $("overlay").hidden=false;play();
 if(navigator.vibrate)navigator.vibrate([400,150,400,150,400]);
}
function dismiss(snooze){
 silence();$("overlay").hidden=true;
 if(active){
  done[key(active.e,active.kind)]=snooze?Date.now()+300000:-1;persistDone();
  active=null;
 }
}
$("stop").onclick=()=>dismiss(false);$("snooze").onclick=()=>dismiss(true);
$("test").onclick=()=>ring({id:"test",date:localDate(new Date()),time:"",title:"Prueba de alarma",location:""},"test");
function check(){
 if(active)return;const now=Date.now();
 for(const e of events){
  const start=when(e);if(!Number.isFinite(start))continue;
  const offset=Number(e.reminder??30);
  const triggers=[["inicio",start]];
  if(offset>=0&&offset>0)triggers.unshift(["previo",start-offset*60000]);
  for(const [kind,target] of triggers){
   const state=done[key(e,kind)];
   if(state===-1)continue;
   if(typeof state==="number"&&state>0){
    if(now>=state&&now-state<60000){ring(e,kind);return}
    if(now-state>=60000){done[key(e,kind)]=-1;persistDone()}
   }else if(now>=target&&now-target<60000){ring(e,kind);return}
  }
 }
}
window.addEventListener("focus",check);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)check()});
setInterval(check,1000);render();check();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));