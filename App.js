const BRS=["Msana","Cava","Aser","Dolce Bakery"],CATS=["Income","Stock","Rent","Bills","Salary","Government","Personal"];
const DEF={pin:"1234",kpin:"1111",rpin:"2222",tok:"9244108229:AAF7L-KTSYN31IBPUcdJ8lxejBwdkr8ZpUU",mchat:"-5477412378",cchat:"-5345671499",achat:"423002127",dchat:"-5037691159",rchat:"-5350761938",admin:"-5392259678",pts:100,menu:[{id:1,br:"Msana",cat:"Mains",name:"Msana Special Tibs",p:650,d:10},{id:2,br:"Cava",cat:"Mains",name:"Cava Grilled Chicken",p:720,d:15},{id:3,br:"Aser",cat:"Mains",name:"Aser Combo Platter",p:800,d:0},{id:4,br:"Dolce Bakery",cat:"Pastries",name:"Butter Croissant",p:160,d:20}],orders:[],ledger:[],cust:[]};
let S=DEF;try{const x=localStorage.getItem("mcad_v14");if(x)S=Object.assign({},DEF,JSON.parse(x))}catch(e){}
function save(){try{localStorage.setItem("mcad_v14",JSON.stringify(S))}catch(e){}}
let cBr="Msana",cCat="All",cart=[],del="Motorbike",fBr="Msana",fCat="Income",bmBr="Msana",bCard=[],bHits=[],bDrawn=[];

function sendTg(id,txt){if(S.tok&&id)fetch("https://telegram.org"+S.tok+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:id,text:txt})}).catch(()=>{})}
function branchChat(b){return b==="Msana"?S.mchat:(b==="Cava"?S.cchat:(b==="Aser"?S.achat:S.dchat))}
function notifyAll(bChat,txt){sendTg(bChat,txt);if(S.admin&&S.admin!==bChat)sendTg(S.admin,txt)}

function tab(t,b){document.querySelectorAll("section").forEach(x=>x.classList.add("hide"));document.getElementById("s-"+t).classList.remove("hide");document.querySelectorAll("nav button").forEach(x=>x.classList.remove("on"));if(b)b.classList.add("on");renderAll()}
function unlockRole(r){const v=document.getElementById(r==="b"?"pin-in":r+"-pin").value,req=r==="b"?S.pin:(r==="k"?S.kpin:S.rpin);if(v===req){document.getElementById(r+"-lock").classList.add("hide");document.getElementById(r+"-open").classList.remove("hide");document.getElementById(r==="b"?"pin-in":r+"-pin").value="";renderAll()}else alert("Wrong PIN")}
function lockRole(r){document.getElementById(r+"-open").classList.add("hide");document.getElementById(r+"-lock").classList.remove("hide")}

function renderCust(){
  document.getElementById("c-branch").innerHTML=BRS.map(b=>'<button type="button" class="chip '+(cBr===b?'on':'')+'" onclick="cBr=\''+b+'\';cCat=\'All\';renderCust()">'+b+'</button>').join("");
  const items=S.menu.filter(m=>m.br===cBr),cats=["All",...new Set(items.map(m=>m.cat))];
  document.getElementById("c-cat").innerHTML=cats.map(c=>'<button type="button" class="chip acc '+(cCat===c?'on':'')+'" onclick="cCat=\''+c+'\';renderCust()">'+c+'</button>').join("");
  const list=cCat==="All"?items:items.filter(m=>m.cat===cCat);
  document.getElementById("c-menu").innerHTML=list.map(m=>{const fp=Math.round(m.p*(1-(m.d||0)/100));return '<div class="item"><div><strong>'+m.name+'</strong> '+(m.d>0?'<span class="badge">'+m.d+'% OFF</span>':'')+'<div style="font-size:12px;color:var(--mut)">'+m.cat+' • <strong style="color:var(--pri)">'+fp+' ETB</strong></div></div><button type="button" class="btn sm" onclick="addCart('+m.id+')">+ Add</button></div>'}).join("")
}
function addCart(id){const m=S.menu.find(x=>x.id===id);if(m){cart.push({name:m.name,br:m.br,p:Math.round(m.p*(1-(m.d||0)/100))});renderCart()}}
function renderCart(){const el=document.getElementById("cart-box");if(!cart.length){el.innerHTML="Cart is empty.";document.getElementById("cart-tot").innerText="0 ETB";return}el.innerHTML=cart.map((c,i)=>'<div class="row" style="margin-bottom:4px"><span>'+c.name+' ('+c.br+')</span><span>'+c.p+' ETB <b style="color:red;cursor:pointer" onclick="cart.splice('+i+',1);renderCart()">✕</b></span></div>').join("");document.getElementById("cart-tot").innerText=cart.reduce((s,i)=>s+i.p,0).toLocaleString()+" ETB"}
function setDel(d,b){del=d;document.querySelectorAll("#del-chips .chip").forEach(x=>x.classList.remove("on"));b.classList.add("on")}

function sendOrder(){
  if(!cart.length)return alert("Add an item first.");
  const name=document.getElementById("o-name").value.trim()||"Customer",phone=document.getElementById("o-phone").value.trim(),tg=document.getElementById("o-tg").value.trim().replace("@",""),loc=document.getElementById("o-loc").value.trim()||"Addis Ababa";
  if(!phone)return alert("Enter phone number.");
  const first=cart.at(0),br=first?first.br:"Msana",tot=cart.reduce((s,i)=>s+i.p,0),txt=cart.map(c=>c.name).join(", "),oid=Date.now().toString().slice(-4);
  S.orders.unshift({id:oid,br:br,items:txt,tot:tot,name:name,phone:phone,del:del,loc:loc,st:"Waiting Restaurant"});
  if(!S.cust.some(c=>c.phone===phone))S.cust.unshift({id:Date.now(),name:name,phone:phone,tg:tg,cred:50});
  cart=[];save();renderCart();
  notifyAll(branchChat(br),"🛎️ NEW ORDER #"+oid+"\n📍 "+br+"\n🍽️ "+txt+" ("+tot+" ETB)\n🛵 "+del+" → "+loc+"\n👤 "+name+" ("+phone+")");
  alert("Order #"+oid+" sent to "+br+"! Play Bingo while you wait.");
}

function renderKitchen(){
  document.getElementById("k-list").innerHTML=S.orders.length?S.orders.map(o=>'<div class="card" style="background:#f9fafb;margin-bottom:8px"><div class="row"><strong>#'+o.id+' • '+o.br+'</strong><span class="badge">'+o.st+'</span></div><div style="font-size:12px;margin:6px 0"><div>🍽️ '+o.items+' ('+o.tot+' ETB)</div><div>📍 '+o.loc+' ('+o.del+')</div><div>👤 '+o.name+' ('+o.phone+')</div></div>'+(o.st==="Waiting Restaurant"?'<button type="button" class="btn acc sm" onclick="acceptOrder(\''+o.id+'\')">✅ Accept & Request Driver</button>':'<span class="pos" style="font-size:11px;font-weight:700">✔ Accepted</span>')+'</div>').join(""):"No orders.";
}
function acceptOrder(id){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  o.st=o.del==="Pickup"?"Ready for Pickup":"Driver Requested";save();renderAll();
  const msg="✅ ACCEPTED #"+o.id+" by "+o.br+"\n🛵 "+o.del+" → "+o.loc+"\n👤 "+o.name+" ("+o.phone+")";
  if(o.del!=="Pickup")sendTg(S.rchat,"🚨 DRIVER REQUESTED #"+o.id+"\nPick up: "+o.br+"\nDrop off: "+o.loc+" ("+o.del+")\nCustomer: "+o.name+" ("+o.phone+")");
  sendTg(S.admin,msg);
  alert("Order #"+o.id+" accepted!");
}

function renderRiders(){
  const list=S.orders.filter(o=>o.del!=="Pickup");
  document.getElementById("r-list").innerHTML=list.length?list.map(o=>'<div class="card" style="background:#f9fafb;margin-bottom:8px"><div class="row"><strong>#'+o.id+' • '+o.br+'</strong><span class="badge">'+o.del+' • '+o.st+'</span></div><div style="font-size:12px;margin:6px 0"><div>📦 '+o.items+'</div><div>📍 '+o.loc+'</div><div>📞 '+o.name+' ('+o.phone+')</div></div>'+(o.st==="Driver Requested"?'<button type="button" class="btn sm" onclick="driverAccept(\''+o.id+'\')">🏍️ Accept Delivery</button>':(o.st==="Driver Assigned"?'<button type="button" class="btn tg sm" onclick="completeDel(\''+o.id+'\')">🏁 Confirm Delivered</button>':'<small style="color:var(--mut)">'+o.st+'</small>'))+'</div>').join(""):"No delivery requests.";
}
function driverAccept(id){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  o.st="Driver Assigned";save();renderAll();
  notifyAll(branchChat(o.br),"🏍️ DRIVER ASSIGNED #"+o.id+" ("+o.br+")! Rider heading to pickup.");
  alert("Delivery #"+o.id+" assigned to you!");
}
function completeDel(id){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  o.st="Delivered";save();renderAll();
  notifyAll(branchChat(o.br),"🏁 DELIVERED #"+o.id+" ("+o.br+") confirmed.");
}

function newBingoCard(){
  if(S.pts<20)return alert("Need 20 Birr Points! Tap +50 Free.");
  S.pts-=20;save();document.getElementById("g-pts").innerText=S.pts;
  bCard=Array.from({length:25},(_,i)=>i+1).sort(()=>Math.random()-0.5);bHits=;bDrawn=[];
  document.getElementById("g-res").innerText="";document.getElementById("b-drawn").innerText="Drawn: FREE center";renderBingo();
}
function renderBingo(){document.getElementById("bingo-board").innerHTML=bCard.map((n,i)=>'<div class="b-cell '+(bHits.includes(i)?'hit':'')+'">'+(i===12?'★':n)+'</div>').join("")}
function drawBingo(){
  if(!bCard.length)return alert("Tap Buy Card first!");
  if(bDrawn.length>=25)return alert("All numbers drawn!");
  let n;do{n=Math.floor(Math.random()*25)+1}while(bDrawn.includes(n));
  bDrawn.push(n);const idx=bCard.indexOf(n);if(idx!==-1&&!bHits.includes(idx))bHits.push(idx);
  document.getElementById("b-drawn").innerText="Drawn: "+bDrawn.join(", ");renderBingo();
  const wins=[,,,,,,,,,,,];
  if(wins.some(l=>l.every(i=>bHits.includes(i)))){S.pts+=150;save();document.getElementById("g-pts").innerText=S.pts;document.getElementById("g-res").innerHTML='<span class="pos">🎉 BINGO! Won +150 Birr Points / Free Pastry!</span>';bCard=[]}
}
function addPts(){S.pts+=50;document.getElementById("g-pts").innerText=S.pts;save()}

function subTab(t,b){["fin","menu","crm","set"].forEach(x=>document.getElementById("sub-"+x).classList.add("hide"));document.getElementById("sub-"+t).classList.remove("hide");document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("on"));b.classList.add("on");renderBoss()}
function qAmt(v){const e=document.getElementById("f-amt");e.value=(Number(e.value)||0)+v}
function saveFin(){const a=Number(document.getElementById("f-amt").value);if(!a||a<=0)return alert("Enter amount.");S.ledger.unshift({id:Date.now(),br:fBr,cat:fCat,amt:a,note:document.getElementById("f-note").value.trim()||fCat});document.getElementById("f-amt").value="";document.getElementById("f-note").value="";save();renderBoss()}
function renderBoss(){
  document.getElementById("f-branch").innerHTML=BRS.map(b=>'<button type="button" class="chip '+(fBr===b?'on':'')+'" onclick="fBr=\''+b+'\';renderBoss()">'+b+'</button>').join("");
  document.getElementById("f-cat").innerHTML=CATS.map(c=>'<button type="button" class="chip acc '+(fCat===c?'on':'')+'" onclick="fCat=\''+c+'\';renderBoss()">'+c+'</button>').join("");
  let tI=0,tC=0,tP=0;