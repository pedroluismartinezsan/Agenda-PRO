/* Calendario visual de Agenda PRO. Comparte el almacenamiento y renderizado de app.js. */
(() => {
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected = localDate(today);
  const grid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("monthLabel");
  const dayList = document.getElementById("dayList");
  const heading = document.getElementById("selectedHeading");
  const fmt = new Intl.DateTimeFormat("es-CO", {month:"long",year:"numeric"});
  const dayFmt = new Intl.DateTimeFormat("es-CO", {weekday:"long",day:"numeric",month:"long"});
  document.getElementById("liveDate").textContent = new Intl.DateTimeFormat("es-CO",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(today);
  function draw(){
    monthLabel.textContent = fmt.format(new Date(viewYear,viewMonth,1));
    grid.replaceChildren();
    const first = new Date(viewYear,viewMonth,1);
    const offset = (first.getDay()+6)%7;
    for(let index=0;index<42;index++){
      const d = new Date(viewYear,viewMonth,index-offset+1);
      const date = localDate(d);
      const count = events.filter(e=>e.date===date).length;
      const btn = document.createElement("button");
      btn.type="button";
      btn.className="calendar-day"+(d.getMonth()!==viewMonth?" outside":"")+(date===localDate(new Date())?" today":"")+(date===selected?" selected":"");
      btn.textContent=String(d.getDate());
      btn.setAttribute("aria-label",dayFmt.format(d)+(count?", "+count+" compromisos":""));
      btn.setAttribute("aria-pressed",String(date===selected));
      if(count){
        const dots=document.createElement("span");dots.className="event-dots";
        for(let i=0;i<Math.min(count,3);i++){const dot=document.createElement("i");dots.append(dot)}
        btn.append(dots);
      }
      btn.addEventListener("click",()=>{
        selected=date;viewYear=d.getFullYear();viewMonth=d.getMonth();
        draw();drawDay();
      });
      grid.append(btn);
    }
    drawDay();
  }
  function drawDay(){
    const [y,m,d]=selected.split("-").map(Number);
    heading.textContent=dayFmt.format(new Date(y,m-1,d));
    dayList.replaceChildren();
    const matches=events.filter(e=>e.date===selected).sort((a,b)=>a.time.localeCompare(b.time));
    if(!matches.length){
      const empty=document.createElement("div");empty.className="empty-state";
      const icon=document.createElement("span");icon.className="empty-icon";icon.textContent="◇";
      empty.append(icon,document.createTextNode("Sin reuniones para este día. ¡Puedes agregar una!"));
      dayList.append(empty);
      return;
    }
    for(const e of matches){
      const item=document.createElement("div");item.className="day-entry";
      const time=document.createElement("span");time.className="time-pill";time.textContent=e.time;
      const details=document.createElement("div");
      const title=document.createElement("strong");title.textContent=e.title;
      const location=document.createElement("p");location.textContent=e.location||"Sin ubicación";
      details.append(title,location);item.append(time,details);dayList.append(item);
    }
  }
  document.getElementById("prevMonth").addEventListener("click",()=>{
    const d=new Date(viewYear,viewMonth-1,1);viewYear=d.getFullYear();viewMonth=d.getMonth();draw();
  });
  document.getElementById("nextMonth").addEventListener("click",()=>{
    const d=new Date(viewYear,viewMonth+1,1);viewYear=d.getFullYear();viewMonth=d.getMonth();draw();
  });
  document.getElementById("goToday").addEventListener("click",()=>{
    const d=new Date();viewYear=d.getFullYear();viewMonth=d.getMonth();selected=localDate(d);draw();
  });
  document.getElementById("newForDay").addEventListener("click",()=>{
    document.getElementById("date").value=selected;
    document.getElementById("crear").scrollIntoView({behavior:"smooth",block:"start"});
    document.getElementById("title").focus({preventScroll:true});
  });
  const originalRender=render;
  render=function(){originalRender();draw()};
  draw();
})();