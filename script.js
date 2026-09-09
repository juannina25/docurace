function showOnlyScreen(id){
 ["startScreen","categoryScreen","matchScreen","gameScreen"].forEach(screenId=>{
   const el=$(screenId);
   if(el)el.classList.toggle("hidden",screenId!==id);
 });
}
function recoverVisibleUI(err){
 console.error("Recuperación de interfaz:",err);
 document.querySelectorAll(".tutorialOverlay,.countdown").forEach(x=>x.remove());
 if(state.player?.code){
   showOnlyScreen("categoryScreen");
   try{renderCategories()}catch(e){console.error(e)}
 }else{
   showOnlyScreen("startScreen");
 }
 say("Recuperé la pantalla para que el juego no quede vacío.");
}
function ensureVisibleUI(){
 const overlay=document.querySelector(".tutorialOverlay,.countdown");
 const visible=["startScreen","categoryScreen","matchScreen","gameScreen"]
   .some(id=>{const el=$(id);return el&&!el.classList.contains("hidden")});
 if(!overlay&&!visible)recoverVisibleUI("Todas las pantallas estaban ocultas.");
}
function startNew(){const n=$("playerName").value.trim();if(!n){alert("Ingresa tu nombre.");return}try{createPlayer(n);showCategories()}catch(e){console.error(e);showOnlyScreen("startScreen");alert("No se pudo crear el jugador. La pantalla inicial fue restaurada.")}}
function resume(){const c=$("playerCode").value.trim();if(!c){alert("Escribe tu código.");return}if(loadPlayer(c))showCategories()}
function showCategories(){showOnlyScreen("categoryScreen");renderCategories();say("¡Hola! Elige una categoría. La documentación es la base de la organización.")}
function completed(c){return Number(state.profile.categories?.[c]||0)}function renderCategories(){const g=$("categoryGrid");g.innerHTML="";Object.entries(categories).forEach(([k,c])=>{const done=completed(k)>=10,x=document.createElement("div");x.className=`card ${done?"done":""}`;x.innerHTML=`<div class="icon">${c.icon}</div><h3>${c.title} ${done?"✅":""}</h3><p>${completed(k)}/10 partidas completadas</p><p class="small">${c.guide}</p>`;x.onclick=()=>openMatches(k);g.appendChild(x)});const all=Object.keys(categories).every(k=>completed(k)>=10),x=document.createElement("div");x.className=`card ${all?"done":"locked"}`;x.innerHTML=`<div class="icon">🎓</div><h3>Examen ${all?"✅":"🔒"}</h3><p>${all?"Disponible":"Completa las 10 partidas de todas las categorías."}</p>`;x.onclick=()=>all?openMatches("examen"):say("El examen está bloqueado. Completa todas las categorías.");g.appendChild(x)}
function openMatches(c){state.category=c;showOnlyScreen("matchScreen");renderMatches();say(c==="examen"?"Aquí se mezclan documentos de todas las categorías.":`Seleccionaste ${categories[c].title}. Te explicaré su estructura antes de jugar.`)}
function renderMatches(){const g=$("matchGrid"),p=state.category==="examen"?0:completed(state.category);g.innerHTML="";$("matchTitle").textContent=state.category==="examen"?"🎓 Examen final":`🚀 Partidas de ${categories[state.category].title}`;$("matchInfo").textContent="Cada partida tiene 5 niveles. Las partidas 8, 9 y 10 son en inglés y son las más difíciles.";for(let i=1;i<=10;i++){const locked=state.category!=="examen"&&i>p+1,done=state.category!=="examen"&&i<=p,x=document.createElement("div");x.className=`card ${locked?"locked":""} ${done?"done":""} ${i>=8?"english":""}`;x.innerHTML=`<div class="icon">${i>=8?"🌐":"📄"}</div><h3>Partida ${i} ${locked?"🔒":done?"✅":"▶️"}</h3><p>${["Inicial","Básica","Intermedia","Media","Media alta","Avanzada","Muy avanzada","English basic","English intermediate","English formal"][i-1]}</p>`;x.onclick=()=>locked?say("Esta partida está bloqueada. Primero completa la anterior."):selectMatch(i);g.appendChild(x)}}
function selectMatch(i){state.match=i;const c=state.profile.current;if(c&&(c.category!==state.category||Number(c.match)!==Number(i)))state.profile.current=null;$("matchScreen").classList.add("hidden");startTutorial()}
const meanings={Membrete:"Identifica a la institución, empresa o remitente.","Lugar y fecha":"Indica dónde y cuándo se emite.",Destinatario:"Señala quién recibe el documento.",Asunto:"Resume el tema principal.",Saludo:"Fórmula breve de cortesía.",Cuerpo:"Se desarrolla en tres párrafos.","Párrafo 1":"Introduce el motivo de la carta.","Párrafo 2":"Desarrolla y sustenta el pedido o información.","Párrafo 3":"Cierra el cuerpo e integra la despedida.",Antefirma:"Fórmula previa a la firma, por ejemplo: Atentamente.",Postfirma:"Nombre completo y cargo de quien suscribe.", "Pie de página":"Incluye las iniciales del jefe y su cargo; debajo, la distribución de copias.",Introducción:"Presenta el motivo principal.",Desarrollo:"Amplía o sustenta la información.",Cierre:"Concluye el mensaje.",Despedida:"Fórmula de cortesía que puede integrarse al cuerpo del texto.",Firma:"Espacio de firma que valida al remitente.",Sumilla:"Resume el pedido de la solicitud.","Datos del solicitante":"Identifica a quien realiza el pedido.",Petitorio:"Expresa exactamente qué se solicita.",Fundamentos:"Explican por qué se realiza el pedido.",Autoridad:"Persona o área que recibe la solicitud.",Código:"Identifica el memorando.",Fecha:"Fecha de emisión.",Para:"Destinatario interno.",De:"Remitente interno.",Cuerpo:"Mensaje o indicación principal.",Encabezado:"Identificación de la reunión.","Número de acta":"Número que identifica el acta.","Fecha, hora y lugar":"Contexto de la reunión.",Participantes:"Personas presentes.","Orden del día":"Temas que se tratarán.","Acuerdos y acciones":"Decisiones y tareas resultantes.","Firma y sello":"Validación final.",Numeración:"Identifica formalmente el documento.",Referencia:"Antecedente relacionado.",Copias:"Indica a quién se remite copia.",Firmas:"Validan el contenido del acta."};
function startTutorial(){
 const c=state.category==="examen"
   ?{title:"Examen",parts:["Cartas","Solicitudes","Memorandos","Actas","Institucionales"],guide:"En el examen se combinan estructuras diferentes."}
   :categories[state.category];
 const parts=c.parts.slice(0,10);
 const o=document.createElement("div");
 o.className="tutorialOverlay";
 o.innerHTML=`<div class="tutorialGrid">
   <div class="tutCard"><h3>🤖 Doci te guía</h3><p>${escapeHtml(c.guide||"Conocerás la estructura del documento antes de jugar.")}</p></div>
   <div class="tutPaper">
     <div class="tutHeader"><h2>📚 Estructura de ${escapeHtml(c.title)}</h2><span class="tutProgress" id="tutProgress"></span></div>
     <div class="tutSteps" id="tutSteps">${parts.map((p,i)=>`<div class="tutStep ${i===0?"active":""}" data-i="${i}">
       <span class="tutStepNum">${i+1}</span><div><strong>${escapeHtml(p)}</strong><small>${escapeHtml(meanings[p]||"Parte importante del documento.")}</small></div>
     </div>`).join("")}</div>
     <div class="tutActions"><button class="skip" id="skipTut">Omitir tutorial</button><button id="nextTut">Continuar explicación</button></div>
   </div>
   <div class="tutCard right"><h3>📝 Ejemplo práctico</h3><div id="tutTitle" class="tutExampleTitle"></div><div class="exampleDoc"><div class="exampleHead">DOCUMENTO ADMINISTRATIVO</div><div id="tutExample"></div></div><p id="tutStatus"></p></div>
 </div>`;
 document.body.appendChild(o);

 let i=0;
 const steps=[...o.querySelectorAll(".tutStep")];
 const progress=o.querySelector("#tutProgress");
 const next=o.querySelector("#nextTut");
 const title=o.querySelector("#tutTitle");
 const status=o.querySelector("#tutStatus");
 const example=o.querySelector("#tutExample");
 if(!title||!status||!example){console.error("Tutorial incompleto");o.remove();startCountdown();return}

 const showStep=idx=>{
   if(!parts.length)return;
   steps.forEach((el,n)=>el.classList.toggle("active",n===idx));
   const label=parts[idx];
   title.textContent=label;
   status.textContent=meanings[label]||"Parte importante del documento.";
   example.innerHTML=parts.slice(0,5).map((p,n)=>`<div class="exampleLine"><span class="exampleNum">${n+1}.</span><span class="exampleText">${escapeHtml(p)}</span></div>`).join("");
   progress.textContent=`Paso ${idx+1} de ${parts.length}`;
   next.textContent=idx===parts.length-1?"Comenzar partida":"Continuar explicación";
   steps[idx].scrollIntoView({behavior:"smooth",block:"center"});
 };

 o.querySelector("#skipTut").onclick=()=>{o.remove();startCountdown()};

 next.onclick=()=>{
   const current=steps[i];
   if(current){
     current.classList.remove("active");
     current.classList.add("filled");
     const chip=document.createElement("div");
     chip.className="flying";
     chip.textContent=parts[i];
     document.body.appendChild(chip);
     const r=current.getBoundingClientRect();
     const sx=Math.max(20,innerWidth/2-70),sy=Math.max(20,innerHeight/2-25);
     chip.style.left=sx+"px";chip.style.top=sy+"px";
     chip.animate(
       [{transform:"scale(.9)",opacity:0},
        {transform:"scale(1)",opacity:1,offset:.15},
        {transform:`translate(${r.left-sx}px,${r.top-sy}px)`,opacity:1,offset:.82},
        {transform:`translate(${r.left-sx}px,${r.top-sy}px) scale(.96)`,opacity:0}],
       {duration:650,fill:"forwards",easing:"cubic-bezier(.18,.78,.22,1)"}
     );
     setTimeout(()=>chip.remove(),700);
   }
   i++;
   if(i>=parts.length){o.remove();startCountdown();return}
   showStep(i);
 };
 showStep(0);
}
function startCountdown(){
 $("startScreen").classList.add("hidden");
 $("categoryScreen").classList.add("hidden");
 $("matchScreen").classList.add("hidden");
 $("gameScreen").classList.add("hidden");
 const o=document.createElement("div");
 o.className="countdown";
 o.innerHTML=`<div><h1>🚀 ¡COMENCEMOS!</h1><div class="num" id="countNum">3</div><p id="countTxt">Doci: observa bien la hoja.</p></div>`;
 document.body.appendChild(o);
 let n=3;
 const timer=setInterval(()=>{
   n--;
   if(n<=0){
     clearInterval(timer);
     o.remove();
     try{prepareMatch();startLevel()}
     catch(err){recoverVisibleUI(err)}
   }else{
     $("countNum").textContent=n;
     $("countTxt").textContent=n===2?"Doci: coloca las piezas en su posición.":"Doci: verifica cuando termines.";
   }
 },900);
}
function makeDocument(cat,match,level){
 if(cat==="examen"){
   const k=Object.keys(categories)[level%5];
   return makeDocument(k,10,level);
 }
 const eng=match>=8;
 const e=entities[(match+level)%entities.length];
 const recipientEntity=entities[(match+level+2)%entities.length];
 const recipientName=names[(match+level)%names.length];
 const senderName=names[(match+level+5)%names.length];
 const dateEs=`${e[2]}, ${12+level} de mayo de 2026`;
 const dateEn=`${e[2]}, May ${12+level}, 2026`;
 const topic=topics[(match+level)%topics.length];
 let o=[],style=null;

 if(cat==="cartas"){
   style=["Bloque extremo","Bloque","Semibloque"][(match+level-1+300)%3];
   const footerInitials="LBMB/G.G.";
   const copies="C.c: Archivo";
   const p1Es=`Me dirijo a usted para solicitar ${topic[0]}.`;
   const p2Es=`La solicitud se relaciona con ${topic[1]}. Esta coordinación permitirá atender adecuadamente lo requerido y mantener el orden de las actividades previstas.`;
   const p3Es=`Agradeceré comunicarme si se requiere información adicional. ${closures[(match+level)%closures.length]}`;
   const p1En=`I am writing to request ${topic[0]}.`;
   const p2En=`This request is related to ${topic[1]}. This coordination will help address the requirement properly and keep the planned activities organized.`;
   const p3En=`Please let me know if additional information is required. Thank you for your attention.`;

   o=eng?[
     `${e[0]} | ${e[1]} | ${e[2]}`,dateEn,
     `${recipientName}\nOperations Coordinator\n${recipientEntity[0]}`,
     `Subject: ${topic[0]}`,"Dear Sir or Madam:",p1En,p2En,p3En,
     "Sincerely,",`✍ ${senderName}`,
     `${senderName.toUpperCase()}\nAdministrative Coordinator`,
     `${footerInitials}\n${copies}`
   ]:[
     `${e[0]} | ${e[1]} | ${e[2]}`,dateEs,
     `${recipientName}\nCoordinador(a) de Operaciones\n${recipientEntity[0]}`,
     `Asunto: ${topic[0]}`,greetings[(match+level)%greetings.length],p1Es,p2Es,p3Es,
     "Atentamente,",`✍ ${senderName}`,
     `${senderName.toUpperCase()}\nCoordinador(a) Administrativo(a)`,
     `${footerInitials}\n${copies}`
   ];
 }
 else if(cat==="solicitudes"){
   o=eng?[
     `Subject: Request for ${topic[0]}`,
     `${recipientName}\nHead of Administration\n${recipientEntity[0]}`,
     `${senderName}, administrative assistant, respectfully submits this request.`,
     `I request authorization for ${topic[0]}.`,
     `The request is supported because ${topic[1]}.`,
     dateEn,`${senderName}\nApplicant`
   ]:[
     `SUMILLA: Solicito ${topic[0]}.`,
     `Señor(a) ${recipientName}\nResponsable de Administración\n${recipientEntity[0]}`,
     `Yo, ${senderName}, me presento ante usted con el debido respeto.`,
     `Solicito se sirva autorizar ${topic[0]}.`,
     `El pedido se fundamenta en que ${topic[1]}.`,
     dateEs,`${senderName}\nSolicitante`
   ];
 }
 else if(cat==="memorandos"){
   o=eng?[
     e[0],`MEMORANDUM No. ${40+level}-2026`,dateEn,
     `TO: ${recipientName} — Operations Team`,
     `FROM: ${senderName} — Administrative Coordination`,
     `SUBJECT: Document control update`,
     `Please register incoming documents with their date, sender and subject before filing. This measure will improve traceability.`,
     `Sincerely,`,`${senderName}\nAdministrative Coordination`
   ]:[
     e[0],`MEMORÁNDUM N.° ${40+level}-2026`,`Fecha: ${dateEs}`,
     `PARA: ${recipientName} — Equipo de Operaciones`,
     `DE: ${senderName} — Coordinación Administrativa`,
     `ASUNTO: Actualización del control documentario`,
     `Se comunica que los documentos recibidos deberán registrarse con fecha, remitente y asunto antes de ser archivados. La medida busca mejorar la trazabilidad.`,
     `Atentamente,`,`${senderName}\nCoordinación Administrativa`
   ];
 }
 else if(cat==="actas"){
   const ag=["Revisión del cronograma de actividades","Organización de materiales","Evaluación de avances","Distribución de responsabilidades","Programación de la siguiente reunión"][level];
   o=eng?[
     `${e[0]}\nMEETING MINUTES`,`MINUTES No. ${10+level}`,
     `May ${12+level}, 2026 — ${10+level}:00 — ${e[1]}, ${e[2]}`,
     `Participants: ${senderName}; Elena Rojas; Bruno Castillo`,
     `Agenda: ${ag}`,
     `The participants reviewed the matter, exchanged observations and recorded the main points discussed.`,
     `Agreements and actions: update the schedule, assign responsibilities and confirm the next review date.`,
     `The meeting ended after the agenda was completed.`,
     `Signatures: ${senderName} — Chair; Elena Rojas — Secretary`
   ]:[
     `${e[0]}\nACTA DE REUNIÓN`,`ACTA N.° ${10+level}`,
     `${dateEs} — ${10+level}:00 — ${e[1]}, ${e[2]}`,
     `Participantes: ${senderName}; Elena Rojas; Bruno Castillo`,
     `Orden del día: ${ag}`,
     `Se revisó el asunto, se intercambiaron observaciones y se registraron las principales intervenciones.`,
     `Acuerdos y acciones: actualizar el cronograma, asignar responsabilidades y confirmar la próxima fecha de revisión.`,
     `No habiendo otros asuntos que tratar, se dio por concluida la reunión.`,
     `Firmas: ${senderName} — Presidencia; Elena Rojas — Secretaría`
   ];
 }
 else if(cat==="institucionales"){
   o=eng?[
     e[0],`OFFICIAL DOCUMENT No. ${60+level}-2026`,dateEn,
     `To: ${recipientName}\nAdministrative Area\n${recipientEntity[0]}`,
     `Subject: Document review schedule`,
     `Reference: Internal communication issued for the current administrative cycle.`,
     `This document communicates the schedule for the review of administrative records and requests the responsible area to report any pending observations.`,
     `Sincerely,`,`${senderName}\nAdministrative Manager\nOfficial seal`,`Copy: Document archive`
   ]:[
     e[0],`DOCUMENTO N.° ${60+level}-2026`,dateEs,
     `Señor(a): ${recipientName}\nÁrea Administrativa\n${recipientEntity[0]}`,
     `Asunto: Cronograma de revisión documentaria`,
     `Referencia: Comunicación interna correspondiente al periodo administrativo vigente.`,
     `Por medio del presente se comunica el cronograma de revisión de los registros administrativos y se solicita al área responsable informar cualquier observación pendiente.`,
     `Atentamente,`,`${senderName}\nJefatura Administrativa\nSello oficial`,`Copia: Archivo documentario`
   ];
 }
 else throw new Error(`Categoría desconocida: ${cat}`);

 if(!Array.isArray(o)||!o.length)throw new Error(`Documento vacío: ${cat}`);
 return{name:`${categories[cat]?.title||"Examen"} — Nivel ${level+1}`,order:o,style};
}
function prepareMatch(){
 if(state.category==="cartas"){
   const cur=state.profile.current;
   if(cur && Array.isArray(cur.slots) && cur.slots.length!==12) state.profile.current=null;
 }

 state.levels=[];
 for(let i=0;i<5;i++){
   const doc=makeDocument(state.category,state.match,i);
   if(!doc||!Array.isArray(doc.order)||!doc.order.length)
     throw new Error(`Nivel inválido: ${state.category} ${i+1}`);
   state.levels.push(doc);
 }
 if(state.levels.length!==5)throw new Error("No se pudieron generar los 5 niveles.");

 const current=state.profile.current;
 const same=current
   && current.category===state.category
   && Number(current.match)===Number(state.match)
   && Number.isInteger(Number(current.level))
   && Number(current.level)>=0
   && Number(current.level)<5
   && Array.isArray(current.parts)
   && Array.isArray(current.slots);

 if(!same) state.profile.current=null;

 state.level=same?Number(current.level):0;
 state.startCoins=state.coins;
 state.correct=same?Number(current.correct||0):0;
 state.total=same?Number(current.total||0):0;
 state.round=same?Number(current.round||0):0;
 state.score=same?Number(current.score||0):0;
 state.dirty=same?Number(current.dirty||0):0;
 state.lastHint=null;

 $("matchResults").classList.add("hidden");
 $("resultsActions").classList.add("hidden");
 $("gameControls").classList.remove("hidden");
}
function restoreCurrent(){const c=state.profile.current;if(!c||c.category!==state.category)return false;state.match=c.match||1;state.level=c.level||0;state.score=c.score||0;state.coins=c.coins??20;state.parts=c.parts||[];state.slots=c.slots||[];state.dirty=c.dirty||0;return true}
function startLevel(){
 showOnlyScreen("gameScreen");
 clearInterval(state.timer);

 if(!Array.isArray(state.levels) || state.levels.length<5){
   state.levels=[];
   for(let i=0;i<5;i++)state.levels.push(makeDocument(state.category,state.match,i));
 }
 if(!Number.isInteger(Number(state.level)) || !state.levels[Number(state.level)]) state.level=0;
 state.level=Number(state.level);

 const doc=state.levels[state.level];
 const order=doc && Array.isArray(doc.order) ? [...doc.order] : [];
 if(!order.length){
   $("game").innerHTML='<div class="gameError">No se pudo crear este documento. Vuelve a categorías e inténtalo de nuevo.</div>';
   return;
 }

 state.verified=false;
 state.attempts=3;

 const current=state.profile.current;
 const same=current
   && current.category===state.category
   && Number(current.match)===Number(state.match)
   && Number(current.level)===state.level
   && Array.isArray(current.parts)
   && Array.isArray(current.slots);

 if(same){
   state.parts=[...current.parts].filter(x=>typeof x==="string");
   state.slots=[...current.slots].slice(0,order.length);
   while(state.slots.length<order.length)state.slots.push(null);
   state.slots=state.slots.map(x=>typeof x==="string"?x:null);
   state.verified=!!current.verified;
   state.attempts=Math.max(0,Number(current.attempts??3));
 }else{
   state.parts=shuffle(order);
   state.slots=Array(order.length).fill(null);
 }

 // Repair any old/corrupt save: every document piece must exist exactly once.
 const all=[...state.parts,...state.slots.filter(Boolean)];
 const valid=all.length===order.length && order.every(x=>all.filter(v=>v===x).length===order.filter(v=>v===x).length);
 if(!valid){
   state.parts=shuffle(order);
   state.slots=Array(order.length).fill(null);
   state.verified=false;
   state.attempts=3;
 }

 state.startedAt=Date.now();
 $("levelStat").textContent=`📄 Partida ${state.match} | Nivel ${state.level+1} de 5`;
 $("roundStat").textContent=`⭐ ${state.round||0}`;
 $("attemptStat").textContent=`💖 ${state.attempts}`;
 $("resultText").textContent="";

 renderGame();
 updatePanel();
 saveProgress();

 state.timer=setInterval(()=>{
   $("timer").textContent=`⏰ ${Math.floor((Date.now()-state.startedAt)/1000)}s`;
 },1000);

 say(state.level===0?"¡Partida iniciada! Ordena las piezas en la hoja.":"Siguiente nivel. La dificultad aumenta.");
}
function renderGame(){
 const g=$("game");
 if(!g)return;

 try{
   const doc=state.levels?.[state.level];
   const correct=doc && Array.isArray(doc.order) ? doc.order : [];
   if(!correct.length)throw new Error("El nivel no contiene piezas.");

   if(!Array.isArray(state.parts))state.parts=[];
   if(!Array.isArray(state.slots))state.slots=Array(correct.length).fill(null);
   while(state.slots.length<correct.length)state.slots.push(null);

   g.innerHTML="";

   const area=document.createElement("div");
   area.className="workArea";

   const tray=document.createElement("div");
   tray.className="partsTray";
   tray.innerHTML="<h3>🧩 Piezas para ordenar</h3><p>Arrastra cada pieza hacia la hoja. Si te equivocas, puedes moverla otra vez.</p>";

   tray.ondragover=e=>e.preventDefault();
   tray.ondrop=e=>{
     e.preventDefault();
     if(!drag)return;
     if(drag.source==="slot" && state.slots[drag.index]){
       state.parts.push(state.slots[drag.index]);
       state.slots[drag.index]=null;
       drag=null;
       renderGame();
       saveProgress();
     }
   };

   state.parts.forEach((text,i)=>{
     if(typeof text==="string") tray.appendChild(makePart(text,"tray",i));
   });

   const wrap=document.createElement("div");
   wrap.className="paperWrap";

   const title=document.createElement("div");
   title.className="paperTitle";
   title.textContent=`📄 ${state.category==="examen"?"Examen":categories[state.category]?.title||"Documento"} — organiza el documento`;
   wrap.appendChild(title);

   const paper=document.createElement("div");
   paper.className="blankPaper";

   correct.forEach((_,i)=>{
     const row=document.createElement("div");
     row.className=slotClass(i);

     const slot=document.createElement("div");
     slot.className="dropSlot";
     slot.dataset.slot=String(i);

     slot.ondragover=e=>{
       e.preventDefault();
       slot.classList.add("dragOver");
     };
     slot.ondragleave=()=>slot.classList.remove("dragOver");
     slot.ondrop=e=>{
       e.preventDefault();
       slot.classList.remove("dragOver");
       if(!drag)return;

       if(drag.source==="tray"){
         const moving=state.parts[drag.index];
         if(typeof moving!=="string"){drag=null;return}
         state.parts.splice(drag.index,1);
         if(state.slots[i])state.parts.push(state.slots[i]);
         state.slots[i]=moving;
       }else if(drag.source==="slot"){
         const from=Number(drag.index);
         if(Number.isInteger(from) && from!==i){
           const tmp=state.slots[i];
           state.slots[i]=state.slots[from];
           state.slots[from]=tmp;
         }
       }

       drag=null;
       state.verified=false;
       renderGame();
       saveProgress();
     };

     if(typeof state.slots[i]==="string"){
       slot.appendChild(makePart(state.slots[i],"slot",i));
     }

     row.appendChild(slot);
     paper.appendChild(row);
   });

   if((state.category==="cartas")||(state.category==="examen"&&Object.keys(categories)[state.level%5]==="cartas")){
     const style=state.levels?.[state.level]?.style||"Bloque extremo";
     const footer=document.createElement("div");
     footer.className="letterStyleFooter";
     const rule=style==="Bloque extremo"
       ?"Todo parte del margen izquierdo."
       :style==="Bloque"
       ?"Fecha, antefirma, firma y postfirma desde la mitad hacia la derecha; los 3 párrafos del cuerpo sin sangría."
       :"Fecha, antefirma, firma y postfirma desde la mitad hacia la derecha; los 3 párrafos del cuerpo con sangría.";
     footer.innerHTML=`<span>📚 Estilo trabajado:</span> <strong>${escapeHtml(style)}</strong><br><small>${escapeHtml(rule)}</small>`;
     paper.appendChild(footer);
   }

   wrap.appendChild(paper);
   area.appendChild(tray);
   area.appendChild(wrap);
   g.appendChild(area);

 }catch(err){
   console.error("Error al dibujar la partida:",err);
   g.innerHTML=`<div class="gameError"><b>La partida no pudo mostrarse.</b><br>Se restableció este nivel para evitar que la pantalla quede vacía.<br><button id="repairLevelBtn">Restablecer nivel</button></div>`;
   const btn=$("repairLevelBtn");
   if(btn)btn.onclick=()=>{
     const doc=state.levels?.[state.level];
     const order=doc&&Array.isArray(doc.order)?doc.order:[];
     state.parts=shuffle(order);
     state.slots=Array(order.length).fill(null);
     state.profile.current=null;
     renderGame();
     saveProgress();
   };
 }
}
function makePart(text,source,index){
 const d=document.createElement("div");
 d.className=`part ${source==="slot"?"inSlot":""}`;
 d.draggable=true;
 d.textContent=String(text);
 d.dataset.source=source;
 d.dataset.index=String(index);
 d.ondragstart=e=>{
   drag={source,index:Number(index)};
   d.classList.add("dragging");
   if(e.dataTransfer)e.dataTransfer.effectAllowed="move";
 };
 d.ondragend=()=>{
   d.classList.remove("dragging");
   drag=null;
 };
 return d;
}
function slotClass(i){
 const layoutCat=state.category==="examen"?Object.keys(categories)[state.level%5]:state.category;

 if(layoutCat==="actas")
   return["slotRow full","slotRow full","slotRow full","slotRow full","slotRow full","slotRow body full","slotRow body full","slotRow close","slotRow signature"][i]||"slotRow full";

 if(layoutCat==="solicitudes")
   return["slotRow full","slotRow full","slotRow full","slotRow body indent full","slotRow body indent full","slotRow align-right short","slotRow signature medium"][i]||"slotRow full";

 if(layoutCat==="cartas"){
   const style=state.levels?.[state.level]?.style||"Bloque extremo";
   if(style==="Bloque extremo"){
     return[
       "slotRow letter-left full",
       "slotRow letter-left short",
       "slotRow letter-left full",
       "slotRow letter-left full",
       "slotRow letter-left short",
       "slotRow letter-left body full",
       "slotRow letter-left body full",
       "slotRow letter-left body full",
       "slotRow letter-left close short",
       "slotRow letter-left signature short",
       "slotRow letter-left signature medium",
       "slotRow letter-left footer full"
     ][i]||"slotRow letter-left full";
   }
   if(style==="Bloque"){
     return[
       "slotRow letter-left full",
       "slotRow letter-right short",
       "slotRow letter-left full",
       "slotRow letter-left full",
       "slotRow letter-left short",
       "slotRow letter-left body full",
       "slotRow letter-left body full",
       "slotRow letter-left body full",
       "slotRow letter-right close short",
       "slotRow letter-right signature short",
       "slotRow letter-right signature medium",
       "slotRow letter-left footer full"
     ][i]||"slotRow letter-left full";
   }
   return[
     "slotRow letter-left full",
     "slotRow letter-right short",
     "slotRow letter-left full",
     "slotRow letter-left full",
     "slotRow letter-left short",
     "slotRow letter-left body indent full",
     "slotRow letter-left body indent full",
     "slotRow letter-left body indent full",
     "slotRow letter-right close short",
     "slotRow letter-right signature short",
     "slotRow letter-right signature medium",
     "slotRow letter-left footer full"
   ][i]||"slotRow letter-left full";
 }

 if(i===0)return"slotRow full";
 if(i===1)return"slotRow align-right short";
 if(i===2||i===3)return"slotRow full";
 if(i===4||i===5||i===6)return"slotRow body indent full";
 if(i===7)return"slotRow close short";
 if(i===8)return"slotRow signature medium";
 return"slotRow full";
}
function checkOrder(){const c=state.levels[state.level].order;let good=0;document.querySelectorAll(".dropSlot").forEach((s,i)=>{s.classList.remove("correct","incorrect","hintSlot");if(state.slots[i]===c[i]){good++;s.classList.add("correct")}else s.classList.add("incorrect")});const err=c.length-good,pts=Math.max(0,Math.round(good/c.length*100)-err*10);if(!state.verified){state.score+=pts;state.round=pts;state.correct+=good;state.total+=c.length;state.coins+=good*5;state.verified=true}else{state.score-=state.round;state.score+=pts;state.round=pts}if(err>0)state.attempts=Math.max(0,state.attempts-1);$("roundStat").textContent=`⭐ ${pts}`;$("attemptStat").textContent=`💖 ${state.attempts}`;updatePanel();$("resultText").textContent=err===0?`✅ ¡Perfecto! +${good*5} monedas.`:`Resultado: ${good}/${c.length} correctas. +${good*5} monedas.`;saveProgress();if(state.coins>=20&&state.dirty>0)cleanDoci()}
function nextLevel(){if(!state.verified){alert("Primero presiona Verificar.");return}if(state.level<4){state.level++;state.profile.current=null;startLevel()}else finishMatch()}
function finishMatch(){
 clearInterval(state.timer);
 const precision=state.total?Math.round(state.correct/state.total*100):0;
 const earned=state.coins-state.startCoins;
 const hints=state.profile.hintsCurrent||0;

 if(state.category!=="examen"){
   state.profile.categories=state.profile.categories||{};
   state.profile.categories[state.category]=Math.max(completed(state.category),state.match);
 }

 state.profile.totalScore=Number(state.profile.totalScore||0)+Math.max(0,state.score);
 state.profile.hintsCurrent=0;
 state.profile.current=null;
 saveProgress();
 saveScore();

 $("game").innerHTML="";
 $("gameControls").classList.add("hidden");
 $("matchResults").innerHTML=`<h2>🎉 Resultados de la partida ${state.match}</h2>
 <div class="bigResults">
   <div class="resultCard">🏆<div class="num">${state.score}</div><b>Puntaje</b></div>
   <div class="resultCard">🎯<div class="num">${precision}%</div><b>Precisión</b></div>
   <div class="resultCard">🪙<div class="num">${earned}</div><b>Monedas ganadas</b></div>
   <div class="resultCard">💡<div class="num">${hints}</div><b>Pistas utilizadas</b></div>
 </div>
 <p><b>${precision>=90?"Excelente trabajo":precision>=70?"Buen trabajo":"Sigue practicando"}</b>. La siguiente partida será más difícil.</p>`;
 $("matchResults").classList.remove("hidden");
 $("resultsActions").classList.remove("hidden");

 const done=state.category!=="examen"&&state.match>=10;
 $("continueMatchBtn").classList.toggle("hidden",done);
 if(done)confetti();

 renderCategories();
 loadRanking();
}
function continueMatch(){state.match++;state.profile.current=null;$("resultsActions").classList.add("hidden");$("matchResults").classList.add("hidden");$("gameScreen").classList.add("hidden");startTutorial()}
function returnCategories(){clearInterval(state.timer);showOnlyScreen("categoryScreen");renderCategories();say("Elige otra categoría o vuelve más tarde con tu código.")}
function updatePanel(){$("scoreStat").textContent=`🏆 ${state.score}`;$('coinStat').textContent=`🪙 ${state.coins}`;$('playerStat').textContent=`👤 ${state.player.name}`}
let sayTimer=null;function say(t){const b=$('botBubble');if(!b)return;b.innerHTML=`🤖 Doci: ${escapeHtml(t)}`;b.classList.add('show');clearTimeout(sayTimer);sayTimer=setTimeout(()=>b.classList.remove('show'),4200)}
function cleanDoci(){state.dirty=0;$('doci').className='doci';say('Recuperé energía. ¡Gracias por conseguir más monedas!')}
function useHint(){
 if($("gameScreen").classList.contains("hidden")){say("Primero entra a una partida para que pueda ayudarte.");return}
 if(state.coins<20){say("Necesitas 20 monedas para una pista. Resuelve piezas para ganar más.");return}
 const c=state.levels[state.level].order;
 let pos=-1;
 for(let i=0;i<c.length;i++)if(state.slots[i]!==c[i]){pos=i;break}
 if(pos<0){say("Todo parece estar en su lugar. Presiona Verificar.");return}
 const item=c[pos],oi=state.parts.indexOf(item),old=state.slots.indexOf(item);
 state.coins-=20;
 state.dirty=Math.min(3,state.dirty+1);
 state.profile.hintsCurrent=(state.profile.hintsCurrent||0)+1;
 state.lastHint={pos,item};
 updatePanel();
 $("doci").className=`doci dirty${state.dirty}`;
 const source=findHintSource(oi,item,old);
 const dest=document.querySelectorAll(".dropSlot")[pos];
 if(source)source.classList.add("hintOrigin");
 if(dest)dest.classList.add("hintSlot");
 say(`💡 Pista: “${item}” va en el espacio ${pos+1}. Te marqué la pieza y su destino.`);
 setTimeout(()=>{
   if(source)source.classList.remove("hintOrigin");
   if(dest)dest.classList.remove("hintSlot");
 },4200);
 saveProgress();
}
function findHintSource(oi,item,old){
 const slots=[...document.querySelectorAll(".dropSlot")];
 if(old>=0&&slots[old])return slots[old].querySelector(".part")||slots[old];
 const ps=[...document.querySelectorAll(".part")];
 return (oi>=0&&ps.find(p=>p.dataset.source==="tray"&&Number(p.dataset.index)===oi))
   ||ps.find(p=>p.textContent.trim()===item.trim());
}
function repeatHint(){if(!state.lastHint)return;const{pos,item}=state.lastHint;if(state.slots[pos]===item){state.lastHint=null;return}const s=document.querySelectorAll('.dropSlot')[pos];if(s){s.classList.add('hintSlot');say('Te recuerdo la pista: esta es la zona que debes considerar.');setTimeout(()=>s.classList.remove('hintSlot'),1800)}}
function confetti(){for(let i=0;i<70;i++){const c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=['#ff5ac8','#ffd45c','#7ef6ff','#9b7cff'][Math.floor(Math.random()*4)];document.body.appendChild(c);setTimeout(()=>c.remove(),3000)}}
const ADMIN_CODE='ADG2026';
const openAdmin=()=>{location.href='admin.html'};
$('startBtn').onclick=startNew;$('doci').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();useHint()}};$('resumeBtn').onclick=resume;$('backCategories1').onclick=returnCategories;$('backCategories2').onclick=returnCategories;$('continueMatchBtn').onclick=continueMatch;$('verifyBtn').onclick=checkOrder;$('nextBtn').onclick=nextLevel;$('doci').onclick=useHint;$('logoutBtn').onclick=()=>{showOnlyScreen('startScreen');renderProfiles();loadRanking();say('Cuando quieras volver, usa tu código de jugador.')};renderProfiles();loadRanking();setTimeout(ensureVisibleUI,200);window.addEventListener('error',()=>setTimeout(ensureVisibleUI,0));window.addEventListener('unhandledrejection',()=>setTimeout(ensureVisibleUI,0));
$('adminBtn').onclick=openAdmin;
window.docuRaceReady?.then(()=>{renderProfiles();loadRanking()});
