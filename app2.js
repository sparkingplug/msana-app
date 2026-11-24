const BRS=new Array("Msana","Cava","Aser","Dolce Bakery"),CATS=new Array("Income","Stock","Rent","Bills","Salary","Government","Personal");
const DEF={pin:"1234",kpin:"1111",rpin:"2222",tok:"9244108229:AAF7L-KTSYN31IBPUcdJ8lxejBwdkr8ZpUU",mchat:"-5477412378",cchat:"-5345671499",achat:"423002127",dchat:"-5037691159",rchat:"-5350761938",admin:"-5392259678",pts:100,menu:new Array({id:1,br:"Msana",cat:"Mains",name:"Msana Special Tibs",p:650,d:10},{id:2,br:"Cava",cat:"Mains",name:"Cava Grilled Chicken",p:720,d:15},{id:3,br:"Aser",cat:"Mains",name:"Aser Combo Platter",p:800,d:0},{id:4,br:"Dolce Bakery",cat:"Pastries",name:"Butter Croissant",p:160,d:20}),orders:new Array(),ledger:new Array(),cust:new Array()};
let S=DEF;try{const x=localStorage.getItem("mcad_v17");if(x)S=Object.assign({},DEF,JSON.parse(x))}catch(e){}
function save(){try{localStorage.setItem("mcad_v17",JSON.stringify(S))}catch(e){}}
let cBr="Msana",cCat="All",cart=new Array(),del="Motorbike",fBr="Msana",fCat="Income",bmBr="Msana",bCard=new Array(),bHits=new Array(),bDrawn=new Array();
function sendTg(id,txt){if(S.tok&&id)fetch("https://telegram.org"+S.tok+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:id,text:txt})}).catch(()=>{})}
function bChat(b){return b==="Msana"?S.mchat:(b==="Cava"?S.cchat:(b==="Aser"?S.achat:S.dchat))}
function notifyAll(c,t){sendTg(c,t);if(S.admin&&S.admin!==c)sendTg(S.admin,t)}
function tab(t,b){document.querySelectorAll("section").forEach(x=>x.classList.add("hide"));document.getElementById("s-"+t).classList.remove("hide");document.querySelectorAll("nav button").forEach(x=>x.classList.remove("on"));if(b)b.classList.add("on");renderAll()}
function unlockRole(r){const v=document.getElementById(r==="b"?"pin-in":r+"-pin").value,req=r==="b"?S.pin:(r==="k"?S.kpin:S.rpin);if(v===req){document.getElementById(r+"-lock").classList.add("hide");document.getElementById(r+"-open").classList.remove("hide");document.getElementById(r==="b"?"pin-in":r+"-pin").value="";renderAll()}else alert("Wrong PIN")}
function lockRole(r){document.getElementById(r+"-open").classList.add("hide");document.getElementById(r+"-lock").classList.remove("hide")}
function renderCust(){
  document.getElementById("c-branch").innerHTML=BRS.map(b=>'<button type="button" class="chip '+(cBr===b?'on':'')+'" onclick="cBr=\''+b+'\';cCat=\'All\';renderCust()">'+b+'</button>').join("");
  const items=S.menu.filter(m=>m.br===cBr),cats=new Array("All").concat(Array.from(new Set(items.map(m=>m.cat))));
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
  cart=new Array();save();renderCart();
  notifyAll(bChat(br),"🛎️ NEW ORDER #"+oid+"\n📍 "+br+"\n🍽️ "+txt+" ("+tot+" ETB)\n🛵 "+del+" → "+loc+"\n👤 "+name+" ("+phone+")");
  alert("Order #"+oid+" sent to "+br+"! Play Bingo while you wait.");
}
function renderKitchen(){document.getElementById("k-list").innerHTML=S.orders.length?S.orders.map(o=>'<div class="card" style="background:#f9fafb;margin-bottom:8px"><div class="row"><strong>#'+o.id+' • '+o.br+'</strong><span class="badge">'+o.st+'</span></div><div style="font-size:12px;margin:6px 0"><div>🍽️ '+o.items+' ('+o.tot+' ETB)</div><div>📍 '+o.loc+' ('+o.del+')</div><div>👤 '+o.name+' ('+o.phone+')</div></div>'+(o.st==="Waiting Restaurant"?'<button type="button" class="btn acc sm" onclick="acceptOrder(\''+o.id+'\')">✅ Accept & Request Driver</button>':'<span class="pos" style="font-size:11px;font-weight:700">✔ Accepted</span>')+'</div>').join(""):"No orders."}
function acceptOrder(id){const o=S.orders.find(x=>x.id===id);if(!o)return;o.st=o.del==="Pickup"?"Ready for Pickup":"Driver Requested";save();renderAll();if(o.del!=="Pickup")sendTg(S.rchat,"🚨 DRIVER REQUESTED #"+o.id+"\nPick up: "+o.br+"\nDrop off: "+o.loc+" ("+o.del+")\nCustomer: "+o.name+" ("+o.phone+")");sendTg(S.admin,"✅ ACCEPTED #"+o.id+" by "+o.br);alert("Order #"+o.id+" accepted!")}