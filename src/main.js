import * as THREE from 'three';
import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="welcome" id="welcome"><div class="card">
    <div style="font-size:64px">🌰</div><h1>와글와글 도토리 타운</h1>
    <p>함께 모험할 캐릭터를 선택해 주세요.</p>
    <div class="gender-select"><button data-gender="girl">👧 여자아이</button><button data-gender="boy">👦 남자아이</button></div>
  </div></div>
  <div class="hud">
    <div class="brand">🌿 도토리 타운</div>
    <div class="status"><div class="pill">🌰 <span id="acorns">25</span></div><div class="pill" id="tool-pill">✋ 맨손</div><div class="pill">☀️ 맑은 낮</div></div>
    <div class="quest"><small>첫 번째 할 일</small>다람쥐 이장을 찾아가 인사해요 <b>0 / 1</b></div>
    <div class="controls">WASD/방향키 이동 · Shift 달리기<br>1 맨손 · 2 도끼 · 3 삽 · E 사용 · I 가방</div>
    <div class="hint" id="hint"></div>
  </div>
  <div class="inventory" id="inventory"><div class="inventory-head"><h2>🎒 내 가방 <small>(12칸)</small></h2><button id="close-inventory">I · 닫기</button></div><div class="slots" id="slots"></div></div>
  <div class="toast" id="toast"></div>`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd8c5);
scene.fog = new THREE.Fog(0x9bd8c5, 100, 260);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 360);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.querySelector('#app').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xfff7d8, 0x52785c, 2.1));
const sun = new THREE.DirectionalLight(0xfff0c6, 3.2);
sun.position.set(-20, 32, 15); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -50; sun.shadow.camera.right = sun.shadow.camera.top = 50;
scene.add(sun);

const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: .85, flatShading: true });
const addMesh = (geo, material, parent = scene, shadows = true) => { const m = new THREE.Mesh(geo, material); m.castShadow = shadows; m.receiveShadow = shadows; parent.add(m); return m; };
const ocean = addMesh(new THREE.CylinderGeometry(210,210,1,64),mat(0x56abc4),scene,false);ocean.position.y=-2;
const ground = addMesh(new THREE.CylinderGeometry(126,132,2,64), mat(0x80b963)); ground.position.y = -1.1;
const beach=addMesh(new THREE.RingGeometry(112,129,64),mat(0xe8cf96));beach.rotation.x=-Math.PI/2;beach.position.y=.015;
const path = addMesh(new THREE.PlaneGeometry(7,115),mat(0xe2c48e));path.rotation.x=-Math.PI/2;path.rotation.z=.15;path.position.y=.035;
const river=addMesh(new THREE.PlaneGeometry(150,12),mat(0x62bad0),scene,false);river.rotation.x=-Math.PI/2;river.position.set(0,.055,55);
const bridge=addMesh(new THREE.BoxGeometry(8,.35,14),mat(0xb47b4f));bridge.position.set(-16,.45,55);

const harvestTargets=[];
function tree(x, z, s = 1, harvestable = true) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  const trunk = addMesh(new THREE.CylinderGeometry(.45, .7, 3, 7), mat(0x886044), g); trunk.position.y = 1.5;
  [[0,4,0,2.1],[1,3.5,.2,1.6],[-1,3.6,.3,1.5],[.2,3.8,-1,1.5]].forEach(([a,b,c,d])=>{ const crown=addMesh(new THREE.IcosahedronGeometry(d,1),mat(0x4f9a59),g); crown.position.set(a,b,c); });
  g.userData={kind:'tree',readyAt:0};if(harvestable)harvestTargets.push(g);return g;
}
for(let i=0;i<85;i++){const a=i/85*Math.PI*2,r=101+Math.sin(i*3)*10;tree(Math.cos(a)*r,Math.sin(a)*r,.7+Math.random()*.5,i%3===0)}
for(let i=0;i<55;i++){const x=-82+Math.random()*55,z=-72+Math.random()*115;if(Math.hypot(x,z)>30)tree(x,z,.7+Math.random()*.55,i%2===0)}
tree(7,8,.9,true);tree(-11,18,1,true);tree(17,22,.85,true);

function rock(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);const m=addMesh(new THREE.DodecahedronGeometry(1.35,0),mat(0x8e9089),g);m.position.y=.85;m.scale.set(1.2,.75,1);g.userData={kind:'rock',readyAt:0};harvestTargets.push(g);return g}
for(let i=0;i<22;i++)rock(42+Math.random()*42,-68+Math.random()*52,.75+Math.random()*.55);
rock(-7,9,.75);rock(12,17,.8);rock(-18,23,.9);
function flowerPatch(x,z,color=0xffef8a){const g=new THREE.Group();g.position.set(x,0,z);for(let i=0;i<5;i++){const a=i/5*Math.PI*2,p=addMesh(new THREE.SphereGeometry(.16,8,6),mat(color),g);p.position.set(Math.cos(a)*.18,.38,Math.sin(a)*.18)}const c=addMesh(new THREE.SphereGeometry(.13,8,6),mat(0xe19a44),g);c.position.y=.38;g.userData={kind:'flower',readyAt:0};harvestTargets.push(g);return g}
for(let i=0;i<30;i++)flowerPatch(28+Math.random()*55,20+Math.random()*45,[0xffef8a,0xffb4c8,0xd9b8ff][i%3]);
flowerPatch(1,14,0xffef8a);flowerPatch(-5,16,0xffb4c8);flowerPatch(8,19,0xd9b8ff);
for(let i=0;i<100;i++){const grass=addMesh(new THREE.ConeGeometry(.16,.65,4),mat(i%2?0x5c9f4e:0x6eac59),scene,false);grass.position.set(-100+Math.random()*200,.32,-95+Math.random()*190);grass.rotation.y=Math.random()*Math.PI}

function house(x,z,color=0xf2ae6f){
 const g=new THREE.Group(); g.position.set(x,0,z);
 const body=addMesh(new THREE.BoxGeometry(7,4.5,6),mat(0xffe5b7),g); body.position.y=2.25;
 const roof=addMesh(new THREE.ConeGeometry(5.6,3.4,4),mat(color),g); roof.position.y=6; roof.rotation.y=Math.PI/4;
 const door=addMesh(new THREE.BoxGeometry(1.5,2.7,.25),mat(0x8f6548),g); door.position.set(0,1.35,3.08);
 [-2,2].forEach(v=>{const w=addMesh(new THREE.BoxGeometry(1.35,1.35,.22),mat(0x8ed3d7),g);w.position.set(v,2.8,3.1)});
 return g;
}
house(-13,-12); house(14,-8,0xc96f58);

const pond=addMesh(new THREE.CylinderGeometry(8,8,0.25,24),mat(0x67bccc)); pond.position.set(13,.05,14); pond.scale.z=.65;
for(let i=0;i<12;i++){ const stone=addMesh(new THREE.DodecahedronGeometry(.6+Math.random()*.35,0),mat(0xa79b80)); const a=i/12*Math.PI*2; stone.position.set(13+Math.cos(a)*8.2,.2,14+Math.sin(a)*5.5); }

const farm = new THREE.Group(); farm.position.set(-15,0,12); scene.add(farm);
for(let r=0;r<3;r++) for(let c=0;c<5;c++){ const soil=addMesh(new THREE.BoxGeometry(1.5,.25,1.5),mat(0x9b6c48),farm); soil.position.set(c*1.8,.1,r*1.8); const sprout=addMesh(new THREE.ConeGeometry(.25,.8,5),mat(0x65a952),farm); sprout.position.set(c*1.8,.65,r*1.8); }

function squirrel(bodyColor=0xc9793e){
 const g=new THREE.Group();
 const body=addMesh(new THREE.SphereGeometry(.72,12,10),mat(bodyColor),g);body.position.y=1.05;body.scale.y=1.2;
 const head=addMesh(new THREE.SphereGeometry(.72,12,10),mat(bodyColor),g);head.position.y=2.08;
 [-.42,.42].forEach(x=>{const ear=addMesh(new THREE.ConeGeometry(.25,.55,6),mat(bodyColor),g);ear.position.set(x,2.75,0)});
 const muzzle=addMesh(new THREE.SphereGeometry(.35,10,8),mat(0xf2c18e),g);muzzle.position.set(0,1.95,.58);muzzle.scale.y=.7;
 [-.23,.23].forEach(x=>{const eye=addMesh(new THREE.SphereGeometry(.085,8,8),mat(0x342a24),g);eye.position.set(x,2.25,.65)});
 const tail=addMesh(new THREE.SphereGeometry(.65,12,10),mat(bodyColor),g);tail.position.set(0,1.45,-.75);tail.scale.set(.85,1.65,.65);tail.rotation.x=-.5;
 return g;
}
function human(gender='girl') {
 const g=new THREE.Group();
 const skin=mat(0xf0b98e), denim=mat(0x3977a6), shirt=mat(gender==='girl'?0xffe2a9:0xf4e1b8), hair=mat(gender==='girl'?0x6d4030:0x59402f), shoe=mat(0x77533f);
 const torso=addMesh(new THREE.BoxGeometry(.85,1.05,.5),shirt,g);torso.position.y=1.45;
 const bib=addMesh(new THREE.BoxGeometry(.62,.72,.54),denim,g);bib.position.set(0,1.38,.05);
 [-.27,.27].forEach(x=>{const strap=addMesh(new THREE.BoxGeometry(.12,.72,.06),denim,g);strap.position.set(x,1.7,.3)});
 [-.25,.25].forEach(x=>{const leg=addMesh(new THREE.CapsuleGeometry(.18,.65,4,8),denim,g);leg.position.set(x,.62,0);const foot=addMesh(new THREE.BoxGeometry(.36,.22,.58),shoe,g);foot.position.set(x,.16,.11)});
 [-.57,.57].forEach(x=>{const arm=addMesh(new THREE.CapsuleGeometry(.14,.7,4,8),skin,g);arm.position.set(x,1.42,0);arm.rotation.z=x>0?-.12:.12});
 const head=addMesh(new THREE.SphereGeometry(.52,14,12),skin,g);head.position.y=2.35;
 const hairCap=addMesh(new THREE.SphereGeometry(.55,14,10,0,Math.PI*2,0,Math.PI*.44),hair,g);hairCap.position.y=2.47;
 if(gender==='girl')[-.48,.48].forEach(x=>{const side=addMesh(new THREE.CapsuleGeometry(.16,.65,4,8),hair,g);side.position.set(x,2.18,-.02)});
 [-.18,.18].forEach(x=>{const eye=addMesh(new THREE.SphereGeometry(.045,8,8),mat(0x352b29),g);eye.position.set(x,2.38,.49)});
 const axe=new THREE.Group(),axeHandle=addMesh(new THREE.CylinderGeometry(.055,.065,.9,7),mat(0x855b3e),axe);axeHandle.rotation.z=.35;const axeHead=addMesh(new THREE.BoxGeometry(.48,.25,.12),mat(0xa7b0ae),axe);axeHead.position.set(-.13,.42,0);axe.position.set(.72,1.25,.12);axe.visible=false;g.add(axe);
 const shovel=new THREE.Group(),shovelHandle=addMesh(new THREE.CylinderGeometry(.045,.055,1.05,7),mat(0x855b3e),shovel);shovelHandle.rotation.z=.28;const shovelHead=addMesh(new THREE.ConeGeometry(.18,.38,4),mat(0x9ca9a8),shovel);shovelHead.position.set(.15,-.5,0);shovelHead.rotation.z=Math.PI;shovel.position.set(.72,1.25,.12);shovel.visible=false;g.add(shovel);g.userData.heldTools={axe,shovel};
 return g;
}
let player=human('girl'); player.position.set(0,0,8); scene.add(player);
const mayor=squirrel(0xb46a37); mayor.position.set(0,0,-8); mayor.rotation.y=Math.PI; mayor.scale.setScalar(1.12); scene.add(mayor);
const hat=addMesh(new THREE.CylinderGeometry(.7,.9,.25,12),mat(0x668c5e),mayor);hat.position.y=2.75;

const itemData={branch:{name:'나뭇가지',icon:'🪵'},stone:{name:'돌멩이',icon:'🪨'},flower:{name:'꽃',icon:'🌼'}};
const inventory={branch:0,stone:0,flower:0};
const drops=[];
function createDrop(type,source){const g=new THREE.Group();g.position.copy(source.position);g.position.x+=(Math.random()-.5)*1.5;g.position.z+=(Math.random()-.5)*1.5;g.position.y=.8;if(type==='branch'){const m=addMesh(new THREE.CylinderGeometry(.09,.12,1.3,7),mat(0x855b3e),g);m.rotation.z=Math.PI/2}else if(type==='stone'){addMesh(new THREE.DodecahedronGeometry(.42,0),mat(0x9d9b91),g)}else{const m=addMesh(new THREE.SphereGeometry(.3,8,6),mat(0xffdc73),g);m.scale.y=.55}g.userData={type,bornAt:performance.now()};scene.add(g);drops.push(g)}
function renderInventory(){const slots=document.querySelector('#slots');slots.innerHTML='';Object.entries(itemData).forEach(([id,item])=>{slots.insertAdjacentHTML('beforeend',`<div class="slot"><span class="icon">${item.icon}</span><span class="name">${item.name}</span><span class="count">${inventory[id]}</span></div>`)});for(let i=3;i<12;i++)slots.insertAdjacentHTML('beforeend','<div class="slot"></div>');}
renderInventory();
const toast=document.querySelector('#toast');let toastTimer;
function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)}
const tools={hand:{name:'맨손',icon:'✋'},axe:{name:'도끼',icon:'🪓'},shovel:{name:'삽',icon:'⛏️'}};let selectedTool='hand';
function selectTool(tool){selectedTool=tool;if(player.userData.heldTools){player.userData.heldTools.axe.visible=tool==='axe';player.userData.heldTools.shovel.visible=tool==='shovel'}document.querySelector('#tool-pill').textContent=`${tools[tool].icon} ${tools[tool].name}`;showToast(`${tools[tool].icon} ${tools[tool].name}을(를) 선택했어요`)}
function nearestTarget(){let best={kind:'mayor',object:mayor,distance:player.position.distanceTo(mayor.position)};for(const r of harvestTargets){if(r.userData.kind==='flower'&&!r.visible)continue;const d=player.position.distanceTo(r.position);if(d<best.distance)best={kind:r.userData.kind,object:r,distance:d}}return best.distance<4?best:null;}
function actionText(kind){if(kind==='tree')return selectedTool==='axe'?'나무를 도끼로 치기':'도끼가 필요해요';if(kind==='rock')return selectedTool==='axe'?'바위를 도끼로 치기':selectedTool==='shovel'?'바위 주변 파기':'도끼나 삽이 필요해요';if(kind==='flower')return selectedTool==='hand'?'꽃 따기':selectedTool==='shovel'?'꽃 캐기':'맨손이나 삽이 필요해요';return ''}
function interact(){const target=nearestTarget();if(!target)return;if(target.kind==='mayor'){document.querySelector('.quest').innerHTML='<small>다람쥐 이장의 이야기</small>도구를 골라 숲의 재료를 모아 보자 🌰';return;}const obj=target.object,now=performance.now();if(now<obj.userData.readyAt){const left=Math.ceil((obj.userData.readyAt-now)/60000);showToast(`${left}분 뒤에 다시 채집할 수 있어요`);return;}let type=null,cooldown=0;if(target.kind==='tree'&&selectedTool==='axe'){type='branch';cooldown=20*60*1000}if(target.kind==='rock'&&(selectedTool==='axe'||selectedTool==='shovel')){type='stone';cooldown=20*60*1000}if(target.kind==='flower'&&(selectedTool==='hand'||selectedTool==='shovel')){type='flower';cooldown=60*1000}if(!type){showToast(actionText(target.kind));return;}obj.userData.readyAt=now+cooldown;if(target.kind==='flower')obj.visible=false;createDrop(type,obj);showToast(`${tools[selectedTool].icon} ${itemData[type].name}이(가) 나왔어요!`)}
const keys={}; let yaw=0, pitch=.32, dragging=false, lastX=0,lastY=0,pointerStartX=0,pointerStartY=0,started=false,inventoryOpen=false;
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Digit1')selectTool('hand');if(e.code==='Digit2')selectTool('axe');if(e.code==='Digit3')selectTool('shovel');if(e.code==='KeyE'&&started&&!inventoryOpen)interact();if(e.code==='KeyI'&&started){inventoryOpen=!inventoryOpen;document.querySelector('#inventory').classList.toggle('open',inventoryOpen)}});
addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=pointerStartX=e.clientX;lastY=pointerStartY=e.clientY});
addEventListener('pointerup',e=>{if(started&&!inventoryOpen&&Math.hypot(e.clientX-pointerStartX,e.clientY-pointerStartY)<5)interact();dragging=false});
addEventListener('pointermove',e=>{if(!dragging)return;yaw-=(e.clientX-lastX)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.004,.12,.75);lastX=e.clientX;lastY=e.clientY});
document.querySelectorAll('[data-gender]').forEach(button=>button.onclick=()=>{const position=player.position.clone();scene.remove(player);player=human(button.dataset.gender);player.position.copy(position);scene.add(player);document.querySelector('#welcome').style.display='none';started=true;showToast(button.dataset.gender==='girl'?'여자아이로 시작해요!':'남자아이로 시작해요!')});
document.querySelector('#close-inventory').onclick=()=>{inventoryOpen=false;document.querySelector('#inventory').classList.remove('open')};

const clock=new THREE.Clock();
function isWater(x,z){
 const inPond=((x-13)/8)**2+((z-14)/5.2)**2<1;
 const onBridge=x>-20&&x<-12&&z>48&&z<62;
 const inRiver=Math.abs(z-55)<6&&Math.abs(x)<75&&!onBridge;
 const inSea=Math.hypot(x,z)>110;
 return inPond||inRiver||inSea;
}
function animate(){
 requestAnimationFrame(animate); const dt=Math.min(clock.getDelta(),.05);
 if(started&&!inventoryOpen){
  const forward=((keys.KeyW||keys.ArrowUp)?1:0)-((keys.KeyS||keys.ArrowDown)?1:0), side=((keys.KeyA||keys.ArrowLeft)?1:0)-((keys.KeyD||keys.ArrowRight)?1:0);
  if(forward||side){const speed=(keys.ShiftLeft||keys.ShiftRight)?9:5;const angle=Math.atan2(side,forward)+yaw,oldX=player.position.x,oldZ=player.position.z;player.position.x+=Math.sin(angle)*speed*dt;player.position.z+=Math.cos(angle)*speed*dt;player.rotation.y=angle;if(isWater(player.position.x,player.position.z)){player.position.x=oldX;player.position.z=oldZ}player.position.y=Math.abs(Math.sin(clock.elapsedTime*10))*.07;}
 }
 const dist=11, target=new THREE.Vector3(player.position.x,1.5,player.position.z);
 const desired=new THREE.Vector3(target.x-Math.sin(yaw)*dist*Math.cos(pitch),target.y+Math.sin(pitch)*dist,target.z-Math.cos(yaw)*dist*Math.cos(pitch));
 camera.position.lerp(desired,.1);camera.lookAt(target);
 const now=performance.now();
 for(const target of harvestTargets){if(target.userData.kind==='flower'&&!target.visible&&now>=target.userData.readyAt)target.visible=true;}
 for(let i=drops.length-1;i>=0;i--){const drop=drops[i],age=now-drop.userData.bornAt;drop.rotation.y+=dt*2;drop.position.y=.35+Math.abs(Math.sin(age*.008))*(age<700?.65:.1);if(age>350&&player.position.distanceTo(drop.position)<2.4){const type=drop.userData.type;if(inventory[type]<99){inventory[type]++;scene.remove(drop);drops.splice(i,1);renderInventory();showToast(`${itemData[type].icon} ${itemData[type].name}을(를) 가방에 담았어요`);const total=Object.values(inventory).reduce((a,b)=>a+b,0);document.querySelector('.quest').innerHTML=`<small>숲의 작은 발견</small>채집물을 3개 모아요 <b>${Math.min(total,3)} / 3</b>`;}}}
 const targetObject=nearestTarget(),hint=document.querySelector('#hint');
 if(targetObject){hint.textContent=targetObject.kind==='mayor'?'E · 다람쥐 이장과 대화하기':`E · ${actionText(targetObject.kind)}`;hint.classList.add('show')}else hint.classList.remove('show');
 renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
