'use strict';
(()=>{
const $=id=>document.getElementById(id);
const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const V3=THREE.Vector3;
// ---------- persistence ----------
const LS={get(k,d){try{const v=localStorage.getItem('tt_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('tt_'+k,JSON.stringify(v))}catch(e){}}};
// ---------- audio ----------
let AC=null,soundOn=LS.get('sound',true);
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,dur,type='sine',vol=.2,f2=null,delay=0){const a=ac();if(!a||!soundOn)return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol=.2,freq=1000,q=1,type='bandpass',delay=0){const a=ac();if(!a||!soundOn)return;const t=a.currentTime+delay,n=a.sampleRate*dur,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.value=freq;fl.Q.value=q;const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}
const SFX={
 click(){tone(600,.06,'square',.06)},
 swing(){noise(.25,.3,1800,.7)},
 hit(p){tone(180+p*200,.12,'triangle',.4,60);noise(.06,.4,3000,1,'highpass')},
 putt(){tone(900,.08,'sine',.25,500)},
 bounce(){tone(140,.08,'sine',.15,70)},
 splash(){noise(.7,.4,700,.5,'lowpass');tone(300,.3,'sine',.1,80)},
 sand(){noise(.3,.3,500,.6)},
 tree(){tone(90,.2,'sawtooth',.2,40);noise(.25,.25,400)},
 cup(){tone(1200,.08,'sine',.3);tone(1600,.1,'sine',.25,null,.09);tone(800,.2,'sine',.2,null,.2)},
 fanfare(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.25,'square',.08,null,i*.12))},
 cheer(){noise(1.2,.25,1500,.3);[0,.15,.3].forEach(d=>tone(rand(700,1100),.3,'triangle',.05,null,d))},
 slam(){tone(200,.08,'square',.3,80);noise(.08,.3,2500)},
 glug(){for(let i=0;i<5;i++)tone(rand(150,230),.09,'sine',.25,90,i*.16)},
 open(){noise(.15,.3,4000,2);tone(2400,.05,'sine',.05)},
 burp(){const a=ac();if(!a||!soundOn)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(110,t);o.frequency.linearRampToValueAtTime(70,t+.5);l.frequency.value=28;lg.gain.value=30;l.connect(lg);lg.connect(o.frequency);const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=600;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.35,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.connect(f);f.connect(g);g.connect(a.destination);o.start(t);l.start(t);o.stop(t+.6);l.stop(t+.6)},
 hic(){tone(500,.07,'triangle',.25,1400)},
 bad(){tone(300,.3,'sawtooth',.12,120)},
 honk(){tone(370,.28,'square',.12);tone(466,.28,'square',.1)},
 quack(){tone(720,.12,'sawtooth',.12,360);tone(700,.1,'sawtooth',.1,340,.15)},
 unlock(){[523,784,1047,1319,1568,2093].forEach((f,i)=>tone(f,.22,'triangle',.12,null,i*.08))},
 sizzle(){noise(.7,.25,5000,.5,'highpass')},
 ding(){tone(1500,.12,'sine',.18);tone(2000,.15,'sine',.12,null,.08)},
 coin(){tone(988,.07,'square',.08);tone(1319,.18,'square',.08,null,.07)},
 perfect(){tone(880,.1,'square',.08);tone(1320,.15,'square',.08,null,.08)}
};
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
// ---------- renderer ----------
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd3ff);scene.fog=new THREE.Fog(0x8fd3ff,180,520);
const camera=new THREE.PerspectiveCamera(60,1,.1,900);
const hemi=new THREE.HemisphereLight(0xdff3ff,0x4a7a2a,1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:200});scene.add(sun,sun.target);
// post
const rt=new THREE.WebGLRenderTarget(4,4);
const postMat=new THREE.ShaderMaterial({uniforms:{t:{value:rt.texture},d:{value:0},T:{value:0},H:{value:0},R:{value:0},A:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform sampler2D t;uniform float d,T,H,R,A;varying vec2 vUv;
 void main(){vec2 uv=vUv;uv+=vec2(sin(uv.y*11.+T*2.1),cos(uv.x*8.+T*1.6))*.007*d;vec2 c=uv-.5;float ca=.018*d;
 vec3 col;col.r=texture2D(t,uv+c*ca).r;col.g=texture2D(t,uv).g;col.b=texture2D(t,uv-c*ca).b;
 vec2 off=vec2(sin(T*.7),cos(T*.93))*.03*d*d;col=mix(col,texture2D(t,uv+off).rgb,.38*d);
 float bl=.005*d;vec3 b=(texture2D(t,uv+vec2(bl,0)).rgb+texture2D(t,uv-vec2(bl,0)).rgb+texture2D(t,uv+vec2(0,bl)).rgb+texture2D(t,uv-vec2(0,bl)).rgb)*.25;
 col=mix(col,b,clamp(d*.8,0.,.7));col*=mix(vec3(1.),vec3(1.12,.96,1.06),d);
 float l=dot(col,vec3(.3,.59,.11));col=mix(col,vec3(l)*vec3(.85,1.,.8),H*.55);
 col=mix(col,col*vec3(1.6,.35,.3)+vec3(.15,0.,0.),R*.65);vec3 gA=vec3(col.g*.55+col.b*.2,col.g*1.2+.06,col.r*.35+col.b*.4);col=mix(col,gA,A*(.5+.2*sin(T*3.)));col*=1.-dot(c,c)*(.5+d*1.4+H*.8+R*.8);gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
 }`,depthTest:false,depthWrite:false});
const postScene=new THREE.Scene(),postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMat));
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?62:50;camera.updateProjectionMatrix();const s=renderer.getDrawingBufferSize(new THREE.Vector2());rt.setSize(s.x,s.y)}
addEventListener('resize',resize);resize();
// ---------- helpers ----------
const M=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
const matCache={};const MC=c=>matCache[c]||(matCache[c]=M(c));
function mesh(g,m,x=0,y=0,z=0,p){const o=new THREE.Mesh(g,typeof m==='number'?MC(m):m);o.position.set(x,y,z);o.castShadow=true;if(p)p.add(o);return o}
const G={sph:new THREE.SphereGeometry(1,24,16),sphL:new THREE.SphereGeometry(1,10,8),cyl:new THREE.CylinderGeometry(1,1,1,16),cone:new THREE.ConeGeometry(1,1,8),box:new THREE.BoxGeometry(1,1,1)};
// ---------- golfer ----------
const OPTS={
 skin:['#ffd9b3','#f1c08a','#d99a6c','#a86a43','#6b4228','#8fe07a','#8fc8ff','#ff9ad5'],
 shirt:['#ff4d4d','#ff9a1f','#ffd23f','#3ccf6e','#1fa3ff','#7a5cff','#ff5fd2','#ffffff','#222222','#d4af37','#39ff14','#ff1493'],
 pants:['#2b2b4a','#f2f2f2','#3a6b3a','#c9a46b','#ff4d4d','#1fa3ff','#ff9ad5','#ffe135'],
 hat:['Cap','Cowboy','Bucket','Top Hat','Beanie','Visor','Party','Viking','None','Crown','Chef','Propeller','Halo','Cone'],
 hatC:['#ffffff','#ff4d4d','#1fa3ff','#ffd23f','#3ccf6e','#222222','#8b5a2b','#ff5fd2'],
 face:['Grin','Smile','Smug','Ooh','Cheeky'],
 stache:['None','Classic','Handlebar','Chevron','Beard'],
 glasses:['None','Shades','Round','Star','Monocle'],
 body:['Classic','Slim','Round','Tall','Tiny'],
 hair:['Short','Mop','Curly','Mohawk','Long','Bald'],
 hairC:['#4a2c15','#1a1a1a','#e8c25a','#c0521f','#9a9a9a','#ff5fd2','#1fa3ff']
};
// ---------- economy / pro shop ----------
const SHOP=[
 {cat:'Hats',items:[{id:'hat:Crown',n:'Crown',p:150,e:'👑'},{id:'hat:Chef',n:'Chef Hat',p:80,e:'👨‍🍳'},{id:'hat:Propeller',n:'Propeller Cap',p:120,e:'🚁',d:'Free at 1,500 career style'},{id:'hat:Halo',n:'Halo',p:250,e:'😇'},{id:'hat:Cone',n:'Traffic Cone',p:60,e:'🚧'}]},
 {cat:'Outfits',items:[{id:'shirt:#d4af37',n:'Gold Lamé Polo',p:120,e:'✨'},{id:'shirt:#39ff14',n:'Highlighter Polo',p:70,e:'🟩'},{id:'shirt:#ff1493',n:'Flamingo Polo',p:60,e:'🦩'},{id:'pants:#ff9ad5',n:'Pink Slacks',p:50,e:'👖'},{id:'pants:#ffe135',n:'Banana Slacks',p:50,e:'🍌'}]},
 {cat:'Clubs',slot:'club',items:[{id:'club:std',n:'Standard Steel',p:0,e:'🏌️',d:'Reliable'},{id:'club:gold',n:'Gold Clubs',p:200,e:'🥇',d:'+3% distance'},{id:'club:wood',n:'Hickory Classics',p:90,e:'🪵',d:'Needle 6% slower'},{id:'club:neon',n:'Neon Sabers',p:160,e:'⚡',d:'Wind pushes 15% less'},{id:'club:candy',n:'Candy Canes',p:110,e:'🍬',d:'Softer hangovers'}]},
 {cat:'Balls',slot:'ball',items:[{id:'ball:white',n:'Classic White',p:0,e:'⚪'},{id:'ball:gold',n:'Gold Ball',p:100,e:'🟡'},{id:'ball:neon',n:'Glow Ball',p:80,e:'🟢'},{id:'ball:eye',n:'Eyeball',p:130,e:'👁️'},{id:'ball:disco',n:'Disco Ball',p:180,e:'🪩'}]},
 {cat:'Trails',slot:'trail',items:[{id:'trail:white',n:'Contrail',p:0,e:'〰️'},{id:'trail:fire',n:'Fire Trail',p:90,e:'🔥'},{id:'trail:rainbow',n:'Rainbow',p:150,e:'🌈',d:'Free at 4,000 career style'},{id:'trail:bubbles',n:'Beer Bubbles',p:120,e:'🫧'}]},
 {cat:'Carts',slot:'cart',items:[{id:'cart:classic',n:'Clubhouse White',p:0,e:'🛺'},{id:'cart:fire',n:'Hot Rod',p:120,e:'🔥'},{id:'cart:camo',n:'Swamp Camo',p:90,e:'🪖'},{id:'cart:pink',n:'Bubblegum',p:80,e:'🍬'},{id:'cart:neon',n:'Midnight Neon',p:200,e:'🌃'},{id:'cart:gold',n:'Gold Rush',p:250,e:'💰',d:'Free at 8,000 career style'}]}];
const MILESTONES=[[1500,'hat:Propeller'],[4000,'trail:rainbow'],[8000,'cart:gold']];
const ALLITEMS={};for(const c of SHOP)for(const it of c.items){it.cat=c.cat;it.slot=c.slot;ALLITEMS[it.id]=it}
const owned=()=>LS.get('owned',[]);const coins=()=>LS.get('coins',0);
function addCoins(n){LS.set('coins',Math.max(0,coins()+n))}
function isOwned(id){const it=ALLITEMS[id];return !it||it.p===0||owned().includes(id)}
const isLocked=(k,v)=>!isOwned(k+':'+v);
const EQ=()=>Object.assign({club:'std',ball:'white',trail:'white',cart:'classic'},LS.get('eq',{}));
function grant(id,why){if(owned().includes(id))return false;const o=owned();o.push(id);LS.set('owned',o);const it=ALLITEMS[id];if(it&&it.slot){const e=EQ();e[it.slot]=id.split(':')[1];LS.set('eq',e)}celebrate(it?it.e:'🎁',it?it.n:id,why);return true}
const celebQ=[];let celebOn=false;
function celebrate(e,n,why){celebQ.push([e,n,why]);if(!celebOn)nextCeleb()}
function nextCeleb(){const c=celebQ.shift();if(!c){celebOn=false;return}celebOn=true;const u=$('unlock');u.querySelector('.ue').textContent=c[0];u.querySelector('.un').textContent=c[1];u.querySelector('.uw').textContent=c[2]||'';u.classList.remove('go');void u.offsetWidth;u.classList.add('go');SFX.unlock();buzz([40,40,80]);setTimeout(nextCeleb,2600)}
function randomChar(i){const r0=a=>a[Math.floor(Math.random()*a.length)];const r=a=>{const k=Object.keys(OPTS).find(k=>OPTS[k]===a);const f=k?a.filter(v=>!isLocked(k,v)):a;return r0(f.length?f:a)};const n=['Chip','Bogey','Shanks','Birdie','Wedgie','Putts','Fairway Frank','Divot','Sandy','Tipsy Tom','Mulligan'];return{name:r(n),skin:r(OPTS.skin),shirt:r(OPTS.shirt),pants:r(OPTS.pants),hat:r(OPTS.hat),hatC:r(OPTS.hatC),face:r(OPTS.face),stache:r(OPTS.stache),glasses:r(OPTS.glasses),body:r(OPTS.body),hair:r(OPTS.hair),hairC:r(OPTS.hairC)}}
function makeGolfer(c){
 const root=new THREE.Group();
 const bs={Classic:[1,1,1,1],Slim:[.8,1.08,1.1,1],Round:[1.35,.95,.88,1],Tall:[.95,1.15,1.3,.95],Tiny:[.9,.8,.75,1.12]}[c.body]||[1,1,1,1];
 const [sx,sy,ll,hs]=bs;
 const skin=M(c.skin),shirt=M(c.shirt,c.shirt==='#d4af37'?{emissive:0x4a3500}:c.shirt==='#39ff14'?{emissive:0x0a5a00}:{}),pants=M(c.pants),hatM=M(c.hatC),hairM=M(c.hairC||'#4a2c15'),dark=MC(0x1a1a1a),white=MC(0xffffff),shoeM=MC(0x3a2a20);
 const legLen=.42*ll,hipY=legLen+.12;
 // legs
 const legs=[];for(const s of[-1,1]){const lg=new THREE.Group();lg.position.set(s*.13*sx,hipY,0);root.add(lg);
  const th=mesh(new THREE.CapsuleGeometry(.1,legLen-.1,4,10),pants,0,-legLen/2,0,lg);
  const sh=mesh(G.sph,shoeM,0,-legLen-.04,.07,lg);sh.scale.set(.12,.08,.19);legs.push(lg)}
 const body=new THREE.Group();body.position.y=hipY;root.add(body);
 const hip=mesh(G.sph,pants,0,.05,0,body);hip.scale.set(.27*sx,.17,.22*sx);
 const torso=mesh(new THREE.CapsuleGeometry(.24,.22,6,14),shirt,0,.3*sy,0,body);torso.scale.set(sx,sy,.85*sx);
 const belt=mesh(G.cyl,dark,0,.12,0,body);belt.scale.set(.245*sx,.04,.21*sx);
 const collar=mesh(new THREE.TorusGeometry(.1,.035,6,16),white,0,.62*sy,0,body);collar.rotation.x=Math.PI/2;
 const neck=mesh(G.cyl,skin,0,.64*sy,0,body);neck.scale.set(.08,.12,.08);
 // head
 const head=new THREE.Group();head.position.y=.66*sy+.33*hs;head.scale.setScalar(hs);body.add(head);
 const hd=mesh(G.sph,skin,0,0,0,head);hd.scale.set(.36,.34,.34);
 for(const s of[-1,1]){const e=mesh(G.sph,skin,s*.35,0,0,head);e.scale.set(.06,.09,.06)}
 const nose=mesh(G.sph,skin,0,-.03,.34,head);nose.scale.set(.07,.06,.06);
 const eyes=[],lids=[];
 for(const s of[-1,1]){const e=mesh(G.sph,white,s*.12,.06,.28,head);e.scale.set(.075,.09,.05);const p=mesh(G.sph,dark,s*.115,.055,.325,head);p.scale.set(.035,.045,.02);eyes.push(p);
  const l=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),skin,s*.12,.06,.285,head);l.scale.set(.082,.098,.056);l.rotation.x=-1.6;lids.push(l)}
 const cheeks=[];for(const s of[-1,1]){const m=new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:0});const k=mesh(G.sph,m,s*.21,-.07,.27,head);k.scale.set(.07,.05,.04);k.castShadow=false;cheeks.push(k)}
 const mouthG=new THREE.Group();mouthG.position.set(0,-.15,.31);head.add(mouthG);
 const fm={Grin:()=>{const m=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),dark,0,.02,0,mouthG);m.scale.set(.1,.07,.03);const t=mesh(G.box,white,0,.012,.015,mouthG);t.scale.set(.13,.02,.02)},
  Smile:()=>{const m=mesh(new THREE.TorusGeometry(.07,.015,6,16,Math.PI),dark,0,.03,0,mouthG);m.rotation.z=Math.PI},
  Smug:()=>{const m=mesh(new THREE.TorusGeometry(.065,.014,6,12,Math.PI*.6),dark,.03,.03,0,mouthG);m.rotation.z=Math.PI*1.15},
  Ooh:()=>{mesh(new THREE.TorusGeometry(.032,.014,6,12),dark,0,0,0,mouthG)},
  Cheeky:()=>{const m=mesh(new THREE.TorusGeometry(.07,.015,6,16,Math.PI),dark,0,.03,0,mouthG);m.rotation.z=Math.PI;const t=mesh(G.sph,MC(0xff6680),.025,-.035,.005,mouthG);t.scale.set(.032,.04,.02)}};
 (fm[c.face]||fm.Grin)();
 const fz=hairM;
 const st={Classic:()=>{for(const s of[-1,1]){const m=mesh(G.sph,fz,s*.05,-.09,.33,head);m.scale.set(.065,.024,.025);m.rotation.z=s*.2}},
  Handlebar:()=>{for(const s of[-1,1]){const m=mesh(new THREE.TorusGeometry(.05,.016,6,12,Math.PI*1.2),fz,s*.06,-.08,.33,head);m.rotation.z=s>0?-.4:Math.PI+.4-Math.PI*.2}},
  Chevron:()=>{const m=mesh(G.box,fz,0,-.085,.335,head);m.scale.set(.17,.04,.03)},
  Beard:()=>{const m=mesh(G.sph,fz,0,-.17,.17,head);m.scale.set(.3,.2,.2)},None:()=>{}};
 (st[c.stache]||st.None)();
 const gm={Shades:()=>{for(const s of[-1,1]){const g=mesh(G.box,dark,s*.12,.07,.35,head);g.scale.set(.13,.075,.02)}const b=mesh(G.box,dark,0,.09,.35,head);b.scale.set(.34,.02,.02)},
  Round:()=>{for(const s of[-1,1])mesh(new THREE.TorusGeometry(.075,.011,6,16),MC(0xc9a400),s*.12,.06,.345,head)},
  Star:()=>{for(const s of[-1,1]){const g=mesh(new THREE.CylinderGeometry(.085,.085,.02,5),MC(0xff3fa0),s*.125,.07,.345,head);g.rotation.x=Math.PI/2}},
  Monocle:()=>{mesh(new THREE.TorusGeometry(.075,.011,6,16),MC(0xc9a400),.12,.06,.345,head)},None:()=>{}};
 (gm[c.glasses]||gm.None)();
 // hair
 const hr={Short:()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*.45),hairM,0,.02,-.02,head);a.scale.set(.37,.36,.36)},
  Mop:()=>{for(let k=0;k<9;k++){const a=k/9*Math.PI*2;const m=mesh(G.sph,hairM,Math.cos(a)*.24,.18+Math.random()*.06,Math.sin(a)*.22-.04,head);m.scale.setScalar(.13)}mesh(G.sph,hairM,0,.26,0,head).scale.set(.28,.14,.26)},
  Mohawk:()=>{for(let k=0;k<5;k++){const m=mesh(G.cone,hairM,0,.36,.2-k*.11,head);m.scale.set(.06,.18,.06);m.rotation.x=-.3+k*.15}},
  Long:()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*.45),hairM,0,.02,-.02,head);a.scale.set(.38,.37,.37);const b=mesh(G.sph,hairM,0,-.12,-.16,head);b.scale.set(.34,.32,.18)},
  Curly:()=>{for(let k=0;k<14;k++){const a=Math.random()*Math.PI*2,e=Math.random()*1.1;const m=mesh(G.sphL,hairM,Math.cos(a)*Math.sin(e)*.33,Math.cos(e)*.31+.02,Math.sin(a)*Math.sin(e)*.31-.04,head);m.scale.setScalar(.1)}},
  Bald:()=>{},None:()=>{}};
 (hr[c.hair]||hr.Short)();
 const hat=new THREE.Group();hat.position.y=.26;hat.scale.setScalar(.7);head.add(hat);
 const hm={Cap:()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),hatM,0,-.05,0,hat);a.scale.set(.52,.38,.52);const b=mesh(G.cyl,hatM,0,-.04,.38,hat);b.scale.set(.32,.02,.3)},
  Cowboy:()=>{const b=mesh(G.cyl,hatM,0,0,0,hat);b.scale.set(.8,.03,.8);const t=mesh(G.cyl,hatM,0,.15,0,hat);t.scale.set(.4,.3,.4);const bd=mesh(G.cyl,dark,0,.04,0,hat);bd.scale.set(.41,.05,.41)},
  Bucket:()=>{mesh(new THREE.CylinderGeometry(.4,.56,.32,16),hatM,0,0,0,hat)},
  'Top Hat':()=>{const b=mesh(G.cyl,dark,0,0,0,hat);b.scale.set(.58,.03,.58);const t=mesh(G.cyl,dark,0,.3,0,hat);t.scale.set(.36,.6,.36);const bd=mesh(G.cyl,hatM,0,.08,0,hat);bd.scale.set(.37,.1,.37)},
  Beanie:()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),hatM,0,-.12,0,hat);a.scale.set(.54,.52,.54);mesh(G.sph,white,0,.4,0,hat).scale.setScalar(.12)},
  Visor:()=>{const b=mesh(G.cyl,hatM,0,-.05,.36,hat);b.scale.set(.36,.02,.32);const r=mesh(new THREE.TorusGeometry(.52,.04,6,20),hatM,0,-.08,0,hat);r.rotation.x=Math.PI/2},
  Party:()=>{const c2=mesh(G.cone,hatM,0,.25,0,hat);c2.scale.set(.25,.6,.25);mesh(G.sph,MC(0xffd23f),0,.57,0,hat).scale.setScalar(.08)},
  Crown:()=>{const gm2=M(0xffd700,{emissive:0x553300});const b=mesh(new THREE.CylinderGeometry(.42,.42,.28,12,1,true),gm2,0,0,0,hat);b.material.side=THREE.DoubleSide;for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const sp=mesh(G.cone,gm2,Math.cos(a)*.4,.24,Math.sin(a)*.4,hat);sp.scale.set(.08,.22,.08)}mesh(G.sph,MC(0xff2050),0,.05,.42,hat).scale.setScalar(.06)},
  Chef:()=>{const t=mesh(G.cyl,white,0,.12,0,hat);t.scale.set(.42,.35,.42);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;mesh(G.sph,white,Math.cos(a)*.22,.42,Math.sin(a)*.22,hat).scale.setScalar(.26)}},
  Propeller:()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),hatM,0,-.05,0,hat);a.scale.set(.52,.38,.52);mesh(G.cyl,MC(0xffd23f),0,.36,0,hat).scale.set(.03,.16,.03);const pr=new THREE.Group();pr.position.y=.45;hat.add(pr);for(const s2 of[-1,1]){const bl=mesh(G.box,s2>0?MC(0xff4d4d):MC(0x1fa3ff),s2*.3,0,0,pr);bl.scale.set(.6,.02,.12)}hat.userData.prop=pr},
  Halo:()=>{const h2=mesh(new THREE.TorusGeometry(.42,.05,8,24),new THREE.MeshBasicMaterial({color:0xfff6a0}),0,.45,0,hat);h2.rotation.x=Math.PI/2;h2.castShadow=false;hat.userData.halo=h2},
  Cone:()=>{const c2=mesh(G.cone,MC(0xff7a1a),0,.38,0,hat);c2.scale.set(.42,.9,.42);const bd=mesh(new THREE.CylinderGeometry(.27,.31,.12,12),white,0,.36,0,hat);mesh(G.box,MC(0xff7a1a),0,-.05,0,hat).scale.set(.85,.06,.85)},
  Viking:()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),MC(0x999999),0,-.1,0,hat);a.scale.set(.55,.44,.55);for(const s of[-1,1]){const h=mesh(G.cone,MC(0xfff3d0),s*.58,.15,0,hat);h.scale.set(.1,.4,.1);h.rotation.z=-s*.9}},None:()=>{}};
 (hm[c.hat]||hm.None)();
 // arms (shoulders group swings for golf)
 const swing=new THREE.Group();swing.position.set(0,.5*sy,0);body.add(swing);
 const armLen=.4*(.85+ll*.15);
 function mkArm(s){const a=new THREE.Group();a.position.set(s*.27*sx,0,0);swing.add(a);mesh(G.sph,shirt,0,0,0,a).scale.setScalar(.1);
  mesh(new THREE.CapsuleGeometry(.065,armLen-.08,4,8),shirt,0,-armLen/2,0,a);const h=mesh(G.sph,skin,0,-armLen,0,a);h.scale.set(.085,.095,.085);const th=mesh(G.sph,skin,s*-.05,-armLen+.03,.04,a);th.scale.setScalar(.04);return a}
 const armL=mkArm(-1),armR=mkArm(1);
 const club=new THREE.Group();club.position.set(0,-armLen+.02,.22);swing.add(club);club.rotation.x=-.7;
 const grip=mesh(G.cyl,dark,0,-.05,0,club);grip.scale.set(.025,.16,.025);
 const shaftL=hipY+.5*sy-armL.position.y;const shaft=mesh(G.cyl,MC(0xcccccc),0,-.42,0,club);shaft.scale.set(.016,.75,.016);
 const chead=mesh(G.box,MC(0x444444),.06,-.8,0,club);chead.scale.set(.16,.07,.09);
 {const k=EQ().club;const CS={gold:[0xd4af37,0xffd700],wood:[0x8b5a2b,0x5a3416],neon:[0x39ff14,0xff2bd6],candy:[0xff3030,0xffffff]}[k];if(CS){shaft.material=k==='neon'?new THREE.MeshBasicMaterial({color:CS[0]}):M(CS[0],k==='gold'?{emissive:0x332200}:{});chead.material=k==='neon'?new THREE.MeshBasicMaterial({color:CS[1]}):M(CS[1])}}
 const can=new THREE.Group();can.position.set(0,-armLen-.05,.04);armR.add(can);can.visible=false;
 const canM=M(0xd0d0d0);mesh(G.cyl,canM,0,0,0,can).scale.set(.07,.18,.07);
 root.userData={body,head,legs,armL,armR,swing,club,can,canM,hat,eyes,lids,cheeks,mouthG,c,armLen};
 setPose(root,'address');return root;
}
function setPose(g,p){const u=g.userData;u.swing.rotation.set(0,0,0);u.head.rotation.set(0,0,0);
 if(p==='address'){u.armL.rotation.set(-.45,0,-.38);u.armR.rotation.set(-.45,0,.38)}
 else if(p==='rest'){u.armL.rotation.set(0,0,-.25);u.armR.rotation.set(0,0,.25)}}
function golferMood(g,dr,t,hang){const u=g.userData;
 for(const k of u.cheeks)k.material.opacity=clamp(dr*1.1,0,.85);
 const droop=clamp(dr*1.1+hang*.5,0,1);for(const l of u.lids){l.rotation.x=lerp(-1.6,-.75,droop)}
 u.body.rotation.z=Math.sin(t*1.6)*(.02+dr*.18);u.body.rotation.x=Math.sin(t*1.1+1)*dr*.1;
 u.head.rotation.z=Math.sin(t*1.2+.5)*(.03+dr*.22);u.head.rotation.y=Math.sin(t*.7)*dr*.25;
 // stumble: legs shuffle and hips drift
 const sh=dr>.35?(dr-.35):0;u.legs[0].rotation.x=Math.sin(t*3.2)*sh*.6;u.legs[1].rotation.x=-Math.sin(t*3.2)*sh*.6;u.legs[0].rotation.z=Math.sin(t*1.6)*sh*.3;u.legs[1].rotation.z=Math.sin(t*1.6)*sh*.3;
 u.body.position.x=Math.sin(t*1.6)*sh*.12;
 for(const e of u.eyes){e.position.x=Math.sign(e.position.x)*.115+Math.sin(t*3+e.position.x*9)*.018*dr}
 u.hat.rotation.z=Math.sin(t*1.3)*dr*.2;if(u.hat.userData.prop)u.hat.userData.prop.rotation.y=t*14;if(u.hat.userData.halo)u.hat.userData.halo.position.y=.45+Math.sin(t*2)*.04;
}
// returns nothing; drives limb poses for a phase
function animGolfer(u,ph,k,t,dr){
 if(ph==='chug'){const lift=clamp(k/.35,0,1),down=k<1.1?1:clamp(1-(k-1.1)/.4,0,1),tilt=k<1.05?clamp((k-.25)/.3,0,1):clamp(1-(k-1.05)/.3,0,1);
  u.swing.rotation.set(0,0,0);u.armR.rotation.set(-lerp(0,2.7,lift)*down,0,lerp(.25,-.35,lift*down));u.armL.rotation.set(0,0,-.25-.6*tilt);
  u.head.rotation.x=-.55*tilt;u.body.rotation.x=-.15*tilt;u.body.position.y=u.body.position.y;if(k>1.15&&k<1.5){u.head.rotation.x=.25*Math.sin((k-1.15)*9);u.body.rotation.z=Math.sin(k*20)*.08}
  if(k>1.4){u.armL.rotation.z=-.25-Math.sin(k*8)*.3;u.body.rotation.z=Math.sin(k*9)*.2}}
 else if(ph==='celebrate'){u.swing.rotation.set(0,0,0);u.armL.rotation.set(0,0,-2.6+Math.sin(k*14)*.3);u.armR.rotation.set(0,0,2.6-Math.sin(k*14)*.3);u.club.visible=false;u.body.position.y+=0}
 else if(ph==='cart'){}
 else{u.armL.rotation.set(-.45,0,-.38);u.armR.rotation.set(-.45,0,.38);u.head.rotation.x=0;
  if(ph==='swing'){u.swing.rotation.set(0,k<.2?lerp(0,-.5,k/.2):lerp(-.5,.6,clamp((k-.2)/.15,0,1)),k<.2?lerp(0,-2.2,k/.2):lerp(-2.2,1.9,clamp((k-.2)/.15,0,1)));u.head.rotation.y=k>.3?.5:0}
  else if(ph==='power'){u.swing.rotation.z=-S.dispPow*2;u.swing.rotation.y=-S.dispPow*.45}
  else{u.swing.rotation.z=lerp(u.swing.rotation.z,Math.sin(t*1.5)*.12*dr,.1);u.swing.rotation.y=lerp(u.swing.rotation.y,0,.1)}}
}
// ---------- holes ----------
const COURSES=[
 {id:'sunny',n:'Sunny Links',e:'☀️',theme:'sunny',d:'Classic fairways, a windmill and a rogue cart.',cost:0,holes:[
 {name:'Opening Pint',par:4,path:[[0,0],[0,-170],[28,-290]],w:22,gr:14,sand:[[22,-165,9],[-12,-285,7],[40,-272,6]],water:[],trees:[],seed:1},
 {name:'Lake Lager',par:3,path:[[0,0],[0,-30]],extra:[[0,-140]],pin:[0,-155],w:18,gr:15,sand:[[16,-150,6]],water:[[0,-90,32]],trees:[],seed:2},
 {name:'Windmill Wobble',par:4,path:[[0,0],[-15,-150],[-15,-275]],w:24,gr:14,sand:[[0,-262,7]],water:[[-48,-140,16]],windmill:[-15,-190],seed:3},
 {name:'Dogleg Distillery',par:5,path:[[0,0],[0,-210],[110,-300],[150,-430]],w:22,gr:16,sand:[[20,-215,10],[130,-410,8]],water:[[62,-235,24]],seed:4},
 {name:'Rogue Cart Crossing',par:4,path:[[0,0],[10,-150],[10,-300]],w:20,gr:14,sand:[[-6,-290,6],[24,-295,6]],water:[],cart:-150,seed:5},
 {name:'Last Call Island',par:3,path:[[0,0],[0,-45]],pin:[0,-165],w:16,gr:13,sand:[],water:[[0,-140,52]],seed:6,island:true}
]},
 {id:'frost',n:'Frostbite Pines',e:'❄️',theme:'frost',d:'Snow, skiddy ice patches and a frozen pond.',cost:200,holes:[
  {name:'Brain Freeze',par:4,path:[[0,0],[0,-160],[-20,-280]],w:22,gr:14,sand:[[18,-150,8]],ice:[[0,-115,13],[-12,-252,8]],seed:11},
  {name:'Frozen Pond',par:3,path:[[0,0],[0,-30]],extra:[[0,-130]],pin:[0,-150],w:18,gr:14,sand:[[17,-152,5]],ice:[[0,-85,30]],seed:12},
  {name:'Yeti Crossing',par:4,path:[[0,0],[20,-150],[20,-290]],w:20,gr:14,sand:[[0,-280,7]],ice:[[24,-205,11]],water:[[-22,-160,14]],seed:13},
  {name:'Avalanche Alley',par:5,path:[[0,0],[0,-200],[-100,-300],[-120,-430]],w:22,gr:16,sand:[[-136,-415,8]],ice:[[-50,-252,15],[0,-150,10]],seed:14},
  {name:'Snowmobile Shuffle',par:4,path:[[0,0],[-10,-140],[10,-290]],w:20,gr:14,ice:[[8,-245,10],[-10,-185,10]],sand:[[26,-292,6]],cart:-140,seed:15},
  {name:'Polar Plunge',par:3,path:[[0,0],[0,-45]],pin:[0,-165],w:16,gr:13,water:[[0,-140,52]],ice:[[-30,-120,8]],seed:16,island:true}]},
 {id:'dune',n:'Dune Dunes',e:'🌵',theme:'dune',d:'Desert heat, cacti everywhere, sand for days.',cost:300,holes:[
  {name:'Mirage Mile',par:4,path:[[0,0],[0,-170],[25,-295]],w:20,gr:14,sand:[[0,-90,17],[32,-200,14],[46,-290,8]],cactus:[[-8,-130],[12,-245]],seed:21},
  {name:'Oasis',par:3,path:[[0,0],[0,-30]],extra:[[0,-135]],pin:[0,-150],w:18,gr:14,sand:[[0,-88,26],[17,-150,6]],water:[[-24,-128,9]],seed:22},
  {name:'Cactus Canyon',par:4,path:[[0,0],[-15,-140],[10,-285]],w:18,gr:14,sand:[[22,-130,15],[-26,-230,13]],cactus:[[-10,-90],[0,-200],[8,-240],[-14,-60]],seed:23},
  {name:'Sahara Sprint',par:5,path:[[0,0],[0,-220],[100,-310],[130,-440]],w:22,gr:16,sand:[[0,-140,19],[52,-262,24],[120,-382,14]],cactus:[[80,-300]],seed:24},
  {name:'Camel Hump',par:4,path:[[0,0],[10,-150],[-10,-300]],w:20,gr:14,sand:[[-10,-205,21],[12,-318,5]],cart:-150,seed:25},
  {name:'Sandstorm Finale',par:3,path:[[0,0],[0,-40]],pin:[0,-170],w:16,gr:13,sand:[[0,-108,40],[-19,-171,6]],seed:26}]},
 {id:'night',n:'Midnight Glow',e:'🌙',theme:'night',d:'After dark. Neon balls, glowing flags, fireflies.',cost:400,holes:[
  {name:'Glow Up',par:4,path:[[0,0],[0,-165],[-25,-290]],w:22,gr:14,sand:[[20,-160,9],[-42,-276,7]],seed:31},
  {name:'Neon Lagoon',par:3,path:[[0,0],[0,-30]],extra:[[0,-140]],pin:[0,-155],w:18,gr:15,water:[[0,-90,32]],seed:32},
  {name:'Firefly Fairway',par:4,path:[[0,0],[15,-150],[15,-280]],w:20,gr:14,sand:[[0,-270,7]],water:[[47,-150,14]],windmill:[15,-195],seed:33},
  {name:'Moonlight Mile',par:5,path:[[0,0],[0,-210],[-110,-300],[-150,-430]],w:22,gr:16,water:[[-60,-236,24]],sand:[[-142,-410,8]],seed:34},
  {name:'Disco Dogleg',par:4,path:[[0,0],[0,-140],[60,-270]],w:20,gr:14,sand:[[42,-258,6],[72,-284,6]],cart:-140,seed:35},
  {name:'Lunar Island',par:3,path:[[0,0],[0,-45]],pin:[0,-170],w:16,gr:13,water:[[0,-145,55]],seed:36,island:true}]}];
const THEMES={
 sunny:{sky:0x8fd3ff,ground:0x4f9a3a,rough:0x5aa840,fair:0x7ccf4f,green:0x96e86a,fringe:0x6cc045,sand:0xf1df9a,water:0x2f9be0,shore:0xe8dca0,hill:0x5c9e45,hemi:[0xdff3ff,0x4a7a2a,1.1],sun:1.6,tree:'pine',cloud:0xffffff,path:0x9a9a92},
 frost:{sky:0xcfe3f2,ground:0xeef4fa,rough:0xdde8f1,fair:0x9fd08a,green:0xb8f0a0,fringe:0x8fc47a,sand:0xf6efe0,water:0x3f88c0,shore:0xffffff,hill:0xf4f8ff,hemi:[0xffffff,0x9fb4c8,1.15],sun:1.35,tree:'snowpine',cloud:0xffffff,ice:0xbfe8ff,path:0x8a96a6,snow:1},
 dune:{sky:0xffd49a,ground:0xe3bd74,rough:0xd8ad62,fair:0x9bc95a,green:0x8fe07a,fringe:0x7ac050,sand:0xf6d98e,water:0x2fc0cf,shore:0xfff0c0,hill:0xd2a050,hemi:[0xfff0d0,0xb08040,1.15],sun:1.9,tree:'cactus',cloud:0xfff6e8,path:0xc0a070},
 night:{sky:0x0a0a26,ground:0x14301c,rough:0x1b4024,fair:0x276634,green:0x3a8f45,fringe:0x2b7a38,sand:0x7d7055,water:0x16337a,shore:0x5a5a80,hill:0x0e1830,hemi:[0x7a7aff,0x102010,.7],sun:.45,tree:'glowpine',cloud:0x2a2a55,path:0x3a3a4a,night:1}};
let CI=0,HOLES=COURSES[0].holes,TH=THEMES.sunny;
function setCourse(i){CI=i;HOLES=COURSES[i].holes;TH=THEMES[COURSES[i].theme];course=null}
const cleared=()=>LS.get('cleared',[]);
function courseOpen(i){return i===0||cleared().includes(COURSES[i-1].id)||owned().includes('course:'+COURSES[i].id)}

let course=null;const courseG=new THREE.Group();scene.add(courseG);
function srand(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function distSeg(px,pz,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l?((px-a[0])*dx+(pz-a[1])*dz)/l:0;t=clamp(t,0,1);return Math.hypot(px-a[0]-t*dx,pz-a[1]-t*dz)}
function distPath(px,pz,p){let m=1e9;for(let i=0;i<p.length-1;i++)m=Math.min(m,distSeg(px,pz,p[i],p[i+1]));if(p.length===1)m=Math.hypot(px-p[0][0],pz-p[0][1]);return m}
function surface(x,z){const h=course;if(Math.hypot(x-h.pin[0],z-h.pin[1])<h.gr)return'green';
 for(const s of h.sand)if(Math.hypot(x-s[0],z-s[1])<s[2])return'sand';
 for(const s of h.ice)if(Math.hypot(x-s[0],z-s[1])<s[2])return'ice';
 for(const s of h.water)if(Math.hypot(x-s[0],z-s[1])<s[2])return'water';
 if(distPath(x,z,h.path)<h.w/2)return'fairway';if(h.extra&&distPath(x,z,[h.extra[0],h.pin])<h.w/2)return'fairway';
 if(Math.hypot(x,z)<5)return'fairway';
 if(distPath(x,z,h.full)<h.w/2+32)return'rough';return'oob'}
function flatDisc(r,col,y,x,z){const m=new THREE.Mesh(new THREE.CircleGeometry(r,40),MC(col));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;courseG.add(m);return m}
function ribbon(path,w,col,y){for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),MC(col));m.rotation.x=-Math.PI/2;m.rotation.z=Math.atan2(b[0]-a[0],-(b[1]-a[1]))*-1;m.position.set((a[0]+b[0])/2,y,(a[1]+b[1])/2);m.receiveShadow=true;courseG.add(m)}for(const p of path)flatDisc(w/2,col,y,p[0],p[1])}
let pinG,flag,windmill=null,cartObj=null,trees=[];
const GLOWC=[0xff2bd6,0x00e5ff,0xfff04a,0x7dff4a];
function makeCactus(x,z,s){const g=new THREE.Group();const cm=MC(0x3f8f3a);const tr=mesh(new THREE.CapsuleGeometry(.55*s,4*s,4,8),cm,0,2.6*s,0,g);for(const k of[-1,1]){const h=1.4+Math.abs(x*3+z)%1.2;const a=mesh(new THREE.CapsuleGeometry(.35*s,1*s,4,8),cm,k*1*s,h*s,0,g);a.rotation.z=k*Math.PI/2;const u=mesh(new THREE.CapsuleGeometry(.35*s,1.3*s,4,8),cm,k*1.6*s,(h+.8)*s,0,g)}mesh(G.sph,MC(0xff5fa0),0,5.2*s,0,g).scale.setScalar(.35*s);g.position.set(x,0,z);g.rotation.y=x*.7;courseG.add(g);trees.push({x,z,r:.9*s,h:5.5*s})}
function makeTree(x,z,s){if(TH.tree==='cactus')return makeCactus(x,z,s);const g=new THREE.Group();mesh(G.cyl,TH.night?0x2a1a10:0x7a4b25,0,1.5*s,0,g).scale.set(.35*s,3*s,.35*s);const pal=TH.night?[0x0f3a22,0x123f2a,0x0c3020]:TH.snow?[0x2a6a4a,0x2f7a52,0x245e40]:[0x2e8b3a,0x3fa34d,0x267a33];const c=pal[Math.floor(Math.abs(x*7+z)%3)];const a=mesh(G.cone,c,0,4.5*s,0,g);a.scale.set(2.2*s,4*s,2.2*s);const b=mesh(G.cone,c,0,6.6*s,0,g);b.scale.set(1.6*s,3*s,1.6*s);
 if(TH.snow){const w=mesh(G.cone,0xffffff,0,7.6*s,0,g);w.scale.set(1.05*s,1.6*s,1.05*s);const w2=mesh(G.cone,0xf4f8ff,0,5.4*s,0,g);w2.scale.set(1.9*s,1.1*s,1.9*s)}
 if(TH.night){for(let k=0;k<5;k++){const a2=k*2.4+x,hh=3.2+k*.8;const o=mesh(G.sphL,new THREE.MeshBasicMaterial({color:GLOWC[(k+Math.floor(Math.abs(z)))%4]}),Math.cos(a2)*(2-k*.3)*s,hh*s,Math.sin(a2)*(2-k*.3)*s,g);o.scale.setScalar(.22*s);o.castShadow=false}}
 g.position.set(x,0,z);courseG.add(g);trees.push({x,z,r:1.6*s,h:8.5*s})}
const CARTSK={classic:[0xffffff,0x1b6b3a,0x8b2b2b],fire:[0xd81e1e,0x161616,0x222222],gold:[0xd4af37,0xfff2c0,0x6b3e1e],camo:[0x4b5d2a,0x2f3a1c,0x6b5a3a],pink:[0xff7ac8,0xffffff,0x9a3cff],neon:[0x15152a,0x00ffcc,0xff2bd6]};
function makeCart(sk){const [bc,rc,sc]=CARTSK[sk]||CARTSK.classic;const g=new THREE.Group();const body=new THREE.Group();body.position.y=.55;g.add(body);
 const bm=M(bc,sk==='gold'?{emissive:0x332200}:{}),dm=MC(0x222222),sm=M(sc),chrome=MC(0xc8c8c8);
 mesh(G.box,dm,0,0,0,body).scale.set(1.7,.18,3.3);
 const cw=mesh(G.box,bm,0,.42,1.2,body);cw.scale.set(1.7,.66,.9);const nose=mesh(G.sph,bm,0,.3,1.62,body);nose.scale.set(.86,.36,.34);
 mesh(G.box,dm,0,.12,1.85,body).scale.set(1.8,.22,.16);mesh(G.box,dm,0,.12,-1.7,body).scale.set(1.8,.22,.16);
 const rb=mesh(G.box,bm,0,.38,-1.15,body);rb.scale.set(1.7,.6,.95);
 mesh(G.box,bm,0,.33,-.15,body).scale.set(1.62,.48,.95);mesh(G.box,sm,0,.66,-.12,body).scale.set(1.5,.16,.85);mesh(G.box,sm,0,1.05,-.56,body).scale.set(1.5,.62,.14);
 for(const[x,z]of[[-.8,1.08],[.8,1.08],[-.8,-.66],[.8,-.66]])mesh(G.cyl,chrome,x,1.4,z,body).scale.set(.05,2.1,.05);
 const roof=mesh(G.box,M(rc),0,2.48,.2,body);roof.scale.set(1.95,.1,2.3);const rl=mesh(G.box,M(rc),0,2.38,.2,body);rl.scale.set(2.05,.08,2.4);
 const ws=new THREE.Mesh(G.box,new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:.3,depthWrite:false}));ws.position.set(0,1.82,1.08);ws.scale.set(1.55,1.2,.04);body.add(ws);
 const colm=mesh(G.cyl,dm,.4,.95,.72,body);colm.scale.set(.04,.7,.04);colm.rotation.x=-.6;
 const sw=new THREE.Group();sw.position.set(.4,1.22,.5);sw.rotation.x=-1.0;body.add(sw);mesh(new THREE.TorusGeometry(.22,.035,6,18),dm,0,0,0,sw).rotation.x=Math.PI/2;mesh(G.box,dm,0,0,0,sw).scale.set(.42,.03,.05);
 const bag=mesh(G.cyl,M(sk==='neon'?0xff2bd6:0x2255aa),0,1.05,-1.42,body);bag.scale.set(.32,1.1,.32);bag.rotation.x=.25;
 for(let k=0;k<4;k++){const ch=mesh(G.box,chrome,-.15+k*.1,1.72,-1.6+k%2*.05,body);ch.scale.set(.07,.12,.15);mesh(G.cyl,chrome,-.15+k*.1,1.55,-1.55,body).scale.set(.015,.4,.015)}
 const hl=new THREE.MeshBasicMaterial({color:0xfff6c0}),tl=new THREE.MeshBasicMaterial({color:0xff2020});
 for(const s2 of[-1,1]){const h=mesh(G.sph,hl,s2*.55,.5,1.75,body);h.scale.set(.16,.13,.07);h.castShadow=false;const t2=mesh(G.box,tl,s2*.6,.45,-1.64,body);t2.scale.set(.25,.12,.04)}
 const wheels=[],front=[];for(const[x,z,fr]of[[-.9,1.12,1],[.9,1.12,1],[-.9,-1.12,0],[.9,-1.12,0]]){const piv=new THREE.Group();piv.position.set(x,.38,z);g.add(piv);const spin=new THREE.Group();piv.add(spin);
  const t=mesh(G.cyl,MC(0x161616),0,0,0,spin);t.scale.set(.38,.26,.38);t.rotation.z=Math.PI/2;const hub=mesh(G.cyl,sk==='gold'?MC(0xffd700):MC(0xdddddd),Math.sign(x)*.135,0,0,spin);hub.scale.set(.2,.02,.2);hub.rotation.z=Math.PI/2;mesh(G.box,MC(0x777777),Math.sign(x)*.145,0,0,spin).scale.set(.02,.34,.07);wheels.push(spin);if(fr)front.push(piv)}
 g.userData={body,wheels,front,sw,hl};return g}
function buildHole(i){
 while(courseG.children.length)courseG.remove(courseG.children[0]);trees=[];windmill=null;cartObj=null;
 const h=course=Object.assign({},HOLES[i]);h.sand=h.sand||[];h.water=h.water||[];h.ice=h.ice||[];h.pin=h.pin||h.path[h.path.length-1];
 applyTheme();h.full=[...h.path,...(h.extra||[]),h.pin];
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),MC(TH.ground));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;courseG.add(ground);
 // rough band
 ribbon(h.full,h.w+64,TH.rough,.01);
 ribbon(h.path,h.w,TH.fair,.02);
 if(h.extra)ribbon([h.extra[0],h.pin],h.w,TH.fair,.02);
 // stripes on fairway
 for(const w of h.water){flatDisc(w[2],TH.water,.05,w[0],w[1]);flatDisc(w[2]+1.2,TH.shore,.045,w[0],w[1])}
 for(const s of h.sand)flatDisc(s[2],TH.sand,.06,s[0],s[1]);
 for(const s of h.ice){flatDisc(s[2]+.8,0xffffff,.052,s[0],s[1]);const im=flatDisc(s[2],0xbfe8ff,.058,s[0],s[1]);im.material=new THREE.MeshLambertMaterial({color:0xbfe8ff,emissive:0x203848});for(let k=0;k<3;k++){const cr=new THREE.Mesh(new THREE.PlaneGeometry(s[2]*1.2,.12),MC(0xffffff));cr.rotation.set(-Math.PI/2,0,k*1.1+s[0]);cr.position.set(s[0],.06,s[1]);courseG.add(cr)}}
 flatDisc(h.gr+2,TH.fringe,.065,h.pin[0],h.pin[1]);flatDisc(h.gr,TH.green,.07,h.pin[0],h.pin[1]);if(TH.night){const gl=new THREE.Mesh(new THREE.RingGeometry(1,1.5,32),new THREE.MeshBasicMaterial({color:0x00ffcc}));gl.rotation.x=-Math.PI/2;gl.position.set(h.pin[0],.085,h.pin[1]);courseG.add(gl)}
 flatDisc(.75,0x111111,.08,h.pin[0],h.pin[1]);
 // tee box
 const tb=mesh(G.box,0x8fe060,0,.05,0,courseG);tb.scale.set(7,.12,7);tb.receiveShadow=true;
 for(const s of[-1,1]){const m=mesh(G.sph,0xff4040,s*2.5,.3,-2,courseG);m.scale.setScalar(.3)}
 pinG=new THREE.Group();pinG.position.set(h.pin[0],0,h.pin[1]);mesh(G.cyl,0xffffff,0,3,0,pinG).scale.set(.06,6,.06);
 flag=mesh(new THREE.PlaneGeometry(1.6,1,4,1),TH.night?new THREE.MeshBasicMaterial({color:0xff2bd6,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({color:0xff3030,side:THREE.DoubleSide}),.8,5.4,0,pinG);courseG.add(pinG);
 const R=srand(h.seed*977);
 // trees along both sides
 for(let k=0;k<h.full.length-1;k++){const a=h.full[k],b=h.full[k+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/l,nz=(b[0]-a[0])/l;
  for(let d=10;d<l;d+=11+R()*10){for(const s of[-1,1]){if(R()<.35)continue;const off=h.w/2+6+R()*30,x=a[0]+(b[0]-a[0])*d/l+nx*off*s,z=a[1]+(b[1]-a[1])*d/l+nz*off*s;
   if(surface(x,z)==='rough'||surface(x,z)==='oob'){if(Math.hypot(x-h.pin[0],z-h.pin[1])>h.gr+6&&Math.hypot(x,z)>10)makeTree(x,z,.8+R()*.6)}}}}
 // a couple of nasty fairway trees
 if(CI===0){if(i===0)makeTree(-8,-120,1.1);if(i===4){makeTree(-4,-220,1);makeTree(20,-80,1)}}
 for(const q of h.cactus||[])makeCactus(q[0],q[1],1.1);
 // decor hills
 for(let k=0;k<14;k++){const a=k/14*Math.PI*2,r=360+R()*80;const m=mesh(G.sphL,TH.hill,h.pin[0]/2+Math.cos(a)*r,-30,h.pin[1]/2+Math.sin(a)*r,courseG);m.scale.set(90+R()*60,70+R()*50,90);m.castShadow=false}
 for(let k=0;k<10;k++){const c=new THREE.Group();for(let j=0;j<4;j++){const m=mesh(G.sphL,cloudMat(),j*9,R()*4,R()*5,c);m.scale.setScalar(7+R()*5);m.castShadow=false}c.position.set(R()*700-350,70+R()*40,-R()*600+100);courseG.add(c)}
 if(h.windmill){const g=new THREE.Group();g.position.set(h.windmill[0],0,h.windmill[1]);const t=mesh(new THREE.CylinderGeometry(2,3.2,10,8),0xc8553d,0,5,0,g);const r=mesh(G.cone,0x6b2e20,0,11.5,0,g);r.scale.set(3.4,3,3.4);
  const bl=new THREE.Group();bl.position.set(0,8,3.3);g.add(bl);for(let k=0;k<4;k++){const b=mesh(G.box,0xf4ecd8,0,4,0);b.scale.set(1.5,8,.2);const p=new THREE.Group();p.rotation.z=k*Math.PI/2;p.add(b);bl.add(p)}
  courseG.add(g);windmill={x:h.windmill[0],z:h.windmill[1],bl};trees.push({x:h.windmill[0],z:h.windmill[1],r:3.2,h:12})}
 if(h.cart!==undefined){const c=makeCart();c.scale.setScalar(1.6);c.position.set(0,0,h.cart);courseG.add(c);cartObj=c}
 // parked cart at tee
 const pc=makeCart(EQ().cart);pc.position.set(-7,0,3);pc.rotation.y=.3;courseG.add(pc);trees.push({x:-7,z:3,r:1.8,h:3});
 h.wind={a:rand(0,Math.PI*2),s:Math.round(rand(0,i===5?9:7))};
 // hallucination props (absinthe): fake holes + hot tub green
 fakeHoles=[];for(let k=0;k<3;k++){const g=new THREE.Group();mesh(G.cyl,0xffffff,0,3,0,g).scale.set(.06,6,.06);const fl=mesh(G.box,new THREE.MeshBasicMaterial({color:[0x7dff4a,0xff2bd6,0xffd23f][k]}),.8,5.4,0,g);fl.scale.set(1.6,1,.05);const cup=new THREE.Mesh(new THREE.CircleGeometry(.75,20),MC(0x111111));cup.rotation.x=-Math.PI/2;cup.position.y=.09;g.add(cup);g.visible=false;courseG.add(g);fakeHoles.push(g)}
 hotTub=new THREE.Group();hotTub.position.set(h.pin[0],0,h.pin[1]);const tw=new THREE.Mesh(new THREE.CircleGeometry(h.gr*.95,40),new THREE.MeshLambertMaterial({color:0x2fe0e0,emissive:0x0a5050,transparent:true,opacity:.85}));tw.rotation.x=-Math.PI/2;tw.position.y=.075;hotTub.add(tw);const rim=mesh(new THREE.TorusGeometry(h.gr*.97,.7,8,40),0x8b5a2b,0,.3,0,hotTub);rim.rotation.x=Math.PI/2;
 const duck=new THREE.Group();mesh(G.sph,0xffd23f,0,.5,0,duck).scale.set(.8,.6,1);mesh(G.sph,0xffd23f,0,1.1,.5,duck).scale.setScalar(.45);mesh(G.cone,0xff8a1a,0,1.05,1,duck).scale.set(.15,.4,.15);duck.children[2].rotation.x=Math.PI/2;duck.position.set(4,0,3);hotTub.add(duck);hotTub.userData.duck=duck;hotTub.visible=false;courseG.add(hotTub);
 // ambient: fireflies (night) / snowfall (frost) / dust (dune)
 amb=null;if(TH.night||TH.snow||CI===2){const N=TH.night?160:TH.snow?400:60,pa=new Float32Array(N*3);for(let k=0;k<N;k++){pa[k*3]=rand(-60,60);pa[k*3+1]=rand(.5,TH.snow?40:8);pa[k*3+2]=rand(-60,60)}const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pa,3));amb=new THREE.Points(gg,new THREE.PointsMaterial({color:TH.night?0xd8ff5a:TH.snow?0xffffff:0xfff0c0,size:TH.night?.5:TH.snow?.35:.25,transparent:true,opacity:TH.night?.95:.8,depthWrite:false}));amb.frustumCulled=false;amb.userData.base=pa.slice();courseG.add(amb)}
 if(TH.night){const mn=new THREE.Mesh(new THREE.SphereGeometry(18,20,14),new THREE.MeshBasicMaterial({color:0xfff8d8,fog:false}));mn.position.set(-160,140,-420);courseG.add(mn);const N=300,pa=new Float32Array(N*3);for(let k=0;k<N;k++){const a=rand(0,Math.PI*2),e=rand(.15,1.2);pa[k*3]=Math.cos(a)*Math.cos(e)*600;pa[k*3+1]=Math.sin(e)*600;pa[k*3+2]=Math.sin(a)*Math.cos(e)*600}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pa,3));const st=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false}));st.frustumCulled=false;courseG.add(st)}
 applyBallSkin();
}
let fakeHoles=[],hotTub=null,amb=null;
const cloudMats={};function cloudMat(){return cloudMats[TH.cloud]||(cloudMats[TH.cloud]=new THREE.MeshBasicMaterial({color:TH.cloud,fog:false}))}
function applyTheme(){scene.background=new THREE.Color(TH.sky);scene.fog.color.setHex(TH.sky);scene.fog.near=TH.night?90:180;scene.fog.far=TH.night?380:520;hemi.color.setHex(TH.hemi[0]);hemi.groundColor.setHex(TH.hemi[1]);hemi.intensity=TH.hemi[2];sun.intensity=TH.sun;sun.color.setHex(TH.night?0x9aa0ff:CI===2?0xfff0d0:0xffffff)}
let ballPupil=null;
function applyBallSkin(){const k=EQ().ball,bm=ball.material;const C={white:[0xffffff,0x333333],gold:[0xffd700,0x664400],neon:[0x7dff4a,0x33aa00],eye:[0xffffff,0x333333],disco:[0xdddddd,0x444444]}[k]||[0xffffff,0x333333];bm.color.setHex(C[0]);bm.emissive.setHex(TH.night?(k==='white'?0x55ffcc:C[0]):C[1]);
 if(!ballPupil){ballPupil=new THREE.Group();const ir=mesh(G.sph,0x1f8fff,0,0,.22,ballPupil);ir.scale.set(.13,.13,.07);const pu=mesh(G.sph,0x111111,0,0,.26,ballPupil);pu.scale.set(.07,.07,.04);ball.add(ballPupil)}ballPupil.visible=k==='eye';
 const T2={white:0xffffff,fire:0xff7a1a,rainbow:0xff2bd6,bubbles:0xffd23f}[EQ().trail]||0xffffff;trail.material.color.setHex(T2)}
// ---------- particles ----------
const parts=[];const pGeo=new THREE.BoxGeometry(1,1,1);
function burst(pos,n,colors,spd=6,size=.25,up=4,life=1.2){for(let i=0;i<n;i++){const m=new THREE.Mesh(pGeo,MC(colors[i%colors.length]));m.position.copy(pos);m.scale.setScalar(size*rand(.5,1.3));scene.add(m);parts.push({m,v:new V3(rand(-1,1)*spd,rand(.3,1)*up+rand(0,spd*.5),rand(-1,1)*spd),l:life*rand(.6,1.2),r:new V3(rand(-5,5),rand(-5,5),0)})}}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;p.v.y-=9*dt*(p.g??1);p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=p.r.x*dt;p.m.rotation.y+=p.r.y*dt;if(p.m.position.y<.05){p.m.position.y=.05;p.v.multiplyScalar(.5)}if(p.l<=0){scene.remove(p.m);parts.splice(i,1)}}}
// trail
const trailN=40,trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(trailN*3),3));const trail=new THREE.Line(trailGeo,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));trail.frustumCulled=false;scene.add(trail);let trailPts=[];
// ---------- ball + aim ----------
const ball=mesh(new THREE.SphereGeometry(.26,16,12),M(0xffffff,{emissive:0x333333}),0,.35,0);scene.add(ball);
const ballShadowRing=new THREE.Mesh(new THREE.RingGeometry(.6,.9,24),new THREE.MeshBasicMaterial({color:0xffff00,transparent:true,opacity:.8}));ballShadowRing.rotation.x=-Math.PI/2;scene.add(ballShadowRing);
const ghosts=[0,1].map(()=>{const g=new THREE.Mesh(new THREE.SphereGeometry(.26,12,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55}));scene.add(g);return g});const ghostPins=[0,1].map(()=>{const g=new THREE.Group();mesh(G.cyl,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.4}),0,3,0,g).scale.set(.06,6,.06);const f=mesh(G.box,new THREE.MeshBasicMaterial({color:0xff3030,transparent:true,opacity:.45}),.8,5.4,0,g);f.scale.set(1.6,1,.05);scene.add(g);return g});
const DOTS=26;const dots=new THREE.InstancedMesh(new THREE.SphereGeometry(.22,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}),DOTS);dots.frustumCulled=false;scene.add(dots);
const land=new THREE.Mesh(new THREE.RingGeometry(2.2,3,32),new THREE.MeshBasicMaterial({color:0xffcc33,transparent:true,opacity:.9,depthWrite:false}));land.rotation.x=-Math.PI/2;scene.add(land);
const CLUBS=[{id:'driver',n:'Driver',carry:200,ang:13,roll:1},{id:'wood',n:'3 Wood',carry:170,ang:16,roll:1},{id:'iron',n:'Iron',carry:130,ang:24,roll:.8},{id:'wedge',n:'Wedge',carry:65,ang:48,roll:.4},{id:'putter',n:'Putter',carry:32,ang:0,roll:1}];
const DRINKS=[
 {id:'beer',e:'🍺',n:'Beer',d:'+18% buzz · steadier needle',amt:.18,col:0xe8b030,can:0xc8a040},
 {id:'whiskey',e:'🥃',n:'Whiskey',d:'+32% buzz · +10% power',amt:.32,col:0xb5651d,can:0x8b4513},
 {id:'espresso',e:'☕',n:'Espresso',d:'-25% buzz · cures hangover',amt:-.25,col:0x3b2412,can:0xffffff},
 {id:'water',e:'💧',n:'Water',d:'-10% · cures hangover',amt:-.1,col:0x8fd3ff,can:0x8fd3ff},
 {id:'mystery',e:'🧪',n:'Mystery Shot',d:'??? pure chaos',amt:0,col:0x9b30ff,can:0x9b30ff},
 {id:'vodka',e:'🧊',n:'Vodka Shot',d:'+30% spike · +20% power · shaky aim',amt:.3,col:0xdff4ff,can:0xe8f6ff,shot:1},
 {id:'screw',e:'🍹',n:'Screwdriver',d:'+12% gentle buzz · steady hands',amt:.12,col:0xffa020,can:0xff9a1f,cup:1},
 {id:'vsoda',e:'🫧',n:'Vodka Soda',d:'+15% · crisp · +8% power',amt:.15,col:0xe8fbff,can:0xbfefff,cup:1},
 {id:'jager',e:'💣',n:'Jäger Bomb',d:'+25% · BULLET-TIME swing',amt:.25,col:0x3a1a0a,can:0x2a2a2a,shot:1},
 {id:'tequila',e:'🌵',n:'Tequila',d:'+28% · left is right (2 shots)',amt:.28,col:0xf5e6a0,can:0xf5e6a0,shot:1},
 {id:'keg',e:'🛢️',n:'Keg Stand',d:'HOLD to chug · huge buzz + style',amt:0,col:0xe8b030,can:0xaaaaaa},
 {id:'absinthe',e:'🧚',n:'Absinthe',d:'+30% · hallucinations (this hole)',amt:.3,col:0x7dff4a,can:0x5ad12a,shot:1},
 {id:'energy',e:'⚡',n:'Rocket Fuel',d:'energy + vodka · +15% · cart TURBO',amt:.15,col:0x4aa0ff,can:0x2050ff},
 {id:'moon',e:'🏺',n:'Moonshine',d:'+45% · +35% power · blackout risk',amt:.45,col:0xf0f0e0,can:0xc8a070,cup:1},
 {id:'hot',e:'🌶️',n:'Hot Sauce Chaser',d:'-15% · sinuses on FIRE',amt:-.15,col:0xff2a00,can:0xff2a00,shot:1},
 {id:'cola',e:'🥤',n:'Fizzy Pop',d:'+5% · giant burp',amt:.05,col:0xff3030,can:0xff3030}];
const REST={green:.25,fairway:.35,rough:.2,sand:.04,ice:.5},KEEP={green:.75,fairway:.8,rough:.55,sand:.15,ice:.97},FR={green:1.7,fairway:3.2,rough:7,sand:16,ice:.55};
const windRes=()=>EQ().club==='neon'?.85:1;
function lieMult(c,s){if(c.id==='putter')return 1;return s==='sand'?(c.id==='wedge'?.85:.6):s==='rough'?.88:s==='ice'?.95:1}
// ---------- game state ----------
const S={mode:'title',players:[],cur:0,hole:0,ballP:new V3(),ballV:new V3(),lastP:new V3(),aim:0,club:0,phase:'aim',power:0,pDir:1,acc:0,aDir:1,t:0,shake:0,flightT:0,golfer:null,cut:null,curve:0,camP:new V3(0,8,15),camL:new V3(),effects:{},spin:0,shotStart:new V3(),swingT:-1,lockedPow:0};
const P=()=>S.players[S.cur];const HV=()=>{const p=P();return p?clamp((p.drunk-.5)/.5,0,1):0};
// ---------- UI build ----------
function show(id,on=true){$(id).classList.toggle('show',on)}
function screen(id){for(const s of['title','setup','creator','how','pass','pause','card','courses','shop'])show(s,s===id);show('hud',id==='hud')}
function toast(txt,sm=false,ms=2200){const d=document.createElement('div');d.className='toast'+(sm?' sm':'');d.textContent=txt;const w=document.createElement('div');w.appendChild(d);$('toasts').appendChild(w);setTimeout(()=>w.remove(),ms)}
const bestTxt=()=>{const b=LS.get('best_sunny',LS.get('best',null));$('bestTxt').textContent=b?`🏆 Sunny Links best: ${b.score} (${b.rel>0?'+':''}${b.rel}) by ${b.name}`:'4 courses · 24 holes of questionable decisions';$('coinTxt').textContent=`🪙 ${coins()}  ·  ⭐ ${LS.get('cstyle',0)} career style`};
function buildCourses(){const el=$('cList');el.innerHTML='';COURSES.forEach((c,i)=>{const open=courseOpen(i),b=LS.get('best_'+c.id,null),par=c.holes.reduce((a,h)=>a+h.par,0),th=THEMES[c.theme];const d=document.createElement('div');d.className='crs'+(open?'':' locked');d.style.background=`linear-gradient(135deg,#${th.sky.toString(16).padStart(6,'0')},#${th.fair.toString(16).padStart(6,'0')})`;
 d.innerHTML=`<div class="ce">${c.e}</div><div class="ct"><b>${c.n}</b><small>${c.d}</small><small>Par ${par} · ${c.holes.length} holes${b?` · 🏆 ${b.score}`:''}${cleared().includes(c.id)?' · ✅':''}</small></div>${open?'<div class="cgo">▶</div>':`<div class="cbuy">🔒<br>${i>0&&!cleared().includes(COURSES[i-1].id)?'Clear '+COURSES[i-1].n.split(' ')[0]+'<br>or ':''}🪙${c.cost}</div>`}`;
 d.onclick=()=>{if(open){SFX.click();setCourse(i);screen('setup')}else if(coins()>=c.cost){addCoins(-c.cost);LS.set('owned',[...owned(),'course:'+c.id]);SFX.coin();celebrate(c.e,c.n,'Course unlocked!');buildCourses();bestTxt()}else{SFX.bad();toast(`Need 🪙${c.cost-coins()} more — finish rounds & cart dashes!`,true,1500)}};el.appendChild(d)});$('cCoins').textContent='🪙 '+coins()}
let shopCat=0;
function buildShop(){$('sCoins').textContent='🪙 '+coins();const tabs=$('sTabs');tabs.innerHTML='';SHOP.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.cat;if(i===shopCat)b.className='sel';b.onclick=()=>{shopCat=i;SFX.click();buildShop()};tabs.appendChild(b)});
 const g=$('sGrid');g.innerHTML='';const cat=SHOP[shopCat],eq=EQ();for(const it of cat.items){const own=isOwned(it.id),[k,v]=it.id.split(':'),on=cat.slot&&eq[cat.slot]===v;const d=document.createElement('div');d.className='itm'+(own?' own':'')+(on?' on':'');
  const sw=v[0]==='#'?`<span class="swc" style="background:${v}"></span>`:'';d.innerHTML=`<div class="e">${it.e}</div><b>${it.n}</b>${sw}<small>${it.d||''}</small><div class="pr">${on?'EQUIPPED':own?(cat.slot?'Equip':'Owned ✓ (Creator)'):'🪙 '+it.p}</div>`;
  d.onclick=()=>{if(own){if(cat.slot){const e=EQ();e[cat.slot]=v;LS.set('eq',e);SFX.click();buildShop()}return}if(coins()>=it.p){addCoins(-it.p);SFX.coin();grant(it.id,cat.slot?'Equipped!':'Now in the Golfer Creator');buildShop();bestTxt()}else{SFX.bad();toast(`Need 🪙${it.p-coins()} more`,true,1100)}};g.appendChild(d)}}
$('bShop').onclick=()=>{SFX.click();buildShop();screen('shop')};$('bShopBack').onclick=()=>{SFX.click();bestTxt();screen('title')};$('bCrsBack').onclick=()=>{SFX.click();screen('title')};
bestTxt();
$('bPlay').onclick=()=>{SFX.click();buildCourses();screen('courses')};$('bHow').onclick=()=>{SFX.click();screen('how')};$('bHowBack').onclick=()=>{screen(S.mode==='paused'?'pause':'title')};$('bSetupBack').onclick=()=>{buildCourses();screen('courses')};
for(let n=1;n<=4;n++){const b=document.createElement('button');b.className='big';b.textContent=n===1?'Solo':n+' Players';b.onclick=()=>{SFX.click();startCreator(n)};$('pcount').appendChild(b)}
// creator
let cIdx=0,cN=1,cChar=null,cGolfer=null;const cScene=new THREE.Scene();cScene.background=new THREE.Color(0x7cc6f2);
cScene.add(new THREE.HemisphereLight(0xffffff,0x557744,1.2));const cl=new THREE.DirectionalLight(0xffffff,1.4);cl.position.set(3,6,5);cScene.add(cl);
{const p=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,.3,32),MC(0x7ccf4f));p.position.y=-.15;cScene.add(p);const g=new THREE.Mesh(new THREE.CircleGeometry(30,32),MC(0x4f9a3a));g.rotation.x=-Math.PI/2;g.position.y=-.3;cScene.add(g)}
const cCam=new THREE.PerspectiveCamera(40,1,.1,100);
function startCreator(n){cN=n;cIdx=0;S.players=[];ac();editChar()}
function editChar(){const saved=LS.get('chars',[]);cChar=Object.assign(randomChar(cIdx),saved[cIdx]||{});S.mode='creator';screen('creator');$('cTitle').textContent=cN>1?`Golfer ${cIdx+1}/${cN}`:'Create your golfer';$('cName').value=cChar.name;buildOpts();rebuildPreview()}
function rebuildPreview(){if(cGolfer)cScene.remove(cGolfer);cGolfer=makeGolfer(cChar);cGolfer.userData.club.visible=false;setPose(cGolfer,'rest');cScene.add(cGolfer)}
const LBL={skin:'Skin',shirt:'Shirt',pants:'Pants',hat:'Hat',hatC:'Hat color',face:'Face',stache:'Face fuzz',hair:'Hair',hairC:'Hair color',glasses:'Eyewear',body:'Body'};
function buildOpts(){const o=$('cOpts');o.innerHTML='';for(const k of Object.keys(LBL)){const r=document.createElement('div');r.className='opt';r.innerHTML=`<b>${LBL[k]}</b>`;const ch=document.createElement('div');ch.className='ch';
 for(const v of OPTS[k]){const e=document.createElement('div');if(v[0]==='#'){e.className='sw';e.style.background=v}else{e.className='tx';e.textContent=v}const lk=isLocked(k,v);if(lk)e.classList.add('lock');if(cChar[k]===v)e.classList.add('sel');e.onclick=()=>{if(lk){SFX.bad();toast('🔒 Unlock it in the Pro Shop',true,1100);return}cChar[k]=v;SFX.click();buildOpts();rebuildPreview();cGolfer.userData.body.rotation.y=0;tipsy=0};ch.appendChild(e)}r.appendChild(ch);o.appendChild(r)}}
let tipsy=0;
$('cRand').onclick=()=>{const n=cChar.name;cChar=randomChar();cChar.name=$('cName').value||cChar.name;SFX.hic();buildOpts();rebuildPreview()};
$('cName').oninput=e=>cChar.name=e.target.value;
$('cNext').onclick=()=>{SFX.click();cChar.name=($('cName').value||'Golfer '+(cIdx+1)).slice(0,12);const saved=LS.get('chars',[]);saved[cIdx]=cChar;LS.set('chars',saved);
 S.players.push({c:cChar,g:null,drunk:0,peak:0,hang:0,scores:[],style:0,strokes:0,steady:0,boost:0});cIdx++;if(cIdx<cN)editChar();else startRound()};
// HUD clubs
CLUBS.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.n;b.onclick=e=>{e.stopPropagation();if(S.phase!=='aim')return;SFX.click();setClub(i)};$('clubs').appendChild(b)});
function setClub(i){S.club=i;[...$('clubs').children].forEach((b,j)=>b.classList.toggle('sel',j===i))}
DRINKS.forEach(d=>{const b=document.createElement('button');b.className='dk';b.innerHTML=`<div class="e">${d.e}</div><div class="n">${d.n}</div><div class="d">${d.d}</div>`;b.onclick=()=>{show('drinks',false);drink(d)};$('drinks').appendChild(b)});
{const b=document.createElement('button');b.textContent='Never mind';b.onclick=()=>show('drinks',false);$('drinks').appendChild(b)}
$('bDrink').onclick=e=>{if(S.mode!=='play'||S.phase!=='aim')return;SFX.open();show('drinks',!$('drinks').classList.contains('show'))};
$('bPause').onclick=()=>{if(S.mode!=='play')return;S.mode='paused';screen('pause')};
$('bResume').onclick=()=>{S.mode='play';screen('hud')};
$('bSound').onclick=()=>{soundOn=!soundOn;LS.set('sound',soundOn);$('bSound').textContent='Sound: '+(soundOn?'On':'Off')};$('bSound').textContent='Sound: '+(soundOn?'On':'Off');
$('bQuit').onclick=()=>{if(myCart){myCart.remove(S.golfer);courseG.remove(myCart);myCart=null;$('cartUI').style.display='none'}ball.visible=true;S.mode='title';screen('title');bestTxt()};
$('bCard').onclick=()=>{showCard(false)};
// ---------- round flow ----------
function startRound(){S.hole=0;S.paid=0;S.roundCoins=0;S.cur=0;for(const p of S.players){p.scores=[];p.style=0}startTurn()}
function startTurn(){const p=P();buildHole(S.hole);p.strokes=0;if(S.hole>0){p.drunk=Math.max(0,p.drunk-.12)}
 S.ballP.set(0,.35,0);S.ballV.set(0,0,0);S.lastP.copy(S.ballP);S.phase='aim';S.effects={};
 if(S.golfer)scene.remove(S.golfer);S.golfer=makeGolfer(p.c);scene.add(S.golfer);
 setClub(0);if(course.par===3&&holeDist()<170)setClub(2);aimAtPin();snapCam();calcHint();
 if(S.players.length>1){S.mode='pass';screen('pass');$('passTxt').textContent=`Pass the phone to ${p.c.name}!`;$('passSub').textContent=`Hole ${S.hole+1}: ${course.name} · Par ${course.par} · Buzz ${Math.round(p.drunk*100)}%`}
 else{beginPlay()}}
$('bPassGo').onclick=()=>{SFX.click();beginPlay()};
function beginPlay(){S.mode='play';screen('hud');updHUD();toast(`Hole ${S.hole+1}\n${course.name}\nPar ${course.par}`);
 if(S.hole===0&&!LS.get('tutDone',false)){setTimeout(()=>toast('Drag to aim ↔',true,3000),2300);setTimeout(()=>toast('Hold SWING for power, release, then tap to stop the needle',true,3500),5300);setTimeout(()=>toast('Tap 🍺 for liquid courage (longer shots, wobblier world)',true,3500),8900);LS.set('tutDone',true)}}
function holeDist(){return Math.hypot(S.ballP.x-course.pin[0],S.ballP.z-course.pin[1])}
function aimAtPin(){S.aimT=S.aim=Math.atan2(course.pin[0]-S.ballP.x,-(course.pin[1]-S.ballP.z))}
function dirV(a){return new V3(Math.sin(a),0,-Math.cos(a))}
// ---------- drinking ----------
function drink(d){const p=P();ac();let msg='';const old=p.drunk;
 if(d.id==='mystery'){const r=Math.floor(Math.random()*5);
  if(r===0){p.drunk+=.4;msg='DOUBLE TROUBLE! +40%'}else if(r===1){S.effects.moon=1;p.drunk+=.1;msg='MOON GRAVITY next shot!'}else if(r===2){S.effects.rocket=1;p.drunk+=.15;msg='ROCKET BALL next shot!'}else if(r===3){p.drunk=0;p.hang=0;msg='Instant sobriety?!'}else{S.effects.giant=1;p.drunk+=.12;msg='GIANT BALL!'}}
 else p.drunk+=d.amt;
 if(d.id==='keg'){return startKeg(d)}
 if(d.id==='vsoda'){p.steady=1;p.crisp=1;setTimeout(()=>quip('vsoda',1),1800)}if(d.id==='jager'){p.jager=1;setTimeout(()=>quip('jager',1),1800)}if(d.id==='tequila'){p.teq=2;setTimeout(()=>quip('tequila',1),1800)}if(d.id==='absinthe'){p.absH=S.hole;setTimeout(()=>quip('absinthe',1),1800)}if(d.id==='energy'){p.turbo=1;setTimeout(()=>quip('energy',1),1800)}if(d.id==='moon'){p.moon=1;setTimeout(()=>quip('moon',1),1800)}if(d.id==='hot'){S.redT=3.2;p.hang=0;setTimeout(()=>{SFX.sizzle();S.shake=.6;quip('hot',1)},900)}
 if(d.id==='beer'||d.id==='screw')p.steady=1;if(d.id==='vodka'){p.vodka=1;setTimeout(()=>quip('vodka',1),1800)}if(d.id==='screw')setTimeout(()=>quip('screw',1),1800);if(d.id==='whiskey')p.boost=1;if(!['mystery','cola'].includes(d.id))p.hang=0;
 p.drunk=Math.max(0,p.drunk);p.peak=Math.max(p.peak,p.drunk);
 startChug(d,msg,old)}
function startChug(d,msg,old){S.cut={t:0,d,msg,dur:d.shot?1.3:1.9,burped:false,old};S.phase='chug';const u=S.golfer.userData;u.can.visible=true;u.club.visible=false;u.canM.color.setHex(d.can);u.can.scale.set(d.shot?.7:d.cup?1.3:1,d.shot?.45:d.cup?.8:1,d.shot?.7:d.cup?1.3:1);$('skip').style.display='block';$('bottom').style.visibility='hidden';updHUD();if(d.shot){SFX.click();setTimeout(SFX.slam,700);setTimeout(()=>{S.shake=.5;toast('SLAM! 🧊',true,700)},700)}else{SFX.open();setTimeout(SFX.glug,250)}show('drinks',false)}
function endChug(){const c=S.cut;if(!c)return;S.cut=null;const u=S.golfer.userData;u.can.visible=false;u.club.visible=true;setPose(S.golfer,'address');u.body.rotation.set(0,0,0);$('skip').style.display='none';$('bottom').style.visibility='';S.phase='aim';
 const p=P();if(!c.burped){SFX.burp()}if(c.msg)toast(c.msg);else toast(`${c.d.e} ${c.d.n}!`,true);
 if(p.drunk>=1){p.drunk=.65;p.strokes++;S.shake=1;toast('💀 BLACKOUT! +1 stroke');SFX.bad();buzz([100,50,200])}
 const lvl=l=>l<.25?0:l<.5?1:l<.75?2:3;if(lvl(p.drunk)>lvl(c.old))setTimeout(()=>toast(['','Tipsy 🙂','Buzzed 🥴','WASTED 🤪'][lvl(p.drunk)],true),600);
 updHUD();snapCam();calcHint()}
function startKeg(d){const p=P();S.phase='keg';S.keg={t:0,hold:0,held:false,start:p.drunk,d,gl:0};show('drinks',false);$('keg').style.display='flex';$('bottom').style.visibility='hidden';const u=S.golfer.userData;u.club.visible=false;u.can.visible=false;if(!kegMesh){kegMesh=new THREE.Group();mesh(G.cyl,0xa8a8a8,0,0,0,kegMesh).scale.set(.45,.75,.45);for(const y of[-.25,.25])mesh(G.cyl,0x666666,0,y,0,kegMesh).scale.set(.47,.06,.47);mesh(G.cyl,0x333333,0,.42,0,kegMesh).scale.set(.06,.12,.06);scene.add(kegMesh)}kegMesh.visible=true;SFX.open();toast('🛢️ KEG STAND!',false,1200)}
let kegMesh=null;
function updKeg(dt){const k=S.keg,p=P();k.t+=dt;const btn=$('kegBtn');
 if(k.held){k.hold+=dt;p.drunk=Math.min(.99,p.drunk+dt*(.2+k.hold*.14));k.gl-=dt;if(k.gl<=0){k.gl=.28;SFX.glug();buzz(15)}S.shake=Math.max(S.shake,.12+k.hold*.05)}
 $('kFill').style.width=Math.min(100,p.drunk*100)+'%';$('kTxt').textContent=`${k.hold.toFixed(1)}s · buzz ${Math.round(p.drunk*100)}%`;btn.textContent=k.held?'CHUG CHUG CHUG!':'HOLD TO CHUG';
 if(p.drunk>=.99||(!k.held&&k.hold>.15)||(k.t>6&&!k.held))endKeg()}
function endKeg(){const k=S.keg,p=P();if(!k)return;S.keg=null;$('keg').style.display='none';if(kegMesh)kegMesh.visible=false;S.golfer.rotation.z=0;S.golfer.position.y=0;
 const gain=Math.max(0,p.drunk-k.start),bonus=Math.round(gain*400)+(k.hold>2.5?100:0);p.style+=bonus;p.peak=Math.max(p.peak,p.drunk);p.hang=0;p.steady=0;
 const msg=gain>0?`🛢️ KEG STAND! ${k.hold.toFixed(1)}s\n+${Math.round(gain*100)}% buzz · +${bonus} style`:'Chickened out of the keg 🐔';if(gain>.1)quip('keg',1);
 S.cut={t:0,d:k.d,msg,dur:0,burped:false,old:k.start};S.phase='chug';endChug()}
// ---------- distance help ----------
function simShot(ci,pw,dir){const c=CLUBS[ci],p=P(),b=S.ballP.clone(),v=new V3(),d=dirV(dir),dt=1/60;let air=c.id!=='putter';const roll=c.roll||1;
 if(!air){const dist=c.carry*pw*(1+.3*p.drunk);v.copy(d).multiplyScalar(Math.sqrt(2*1.7*dist))}
 else{const carry=c.carry*pw*drunkMult(p)*(S.effects.rocket?1.8:1)*1.05*lieMult(c,surface(b.x,b.z)),th=c.ang*Math.PI/180,vv=Math.sqrt(carry*9.8/Math.sin(2*th));v.copy(d).multiplyScalar(vv*Math.cos(th));v.y=vv*Math.sin(th)}
 const wv=dirV(course.wind.a),ws=course.wind.s*windRes()*.11,g=9.8*(S.effects.moon?.45:1);
 for(let i=0;i<1200;i++){if(air){v.y-=g*dt;v.x+=wv.x*ws*dt;v.z+=wv.z*ws*dt;b.addScaledVector(v,dt);if(b.y<=.35){b.y=.35;const s=surface(b.x,b.z);if(s==='water'||s==='oob')break;v.y=-v.y*REST[s];const k=KEEP[s]*roll+(1-roll)*.3;v.x*=k;v.z*=k;if(v.y<1.8){v.y=0;air=false}}}
  else{const s=surface(b.x,b.z);if(s==='water'||s==='oob')break;const sp=Math.hypot(v.x,v.z),ns=Math.max(0,sp-FR[s]*dt);if(sp>0){v.x*=ns/sp;v.z*=ns/sp}b.addScaledVector(v,dt);if(ns<.12)break}}
 return (b.x-S.ballP.x)*d.x+(b.z-S.ballP.z)*d.z}
function calcHint(){if(!course||!P())return;const d=holeDist(),dir=Math.atan2(course.pin[0]-S.ballP.x,-(course.pin[1]-S.ballP.z)),s=surface(S.ballP.x,S.ballP.z),pw=[];
 for(let ci=0;ci<CLUBS.length;ci++){if(simShot(ci,1,dir)<d){pw[ci]=1;continue}let lo=.02,hi=1;for(let k=0;k<10;k++){const m=(lo+hi)/2;if(simShot(ci,m,dir)<d)lo=m;else hi=m}pw[ci]=(lo+hi)/2}
 let rec=4;if(!(s==='green'||d<22)){rec=0;for(let ci=3;ci>=0;ci--){if(pw[ci]<=.92){rec=ci;break}}}S.hint={pw,rec,d,lie:s}}
// ---------- input ----------
let drag=null;
canvas.addEventListener('pointerdown',e=>{if(S.mode==='play'&&S.phase==='chug'){endChug();return}
 if(S.mode!=='play')return;if(S.phase==='acc'){shoot();return}if(S.phase==='aim'){drag={x:e.clientX,a:S.aimT=S.aim};show('drinks',false)}});
canvas.addEventListener('pointermove',e=>{if(drag&&S.phase==='aim'){const h=HV();S.aimT=drag.a+(e.clientX-drag.x)*.006*(S.club===4?.4:1)*((h>.55)!==!!P().teq?-1:1);if(P().teq&&!S.teqQ){S.teqQ=1;toast('🌵 Tequila: left is right!',true,1300)}if(h>.55&&!S.invQ){S.invQ=1;toast('🙃 Controls feel… backwards?',true,1500)}}});
addEventListener('pointerup',()=>drag=null);
const sw=$('bSwing');
sw.addEventListener('pointerdown',e=>{e.preventDefault();try{sw.setPointerCapture(e.pointerId)}catch(_){}ac();if(S.mode!=='play')return;if(S.phase==='aim'){S.phase='power';S.power=0;S.pDir=1;sw.classList.add('hold');sw.textContent='RELEASE';$('power').style.display='block'}else if(S.phase==='acc')shoot()});
const swUp=e=>{e.preventDefault();if(S.phase==='power'){S.lockedPow=clamp(S.dispPow,.02,1);S.phase='acc';S.acc=-1;S.aDir=1;sw.classList.remove('hold');sw.textContent='TAP!';$('acc').style.display='block';SFX.click()}};sw.addEventListener('pointerup',swUp);sw.addEventListener('pointercancel',swUp);addEventListener('pointerup',e=>{if(S.phase==='power')swUp(e)});
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('touchmove',e=>{if(!e.target.closest('#cOpts'))e.preventDefault()},{passive:false});
let lastTouch=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTouch<300&&!e.target.closest('button,input,.sw,.tx,.dk'))e.preventDefault();lastTouch=n},{passive:false});
// ---------- shooting ----------
function drunkMult(p){return (1+.6*p.drunk)*(p.hang?(EQ().club==='candy'?.9:.82):1)*(p.boost?1.1:1)*(p.vodka?1.2:1)*(p.crisp?1.08:1)*(p.moon?1.35:1)*(EQ().club==='gold'?1.03:1)}
function shoot(){const p=P(),c=CLUBS[S.club];S.phase='swing';S.swingT=0;$('acc').style.display='none';$('power').style.display='none';sw.textContent='SWING';SFX.swing();
 const a=S.acc,perfect=Math.abs(a)<.08;if(perfect){toast('PERFECT!',true,1200);SFX.perfect()}
 S.pending={a,perfect,c}}
function launch(){const p=P(),{a,perfect,c}=S.pending,pw=S.lockedPow;const h=HV();
 if(h>0&&Math.random()<.14*h){p.strokes++;S.phase='aim';p.steady=0;p.boost=0;p.vodka=0;SFX.swing();toast('🙈 Swung at the WRONG ball!\n+1 stroke',false,2000);quip('wasted',1);S.shake=.4;buzz(80);updHUD();return}let mult=drunkMult(p)*lieMult(c,surface(S.ballP.x,S.ballP.z));if(S.effects.rocket)mult*=1.8;
 const dir=S.aim+S.wob+rand(-.07,.07)*h+a*.13*(c.id==='putter'?.35:1)+(Math.random()-.5)*.08*p.drunk+(p.moon&&Math.random()<.3?(S.black=1.8,toast('🌑 Moonshine blackout…\nwhere did it go?!',false,1800),SFX.bad(),rand(-.9,.9)):0);
 S.shotStart.copy(S.ballP);S.lastP.copy(S.ballP);p.strokes++;S.curve=c.id==='putter'?0:a*7*(1+p.drunk);S.flightT=0;trailPts=[];
 const d=dirV(dir);
 if(c.id==='putter'){const dist=c.carry*pw*(1+.3*p.drunk);const v=Math.sqrt(2*1.7*dist);S.ballV.copy(d).multiplyScalar(v);SFX.putt()}
 else{const carry=c.carry*pw*mult*(perfect?1.05:1)*(1-Math.abs(a)*.15),th=c.ang*Math.PI/180,g=9.8*(S.effects.moon?.45:1);const v=Math.sqrt(carry*9.8/Math.sin(2*th));S.ballV.copy(d).multiplyScalar(v*Math.cos(th));S.ballV.y=v*Math.sin(th);SFX.hit(pw);S.shake=.25+pw*.3;buzz(30);
  burst(S.ballP.clone(),10,[0x5aa840,0x7a4b25,0xffffff],4,.2,3,.6)}
 const jg=p.jager;p.steady=0;p.boost=0;p.vodka=0;p.crisp=0;p.moon=0;p.jager=0;S.effects.rocket=0;S.slowT=(c.id!=='putter'&&S.ballV.length()>40)?.9:0;if(jg&&c.id!=='putter'){S.slowT=2.4;S.flash=1;toast('💣 BULLET TIME',true,1200)}if(S.slowT){S.flash=1;if(p.drunk>.4)toast('🔥 SEND IT!',true,900)}S.phase='fly';S.airborne=c.id!=='putter';S.bounces=0;S.shotClub=c;S.shotDrunk=p.drunk;
 if(S.effects.giant){ball.scale.setScalar(3)}}
function settle(){const p=P(),s=surface(S.ballP.x,S.ballP.z);if(p.teq){p.teq--;S.teqQ=0}
 const carried=S.shotStart.distanceTo(new V3(S.ballP.x,S.shotStart.y,S.ballP.z));
 if(S.shotClub.id!=='putter'&&carried>=200&&S.shotDrunk>=.5){p.style+=100;toast(`🔥 LIQUID COURAGE! ${Math.round(carried)}m\n+100 style`);SFX.cheer();buzz([40,40,40])}
 else if(carried>=240){p.style+=50;toast(`BOOMER! ${Math.round(carried)}m`,true)}
 S.effects.moon=0;if(S.effects.giant){S.effects.giant=0;ball.scale.setScalar(1)}
 // sober-up per stroke
 p.drunk=Math.max(0,p.drunk-.05);
 if(p.peak>=.7&&p.drunk<.35&&!p.hang){p.hang=1;p.peak=p.drunk;toast('🤕 HANGOVER!\nweak swings until you drink something',true,3000);SFX.bad();quip('hang',1)}
 if(S.shotClub.id!=='putter'&&holeDist()>S.shotStart.distanceTo(new V3(course.pin[0],.35,course.pin[1]))-20&&s!=='green')quip('bad');
 if(p.strokes>=course.par+5){toast('Picked up. Max strokes!',true);p.strokes=course.par+5;return finishHole()}
 S.phase='aim';if(s==='green'||holeDist()<25)setClub(4);else if(holeDist()<75)setClub(3);else if(S.club===4||S.club===3)setClub(2);else if(S.club===0&&s!=='fairway'&&s!=='rough')setClub(2);else if(S.club===0&&s==='rough')setClub(1);
 aimAtPin();updHUD();if(s==='sand')quip('sand');else if(p.drunk>.75&&Math.random()<.6)quip('wasted');else if(p.drunk>.55&&Math.random()<.5)quip('drunk');else if(carried>150&&s==='fairway')quip('good');
 const sn={sand:'In the sand 🏖️',rough:'In the rough',fairway:'Fairway!',green:'On the green!',ice:'On the ice ⛸️'}[s];if(sn)toast(sn,true,1300);calcHint()}
function penalty(kind){const p=P();p.strokes++;S.ballP.copy(S.lastP);S.ballV.set(0,0,0);S.airborne=false;
 if(kind==='water'){SFX.splash();burst(S.splashP,30,[0x8fd3ff,0xffffff,0x2f9be0],5,.3,8);toast('SPLASH! 💦 +1',true);quip('water',1)}else{SFX.bad();toast('Out of bounds! +1',true);quip('oob',1)}buzz(80);
 S.phase='wait';setTimeout(()=>{S.phase='aim';p.drunk=Math.max(0,p.drunk-.05);aimAtPin();updHUD();snapCam();calcHint()},1200)}
function holed(){const p=P();S.celebT=0;SFX.cup();S.phase='holed';ball.visible=false;buzz([50,30,50,30,120]);
 const rel=p.strokes-course.par;const nm=p.strokes===1?'HOLE IN ONE!!!':{'-3':'ALBATROSS!','-2':'EAGLE!','-1':'BIRDIE!','0':'PAR','1':'Bogey','2':'Double Bogey'}[rel]||`+${rel}… yikes`;
 if(p.strokes===1){p.style+=1000;SFX.fanfare();for(let k=0;k<4;k++)setTimeout(()=>burst(new V3(course.pin[0],1,course.pin[1]),60,[0xff3030,0xffd23f,0x3ccf6e,0x1fa3ff,0xff5fd2],10,.4,14,2.5),k*300);S.shake=1.2;toast('⛳ HOLE IN ONE!!! ⛳\n+1000 style')}
 else{toast(nm);if(rel<0){SFX.fanfare();p.style+=200*-rel;burst(new V3(course.pin[0],1,course.pin[1]),50,[0xff3030,0xffd23f,0x3ccf6e,0x1fa3ff],8,.35,10,2)}else SFX.cheer()}
 if(p.drunk>=.5&&rel<=0){p.style+=150;setTimeout(()=>toast('🍻 Drunken Master +150',true),1200)}
 setTimeout(()=>{if(S.hole<HOLES.length-1)startCart();else finishHole()},2600)}
function finishHole(){const p=P();p.scores[S.hole]=p.strokes;ball.visible=true;S.phase='done';
 if(S.cur<S.players.length-1){S.cur++;startTurn()}else{S.cur=0;showCard(true)}}
function showCard(advance){const done=advance&&S.hole===HOLES.length-1;S.mode='card';screen('card');$('cardTitle').textContent=done?'🏆 Final Scorecard':'Scorecard';
 let h='<table><tr><th>Hole</th>'+HOLES.map((x,i)=>`<th>${i+1}</th>`).join('')+'<th>Tot</th><th>Style</th></tr><tr><td>Par</td>'+HOLES.map(x=>`<td>${x.par}</td>`).join('')+`<td>${HOLES.reduce((a,x)=>a+x.par,0)}</td><td></td></tr>`;
 const res=[];for(const p of S.players){let tot=0,par=0;h+=`<tr><td style="color:${p.c.shirt}">${esc(p.c.name)}</td>`+HOLES.map((x,i)=>{const s=p.scores[i];if(s==null)return'<td>-</td>';tot+=s;par+=x.par;return`<td class="${s<x.par?'under':s>x.par?'over':''}">${s}</td>`}).join('')+`<td><b>${tot}</b> (${tot-par>0?'+':''}${tot-par})</td><td>${p.style}</td></tr>`;res.push({p,tot,rel:tot-par})}
 h+='</table>';if(done){res.sort((a,b)=>a.tot-b.tot||b.p.style-a.p.style);h+=`<h2>${esc(res[0].p.c.name)} wins! 🍾</h2>`;const cid=COURSES[CI].id,bk='best_'+cid,b=LS.get(bk,null);if(!b||res[0].tot<b.score){LS.set(bk,{score:res[0].tot,rel:res[0].rel,name:res[0].p.c.name});h+='<div>NEW COURSE RECORD! 🏆</div>';SFX.fanfare()}
  if(!S.paid){S.paid=1;const sty=S.players.reduce((a,p)=>a+p.style,0),under=S.players.reduce((a,p)=>a+p.scores.filter((x,i)=>x!=null&&x<HOLES[i].par).length,0),earn=25+Math.round(sty/8)+10*under;addCoins(earn);const cs0=LS.get('cstyle',0),cs1=cs0+sty;LS.set('cstyle',cs1);SFX.coin();
   h+=`<div class="earn">🪙 +${earn} coins <small>(round 25 · style ${Math.round(sty/8)} · under-par ${10*under})</small>${S.roundCoins?`<br><small>+ ${S.roundCoins} 🪙 already won in cart dashes</small>`:''}<br>Bank: 🪙 ${coins()}</div>`;
   const was=cleared().includes(cid);if(!was){LS.set('cleared',[...LS.get('cleared',[]),cid]);const nx=COURSES[CI+1];if(nx&&!owned().includes('course:'+nx.id))setTimeout(()=>celebrate(nx.e,nx.n,'New course unlocked!'),900)}
   for(const[th2,id]of MILESTONES)if(cs0<th2&&cs1>=th2)setTimeout(()=>grant(id,`${th2.toLocaleString()} career style!`),1600)}}
 $('cardTbl').innerHTML=h;$('bCardGo').textContent=done?'Back to Title':advance?'Next Hole ▶':'Back';
 $('bCardGo').onclick=()=>{SFX.click();if(done){S.mode='title';screen('title');bestTxt()}else if(advance){S.hole++;S.cur=0;startTurn()}else{S.mode='paused';screen('pause')}};
 S.cardAdv=advance}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const QUIPS={
 water:['Caddie: Fish thank you for the gift.','Caddie: That ball is sleeping with the fishes.','Caddie: Maybe drink LESS of the lake next time.','Caddie: Splash zone! Bring a snorkel.'],
 oob:['Caddie: That ball is in another postal code.','Caddie: Another time zone called, they found your ball.','Caddie: Bold. Wrong, but bold.'],
 tree:['Caddie: The tree had right of way.','Caddie: Nature 1, You 0.','Caddie: That branch saw everything.'],
 good:['Caddie: Absolute laser!','Caddie: Did you just… meant to do that?','Caddie: Pure. Chef\'s kiss.','Caddie: Tour-card worthy, honestly.'],
 drunk:['Caddie: Are there two flags or is it me?','Caddie: You\'re swaying like a windmill.','Caddie: Remember, the ball is the small white one.','Caddie: I\'m legally obligated to drive the cart.','Caddie: Hold my clubs. And my beer.'],
 hang:['Caddie: Sunglasses on. Voices down.','Caddie: Your swing has a headache.'],
 sand:['Caddie: Welcome to the beach!','Caddie: Build a sandcastle while you\'re there.'],
 bad:['Caddie: I\'ll tell everyone it was the wind.','Caddie: Let\'s call that a practice swing.','Caddie: Hey, at least you\'re having fun.'],
 vodka:['Caddie: Straight vodka?! Bold strategy.','Caddie: Your aim just left the building.','Caddie: Cheers! Now hit it to the next county.'],
 screw:['Caddie: Ah, a classy screwdriver. Vitamin C!','Caddie: Smooth sipper. Steady hands, champ.'],
 wasted:['Caddie: You just addressed my golf bag.','Caddie: The ball is the one NOT spinning, champ.','Caddie: I see three flags. Aim for the middle one.','Caddie: Should I call you a cab? Or a cart?','Caddie: Left is right now. Good luck.'],
 vsoda:['Caddie: Vodka soda. Zero carbs, all chaos.','Caddie: Crisp. Like your next drive.'],
 jager:['Caddie: Jäger Bomb! Time is… slowing… down…','Caddie: Everything is in slow-mo, Neo.'],
 tequila:['Caddie: Tequila! Your left hand is now your right hand.','Caddie: One tequila, two tequila, three tequila, floor.'],
 keg:['Caddie: The crowd goes WILD!','Caddie: I have never been prouder or more concerned.','Caddie: USA! USA! …wait, we\'re golfing.'],
 absinthe:['Caddie: Don\'t trust the extra flags. Or the hot tub.','Caddie: The green fairy says hi.','Caddie: Is the green… bubbling?'],
 energy:['Caddie: Your heart is doing a drum solo. Cart goes VROOM.','Caddie: Wings? No. Turbo? Yes.'],
 moon:['Caddie: Grandpa\'s recipe. Godspeed.','Caddie: That jug has three X\'s on it. THREE.'],
 hot:['Caddie: Your face is the color of the flag.','Caddie: Sobering, yes. Painful, also yes.','Caddie: Milk! Somebody get this golfer milk!'],
 cart:['Caddie: Seatbelts are a suggestion.','Caddie: The cart is NOT a monster truck.','Caddie: That\'s coming out of your deposit.','Caddie: Wheee!']};
let lastQ=0;function quip(k,force){const n=performance.now();if(!force&&n-lastQ<3500)return;lastQ=n;const a=QUIPS[k];setTimeout(()=>toast('🧢 '+a[Math.floor(Math.random()*a.length)],true,2600),700)}
// ---------- cart dash ----------
let myCart=null;const ctl={gas:0,brake:0,wheel:0};
function distPathPt(px,pz,p){let m=1e9,bi=0;for(let i=0;i<p.length-1;i++){const d=distSeg(px,pz,p[i],p[i+1]);if(d<m){m=d;bi=i}}return[m,bi]}
const MARKN=260;const marks=new THREE.InstancedMesh((()=>{const g=new THREE.PlaneGeometry(.32,.7);g.rotateX(-Math.PI/2);return g})(),new THREE.MeshBasicMaterial({color:0x1a1a1a,transparent:true,opacity:.5,depthWrite:false}),MARKN);marks.frustumCulled=false;scene.add(marks);let markI=0;const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new V3(),_p=new V3();
function clearMarks(){_m4.makeScale(0,0,0);for(let i=0;i<MARKN;i++)marks.setMatrixAt(i,_m4);marks.instanceMatrix.needsUpdate=true}clearMarks();
function addMark(x,z,a){_q.setFromAxisAngle(new V3(0,1,0),a);_s.set(1,1,1);_p.set(x,.125,z);_m4.compose(_p,_q,_s);marks.setMatrixAt(markI,_m4);markI=(markI+1)%MARKN;marks.instanceMatrix.needsUpdate=true}
function makeDuck(){const d=new THREE.Group();mesh(G.sph,0xffffff,0,.45,0,d).scale.set(.38,.3,.5);mesh(G.sph,0x2f8f3a,0,.8,.35,d).scale.setScalar(.2);const b=mesh(G.cone,0xff8a1a,0,.78,.6,d);b.scale.set(.07,.2,.07);b.rotation.x=Math.PI/2;for(const s2 of[-1,1])mesh(G.cyl,0xff8a1a,s2*.12,.12,0,d).scale.set(.03,.25,.03);return d}
function startCart(){const c=course;S.phase='cart';ball.visible=false;const pin=new V3(c.pin[0],0,c.pin[1]);const pp=c.full.filter(q=>Math.hypot(q[0]-c.pin[0],q[1]-c.pin[1])>1);const lp=pp[pp.length-1]||[0,0];const back=new V3(c.pin[0]-lp[0],0,c.pin[1]-lp[1]).normalize();const side=new V3(back.z,0,-back.x);
 const start=pin.clone().addScaledVector(back,8),R=srand(S.hole*31+7+CI*101),N=12,L=190,amp=16+R()*8,ph=R()*6;
 const path=[];for(let i=0;i<=N;i++){const f=i/N;const q=start.clone().addScaledVector(back,f*L).addScaledVector(side,Math.sin(f*Math.PI*2.4+ph)*amp*Math.min(1,f*3));path.push([q.x,q.z])}
 let len=0;for(let i=0;i<N;i++)len+=Math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]);
 const tgt=new V3(path[N][0],0,path[N][1]);const PW=7.5;
 const pg=new THREE.Group();courseG.add(pg);const pathM=MC(TH.path),edgeM=MC(TH.night?0x00ffcc:0xffffff);
 const segA=[];for(let i=0;i<N;i++){const a=path[i],b=path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);segA.push(ang);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(PW,l+.5),pathM);m.rotation.set(-Math.PI/2,0,ang);m.position.set((a[0]+b[0])/2,.12,(a[1]+b[1])/2);m.receiveShadow=true;pg.add(m);
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.PlaneGeometry(.35,l+.5),edgeM);e.rotation.set(-Math.PI/2,0,ang);const nx=Math.cos(ang),nz=-Math.sin(ang);e.position.set((a[0]+b[0])/2+nx*s*PW/2,.13,(a[1]+b[1])/2+nz*s*PW/2);pg.add(e)}
  const dsh=new THREE.Mesh(new THREE.PlaneGeometry(.2,l*.5),MC(0xffd23f));dsh.rotation.set(-Math.PI/2,0,ang);dsh.position.set((a[0]+b[0])/2,.125,(a[1]+b[1])/2);pg.add(dsh);
  const j=new THREE.Mesh(new THREE.CircleGeometry(PW/2,16),pathM);j.rotation.x=-Math.PI/2;j.position.set(b[0],.115,b[1]);pg.add(j)}
 const ptAt=(i,f,lat)=>{const a=path[i],b=path[i+1],ang=segA[i],nx=Math.cos(ang),nz=-Math.sin(ang);return[a[0]+(b[0]-a[0])*f+nx*lat,a[1]+(b[1]-a[1])*f+nz*lat,ang]};
 // scenery: trees + benches + parked carts off the path edges
 for(let i=1;i<N;i++){const ang=segA[i],nx=Math.cos(ang),nz=-Math.sin(ang),a=path[i];
  for(const s of[-1,1]){if(R()<.55){const o=PW/2+3+R()*7;makeTree(a[0]+nx*s*o,a[1]+nz*s*o,.7+R()*.4)}}
  const r=R(),s=R()<.5?-1:1,[x,z]=ptAt(i,.5,s*(PW/2+1.6));
  if(r<.25){const bn=new THREE.Group();mesh(G.box,0x8b5a2b,0,.6,0,bn).scale.set(2.4,.15,.7);mesh(G.box,0x8b5a2b,0,1.1,-.3,bn).scale.set(2.4,.6,.12);for(const q of[-1,1])mesh(G.box,0x333333,q*1,.3,0,bn).scale.set(.12,.6,.6);bn.position.set(x,0,z);bn.rotation.y=ang+Math.PI/2*s;courseG.add(bn);trees.push({x,z,r:1.2,h:2,kind:'bench'})}
  else if(r<.45){const pc=makeCart(['classic','fire','camo','pink'][Math.floor(R()*4)]);pc.position.set(x,0,z);pc.rotation.y=ang+R();courseG.add(pc);trees.push({x,z,r:1.7,h:3,kind:'cart'})}}
 // ramps
 const ramps=[];for(const i of[3,8]){const [x,z,ang]=ptAt(i,.5,0);const rg=new THREE.Group();rg.position.set(x,0,z);rg.rotation.y=ang;const th=Math.atan2(1.3,6);const rp=mesh(G.box,0xffcc33,0,.62,0,rg);rp.scale.set(4.6,.22,6.1);rp.rotation.x=-th;for(let k=-1;k<=1;k++){const st=mesh(G.box,0x222222,k*1.5,.66,0,rg);st.scale.set(.5,.23,6.12);st.rotation.x=-th}const sd=mesh(G.box,0x555555,0,.65,3,rg);sd.scale.set(4.6,1.3,.2);courseG.add(rg);ramps.push({x,z,ang})}
 // cones
 const cones=[];for(let i=1;i<N;i++){if(i===3||i===8)continue;const n=R()<.6?2:0;for(let k=0;k<n;k++){const[x,z]=ptAt(i,.25+k*.35,(R()-.5)*PW*.7);const cg=new THREE.Group();mesh(G.cone,0xff7a1a,0,.45,0,cg).scale.set(.32,.9,.32);mesh(G.box,0xff7a1a,0,.04,0,cg).scale.set(.7,.08,.7);mesh(G.cyl,0xffffff,0,.5,0,cg).scale.set(.2,.1,.2);cg.position.set(x,0,z);courseG.add(cg);cones.push({g:cg,x,z,v:null})}}
 // duck crossing
 const ducks=[];{const i=5,[x,z,ang]=ptAt(i,.5,0);const sg=new THREE.Group();mesh(G.cyl,0x888888,0,1.2,0,sg).scale.set(.06,2.4,.06);const sb=mesh(G.box,0xffd23f,0,2.5,0,sg);sb.scale.set(1.2,1.2,.08);sb.rotation.z=Math.PI/4;const [sx,sz]=ptAt(i,.1,PW/2+1.4);sg.position.set(sx,0,sz);sg.rotation.y=ang;courseG.add(sg);
  for(let k=0;k<4;k++){const d=makeDuck();d.scale.setScalar(1.3);courseG.add(d);ducks.push({g:d,cx:x,cz:z,nx:Math.cos(ang),nz:-Math.sin(ang),ph:k*.9,flee:0,hit:0,fx:0,fz:0})}}
 // sprinklers
 const sprinks=[];for(const i of[7,10]){const s=R()<.5?-1:1,[x,z]=ptAt(i,.4,s*(PW/2-.6));const sg=new THREE.Group();mesh(G.cyl,0x444444,0,.25,0,sg).scale.set(.15,.5,.15);mesh(G.sph,0x888888,0,.55,0,sg).scale.setScalar(.15);sg.position.set(x,0,z);courseG.add(sg);sprinks.push({x,z,a:R()*6,s})}
 // checkpoint gates
 const cps=[];for(const i of[4,9]){const[x,z,ang]=ptAt(i,0,0);const gg=new THREE.Group();gg.position.set(x,0,z);gg.rotation.y=ang;for(const s of[-1,1]){mesh(G.cyl,0xffffff,s*(PW/2+.4),1.8,0,gg).scale.set(.12,3.6,.12);const fl=mesh(G.box,0xff3030,s*(PW/2+.4)+.5*s,3.2,0,gg);fl.scale.set(1,.7,.05)}const ban=mesh(G.box,0x1fa3ff,0,3.6,0,gg);ban.scale.set(PW+.8,.5,.08);courseG.add(gg);cps.push({x,z,ang,hit:false,g:gg,ban})}
 // finish tee
 const tee=new THREE.Group();tee.position.copy(tgt);const pad=mesh(G.box,TH.fair,0,.1,0,tee);pad.scale.set(9,.2,9);for(const s of[-1,1]){mesh(G.cyl,0x111111,s*4,2.2,0,tee).scale.set(.15,4.4,.15)}const chk=new THREE.Mesh(new THREE.PlaneGeometry(8,1.2),new THREE.MeshBasicMaterial({map:(()=>{const cv=document.createElement('canvas');cv.width=128;cv.height=16;const x=cv.getContext('2d');for(let i=0;i<16;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#fff':'#111';x.fillRect(i*8,j*8,8,8)}const tx=new THREE.CanvasTexture(cv);tx.magFilter=THREE.NearestFilter;return tx})(),side:THREE.DoubleSide}));chk.position.y=4.4;tee.add(chk);tee.rotation.y=segA[N-1];
 const bc=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,60,16,1,true),new THREE.MeshBasicMaterial({color:0xffdd33,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));bc.position.y=30;tee.add(bc);courseG.add(tee);
 myCart=makeCart(EQ().cart);myCart.scale.setScalar(1.2);myCart.position.copy(start);const a0=Math.atan2(path[1][0]-path[0][0],path[1][1]-path[0][1]);myCart.rotation.y=a0;courseG.add(myCart);
 S.golfer.position.set(.4,.93,-.12);S.golfer.rotation.set(0,0,0);S.golfer.scale.setScalar(.75);myCart.add(S.golfer);
 const gold=Math.round(len/15.5*10)/10,silver=Math.round(len/11.5*10)/10,bronze=Math.round(len/8.5*10)/10;const p=P();const turbo=!!p.turbo;
 S.cartS={v:0,a:a0,t:0,tgt,path,PW,hits:0,done:false,av:0,on:0,tot:0,flip:0,buf:[],stick:0,auto:0,y:0,vy:0,air:0,airT:0,lastG:0,sy:0,svy:0,pitch:0,ramps,cones,ducks,sprinks,cps,medals:[gold,silver,bronze],len,turbo,coneHits:0,wet:0,honkT:0,slow:0,style:0,spin:0,start:false};
 S.camP.copy(start).addScaledVector(back,-10).setY(6);markI=0;clearMarks();
 ctl.gas=ctl.brake=ctl.wheel=0;$('cartUI').style.display='flex';$('cartUI').classList.toggle('lefty',LS.get('hand','right')==='left');show('hud',false);
 toast(`🛺 CART DASH!\n🥇 ${gold}s  🥈 ${silver}s  🥉 ${bronze}s`,true,3000);if(turbo)setTimeout(()=>toast('⚡ ROCKET FUEL TURBO!',true,1400),1500);if(p.drunk>.5)quip('cart',1)}
function honk(){SFX.honk();const cs=S.cartS;if(!cs||!myCart)return;cs.honkT=.3;for(const d of cs.ducks){if(!d.flee&&d.g.position.distanceTo(myCart.position)<30){d.flee=1;d.fx=rand(-1,1);d.fz=rand(-1,1);SFX.quack()}}}
function cartFail(cs,c,msg){cs.hits++;cs.v*=.3;toast(msg,true,900)}
function updCart(dt0,dr){const cs=S.cartS,c=myCart,ud=c.userData;let dt=dt0;if(cs.slow>0){cs.slow-=dt0;dt=dt0*.4}cs.t+=dt;if(cs.done){cs.v*=Math.exp(-dt*3);return}const hcv=HV();
 if(cs.honkT>0)cs.honkT-=dt;
 // ducks + sprinklers animate always
 for(const d of cs.ducks){if(d.flee){d.flee+=dt;d.g.position.x+=d.fx*6*dt;d.g.position.z+=d.fz*6*dt;d.g.position.y+=dt*(d.flee>.4?5:0);d.g.rotation.z=Math.sin(d.flee*30)*.3;if(d.g.position.y>30)d.g.visible=false}else if(!d.hit){const o=Math.sin(S.t*.6+d.ph)*cs.PW*.75;d.g.position.set(d.cx+d.nx*o+d.ph*.3*d.nz,0,d.cz+d.nz*o-d.ph*.3*d.nx);d.g.rotation.y=Math.atan2(d.nx,d.nz)*(Math.cos(S.t*.6+d.ph)>0?1:-1)+(Math.cos(S.t*.6+d.ph)>0?0:Math.PI);d.g.position.y=Math.abs(Math.sin(S.t*8+d.ph))*.08}}
 for(const sp of cs.sprinks){sp.a+=dt*2.4;if(Math.random()<dt*25){const dir=new V3(Math.sin(sp.a),0,Math.cos(sp.a));burst(new V3(sp.x,.7,sp.z),1,[0x8fd3ff,0xffffff],0,.14,5,.8);const pt=parts[parts.length-1];pt.v.set(dir.x*7,4.5,dir.z*7)}}
 if(cs.flip>0){cs.flip-=dt;c.rotation.z+=dt*7;c.rotation.x+=dt*2;c.position.y=Math.sin((1.2-cs.flip)/1.2*Math.PI)*3.5;if(cs.flip<=0){c.rotation.z=0;c.rotation.x=0;c.position.y=0;const[,bi]=distPathPt(c.position.x,c.position.z,cs.path);const q=cs.path[bi],n=cs.path[bi+1];c.position.set(q[0],0,q[1]);cs.a=Math.atan2(n[0]-q[0],n[1]-q[1]);cs.v=0;cs.y=0;cs.air=0}return}
 // inputs (drunk: delay, oversensitive, yanks, sticky pedal)
 cs.buf.push([cs.t,ctl.wheel]);while(cs.buf.length>1&&cs.buf[1][0]<cs.t-(.05+.45*hcv))cs.buf.shift();
 if(hcv>0&&Math.random()<dt*.5*hcv){cs.sw=rand(-1.3,1.3);if(Math.random()<.5)toast(['YANK!','Whoa whoa whoa','Squirrel!!','Wheel has a mind of its own'][Math.floor(Math.random()*4)],true,700)}cs.sw=(cs.sw||0)*Math.exp(-dt*2.5);
 if(dr>.5&&!cs.stick&&Math.random()<dt*.15*dr){cs.stick=1.2;toast('🦶 Pedal STUCK!',true,900)}if(cs.stick>0)cs.stick-=dt;
 let wheel=cs.buf[0][1]*(1+dr*.6+hcv*1.2)+cs.sw+Math.sin(S.t*2.3)*dr*.12+(cs.wet>0?Math.sin(S.t*13)*.5:0);
 let gas=ctl.gas||cs.stick>0?1:0,brake=ctl.brake;
 if(cs.auto){const want=Math.atan2(cs.tgt.x-c.position.x,cs.tgt.z-c.position.z);let df=want-cs.a;df=Math.atan2(Math.sin(df),Math.cos(df));wheel=-clamp(df*2,-1,1);gas=1;brake=0}
 if(cs.air)wheel*=.15;
 const[pd]=distPathPt(c.position.x,c.position.z,cs.path);const onP=pd<cs.PW/2+.5;cs.tot+=dt*(Math.abs(cs.v)>1);if(onP&&Math.abs(cs.v)>1)cs.on+=dt;
 const tb=cs.turbo?1.45:1,vmax=(onP?20:9)*tb;if(gas&&!cs.air)cs.v+=(cs.v<vmax?14*tb:-10)*dt;else if(brake&&!cs.air)cs.v-=(cs.v>0?28:6)*dt;else if(!cs.air)cs.v*=Math.exp(-dt*1.4);cs.v=clamp(cs.v,-6,vmax+6);if(!onP&&cs.v>vmax)cs.v-=12*dt;
 if(cs.turbo&&gas&&cs.v>8&&Math.random()<dt*30){const f2=new V3(Math.sin(cs.a),0,Math.cos(cs.a));burst(c.position.clone().addScaledVector(f2,-2.4).setY(.7),1,[0xff7a1a,0xffd23f,0x4aa0ff],1,.25,1,.35)}
 const steer=-clamp(wheel,-1.6,1.6)*2.2;cs.av=lerp(cs.av,steer,1-Math.exp(-6*dt));cs.a+=cs.av*dt*clamp(cs.v/8,-1,1)+cs.spin*dt;cs.spin*=Math.exp(-dt*3);
 const f=new V3(Math.sin(cs.a),0,Math.cos(cs.a));c.position.addScaledVector(f,cs.v*dt);c.rotation.y=cs.a;
 // ramps / air
 let ground=0;for(const r of cs.ramps){const dx=c.position.x-r.x,dz=c.position.z-r.z,al=dx*Math.sin(r.ang)+dz*Math.cos(r.ang),lat=dx*Math.cos(r.ang)-dz*Math.sin(r.ang);if(Math.abs(lat)<2.5&&al>-3&&al<3)ground=Math.max(ground,(al+3)/6*1.3)}
 if(cs.air){cs.vy-=22*dt;cs.y+=cs.vy*dt;cs.airT+=dt;if(cs.y<=ground){cs.y=ground;cs.air=0;cs.svy=-Math.min(6,Math.abs(cs.vy))*.9;S.shake=Math.max(S.shake,.5);SFX.bounce();buzz(40);burst(c.position.clone().setY(.3),10,[0xcccccc,TH.rough],3,.25,2,.6);if(cs.airT>.45){const sb=Math.round(cs.airT*40);cs.style+=sb;toast(`🚀 AIR TIME ${cs.airT.toFixed(1)}s +${sb}`,true,1100)}cs.airT=0}}
 else{if(cs.lastG>1.1&&ground<.2&&cs.v>5){cs.air=1;cs.vy=3+cs.v*.32;cs.airT=0;SFX.swing()}else cs.y=ground}cs.lastG=ground;
 // suspension
 const bump=(onP?0:Math.sin(cs.t*17)*.5)*Math.abs(cs.v)/15;cs.svy+=(-cs.sy*90-cs.svy*9+bump*25)*dt;cs.sy+=cs.svy*dt;
 const acc=(cs.v-(cs.pv??cs.v))/Math.max(dt,1e-3);cs.pv=cs.v;cs.pitch=lerp(cs.pitch,clamp(-acc*.006,-.08,.08),.15);
 ud.body.position.y=.55+cs.sy*.25;ud.body.rotation.x=cs.pitch+(cs.air?-.12:0);ud.body.rotation.z=lerp(ud.body.rotation.z,cs.av*.05*Math.abs(cs.v)/15,.2);
 c.position.y=cs.y;c.rotation.x=cs.air?-cs.vy*.02:0;
 for(const w of ud.wheels)w.rotation.x+=cs.v*dt/.46;for(const fp of ud.front)fp.rotation.y=clamp(-wheel*.5,-.6,.6);ud.sw.rotation.z=wheel*2;
 // drift smoke + tire marks
 const slip=Math.abs(cs.av)*Math.abs(cs.v);if(!cs.air&&(slip>22||(brake&&cs.v>10))){const rg=new V3(Math.cos(cs.a),0,-Math.sin(cs.a));for(const sd of[-1,1]){const wp=c.position.clone().addScaledVector(f,-1.35).addScaledVector(rg,sd*1.05);if(Math.random()<.5)addMark(wp.x,wp.z,cs.a);if(Math.random()<dt*25){burst(wp.setY(.4),1,[0xdddddd,0xbbbbbb],1.2,.45,1.2,.9);parts[parts.length-1].g=-.15}}if(!cs.drQ&&slip>30){cs.drQ=1;cs.style+=15;toast('💨 DRIFT KING',true,900);setTimeout(()=>cs.drQ=0,2500)}}
 if(!onP&&Math.abs(cs.v)>4&&Math.random()<dt*8)burst(c.position.clone().addScaledVector(f,-2).setY(.3),1,[TH.rough,0x7a4b25],1.5,.2,1.5,.5);
 // collisions: trees/benches/carts
 if(!cs.air)for(const t of(cs.auto?[]:trees)){const dx=c.position.x-t.x,dz=c.position.z-t.z,l=Math.hypot(dx,dz);if(l<t.r+1.8){c.position.x=t.x+dx/l*(t.r+1.9);c.position.z=t.z+dz/l*(t.r+1.9);const hard=Math.abs(cs.v)>13;cs.hits++;S.shake=hard?1:.6;SFX.tree();SFX.bounce();buzz(60);burst(c.position.clone().setY(2),14,[0x2e8b3a,0xffffff,0x3fa34d],5,.3,5);
  if(hard){cs.flip=1.2;cs.slow=1.4;SFX.bad();toast(t.kind==='cart'?'💥 CART-ON-CART CRIME! FLIPPED!':'🤸 FLIPPED IT!',false,1600);quip('cart',1)}else{cs.v=-cs.v*.4;cs.a+=rand(-.6,.6);toast(t.kind==='bench'?'BENCHED! 🪑':t.kind==='cart'?'Fender bender! 🛺':['CRUNCH!','BONK!','OOF!'][cs.hits%3],true,900)}break}}
 // cones
 for(const k of cs.cones){if(k.v){k.v.y-=20*dt;k.g.position.addScaledVector(k.v,dt);k.g.rotation.x+=dt*9;k.g.rotation.z+=dt*6;if(k.g.position.y<0){k.g.position.y=0;k.v.multiplyScalar(.3);if(k.v.length()<.5)k.v.set(0,0,0)}continue}
  if(!cs.auto&&Math.hypot(c.position.x-k.x,c.position.z-k.z)<1.6&&cs.y<1){k.v=f.clone().multiplyScalar(Math.abs(cs.v)*.9+3).add(new V3(rand(-3,3),6+Math.abs(cs.v)*.2,rand(-3,3)));cs.coneHits++;SFX.bounce();tone(260,.1,'square',.08,120);if(cs.coneHits===1||cs.coneHits%3===0)toast(`🚧 CONE! (${cs.coneHits})`,true,700)}}
 // ducks
 if(!cs.auto)for(const d of cs.ducks){if(d.flee||d.hit)continue;if(d.g.position.distanceTo(c.position)<2&&cs.y<1){d.hit=1;d.flee=1;d.fx=rand(-1,1);d.fz=rand(-1,1);SFX.quack();burst(d.g.position.clone().setY(1),16,[0xffffff,0xeeeeee],4,.18,4,1.2);cartFail(cs,c,'🦆 QUACK ATTACK! (-speed)');cs.spin=rand(-2,2)}}
 // sprinklers
 for(const sp of cs.sprinks){if(Math.hypot(c.position.x-sp.x,c.position.z-sp.z)<4.5&&cs.wet<=0&&!cs.auto){cs.wet=1.4;SFX.splash();toast('💦 SPRINKLED! slippery!',true,900);$('flash').style.background='#8fd3ff';S.flash=.8;setTimeout(()=>$('flash').style.background='',600)}}if(cs.wet>0)cs.wet-=dt;
 // checkpoints
 for(const cp of cs.cps){if(cp.hit)continue;const dx=c.position.x-cp.x,dz=c.position.z-cp.z,al=dx*Math.sin(cp.ang)+dz*Math.cos(cp.ang),lat=dx*Math.cos(cp.ang)-dz*Math.sin(cp.ang);if(Math.abs(al)<2.5&&Math.abs(lat)<cs.PW/2+1){cp.hit=true;cp.ban.material=MC(0x3ccf6e);SFX.ding();const n=cs.cps.filter(q=>q.hit).length;toast(`✅ CHECKPOINT ${n}/${cs.cps.length} · ${cs.t.toFixed(1)}s`,true,1000);burst(new V3(cp.x,3.6,cp.z),20,[0x3ccf6e,0xffd23f,0xffffff],5,.25,4,1)}}
 const s=surface(c.position.x,c.position.z);if(s==='water'&&!cs.air){SFX.splash();burst(c.position.clone(),30,[0x8fd3ff,0xffffff],6,.3,8);toast('Cart went for a swim 🛺💦',true);const[,bi]=distPathPt(c.position.x,c.position.z,cs.path);c.position.set(cs.path[bi][0],0,cs.path[bi][1]);cs.v=0;cs.hits++}
 const d2=Math.hypot(c.position.x-cs.tgt.x,c.position.z-cs.tgt.z);const want=Math.atan2(cs.tgt.x-c.position.x,cs.tgt.z-c.position.z);let df=want-cs.a;df=Math.atan2(Math.sin(df),Math.cos(df));
 const m=cs.medals,md=cs.t<=m[0]?'🥇':cs.t<=m[1]?'🥈':cs.t<=m[2]?'🥉':'🐢';const nextM=cs.t<=m[0]?m[0]:cs.t<=m[1]?m[1]:m[2];
 $('cartTxt').innerHTML=`<span style="display:inline-block;transform:rotate(${(-df)*180/Math.PI}deg)">⬆️</span> ${Math.round(d2)}m · <b>${cs.t.toFixed(1)}s</b> ${md}${cs.t<=m[2]?' <small>&lt;'+nextM+'s</small>':''}<br><small>${onP?'🛣️ on path':'🌾 off path'} · ✅ ${cs.cps.filter(q=>q.hit).length}/${cs.cps.length}${cs.turbo?' · ⚡TURBO':''}</small>`;
 if(gas)cs.used=1;if(!cs.auto&&(cs.t>45||d2>300||(cs.t>12&&!cs.used))){cs.auto=1;toast('🧢 Caddie: Scoot over, I\'m driving.',true,1800)}
 if(d2<6||cs.t>70){cs.done=true;const p=P();p.turbo=0;let bonus=0;if(d2<6&&!cs.auto){const frac=cs.tot?cs.on/cs.tot:0,miss=cs.cps.filter(q=>!q.hit).length,ft=cs.t+miss*3;bonus=Math.max(0,Math.round(60+frac*100-cs.t*2-cs.hits*15))+cs.style;if(p.drunk>.5)bonus+=50;p.style+=bonus;
   const mi=ft<=m[0]?0:ft<=m[1]?1:ft<=m[2]?2:3;const coin=[30,18,8,0][mi];if(coin)addCoins(coin);S.roundCoins=(S.roundCoins||0)+coin;SFX.fanfare();
   toast(`🏁 ${['🥇 GOLD!','🥈 SILVER!','🥉 BRONZE!','Made it!'][mi]} ${ft.toFixed(1)}s${miss?` (+${miss*3}s missed gate)`:''}\n${Math.round(frac*100)}% on path · ${cs.coneHits} cones\n+${bonus} style${coin?` · +${coin} 🪙`:''}`,false,2600)}else toast('Caddie parked it. 🙄 No medal.',true);setTimeout(endCart,2200)}}
function cartPose(u,t){const cs=S.cartS;u.legs[0].rotation.set(-1.45,0,.1);u.legs[1].rotation.set(-1.45,0,-.1);u.body.rotation.x=-.05;u.body.position.x=0;
 const w=cs?clamp(ctl.wheel,-1,1):0;u.swing.rotation.set(0,0,-w*.35);u.armL.rotation.set(-1.15,0,-.12);u.armR.rotation.set(-1.15,0,.12);u.club.visible=false;
 if(cs&&cs.flip>0){u.armL.rotation.set(-2.5+Math.sin(t*25)*.8,0,-1.2);u.armR.rotation.set(-2.5+Math.cos(t*23)*.8,0,1.2);u.legs[0].rotation.x=-1+Math.sin(t*20)*.9;u.legs[1].rotation.x=-1-Math.sin(t*20)*.9;u.head.rotation.x=Math.sin(t*18)*.4}
 else if(cs&&cs.air){u.armL.rotation.set(-2.8,0,-.4);u.armR.rotation.set(-2.8,0,.4)}
 if(cs&&cs.honkT>0)u.armR.rotation.set(-1.4,0,-.4);
 S.golfer.position.y=.93+(cs&&cs.flip>0?Math.abs(Math.sin(cs.flip*6))*1.4:0)+(cs&&cs.air?.15:0)}
function endCart(){if(!myCart)return;myCart.remove(S.golfer);scene.add(S.golfer);S.golfer.scale.setScalar(1);S.golfer.position.y=0;courseG.remove(myCart);myCart=null;$('cartUI').style.display='none';ball.visible=true;resize();finishHole()}
// ---------- HUD ----------
function updHUD(){const p=P();if(!p)return;$('hInfo').innerHTML=`<span style="color:${p.c.shirt}">●</span> ${esc(p.c.name)}<br>Hole ${S.hole+1}/${HOLES.length} · Par ${course.par}<br>Stroke ${p.strokes+1}`;
 $('dFill').style.width=Math.round(p.drunk*100)+'%';$('dPct').textContent=Math.round(p.drunk*100)+'%';
 const st=[];if(p.hang)st.push('🤕 Hangover');if(p.steady)st.push('🍺 Steady');if(p.boost)st.push('🥃 Power');if(p.vodka)st.push('🧊 Vodka rush');if(S.effects.moon)st.push('🌙 Moon');if(S.effects.rocket)st.push('🚀 Rocket');if(S.effects.giant)st.push('🎈 Giant');if(p.crisp)st.push('🫧 Crisp');if(p.jager)st.push('💣 Bullet time');if(p.teq)st.push('🌵 Flipped');if(p.absH===S.hole)st.push('🧚 Seeing things');if(p.turbo)st.push('⚡ Cart turbo');if(p.moon)st.push('🏺 Moonshine');st.push(`×${drunkMult(p).toFixed(2)} dist`);$('status').textContent=st.join(' · ');
 $('wTxt').textContent=course.wind.s+' m/s'}
// ---------- camera ----------
function snapCam(){const d=dirV(S.aim);const cp=S.ballP.clone().addScaledVector(d,-11);cp.y=5;S.camP.copy(cp);S.camL.copy(S.ballP).addScaledVector(d,25)}
// ---------- main loop ----------
let last=performance.now();S.wob=0;S.dispPow=0;
function physics(dt){const p=P(),b=S.ballP,v=S.ballV,c=course;
 if(S.airborne){const g=9.8*(S.effects.moon?.45:1);v.y-=g*dt;const wv=dirV(c.wind.a),wr=windRes();v.x+=wv.x*c.wind.s*.11*wr*dt;v.z+=wv.z*c.wind.s*.11*wr*dt;
  // curve
  const hv=Math.hypot(v.x,v.z)||1,cpx=-v.z/hv,cpz=v.x/hv;v.x+=cpx*S.curve*dt;v.z+=cpz*S.curve*dt;
  b.addScaledVector(v,dt);
  // trees
  for(const t of trees){if(b.y<t.h&&Math.hypot(b.x-t.x,b.z-t.z)<t.r+.35){const nx=(b.x-t.x),nz=(b.z-t.z),l=Math.hypot(nx,nz)||1;b.x=t.x+nx/l*(t.r+.4);b.z=t.z+nz/l*(t.r+.4);const dot=(v.x*nx+v.z*nz)/l;v.x=(v.x-2*dot*nx/l)*.35;v.z=(v.z-2*dot*nz/l)*.35;SFX.tree();burst(b.clone(),12,[0x2e8b3a,0x3fa34d],4,.25,2);S.shake=.4;if(!S.tTo){toast('TIMBER! 🌲',true,1000);quip('tree');S.tTo=1;setTimeout(()=>S.tTo=0,1500)}}}
  if(cartObj){const cp=cartObj.position;if(Math.abs(b.x-cp.x)<2.2&&Math.abs(b.z-cp.z)<3.5&&b.y<4){v.x=-v.x*.6+rand(-6,6);v.z=-v.z*.4;v.y=Math.abs(v.y)+6;b.addScaledVector(v,dt*3);SFX.bounce();SFX.bad();toast('BONK! Rogue cart! 🛺',true,1200);S.shake=.6}}
  if(windmill&&b.y<16&&b.y>2&&Math.hypot(b.x-windmill.x,b.z-(windmill.z+3.3))<8&&Math.abs(b.z-(windmill.z+3.3))<1.2){const ang=((windmill.bl.rotation.z%(Math.PI/2))+Math.PI/2)%(Math.PI/2);if(ang<.5){v.z=Math.abs(v.z)*.5;v.x+=rand(-8,8);v.y+=4;SFX.tree();toast('WHACKED by the windmill!',true,1300);S.shake=.6}}
  if(b.y<=.35){b.y=.35;const s=surface(b.x,b.z);if(s==='water'){S.splashP=b.clone();return penalty('water')}if(s==='oob')return penalty('oob');
   const rest=REST[s],keep=KEEP[s];if(s==='ice'&&S.bounces===0){toast('⛸️ Skiiiiid!',true,1000);SFX.putt()}
   if(S.bounces===0){if(s==='sand'){SFX.sand();burst(b.clone(),16,[0xf1df9a,0xe0c070],3,.2,3)}else{SFX.bounce();burst(b.clone(),6,[0x5aa840,0x7a4b25],2,.15,2)}}
   S.bounces++;v.y=-v.y*rest;v.x*=keep*(S.shotClub.roll||1)+(1-(S.shotClub.roll||1))*.3;v.z*=keep*(S.shotClub.roll||1)+(1-(S.shotClub.roll||1))*.3;if(v.y<1.8){v.y=0;S.airborne=false}}
 }else{b.y=.35;const s=surface(b.x,b.z);const sp=Math.hypot(v.x,v.z);
  if(s==='water'){S.splashP=b.clone();return penalty('water')}if(s==='oob')return penalty('oob');
  const dh=Math.hypot(b.x-c.pin[0],b.z-c.pin[1]);if(dh<.9&&sp<7.5)return holed();
  if(dh<.9&&sp>=7.5){v.x*=.8;v.z*=.8}
  const fr=FR[s];const ns=Math.max(0,sp-fr*dt);if(sp>0){v.x*=ns/sp;v.z*=ns/sp}
  // slight drunk drift on green
  b.addScaledVector(v,dt);
  for(const t of trees){if(Math.hypot(b.x-t.x,b.z-t.z)<t.r+.35){v.x*=-.4;v.z*=-.4}}
  if(ns<.12){v.set(0,0,0);return settle()}}
}
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;S.t+=dt;const t=S.t;let hv=HV();
 if(S.mode==='creator'||(S.mode==='title'&&false)){if(cGolfer){cGolfer.rotation.y+=dt*.8;tipsy+=dt*.1;golferMood(cGolfer,(Math.sin(t*.5)*.5+.5)*.6,t,0);const u=cGolfer.userData;u.armL.rotation.z=-.25-Math.sin(t*2)*.08;u.armR.rotation.z=.25+Math.sin(t*2)*.08}
  const w=innerWidth,h=innerHeight,land_=w>h;cCam.aspect=w/h;cCam.updateProjectionMatrix();if(land_){cCam.position.set(2.4,1.4,6);cCam.lookAt(2.4,1,0)}else{cCam.position.set(0,1.9,7.5);cCam.lookAt(0,-.55,0)}
  renderer.setRenderTarget(null);renderer.render(cScene,cCam);return}
 if(S.mode==='title'&&!course){buildHole(0);S.ballP.set(0,.35,0);aimAtPin();S.golfer=makeGolfer(randomChar());scene.add(S.golfer)}
 const p=P()||{drunk:Math.sin(t*.3)*.35+.35,hang:0};const dr=p.drunk;
 if(S.mode==='play'){
  // meters
  const jgs=P()&&P().jager?.35:1;
  if(S.phase==='power'){const sp=1.1*(1+dr*1.4+hv*1.6)*jgs;S.power+=S.pDir*sp*dt;if(S.power>1){S.power=1;S.pDir=-1}if(S.power<0){S.power=0;S.pDir=1}S.dispPow=clamp(S.power+Math.sin(t*14)*.08*dr+Math.sin(t*5.3)*.05*dr+Math.sin(t*23)*.1*hv,0,1);$('pFill').style.height=(S.dispPow*100)+'%'}
  if(S.phase==='acc'){const sp=1.6*(1+dr*1.6+hv*1.4)*(p.steady?.55:1)*jgs*(EQ().club==='wood'?.94:1);S.acc+=S.aDir*sp*dt+Math.sin(t*9)*dr*.9*dt*3+Math.sin(t*17)*hv*dt*4;if(S.acc>1){S.acc=1;S.aDir=-1}if(S.acc<-1){S.acc=-1;S.aDir=1;}$('needle').style.left=((S.acc+1)/2*100)+'%'}
  if(S.phase==='swing'){S.swingT+=dt;if(S.swingT>.22&&S.pending){launch();S.pending=null}if(S.swingT>.6)S.swingT=-1}
  if(S.phase==='fly'){let ts=1;if(S.slowT>0){S.slowT-=dt;ts=.35}const nearCup=!S.airborne&&Math.hypot(S.ballP.x-course.pin[0],S.ballP.z-course.pin[1])<4&&S.ballV.length()<6&&S.ballV.length()>.5;if(nearCup)ts=.45;const pdt=dt*ts,steps=4;for(let i=0;i<steps&&S.phase==='fly';i++)physics(pdt/steps);S.flightT+=dt;if(S.phase==='fly'&&S.flightT>25){S.ballV.set(0,0,0);S.airborne=false;settle()}
   trailPts.push(S.ballP.clone());if(trailPts.length>trailN)trailPts.shift()}
  if(S.phase==='cart'&&myCart)updCart(dt,dr);
  if(S.phase==='keg'&&S.keg)updKeg(dt);
  if(S.phase==='chug'){const c=S.cut;c.t+=dt;if(c.t>1.15&&!c.burped){c.burped=true;SFX.burp();const u=S.golfer.userData;const mp=new V3();u.mouthG.getWorldPosition(mp);for(let i=0;i<14;i++){burst(mp,1,[0xffffff,c.d.col],1.5,.12,2,1);parts[parts.length-1].g=-.3}toast('*BUUURP*',true,900);S.shake=.3;buzz(60)}if(c.t>c.dur)endChug()}
 }
 // laggy aim follow
 if(S.aimT!==undefined&&S.phase==='aim'){const h=HV();S.aim=lerp(S.aim,S.aimT,1-Math.exp(-dt*(14-11*h)))}
 hv=HV();
 // wobble aim
 S.wob=(Math.sin(t*1.3)*.09+Math.sin(t*2.9)*.05)*dr*dr*1.6*(P()&&P().vodka?1.9:1)+(P()&&P().vodka?Math.sin(t*7)*.03:0)+Math.sin(t*2.2+Math.sin(t*.7)*2)*.32*hv*hv;
 if(S.mode==='play'&&(S.phase==='power'||S.phase==='acc')&&hv>0&&Math.random()<dt*.7*hv){S.aim+=rand(-.25,.25);S.hicJolt=1;SFX.hic();S.shake=.35;toast('*HIC!*',true,700);if(S.phase==='acc')S.acc+=rand(-.4,.4)}
 sw.style.transform=hv>0&&S.mode==='play'?`translate(${Math.sin(t*.9)*70*hv}px,${(Math.cos(t*1.3)-1)*60*hv}px) rotate(${Math.sin(t*1.7)*25*hv}deg)`:'';
 // golfer placement
 if(S.golfer&&S.phase==='cart'){golferMood(S.golfer,dr,t,0);animGolfer(S.golfer.userData,'cart',0,t,dr);cartPose(S.golfer.userData,t)}
 else if(S.golfer&&S.phase==='keg'){const g=S.golfer,u=g.userData,d=dirV(S.aim),r=new V3(-d.z,0,d.x),gp=S.ballP.clone().addScaledVector(r,-.9);g.position.set(gp.x,1.75,gp.z);g.rotation.y=Math.atan2(-r.x,-r.z);g.rotation.z=Math.PI;golferMood(g,dr,t,0);u.armL.rotation.set(0,0,-.9);u.armR.rotation.set(0,0,.9);u.swing.rotation.set(0,0,0);const kk=S.keg&&S.keg.held?1:.3;u.legs[0].rotation.x=Math.sin(t*9)*.6*kk;u.legs[1].rotation.x=-Math.sin(t*9)*.6*kk;if(kegMesh)kegMesh.position.set(gp.x,.45,gp.z)}
 else if(S.golfer){const g=S.golfer,u=g.userData;const ad=S.aim+(S.phase==='aim'||S.phase==='power'||S.phase==='acc'?S.wob:0);const d=dirV(ad),r=new V3(-d.z,0,d.x);
  if(S.phase!=='fly'||S.flightT<.8){const gp=S.ballP.clone().addScaledVector(r,-.9);if(S.phase!=='fly'){g.position.set(gp.x,0,gp.z);g.rotation.y=S.phase==='chug'?Math.atan2(-r.x,-r.z):Math.atan2(r.x,r.z)}}
  golferMood(g,dr,t,p.hang||0);
  if(S.phase==='chug')animGolfer(u,'chug',S.cut.d.shot?Math.min(S.cut.t*1.5,1.05)+Math.max(0,S.cut.t-.7):S.cut.t,t,dr);else if(S.phase==='holed'){S.celebT=(S.celebT||0)+dt;animGolfer(u,'celebrate',S.celebT,t,dr);g.position.y=Math.abs(Math.sin(S.celebT*7))*.35}else if(S.swingT>=0){animGolfer(u,'swing',S.swingT,t,dr);if(hv>0){u.body.rotation.z+=Math.sin(S.swingT*25)*.25*hv;g.position.x+=Math.sin(t*11)*.04*hv}}else animGolfer(u,S.phase==='power'?'power':'idle',0,t,dr);if(S.phase!=='holed'){g.position.y=0;if(S.phase!=='chug')u.club.visible=true}g.rotation.z=0}
 // world anim
 if(windmill)windmill.bl.rotation.z+=dt*1.1;if(cartObj){cartObj.position.x=Math.sin(t*.45)*38;cartObj.rotation.y=Math.cos(t*.45)>0?Math.PI/2:-Math.PI/2}
 if(flag){const pa=flag.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i)+.8;pa.setZ(i,Math.sin(t*6+x*3)*.15*x)}pa.needsUpdate=true;const wa=course.wind.a;pinG.rotation.y=-wa+Math.PI/2}
 ghosts.forEach((g,i)=>{const on=hv>0&&S.mode==='play'&&ball.visible&&(i===0||hv>.5);g.visible=on;if(on){const s=i?-1:1;g.position.set(S.ballP.x+Math.sin(t*.8+i*2)*2.2*hv*s,S.ballP.y,S.ballP.z+Math.cos(t*.6+i)*1.5*hv)}});
 ghostPins.forEach((g,i)=>{const on=hv>0&&S.mode==='play'&&course&&(i===0||hv>.5);g.visible=on;if(on)g.position.set(course.pin[0]+Math.sin(t*.5+i*3)*6*hv*(i?-1:1),0,course.pin[1]+Math.cos(t*.4+i)*4*hv)});
 const absOn=S.mode==='play'&&P()&&P().absH===S.hole&&S.phase!=='cart';if(hotTub){hotTub.visible=absOn;if(absOn){hotTub.userData.duck.position.set(Math.cos(t*.4)*course.gr*.6,Math.sin(t*3)*.08,Math.sin(t*.4)*course.gr*.6);hotTub.userData.duck.rotation.y=-t*.4;if(Math.random()<dt*14){burst(new V3(course.pin[0]+rand(-1,1)*course.gr*.8,.2,course.pin[1]+rand(-1,1)*course.gr*.8),1,[0xffffff,0xbff8ff],.5,.25,2.5,.9);parts[parts.length-1].g=-.4}}}
 fakeHoles.forEach((g,i)=>{g.visible=absOn;if(absOn){const a=t*.15+i*2.1,r2=course.gr+10+i*6;g.position.set(course.pin[0]+Math.cos(a)*r2,0,course.pin[1]+Math.sin(a)*r2*.7)}});
 if(amb){const pa=amb.geometry.attributes.position,b0=amb.userData.base,cx=S.camL.x,cz=S.camL.z;for(let i=0;i<pa.count;i++){let x=b0[i*3],y=b0[i*3+1],z=b0[i*3+2];if(TH.snow){y=((y-t*2.2)%40+40)%40;x+=Math.sin(t*.7+i)*1.2}else if(TH.night){x+=Math.sin(t*.6+i)*2;y+=Math.sin(t*1.3+i*.7)*.8;z+=Math.cos(t*.5+i*1.3)*2}else{x+=((t*6+i*7)%120)-60;y=.3+Math.abs(Math.sin(t+i))*1.5}pa.setXYZ(i,cx+x,y,cz+z)}pa.needsUpdate=true;if(TH.night)amb.material.opacity=.6+Math.sin(t*4)*.35}
 if(S.phase==='fly'&&ball.visible){const tk=EQ().trail;if(tk==='rainbow')trail.material.color.setHSL((t*.8)%1,1,.6);if(tk==='fire'&&Math.random()<.7)burst(S.ballP.clone(),1,[0xff7a1a,0xffd23f,0xff3030],.6,.18,.5,.45);if(tk==='bubbles'&&Math.random()<.6){burst(S.ballP.clone(),1,[0xffd23f,0xffffff],.5,.16,1,.8);parts[parts.length-1].g=-.2}}
 if(EQ().ball==='disco')ball.material.emissive.setHSL((t*1.5)%1,.9,.35);
 if(S.redT>0)S.redT-=dt;if(S.black>0)S.black-=dt;$('black').style.opacity=S.black>0?Math.min(1,S.black*1.4):0;
 // distance hint: ideal power tick
 {const pi=$('pIdeal');if(S.hint&&S.mode==='play'&&(S.phase==='power'||S.phase==='aim')){const pw=S.hint.pw[S.club];pi.style.display='block';pi.style.bottom=(pw*100)+'%';pi.style.transform=`translateY(${(Math.sin(t*6.3)*16+Math.sin(t*2.1)*10)*dr*dr}px)`;pi.style.filter=dr>.3?`blur(${(dr-.3)*4}px)`:'';pi.classList.toggle('full',pw>=1)}else pi.style.display='none'}
 updParts(dt);
 ball.position.copy(S.ballP);ballShadowRing.position.set(S.ballP.x,.1,S.ballP.z);ballShadowRing.visible=S.phase==='aim';ballShadowRing.material.opacity=.5+Math.sin(t*5)*.3;
 // trail
 const tp=trail.geometry.attributes.position;for(let i=0;i<trailN;i++){const q=trailPts[Math.min(i,trailPts.length-1)]||S.ballP;tp.setXYZ(i,q.x,q.y,q.z)}tp.needsUpdate=true;trail.visible=S.phase==='fly'&&trailPts.length>1;
 // aim preview
 const aiming=S.mode==='play'&&(S.phase==='aim'||S.phase==='power'||S.phase==='acc');dots.visible=land.visible=aiming;
 if(aiming){const c=CLUBS[S.club],d=dirV(S.aim+S.wob),m=new THREE.Matrix4();const pw=S.phase==='aim'?1:(S.phase==='power'?S.dispPow:S.lockedPow);
  if(c.id==='putter'){const L=c.carry*pw*(1+.3*dr);for(let i=0;i<DOTS;i++){const k=i/DOTS*L;m.makeTranslation(S.ballP.x+d.x*k,.3,S.ballP.z+d.z*k);dots.setMatrixAt(i,m)}land.position.set(S.ballP.x+d.x*L,.12,S.ballP.z+d.z*L);land.scale.setScalar(.4)}
  else{const L=c.carry*pw*drunkMult(p)*(S.effects.rocket?1.8:1),th=c.ang*Math.PI/180,hmax=L*Math.tan(th)/4;for(let i=0;i<DOTS;i++){const k=i/(DOTS-1);m.makeTranslation(S.ballP.x+d.x*L*k,.4+4*hmax*k*(1-k),S.ballP.z+d.z*L*k);dots.setMatrixAt(i,m)}land.position.set(S.ballP.x+d.x*L,.12,S.ballP.z+d.z*L);land.scale.setScalar(1+dr*1.5)}
  dots.instanceMatrix.needsUpdate=true;
  {const hd=S.hint;let ht='';if(hd){const fz=dr>.45?'~':'';const jit=v=>Math.round(clamp(v+(dr>.45?Math.sin(t*3.7)*dr*.12:0),0,1)*100);ht=`<div class="hint">🎯 ${CLUBS[hd.rec].n} ${fz}${hd.pw[hd.rec]>=1?'FULL':jit(hd.pw[hd.rec])+'%'}${hd.rec!==S.club?' · tap':''}</div><div style="font-size:11px">${CLUBS[S.club].n}: ${hd.pw[S.club]>=1?'can\'t reach':fz+jit(hd.pw[S.club])+'% power'}</div>`}$('hDist').innerHTML=`${Math.round(holeDist())}m<div style="font-size:11px">to pin</div>${ht}`}
  const cy=Math.atan2(S.camL.x-S.camP.x,-(S.camL.z-S.camP.z));$('wArrow').style.transform=`rotate(${(course.wind.a-cy)*180/Math.PI-90}deg)`}
 // camera targets
 let tp2,tl,k=4;
 if(S.mode==='title'){const a=t*.12;tl=new V3(course.pin[0]*.3,0,course.pin[1]*.3);tp2=new V3(Math.sin(a)*60,30,Math.cos(a)*60+course.pin[1]*.3);k=2}
 else if(S.phase==='cart'&&myCart){const cs=S.cartS;const f=new V3(Math.sin(myCart.rotation.y),0,Math.cos(myCart.rotation.y));const sp=Math.abs(cs.v);
  if(cs.flip>0){const oa=S.t*.9;tp2=myCart.position.clone().add(new V3(Math.sin(oa)*9,5,Math.cos(oa)*9));tl=myCart.position.clone();k=3}
  else{tp2=myCart.position.clone().addScaledVector(f,-(8.5+sp*.12));tp2.y=myCart.position.y+3.6+sp*.05;tl=myCart.position.clone().addScaledVector(f,7+sp*.4);tl.y+=1.2;k=5}
  const bf=(innerWidth<innerHeight?62:50)+Math.min(sp,30)*.45;camera.fov=lerp(camera.fov,bf,.08);camera.updateProjectionMatrix()}
 else if((S.phase==='chug'||S.phase==='keg')&&S.golfer){const g=S.golfer;const f=new V3(Math.sin(g.rotation.y),0,Math.cos(g.rotation.y));const side=new V3(f.z,0,-f.x);tp2=g.position.clone().addScaledVector(f,3.6).addScaledVector(side,1.2);tp2.y=1.9;tl=g.position.clone();tl.y=1.25;k=8}
 else if(S.phase==='fly'||S.phase==='holed'||S.phase==='wait'){const hv=new V3(S.ballV.x,0,S.ballV.z);if(hv.length()<.5)hv.copy(dirV(S.aim));hv.normalize();tp2=S.ballP.clone().addScaledVector(hv,-14);tp2.y=Math.max(S.ballP.y+5,5);tl=S.ballP.clone().addScaledVector(hv,6);k=3.5;
  if(S.phase==='holed'){tp2=new V3(course.pin[0]+8,6,course.pin[1]+8);tl=new V3(course.pin[0],1,course.pin[1])}}
 else{const d=dirV(S.aim+S.wob*.5),pin=S.club===4;tp2=S.ballP.clone().addScaledVector(d,pin?-7:-11);tp2.y=pin?3.2:5;tl=S.ballP.clone().addScaledVector(d,pin?12:28);k=6}
 const kk=1-Math.exp(-k*dt);S.camP.lerp(tp2,kk);S.camL.lerp(tl,kk);
 camera.position.copy(S.camP);camera.position.x+=Math.sin(t*.9)*dr*1.2;camera.position.y+=Math.sin(t*1.3)*dr*.6;
 if(S.shake>0){S.shake=Math.max(0,S.shake-dt*2);camera.position.x+=rand(-1,1)*S.shake*.6;camera.position.y+=rand(-1,1)*S.shake*.6}
 camera.lookAt(S.camL);camera.rotateZ(Math.sin(t*.8)*dr*.12+Math.sin(t*2.1)*dr*.03+Math.sin(t*.25)*.45*hv);
 sun.position.set(S.camL.x+30,60,S.camL.z+20);sun.target.position.copy(S.camL);
 if(S.flash>0)S.flash=Math.max(0,S.flash-dt*3);$('flash').style.opacity=S.flash*.6;
 const H=p.hang?1:0;const pd=S.mode==='title'?.15:dr;const Rr=Math.max(0,Math.min(1,(S.redT||0)/1.5)),Aa=absOn?.85:0;postMat.uniforms.R.value=Rr;postMat.uniforms.A.value=Aa;
 if(pd<.02&&!H&&!Rr&&!Aa){renderer.setRenderTarget(null);renderer.render(scene,camera)}else{renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);postMat.uniforms.d.value=pd;postMat.uniforms.T.value=t;postMat.uniforms.H.value=H;renderer.render(postScene,postCam)}
}
requestAnimationFrame(frame);
// orientation lock where supported
try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('portrait').catch(()=>{})}catch(e){}
for(const[id,k]of[['gas','gas'],['brake','brake']]){const e=$(id);e.addEventListener('pointerdown',ev=>{ev.preventDefault();try{e.setPointerCapture(ev.pointerId)}catch(_){}ctl[k]=1;e.classList.add('down')});const up=()=>{ctl[k]=0;e.classList.remove('down')};e.addEventListener('pointerup',up);e.addEventListener('pointercancel',up)}
{const w=$('wheel');let st=null;const ang=ev=>{const r=w.getBoundingClientRect();return Math.atan2(ev.clientX-(r.left+r.width/2),-(ev.clientY-(r.top+r.height/2)))};
 w.addEventListener('pointerdown',ev=>{ev.preventDefault();try{w.setPointerCapture(ev.pointerId)}catch(_){}st={a:ang(ev),w:ctl.wheel*2.4}});
 w.addEventListener('pointermove',ev=>{if(!st)return;let d=ang(ev)-st.a;d=Math.atan2(Math.sin(d),Math.cos(d));const tot=clamp(st.w+d,-2.4,2.4);st.w=tot;st.a=ang(ev);ctl.wheel=tot/2.4});
 const rel=()=>{st=null};w.addEventListener('pointerup',rel);w.addEventListener('pointercancel',rel);
 (function spring(){requestAnimationFrame(spring);if(!st)ctl.wheel*=.82;w.style.transform=`rotate(${ctl.wheel*2.4*180/Math.PI}deg)`})()}
$('bHand').onclick=()=>{const h=LS.get('hand','right')==='right'?'left':'right';LS.set('hand',h);$('bHand').textContent='Cart wheel: '+(h==='right'?'Right hand':'Left hand')};$('bHand').textContent='Cart wheel: '+(LS.get('hand','right')==='right'?'Right hand':'Left hand');
$('honk').addEventListener('pointerdown',e=>{e.preventDefault();honk()});
$('stSkip').onclick=()=>{if(S.cartS&&!S.cartS.done){S.cartS.done=true;endCart()}};
{const kb=$('kegBtn'),dn=e=>{e.preventDefault();if(S.keg){S.keg.held=true;buzz(20)}},up=e=>{if(S.keg)S.keg.held=false};kb.addEventListener('pointerdown',dn);kb.addEventListener('pointerup',up);kb.addEventListener('pointercancel',up);kb.addEventListener('pointerleave',up)}
$('hDist').addEventListener('click',e=>{if(S.hint&&S.phase==='aim'){setClub(S.hint.rec);SFX.click();updHUD()}});
window.__TT=S;window.__TTapi={shoot,launch,drink,DRINKS,setClub,holed,finishHole,showCard,addCoins,grant,setCourse,calcHint,startCart,honk,buildShop,buildCourses,coins};
})();
