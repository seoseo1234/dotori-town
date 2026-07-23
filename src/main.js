import * as THREE from 'three';
import './style.css';

document.querySelector('#app').innerHTML = `
<div class="intro" id="intro"><div class="intro-card">
  <span class="eyebrow">도시를 떠나, 숲속의 작은 마을로</span><div class="mark">♧</div>
  <h1>와글와글<br><strong>도토리 타운</strong></h1>
  <p>빈 땅과 작은 텐트, 그리고 도토리나무 한 그루.<br>오늘부터 이곳에서 천천히 시작해요.</p>
  <button id="start">마을에 도착하기　→</button>
</div><small>WASD 이동 · 마우스로 둘러보기 · E 대화하기</small></div>
<div class="hud">
  <div class="day">☀️ <b>봄 1일</b><span>오전 08:20</span></div>
  <div class="wallet">도토리 <b>25</b> 🟤</div>
  <div class="place"><b id="place">새로운 보금자리</b><span id="area">도토리 타운 남쪽 들판</span></div>
  <div class="quest"><em>오늘의 첫걸음</em><b>다람쥐 이장에게 인사하기</b><i><u></u></i><small id="count">0 / 1</small></div>
  <div class="hint" id="hint"><kbd>E</kbd> 다람쥐 이장과 대화하기</div>
</div>
<div class="dialogue" id="dialogue"><span>🐿️</span><div><b>도토리 이장</b><p>어서 와! 네가 지낼 텐트와 작은 밭을 준비해 뒀어. 서두르지 말고, 우리 마을의 계절을 천천히 즐겨 줘.</p></div><button id="close">고마워요!</button></div>
<div class="toast" id="toast">새로운 목표가 열렸어요!</div>`;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xa5ddd4);
scene.fog=new THREE.FogExp2(0xb8ded2,.0065);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,350);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
document.querySelector('#app').prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xfff7d8,0x668b72,2.7));
const sun=new THREE.DirectionalLight(0xffe6b2,3.8);sun.position.set(-40,65,-30);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=sun.shadow.camera.bottom=-80;sun.shadow.camera.right=sun.shadow.camera.top=80;scene.add(sun);

const cache={};
const mat=(c,n=c)=>cache[n]||=new THREE.MeshStandardMaterial({color:c,roughness:.9,flatShading:true});
const add=(geo,ma,parent=scene,shadow=true)=>{const m=new THREE.Mesh(geo,ma);m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m};
const rnd=(a,b)=>a+Math.random()*(b-a);

const water=add(new THREE.CircleGeometry(220,96),mat(0x70bfd1,'water'),scene,false);water.rotation.x=-Math.PI/2;water.position.y=-1.4;
const land=add(new THREE.CircleGeometry(128,96),mat(0x83bc69,'grass'));land.rotation.x=-Math.PI/2;
const beach=add(new THREE.RingGeometry(116,130,96),mat(0xe8d29c,'sand'));beach.rotation.x=-Math.PI/2;beach.position.y=-.05;
const blob=(x,z,sx,sz,c,y=.03)=>{const o=add(new THREE.CircleGeometry(1,40),mat(c),scene,false);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.scale.set(sx,sz,1)};
blob(26,20,17,11,0x70bbcc,.05);blob(-8,-6,34,27,0x91c776,.015);blob(0,62,79,8,0x70bbcc,.05);
function path(points,w=5){
 const c=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.06,z)));
 const p=add(new THREE.TubeGeometry(c,40,w/2,8),mat(0xe7ce98,'path'),scene,false);p.scale.y=.025;
}
path([[0,72],[-4,48],[-2,24],[0,4],[6,-22],[2,-60],[2,-106]],6);
path([[-2,4],[-22,2],[-43,-8]],4);path([[2,4],[23,-2],[44,3]],4);

function tree(x,z,s=1,acorns=false){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);
 const t=add(new THREE.CylinderGeometry(.5,.78,3.8,7),mat(0x80563d,'wood'),g);t.position.y=1.9;
 [[0,4.4,0,2.2],[-1.2,4,.1,1.55],[1.15,4.05,.2,1.6],[.1,4,-1,1.5]].forEach(([a,b,c,r])=>{const o=add(new THREE.IcosahedronGeometry(r,1),mat(acorns?0x4f9954:0x579f59,acorns?'acornleaf':'leaf'),g);o.position.set(a,b,c)});
 if(acorns)for(let i=0;i<6;i++){const n=add(new THREE.SphereGeometry(.18,8,6),mat(0xa96b35,'acorn'),g);n.scale.y=1.3;n.position.set(rnd(-1.5,1.5),rnd(3.4,4.8),rnd(-.8,1))}
}
function bush(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);[-.6,0,.6].forEach((a,i)=>{const b=add(new THREE.IcosahedronGeometry(i===1?.85:.65,1),mat(0x68a956,'bush'),g);b.position.set(a,i===1?.65:.5,0)})}
function flower(x,z,c){const g=new THREE.Group();g.position.set(x,0,z);for(let i=0;i<5;i++){const f=add(new THREE.SphereGeometry(.13,7,5),mat(c,`f${c}`),g,false);f.position.set(rnd(-.5,.5),.35,rnd(-.5,.5))}}
for(let i=0;i<82;i++){const a=i/82*Math.PI*2,r=rnd(92,116);tree(Math.cos(a)*r,Math.sin(a)*r,rnd(.75,1.15),i%9===0)}
[[-35,18],[-28,30],[39,32],[49,22],[-52,-28],[55,-25]].forEach(([x,z],i)=>tree(x,z,rnd(.8,1.1),i%3===0));
for(let i=0;i<35;i++)bush(rnd(-87,87),rnd(-80,85),rnd(.6,1.1));
for(let i=0;i<38;i++)flower(rnd(-75,75),rnd(-76,80),[0xffe17d,0xffa9b3,0xdab6f0,0xfff1cc][i%4]);

function house(x,z,wall,roof,s=1){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);
 const body=add(new THREE.BoxGeometry(8,5,6.6),mat(wall,`w${wall}`),g);body.position.y=2.5;
 const r=add(new THREE.ConeGeometry(5.7,3.7,4),mat(roof,`r${roof}`),g);r.position.y=6.2;r.rotation.y=Math.PI/4;
 const d=add(new THREE.BoxGeometry(1.6,2.9,.25),mat(0x8e6143,'door'),g);d.position.set(0,1.45,3.38);
 [-2.3,2.3].forEach(x=>{const q=add(new THREE.BoxGeometry(1.4,1.35,.28),mat(0x9cd7d6,'glass'),g);q.position.set(x,3,3.4)});
 const ch=add(new THREE.BoxGeometry(.9,2,.9),mat(0xa86750,'chimney'),g);ch.position.set(2.3,6.2,-.4);
}
house(-42,-8,0xffe5b8,0xc86e50,1.05);house(42,3,0xffe9c9,0x719963,1.08);
house(-28,32,0xf8dcad,0xd58b53,.9);house(48,35,0xffe7c2,0xb86f5c,.88);

const plaza=add(new THREE.CylinderGeometry(13,13,.2,40),mat(0xead7a8,'plaza'));plaza.position.set(0,.08,3);
for(let i=0;i<11;i++){const s=add(new THREE.DodecahedronGeometry(.6,0),mat(0xaaa38c,'stone'));const a=i/11*Math.PI*2;s.position.set(Math.cos(a)*13,.25,3+Math.sin(a)*13);s.scale.y=.55}
const notice=new THREE.Group();notice.position.set(-8,0,-1);scene.add(notice);
const post=add(new THREE.BoxGeometry(.35,3,.35),mat(0x8c603e,'post'),notice);post.position.y=1.5;
const board=add(new THREE.BoxGeometry(3.8,2.2,.3),mat(0xbc7b47,'board'),notice);board.position.y=2.7;
const paper=add(new THREE.PlaneGeometry(1.2,1.25),mat(0xfff1cd,'paper'),notice,false);paper.position.set(.45,2.75,.16);

function tent(x,z){const g=new THREE.Group();g.position.set(x,0,z);const base=add(new THREE.CircleGeometry(3.8,16),mat(0xd9c18d,'camp'),g,false);base.rotation.x=-Math.PI/2;base.position.y=.03;const c=add(new THREE.ConeGeometry(3.2,4.5,4),mat(0xf0a75e,'tent'),g);c.position.y=2.25;c.rotation.y=Math.PI/4}
tent(12,-61);
const farm=new THREE.Group();farm.position.set(-13,0,-55);scene.add(farm);
for(let r=0;r<3;r++)for(let c=0;c<4;c++){const soil=add(new THREE.BoxGeometry(1.6,.18,1.6),mat(0x966443,'soil'),farm);soil.position.set(c*1.9,.1,r*1.9);const sprout=add(new THREE.ConeGeometry(.18,.5,5),mat(0x62a653,'sprout'),farm);sprout.position.set(c*1.9,.46,r*1.9)}
tree(3,-51,.7,true);
const crate=add(new THREE.BoxGeometry(2.2,1.2,1.7),mat(0xa96f44,'crate'));crate.position.set(18,.6,-58);

const bridge=new THREE.Group();bridge.position.set(-4,0,62);scene.add(bridge);
for(let i=-5;i<=5;i++){const p=add(new THREE.BoxGeometry(6,.35,1.05),mat(i%2?0xa97347:0xb88152,`bridge${i%2}`),bridge);p.position.set(0,.35,i)}

function squirrel(color=0xc77a3c){
 const g=new THREE.Group();const fur=mat(color,`fur${color}`);
 const body=add(new THREE.SphereGeometry(.72,14,11),fur,g);body.position.y=1.05;body.scale.y=1.2;
 const head=add(new THREE.SphereGeometry(.7,14,11),fur,g);head.position.y=2.05;
 [-.4,.4].forEach(x=>{const e=add(new THREE.ConeGeometry(.24,.55,7),fur,g);e.position.set(x,2.72,0)});
 const mu=add(new THREE.SphereGeometry(.34,10,8),mat(0xf1c28f,'muzzle'),g);mu.position.set(0,1.93,.58);mu.scale.y=.7;
 [-.22,.22].forEach(x=>{const e=add(new THREE.SphereGeometry(.075,8,8),mat(0x30261f,'eye'),g);e.position.set(x,2.23,.64)});
 const tail=add(new THREE.SphereGeometry(.7,12,10),fur,g);tail.position.set(0,1.45,-.8);tail.scale.set(.8,1.65,.65);return g;
}
const mayor=squirrel();mayor.position.set(2,0,-2);mayor.rotation.y=Math.PI;scene.add(mayor);
const hat=add(new THREE.CylinderGeometry(.65,.85,.25,12),mat(0x5f875f,'hat'),mayor);hat.position.y=2.8;
[[31,-1,0xd09258],[-19,29,0xa86f4c],[45,28,0xd9a05f]].forEach(([x,z,c])=>{const n=squirrel(c);n.position.set(x,0,z);scene.add(n)});

function person(){
 const g=new THREE.Group(),skin=mat(0xf0bd91,'skin'),denim=mat(0x5686a5,'denim');
 const torso=add(new THREE.BoxGeometry(.9,1.1,.55),mat(0xf5d58a,'shirt'),g);torso.position.y=1.45;
 const bib=add(new THREE.BoxGeometry(.64,.78,.59),denim,g);bib.position.set(0,1.38,.04);
 [-.25,.25].forEach(x=>{const l=add(new THREE.CapsuleGeometry(.17,.65,4,8),denim,g);l.position.set(x,.58,0)});
 const head=add(new THREE.SphereGeometry(.52,14,11),skin,g);head.position.y=2.35;
 const hair=add(new THREE.SphereGeometry(.56,14,10,0,Math.PI*2,0,Math.PI*.5),mat(0x6d4634,'hair'),g);hair.position.y=2.48;return g;
}
const player=person();player.position.set(3,0,-70);scene.add(player);

let started=false,dialogue=false,yaw=0,pitch=.43,drag=false,lastX=0,lastY=0;
const keys={},clock=new THREE.Clock(),hint=document.querySelector('#hint');
document.querySelector('#start').onclick=()=>{started=true;document.querySelector('#intro').classList.add('hidden');setTimeout(()=>document.querySelector('#intro').remove(),800)};
document.querySelector('#close').onclick=()=>{dialogue=false;document.querySelector('#dialogue').classList.remove('open');document.querySelector('#count').textContent='1 / 1';document.querySelector('.quest u').style.width='100%';const t=document.querySelector('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE'&&started&&player.position.distanceTo(mayor.position)<5){dialogue=true;document.querySelector('#dialogue').classList.add('open')}});
addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.onpointerdown=e=>{drag=true;lastX=e.clientX;lastY=e.clientY};
addEventListener('pointerup',()=>drag=false);addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-lastX)*.005;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,.22,.7);lastX=e.clientX;lastY=e.clientY});
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
 if(started&&!dialogue){const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);if(f||s){const a=Math.atan2(s,f)+yaw,v=(keys.ShiftLeft||keys.ShiftRight)?9:5.5,nx=player.position.x+Math.sin(a)*v*dt,nz=player.position.z+Math.cos(a)*v*dt;if(Math.hypot(nx,nz)<111&&!(Math.abs(nz-62)<7&&!(nx>-8&&nx<0))){player.position.x=nx;player.position.z=nz}player.rotation.y=a;player.position.y=Math.abs(Math.sin(clock.elapsedTime*10))*.07}}
 const d=13,target=new THREE.Vector3(player.position.x,1.4,player.position.z),desired=new THREE.Vector3(target.x-Math.sin(yaw)*d*Math.cos(pitch),target.y+Math.sin(pitch)*d,target.z-Math.cos(yaw)*d*Math.cos(pitch));camera.position.lerp(desired,.075);camera.lookAt(target);
 hint.classList.toggle('show',started&&!dialogue&&player.position.distanceTo(mayor.position)<5);
 const data=player.position.z<-42?['새로운 보금자리','도토리 타운 남쪽 들판']:player.position.z>52?['바람개비 숲길','졸졸 강 건너']:['도토리 마을','포근한 중앙 광장'];document.querySelector('#place').textContent=data[0];document.querySelector('#area').textContent=data[1];
 renderer.render(scene,camera);
}
camera.position.set(3,8,-83);animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
