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
function tone(f,dur,type='sine',vol=.2,f2=null,delay=0){const a=ac();if(!a||!soundOn)return;if(typeof MUS!=='undefined'&&MUS.duck&&!MUS.hold)musDuck(.6,dur+delay);const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol=.2,freq=1000,q=1,type='bandpass',delay=0){const a=ac();if(!a||!soundOn)return;const t=a.currentTime+delay,n=a.sampleRate*dur,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.value=freq;fl.Q.value=q;const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}
const ENG={};function engSet(on,gas,v){const a=AC;if(!a||a.state!=='running'){return}if(!ENG.o){if(!on)return;const o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=420;f.Q.value=2;g.gain.value=0;l.frequency.value=11;lg.gain.value=6;l.connect(lg);lg.connect(o.frequency);o.connect(f);o2.connect(f);f.connect(g);g.connect(a.destination);o.start();o2.start();l.start();Object.assign(ENG,{o,o2,f,g,l})}const t=a.currentTime,ok=on&&soundOn;const hz=48+Math.min(1,Math.abs(v)/22)*70+gas*14;ENG.o.frequency.setTargetAtTime(hz,t,.08);ENG.o2.frequency.setTargetAtTime(hz*.5,t,.08);ENG.l.frequency.setTargetAtTime(9+hz*.12,t,.1);ENG.f.frequency.setTargetAtTime(300+gas*500+Math.abs(v)*12,t,.1);ENG.g.gain.setTargetAtTime(ok?.035+gas*.03:0,t,ok?.08:.04)}
const SFX={
 click(){tone(600,.06,'square',.06)},
 swing(){noise(.25,.3,1800,.7)},
 hit(p,id){p=p||.7;if(id==='driver'||id==='wood'){tone(95+p*40,.22,'sine',.42,40);tone(420+p*120,.05,'triangle',.22,160);noise(.05,.45,4200,.8,'highpass');noise(.14,.22,1400,.9)}else if(id==='wedge'){tone(260,.09,'triangle',.26,110);noise(.12,.3,900,.7);noise(.22,.14,2200,.5,'bandpass',.03)}else{tone(150+p*80,.12,'triangle',.36,70);tone(900,.04,'square',.06,500);noise(.05,.4,3200,1,'highpass')}},
 putt(){tone(620,.05,'sine',.16,380);noise(.03,.12,2600,1.5);tone(180,.07,'sine',.1,120)},
 land(s){if(s==='sand'){noise(.22,.32,380,.6,'lowpass');tone(85,.12,'sine',.14,50)}else if(s==='rough'||s==='fringe'||s==='oob'){noise(.12,.22,600,.6,'lowpass');tone(110,.09,'sine',.14,60)}else SFX.bounce()},
 bounce(){tone(140,.08,'sine',.15,70)},
 lava(){noise(1.1,.3,5200,.6,'highpass');noise(.4,.25,700,.8,'lowpass');for(let i=0;i<7;i++)tone(rand(90,160),.07,'sine',.14,rand(200,320),.15+i*rand(.08,.14));for(let i=0;i<5;i++)noise(.02,.2,rand(3000,7000),2,'bandpass',rand(.05,.9))},
 splash(){noise(.08,.35,2400,.7);noise(.7,.36,700,.5,'lowpass',.03);tone(380,.18,'sine',.12,90);for(let i=0;i<5;i++)tone(rand(700,1400),.05,'sine',.06,rand(1500,2400),.15+i*rand(.05,.09))},
 sand(){noise(.22,.32,380,.6,'lowpass');tone(85,.12,'sine',.14,50)},
 tree(){tone(90,.2,'sawtooth',.2,40);noise(.25,.25,400)},
 cup(){tone(2300,.12,'triangle',.16);tone(3450,.08,'sine',.07);[.07,.12,.16,.19,.215,.235].forEach((d,i)=>{tone(1900+i*90+rand(-60,60),.05,'triangle',.1*(1-i*.12),null,d);noise(.015,.08,5000,2,'bandpass',d)});tone(180,.12,'sine',.18,90,.28);tone(1047,.25,'sine',.1,null,.4);tone(1568,.35,'sine',.08,null,.48)},
 fanfare(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.25,'square',.08,null,i*.12))},
 drumroll(){for(let i=0;i<14;i++)tone(110+i*4,.06,'square',.05+i*.004,90,i*.09);tone(220,.35,'triangle',.13,440,1.3)},woo(){tone(320,.22,'triangle',.12,620);tone(620,.4,'triangle',.11,380,.2);tone(330,.22,'sine',.06,640,.01)},
 roar(){noise(2,.3,1100,.25);noise(1.6,.18,2600,.4,'bandpass',.2)},
 cheer(){noise(1.2,.25,1500,.3);[0,.15,.3].forEach(d=>tone(rand(700,1100),.3,'triangle',.05,null,d))},
 slam(){tone(200,.08,'square',.3,80);noise(.08,.3,2500)},
 glug(){for(let i=0;i<5;i++)tone(rand(150,230),.09,'sine',.25,90,i*.16)},
 open(){noise(.15,.3,4000,2);tone(2400,.05,'sine',.05)},
 burp(){const a=ac();if(!a||!soundOn)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(110,t);o.frequency.linearRampToValueAtTime(70,t+.5);l.frequency.value=28;lg.gain.value=30;l.connect(lg);lg.connect(o.frequency);const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=600;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.35,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.connect(f);f.connect(g);g.connect(a.destination);o.start(t);l.start(t);o.stop(t+.6);l.stop(t+.6)},
 hic(){tone(500,.07,'triangle',.25,1400)},
 bad(){tone(300,.3,'sawtooth',.12,120)},
 honk(){tone(370,.28,'square',.12);tone(466,.28,'square',.1)},
 ooh(){musDuck(.2,1.3);MUS.hold=1;setTimeout(()=>MUS.hold=0,1300);for(let i=0;i<6;i++){const f=rand(170,300);tone(f,.45,i%2?'triangle':'sine',.05,f*1.25,i*.02);tone(f*1.25,.8,i%2?'triangle':'sine',.05,f*.8,.42+i*.02)}noise(1.1,.04,500,.7)},
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
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
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
const GT={value:0};const GNT=(()=>{const n=64,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),d=x.createImageData(n,n),r=srand(7),v=[];for(let i=0;i<n*n;i++)v.push(r());
 for(let y=0;y<n;y++)for(let X=0;X<n;X++){let a=0;for(const[dx,dy,w]of[[0,0,.4],[1,0,.15],[-1,0,.15],[0,1,.15],[0,-1,.15]])a+=v[((y+dy+n)%n)*n+(X+dx+n)%n]*w;const q=(y*n+X)*4;d.data[q]=d.data[q+1]=d.data[q+2]=a*255;d.data[q+3]=255}
 x.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;return{value:t}})();
// k: 0 rough/ground noise, 1 mowing stripes along d, 2 green checker, 3 sand speckle, 4 water shimmer
function gMat(col,k,d,a){const m=new THREE.MeshLambertMaterial({color:col,vertexColors:!!(a&&a.vc)});const u={uK:{value:k},uD:{value:new THREE.Vector2(d?d[0]:0,d?d[1]:1)},uA:{value:a&&a.amp!=null?a.amp:1},uT:GT};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u,{uN:GNT});sh.vertexShader='varying vec2 vGW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGW=(modelMatrix*vec4(transformed,1.)).xz;');
  sh.fragmentShader='varying vec2 vGW;uniform float uK,uA,uT;uniform vec2 uD;uniform sampler2D uN;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float gn=texture2D(uN,vGW*.06).r*.55+texture2D(uN,vGW*.017).r*.45,f=1.;gn=clamp((gn-.5)*1.8+.5,0.,1.);
  if(uK<.5)f=.9+.18*gn*uA+(1.-uA)*.08;
  else if(uK<1.5){float s=clamp(sin(dot(vGW,uD)*.8976)*3.,-1.,1.);f=1.+.055*s+.06*(gn-.5);}
  else if(uK<2.5){vec2 q=vGW*1.2566;float s=clamp(sin(q.x)*sin(q.y)*4.,-1.,1.);f=1.+.03*s+.04*(gn-.5);}
  else if(uK<3.5){f=.9+.16*texture2D(uN,vGW*.5).r+.06*gn;}
  else{float w=sin(vGW.x*.7+uT*1.3)+sin(vGW.y*.9-uT*1.1)+sin((vGW.x+vGW.y)*.45+uT*.7)+sin(vGW.x*1.9-vGW.y*1.3+uT*2.)*.5;f=.94+.04*w;diffuseColor.rgb+=vec3(.22,.26,.3)*pow(max(0.,w/3.5),5.);}
  diffuseColor.rgb*=f;`)};
 m.customProgramCacheKey=()=>'gm'+(a&&a.vc?1:0);return m}
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
 body:['Classic','Slim','Round','Tall','Tiny','Dad Bod','Big Boy'],
 hair:['Short','Mop','Curly','Mohawk','Long','Bald','Mullet','Afro','Man Bun','Pigtails','Bowl Cut','Spiky','Comb-Over'],
 pattern:['Solid','Hawaiian','Argyle','Plaid'],
 socks:['Ankle','Crew','Dad Socks'],
 tan:['Normal','Pasty','Golf Tan','Lobster'],
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
function randomChar(i){const r0=a=>a[Math.floor(Math.random()*a.length)];const r=a=>{const k=Object.keys(OPTS).find(k=>OPTS[k]===a);const f=k?a.filter(v=>!isLocked(k,v)):a;return r0(f.length?f:a)};const n=['Chip','Bogey','Shanks','Birdie','Wedgie','Putts','Fairway Frank','Divot','Sandy','Tipsy Tom','Mulligan'];return{name:r(n),skin:r(OPTS.skin),shirt:r(OPTS.shirt),pants:r(OPTS.pants),hat:r(OPTS.hat),hatC:r(OPTS.hatC),face:r(OPTS.face),stache:r(OPTS.stache),glasses:r(OPTS.glasses),body:r(OPTS.body),hair:r(OPTS.hair),hairC:r(OPTS.hairC),pattern:r(OPTS.pattern),socks:r(OPTS.socks),tan:r(OPTS.tan)}}
const CDEF={pattern:'Solid',socks:'Ankle',tan:'Normal'};
const patTex={};function patMap(p){if(patTex[p])return patTex[p];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,64,64);
 if(p==='Hawaiian'){x.fillStyle='#c8c8c8';x.fillRect(0,0,64,64);for(const[a,b,r]of[[14,14,9],[46,22,8],[24,46,9],[56,54,7],[4,40,6]]){x.fillStyle='#4a7a3a';x.beginPath();x.ellipse(a+r*.9,b+r*.6,r*.9,r*.35,.6,0,7);x.fill();x.fillStyle='#ffffff';for(let k=0;k<5;k++){const q=k/5*6.28;x.beginPath();x.arc(a+Math.cos(q)*r*.55,b+Math.sin(q)*r*.55,r*.5,0,7);x.fill()}x.fillStyle='#ffd23f';x.beginPath();x.arc(a,b,r*.3,0,7);x.fill()}}
 else if(p==='Argyle'){for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#a8a8a8':'#ffffff';x.beginPath();x.moveTo(i*32+16,j*32);x.lineTo(i*32+32,j*32+16);x.lineTo(i*32+16,j*32+32);x.lineTo(i*32,j*32+16);x.fill()}x.strokeStyle='#333';x.lineWidth=1.5;x.setLineDash([3,3]);for(let k=-64;k<=64;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k+64,64);x.stroke();x.beginPath();x.moveTo(k+64,0);x.lineTo(k,64);x.stroke()}}
 else if(p==='Dots'){x.fillStyle='#e4f1f1';x.fillRect(0,0,64,64);x.fillStyle='#ffffff';for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.beginPath();x.arc(i*8+(j%2)*4+2,j*8+2,1.4,0,7);x.fill()}}
 else if(p==='Plaid'){x.fillStyle='rgba(0,0,0,.28)';for(const k of[8,40]){x.fillRect(k,0,12,64);x.fillRect(0,k,64,12)}x.fillStyle='rgba(255,255,255,.9)';for(const k of[28,60]){x.fillRect(k,0,2,64);x.fillRect(0,k,64,2)}x.fillStyle='rgba(0,0,0,.4)';for(const k of[2,34]){x.fillRect(k,0,2,64);x.fillRect(0,k,64,2)}}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);t.colorSpace=THREE.SRGBColorSpace;return patTex[p]=t}
function tanCol(sk,t){const c=new THREE.Color(sk);if(t==='Pasty')c.lerp(new THREE.Color('#fff4ec'),.45);else if(t==='Golf Tan')c.lerp(new THREE.Color('#8a4b22'),.3);else if(t==='Lobster')c.lerp(new THREE.Color('#ff3b24'),.55);return c}
function makeGolfer(c){
 const root=new THREE.Group();
 const bs={Classic:[1,1,1,1],Slim:[.8,1.08,1.1,1],Round:[1.35,.95,.88,1],Tall:[.95,1.15,1.3,.95],Tiny:[.9,.8,.75,1.12],'Dad Bod':[1.45,.97,.9,1],'Big Boy':[1.75,1,.86,1]}[c.body]||[1,1,1,1];
 const [sx,sy,ll,hs]=bs;
 c=Object.assign({},CDEF,c);const fat=c.body==='Dad Bod'?1:c.body==='Big Boy'?2:0;const skin=M(tanCol(c.skin,c.tan)),shirt=M(c.shirt,Object.assign(c.shirt==='#d4af37'?{emissive:0x4a3500}:c.shirt==='#39ff14'?{emissive:0x0a5a00}:{},c.pattern&&c.pattern!=='Solid'&&(OPTS.pattern.includes(c.pattern)||c.pattern==='Dots')?{map:patMap(c.pattern)}:{})),pants=M(c.pants),hatM=M(c.hatC),hairM=M(c.hairC||'#4a2c15'),sockM=MC(0xffffff),paleM=M(new THREE.Color(c.skin).lerp(new THREE.Color('#fff8f0'),.5)),dark=MC(0x1a1a1a),white=MC(0xffffff),shoeM=MC(0x3a2a20);
 const legLen=.42*ll,hipY=legLen+.12;
 // legs
 const legs=[];for(const s of[-1,1]){const lg=new THREE.Group();lg.position.set(s*.13*sx,hipY,0);root.add(lg);
  if(c.socks==='Dad Socks'){const L=legLen;mesh(new THREE.CapsuleGeometry(.11,L*.3,4,10),pants,0,-L*.2,0,lg);const kn=mesh(G.cyl,skin,0,-L*.47,0,lg);kn.scale.set(.075,L*.2,.075);if(c.tan==='Golf Tan'){const pl=mesh(G.cyl,paleM,0,-L*.555,0,lg);pl.scale.set(.077,.03,.077)}const so=mesh(G.cyl,sockM,0,-L*.78,0,lg);so.scale.set(.085,L*.45,.085);const st2=mesh(G.cyl,MC(0x2b5cff),0,-L*.6,0,lg);st2.scale.set(.087,.025,.087)}
  else{mesh(new THREE.CapsuleGeometry(.1,legLen-.1,4,10),pants,0,-legLen/2,0,lg);if(c.socks==='Crew'){const so=mesh(G.cyl,sockM,0,-legLen+.03,0,lg);so.scale.set(.085,.12,.085)}}
  const sh=mesh(G.sph,shoeM,0,-legLen-.04,.07,lg);sh.scale.set(.12,.08,.19);legs.push(lg)}
 const body=new THREE.Group();body.position.y=hipY;root.add(body);
 const hip=mesh(G.sph,pants,0,.05,0,body);hip.scale.set(.27*sx,.17,.22*sx);
 const torso=mesh(new THREE.CapsuleGeometry(.24,.22,6,14),shirt,0,.3*sy,0,body);torso.scale.set(sx,sy,.85*sx);
 let belly=null;if(fat){belly=new THREE.Group();belly.position.set(0,.2,.1*sx);body.add(belly);const gb=mesh(G.sph,shirt,0,0,.06,belly);gb.scale.set(.3*sx*.72,.24+fat*.03,.24+fat*.05);const bb=mesh(G.sph,skin,0,-.13-fat*.01,.18+fat*.04,belly);bb.scale.set(.15*sx*.7,.06,.1)}
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
 const cheeks=[];
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
  Goatee:()=>{for(const s of[-1,1]){const m=mesh(G.sph,fz,s*.06,-.095,.33,head);m.scale.set(.075,.026,.026);m.rotation.z=s*.25;const d=mesh(G.sph,fz,s*.115,-.17,.3,head);d.scale.set(.025,.07,.025)}const g=mesh(G.sph,fz,0,-.27,.27,head);g.scale.set(.085,.075,.05)},
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
  Mullet:()=>{hr.Short();const b=mesh(G.sph,hairM,0,-.2,-.2,head);b.scale.set(.3,.3,.15);const t2=mesh(G.sph,hairM,0,-.38,-.2,head);t2.scale.set(.22,.16,.1)},
  Afro:()=>{if(capd){for(const s of[-1,1]){const m=mesh(G.sph,hairM,s*.33,.02,-.05,head);m.scale.set(.15,.22,.25)}const b=mesh(G.sph,hairM,0,0,-.24,head);b.scale.set(.32,.26,.16)}else{const a=mesh(G.sph,hairM,0,.2,-.13,head);a.scale.set(.52,.44,.44)}},
  'Man Bun':()=>{hr.Short();if(!capd||c.hat==='Visor'){const b=mesh(G.sph,hairM,0,.3,-.2,head);b.scale.setScalar(.13)}else{const b=mesh(G.sph,hairM,0,-.02,-.4,head);b.scale.setScalar(.12)}},
  Pigtails:()=>{hr.Short();for(const s of[-1,1]){const p=mesh(G.sph,hairM,s*.4,-.08,-.1,head);p.scale.set(.1,.18,.1);p.rotation.z=s*.5;mesh(G.sph,MC(0xff5fd2),s*.36,.04,-.1,head).scale.setScalar(.045)}},
  'Bowl Cut':()=>{const a=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*.5),hairM,0,.04,0,head);a.scale.set(.4,.4,.39);const f=mesh(G.cyl,hairM,0,.06,0,head);f.scale.set(.4,.06,.39)},
  Spiky:()=>{hr.Short();if(capd)return;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;const m=mesh(G.cone,hairM,Math.cos(a)*.17,.33,Math.sin(a)*.15-.03,head);m.scale.set(.07,.2,.07);m.rotation.set(Math.sin(a)*.6,0,-Math.cos(a)*.6)}mesh(G.cone,hairM,0,.42,0,head).scale.set(.07,.2,.07)},
  'Comb-Over':()=>{for(const s of[-1,1]){const m=mesh(G.sph,hairM,s*.31,.02,-.08,head);m.scale.set(.08,.13,.22)}const b=mesh(G.sph,hairM,0,-.02,-.28,head);b.scale.set(.25,.13,.08);if(capd)return;const cg=new THREE.Group();cg.position.set(-.3,.2,0);head.add(cg);for(const[z,w]of[[-.06,.1],[.06,.09]]){const sd=mesh(G.sphL,hairM,.27,.13,z,cg);sd.scale.set(.32,.035,w);sd.rotation.z=-.38}comb=cg},
  Slay:()=>{for(const s of[-1,1]){const a=mesh(new THREE.SphereGeometry(1,16,8,s>0?0:Math.PI,Math.PI,0,Math.PI*.5),hairM,s*.03,.13,-.03,head);a.scale.set(.41,.34,.42);a.rotation.y=-Math.PI/2;const sd=mesh(G.sph,hairM,s*.37,-.28,-.1,head);sd.scale.set(.075,.56,.15);sd.rotation.z=s*.06}const b=mesh(G.sph,hairM,0,-.24,-.22,head);b.scale.set(.37,.54,.2)},
  Bald:()=>{},None:()=>{}};
 const capd=!['None','Halo','Party'].includes(c.hat);let comb=null;
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
 const swing=new THREE.Group();swing.position.set(0,.5*sy,fat?.08+fat*.08:0);body.add(swing);
 const armLen=.4*(.85+ll*.15);
 function mkArm(s){const a=new THREE.Group();a.position.set(s*.27*sx,0,0);swing.add(a);mesh(G.sph,shirt,0,0,0,a).scale.setScalar(.1);
  mesh(new THREE.CapsuleGeometry(.065,armLen-.08,4,8),shirt,0,-armLen/2,0,a);const h=mesh(G.sph,skin,0,-armLen,0,a);h.scale.set(.085,.095,.085);const th=mesh(G.sph,skin,s*-.05,-armLen+.03,.04,a);th.scale.setScalar(.04);return a}
 const armL=mkArm(-1),armR=mkArm(1);
 const club=new THREE.Group();club.position.set(0,-armLen+.02,.22);swing.add(club);club.rotation.x=-.7;
 const grip=mesh(G.cyl,dark,0,-.05,0,club);grip.scale.set(.025,.16,.025);
 const shaftL=hipY+.5*sy-armL.position.y;const shaft=mesh(G.cyl,MC(0xcccccc),0,-.42,0,club);shaft.scale.set(.016,.75,.016);
 const chead=mesh(G.box,MC(0x444444),.06,-.8,0,club);chead.scale.set(.16,.07,.09);
 {const k=(c.club||EQ().club);const CS={gold:[0xd4af37,0xffd700],wood:[0x8b5a2b,0x5a3416],neon:[0x39ff14,0xff2bd6],candy:[0xff3030,0xffffff]}[k];if(CS){shaft.material=k==='neon'?new THREE.MeshBasicMaterial({color:CS[0]}):M(CS[0],k==='gold'?{emissive:0x332200}:{});chead.material=k==='neon'?new THREE.MeshBasicMaterial({color:CS[1]}):M(CS[1])}}
 const can=new THREE.Group();can.position.set(0,-armLen-.05,.04);armR.add(can);can.visible=false;
 const canM=M(0xd0d0d0);mesh(G.cyl,canM,0,0,0,can).scale.set(.07,.18,.07);
 if(c.tan==='Golf Tan'){const hl=armL.children[2];if(hl)hl.material=MC(0xffffff)}
 let vg=null;if(c.prop==='vodka'){vg=new THREE.Group();vg.position.set(0,-armLen-.02,.09);armL.add(vg);const gl=new THREE.Mesh(new THREE.CylinderGeometry(.065,.05,.16,14),new THREE.MeshStandardMaterial({color:0xdff6ff,transparent:true,opacity:.45,roughness:.1}));vg.add(gl);mesh(new THREE.CylinderGeometry(.056,.046,.11,14),M(0xfff3c8),0,-.02,0,vg);const lm=mesh(G.sph,MC(0x7ed957),.05,.08,0,vg);lm.scale.set(.035,.035,.012);mesh(G.cyl,MC(0xff4d8d),-.02,.1,0,vg).scale.set(.008,.12,.008)}
 root.userData={body,head,legs,armL,armR,swing,club,can,canM,hat,eyes,lids,cheeks,mouthG,c,armLen,belly,bv:0,bx:0,comb,cv:0,cx:0,fat,vg};
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
 if(u.belly||u.comb){const dt=clamp(t-(u.lt??t),0,.05);u.lt=t;if(u.belly){u.bv+=(-u.bx*90-u.bv*(6-dr*3.5))*dt;u.bx+=u.bv*dt;const j=u.bx*(1+dr*1.5),q=1+clamp(j,-.25,.35);u.belly.scale.set(1/Math.sqrt(q),q,1/Math.sqrt(q));u.belly.rotation.z=j*.4}
  if(u.comb){const w=(course&&course.wind&&course.wind.s)||2;u.cv+=(-u.cx*60-u.cv*5)*dt;u.cx+=u.cv*dt;u.comb.rotation.z=.02+Math.abs(Math.sin(t*(4+w)+Math.sin(t*1.7)))*(.12+w*.05)+Math.abs(u.cx)}}
 u.hat.rotation.z=Math.sin(t*1.3)*dr*.2;if(u.hat.userData.prop)u.hat.userData.prop.rotation.y=t*14;if(u.hat.userData.halo)u.hat.userData.halo.position.y=.45+Math.sin(t*2)*.04;
}
// returns nothing; drives limb poses for a phase
function animGolfer(u,ph,k,t,dr){
 if(ph==='chug'){const lift=clamp(k/.35,0,1),down=k<1.1?1:clamp(1-(k-1.1)/.4,0,1),tilt=k<1.05?clamp((k-.25)/.3,0,1):clamp(1-(k-1.05)/.3,0,1);
  u.swing.rotation.set(0,0,0);u.armR.rotation.set(-lerp(0,2.7,lift)*down,0,lerp(.25,-.35,lift*down));u.armL.rotation.set(0,0,-.25-.6*tilt);
  u.head.rotation.x=-.55*tilt;u.body.rotation.x=-.15*tilt;u.body.position.y=u.body.position.y;if(k>1.15&&k<1.5){u.head.rotation.x=.25*Math.sin((k-1.15)*9);u.body.rotation.z=Math.sin(k*20)*.08}
  if(k>1.4){u.armL.rotation.z=-.25-Math.sin(k*8)*.3;u.body.rotation.z=Math.sin(k*9)*.2}}
 else if(ph==='celebrate'){u.swing.rotation.set(0,0,0);u.armL.rotation.set(0,0,-2.6+Math.sin(k*14)*.3);u.armR.rotation.set(0,0,2.6-Math.sin(k*14)*.3);u.club.visible=false;if(dr>.3){u.body.rotation.z=Math.sin(k*9)*dr*.45;u.armL.rotation.z-=Math.sin(k*5)*dr*1.2;u.head.rotation.z=Math.sin(k*7)*dr*.3}}
 else if(ph==='cart'){}
 else{u.armL.rotation.set(-.45,0,-.38);u.armR.rotation.set(-.45,0,.38);u.head.rotation.x=0;
  if(ph==='swing'){if(k>.18&&k<.32){if(u.belly)u.bv+=.35+dr*.4;if(u.comb)u.cv+=1.4}u.swing.rotation.set(0,k<.2?lerp(0,-.5,k/.2):lerp(-.5,.6,clamp((k-.2)/.15,0,1)),k<.2?lerp(0,-2.2,k/.2):lerp(-2.2,1.9,clamp((k-.2)/.15,0,1)));u.head.rotation.y=k>.3?.5:0}
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
  {name:'Lunar Island',par:3,path:[[0,0],[0,-45]],pin:[0,-170],w:16,gr:13,water:[[0,-145,55]],seed:36,island:true}]},
 {id:'volcano',n:'Magma Muni',e:'🌋',theme:'volcano',d:'Big drops, brutal climbs, and lava where the water should be.',cost:500,holes:[
  {name:'Ash Drop',par:4,path:[[0,0],[0,-170],[20,-290]],w:22,gr:14,el:[[0,38],[.4,2],[1,6]],lat:.7,sand:[[-24,-205,8]],water:[[36,-175,13]],seed:41},
  {name:'Lava Lake',par:3,path:[[0,0],[0,-30]],extra:[[0,-140]],pin:[0,-155],w:18,gr:15,el:[[0,24],[.2,22],[.75,0],[1,0]],lat:.5,water:[[0,-88,25]],seed:42},
  {name:'Switchback Climb',par:4,path:[[0,0],[-18,-150],[10,-275]],w:20,gr:14,el:[[0,0],[.5,16],[1,30]],lat:.5,sand:[[24,-262,7]],water:[[-52,-120,12]],seed:43},
  {name:'Obsidian Mile',par:5,path:[[0,0],[0,-210],[100,-300],[130,-430]],w:22,gr:16,el:[[0,32],[.35,4],[.6,14],[1,10]],lat:.6,water:[[122,-282,13]],sand:[[122,-410,8]],seed:44},
  {name:'Ember Ridge',par:4,path:[[0,0],[10,-150],[-10,-290]],w:22,gr:14,el:[[0,8],[.5,20],[1,26]],lat:-.5,water:[[-44,-150,11],[46,-215,11]],cart:-140,seed:45},
  {name:'Crater Rim',par:3,path:[[0,0],[0,-45]],pin:[0,-140],w:16,gr:14,el:[[0,14],[.45,10],[1,22]],lat:.4,water:[[0,-190,22]],seed:46}]}];
// v4: roomier courses. Wider fairways, bigger greens, a much wider rough before OB,
// island holes get a fairway apron around the green and a smaller lake.
const ROUGH=58,ISLE=14;
for(const c of COURSES)for(const h of c.holes){h.w=Math.round(h.w*1.5);h.gr=h.gr+3;h.sand=h.sand||[];h.water=h.water||[];h.ice=h.ice||[];
 if(h.island){h.pin=[h.pin[0],h.pin[1]+15];h.water=h.water.map(w=>[w[0],w[1]+8,w[2]-14])}}
const THEMES={
 sunny:{sky:0x8fd3ff,ground:0x4f9a3a,rough:0x5aa840,fair:0x7ccf4f,green:0x96e86a,fringe:0x6cc045,sand:0xf1df9a,water:0x2f9be0,shore:0xe8dca0,hill:0x5c9e45,hemi:[0xe6f2ff,0x557a2e,1.05],sun:1.75,sunC:0xfff0d6,fog:[130,500],tree:'pine',cloud:0xffffff,path:0x9a9a92},
 frost:{sky:0xcfe3f2,ground:0xeef4fa,rough:0xdde8f1,fair:0x9fd08a,green:0xb8f0a0,fringe:0x8fc47a,sand:0xf6efe0,water:0x3f88c0,shore:0xffffff,hill:0xf4f8ff,hemi:[0xf4f8ff,0x9fb0c4,1.12],sun:1.45,sunC:0xfff4e8,fog:[100,430],tree:'snowpine',cloud:0xffffff,ice:0xbfe8ff,path:0x8a96a6,snow:1},
 dune:{sky:0xffd49a,ground:0xe3bd74,rough:0xd8ad62,fair:0x9bc95a,green:0x8fe07a,fringe:0x7ac050,sand:0xf6d98e,water:0x2fc0cf,shore:0xfff0c0,hill:0xd2a050,hemi:[0xfff0d8,0xa87a40,1.05],sun:2,sunC:0xffe0b0,fog:[120,470],tree:'cactus',cloud:0xfff6e8,path:0xc0a070},
 volcano:{sky:0x9a5a44,ground:0x2e2826,rough:0x6a6460,fair:0x667f3c,green:0x86b850,fringe:0x5f9440,sand:0x3c3538,water:0xff5a10,shore:0x2a1a14,hill:0x3a302c,hemi:[0xffc8a8,0x3a2a22,1.05],sun:1.35,tree:'charred',cloud:0x6a5a58,path:0x5e4c44,lava:1},
 night:{sky:0x0a0a26,ground:0x14301c,rough:0x1b4024,fair:0x276634,green:0x3a8f45,fringe:0x2b7a38,sand:0x7d7055,water:0x16337a,shore:0x5a5a80,hill:0x0e1830,hemi:[0x7a7aff,0x102010,.7],sun:.45,tree:'glowpine',cloud:0x2a2a55,path:0x3a3a4a,night:1}};
let CI=0,HOLES=COURSES[0].holes,TH=THEMES.sunny;
function setCourse(i){CI=i;HOLES=COURSES[i].holes;TH=THEMES[COURSES[i].theme];course=null}
const cleared=()=>LS.get('cleared',[]);
function courseOpen(i){return i===0||cleared().includes(COURSES[i-1].id)||owned().includes('course:'+COURSES[i].id)}

let course=null;const courseG=new THREE.Group();scene.add(courseG);
function srand(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function distSeg(px,pz,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l?((px-a[0])*dx+(pz-a[1])*dz)/l:0;t=clamp(t,0,1);return Math.hypot(px-a[0]-t*dx,pz-a[1]-t*dz)}
function distPath(px,pz,p){let m=1e9;for(let i=0;i<p.length-1;i++)m=Math.min(m,distSeg(px,pz,p[i],p[i+1]));if(p.length===1)m=Math.hypot(px-p[0][0],pz-p[0][1]);return m}

function GY(x,z){return course&&course.hf?course.hf(x,z):0}
function GG(x,z){return[GY(x+.5,z)-GY(x-.5,z),GY(x,z+.5)-GY(x,z-.5)]}
const SLP=4.2,smst=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function makeHF(h){const F=h.full,sg=[];let T=0;for(let i=0;i<F.length-1;i++){const a=F[i],b=F[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>.01){sg.push([a,b,L,T]);T+=L}}
 const E=h.el,prof=f=>{if(f<=E[0][0])return E[0][1];for(let i=1;i<E.length;i++)if(f<=E[i][0])return lerp(E[i-1][1],E[i][1],smst(E[i-1][0],E[i][0],f));return E[E.length-1][1]};
 const lat=h.lat||0,hw=h.w/2,Ht=prof(0),Hp=prof(1);
 const base=(x,z)=>{let bd=1e9,bs=0;for(const[a,b,L,A]of sg){const dx=b[0]-a[0],dz=b[1]-a[1];const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(L*L),0,1),d=Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);if(d<bd){bd=d;bs=A+t*L}}
  const o=clamp((bd-hw)/40,0,1.6),n=(Math.sin(x*.05+Math.sin(z*.03)*2)*Math.cos(z*.045)+.5*Math.sin(x*.13+z*.11))*smst(0,20,bd-hw);
  let y=prof(bs/T)+lat*o*o*12+n*1.4;y=lerp(Ht,y,smst(7,16,Math.hypot(x,z)));return lerp(Hp,y,smst(h.gr+3,h.gr+12,Math.hypot(x-h.pin[0],z-h.pin[1])))};
 const W=h.water.map(w=>{let m=1e9;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;m=Math.min(m,base(w[0]+Math.cos(a)*(w[2]+2),w[1]+Math.sin(a)*(w[2]+2)))}return[w[0],w[1],w[2],m-.35]});
 const f=(x,z)=>{let y=base(x,z);for(const w of W){const d=Math.hypot(x-w[0],z-w[1]);if(d<w[2]+6)y=lerp(Math.min(y,w[3]-.9),y,smst(w[2]-1,w[2]+6,d))}return y};
 f.Ht=Ht;f.Hp=Hp;f.W=W;return f}
const HPf=()=>course&&course.hf?course.hf.Hp:0;
function lavaLv(x,z){if(!course||!course.hf)return 0;for(const w of course.hf.W)if(Math.hypot(x-w[0],z-w[1])<w[2]+1.5)return w[3];return GY(x,z)}
let LAVA=null;function lavaMat(){if(!LAVA){const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.fillStyle='#b82400';x.fillRect(0,0,128,128);
 for(let i=0;i<70;i++){const r=4+Math.random()*16,px=Math.random()*128,py=Math.random()*128;for(const ox of[-128,0,128])for(const oy of[-128,0,128]){const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,r);g.addColorStop(0,i%3?'#ffa020':'#fff070');g.addColorStop(1,'rgba(255,80,0,0)');x.fillStyle=g;x.beginPath();x.arc(px+ox,py+oy,r,0,7);x.fill()}}
 x.strokeStyle='rgba(50,8,0,.6)';for(let i=0;i<22;i++){x.lineWidth=1+Math.random()*2;x.beginPath();let px=Math.random()*128,py=Math.random()*128;x.moveTo(px,py);for(let k=0;k<5;k++){px+=Math.random()*24-12;py+=Math.random()*24-12;x.lineTo(px,py)}x.stroke()}
 const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(3,3);LAVA=new THREE.MeshBasicMaterial({map:tx})}return LAVA}
function drape(m,off){if(!course||!course.hf)return;m.updateMatrixWorld(true);const pa=m.geometry.attributes.position,inv=m.matrixWorld.clone().invert(),v=new V3();for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(m.matrixWorld);v.y=GY(v.x,v.z)+off;v.applyMatrix4(inv);pa.setXYZ(i,v.x,v.y,v.z)}pa.needsUpdate=true;m.geometry.computeVertexNormals()}
function volcanoGround(h){const xs=h.full.map(p=>p[0]),zs=h.full.map(p=>p[1]),M=h.w/2+ROUGH+50;
 const x0=Math.min(...xs)-M,x1=Math.max(...xs)+M,z0=Math.min(...zs)-M,z1=Math.max(...zs)+M,nx=Math.ceil((x1-x0)/2.5),nz=Math.ceil((z1-z0)/2.5);
 const geo=new THREE.PlaneGeometry(x1-x0,z1-z0,nx,nz);geo.rotateX(-Math.PI/2);geo.translate((x0+x1)/2,0,(z0+z1)/2);
 const pa=geo.attributes.position,col=new Float32Array(pa.count*3),C=new THREE.Color(),cm={green:TH.green,sand:TH.sand,fairway:TH.fair,rough:TH.rough,oob:TH.ground,water:0x241008};
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i);pa.setY(i,h.hf(x,z));const s=surface(x,z);let c=cm[s]??TH.ground;
  if(s!=='green'&&Math.hypot(x-h.pin[0],z-h.pin[1])<h.gr+2)c=TH.fringe;else if(s!=='water'&&s!=='green')for(const w of h.water)if(Math.hypot(x-w[0],z-w[1])<w[2]+4)c=TH.shore;
  C.setHex(c);const j=.92+.08*Math.sin(x*1.7+z*2.3);col[i*3]=C.r*j;col[i*3+1]=C.g*j;col[i*3+2]=C.b*j}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,gMat(0xffffff,0,0,{vc:1,amp:.8}));m.receiveShadow=true;courseG.add(m);
 const og=new THREE.PlaneGeometry(1400,1400,70,70);og.rotateX(-Math.PI/2);const op=og.attributes.position;for(let i=0;i<op.count;i++){const x=op.getX(i),z=op.getZ(i),inn=x>x0&&x<x1&&z>z0&&z<z1;op.setY(i,h.hf(x,z)-(inn?5:.6))}og.computeVertexNormals();courseG.add(new THREE.Mesh(og,MC(TH.ground)));
 for(const w of h.hf.W){const lm=new THREE.Mesh(new THREE.CircleGeometry(w[2]+1,40),lavaMat());lm.rotation.x=-Math.PI/2;lm.position.set(w[0],w[3],w[1]);courseG.add(lm)}
 // the big one in the distance: glowing crater, lava streaks, a lazy smoke column
 const lp=h.full[h.full.length-2],dx=h.pin[0]-lp[0],dz=h.pin[1]-lp[1],dl=Math.hypot(dx,dz)||1,vx=h.pin[0]+dx/dl*380,vz=h.pin[1]+dz/dl*380;
 const vg=new THREE.Group();vg.position.set(vx,h.hf(vx,vz)-20,vz);courseG.add(vg);mesh(new THREE.CylinderGeometry(55,260,190,28,1,true),0x2b2422,0,95,0,vg).castShadow=false;
 const cr=mesh(new THREE.CircleGeometry(55,28),new THREE.MeshBasicMaterial({color:0xff6a10}),0,186,0,vg);cr.rotation.x=-Math.PI/2;
 const face=Math.atan2(-dx,-dz),stm=new THREE.MeshBasicMaterial({color:0xff4a08});for(const o of[-.45,-.15,.2,.5]){const sg=new THREE.Group();sg.rotation.y=face+o;vg.add(sg);const st=mesh(G.box,stm,0,95,157,sg);st.scale.set(3+Math.abs(o)*4,282,1);st.rotation.x=-Math.atan2(205,190)}
 const sm=new THREE.MeshLambertMaterial({color:0x5a5250,transparent:true,opacity:.5,depthWrite:false});S.vSmoke=[];for(let k=0;k<6;k++){const p=mesh(G.sphL,sm.clone(),0,190,0,vg);p.castShadow=false;S.vSmoke.push(p)}}
function surface(x,z){const h=course;if(Math.hypot(x-h.pin[0],z-h.pin[1])<h.gr)return'green';
 for(const s of h.sand)if(Math.hypot(x-s[0],z-s[1])<s[2])return'sand';
 for(const s of h.ice)if(Math.hypot(x-s[0],z-s[1])<s[2])return'ice';
 if(h.island&&Math.hypot(x-h.pin[0],z-h.pin[1])<h.gr+ISLE)return'fairway';
 for(const s of h.water)if(Math.hypot(x-s[0],z-s[1])<s[2])return'water';
 if(distPath(x,z,h.path)<h.w/2)return'fairway';if(h.extra&&distPath(x,z,[h.extra[0],h.pin])<h.w/2)return'fairway';
 if(Math.hypot(x,z)<5)return'fairway';
 if(distPath(x,z,h.full)<h.w/2+ROUGH)return'rough';return'oob'}
function flatDisc(r,col,y,x,z){const m=new THREE.Mesh(new THREE.CircleGeometry(r,40),MC(col));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;courseG.add(m);return m}
function ribbon(path,w,col,y,k){const ms=[],dm=k?null:gMat(col,0,0,{amp:TH.snow?.4:1});for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);const mt=dm||gMat(col,1,[(b[0]-a[0])/(l||1),(b[1]-a[1])/(l||1)]);ms.push(mt);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),mt);m.rotation.x=-Math.PI/2;m.rotation.z=Math.atan2(b[0]-a[0],-(b[1]-a[1]))*-1;m.position.set((a[0]+b[0])/2,y,(a[1]+b[1])/2);m.receiveShadow=true;courseG.add(m)}path.forEach((p,i)=>{flatDisc(w/2,col,y,p[0],p[1]).material=ms[Math.min(i,ms.length-1)]||dm})}
// course life: instanced bushes/flowers/rocks off the play line, plus a bench + ball washer by the tee
const DG={bush:new THREE.IcosahedronGeometry(1,1),fl:new THREE.IcosahedronGeometry(1,0),rock:new THREE.DodecahedronGeometry(1,0)};
const DEC={sunny:{b:[0x2f7f34,0x3d9440,0x4aa24a],nb:46,f:[0xff5fa0,0xffd23f,0xffffff,0xb07aff,0xff8a3a],nf:30,r:[0x9a9a92,0x8a8a84,0xb0aca0],nr:22},
 frost:{b:[0xe8f0f6,0xd6e4ec,0x7fa890],nb:36,f:[],nf:0,r:[0x8a96a6,0x9aa6b6,0x707c8c],nr:30},
 dune:{b:[0x9a8a48,0x8a7a3c,0xb0a060],nb:26,f:[0xff6a8a,0xffb040,0xfff0a0],nf:10,r:[0xc08850,0xa8704a,0xd09a60],nr:44},
 night:{b:[0x123a22,0x184a2a,0x0f3020],nb:40,f:[0xff2bd6,0x00e5ff,0xfff04a,0x7dff4a],nf:26,r:[0x3a3a50,0x2e2e44,0x444460],nr:22,glow:1},
 volcano:{b:[0x3a4a2a,0x2e3a22],nb:14,f:[0xff7a20,0xffb030],nf:8,r:[0x1e1a1c,0x2e2626,0x3a3230],nr:70,glow:1}};
function decorate(h,R){S.decor=[];if(GFX==='low')S.lowG=1;const D=DEC[TH.lava?'volcano':TH.night?'night':TH.snow?'frost':CI===2?'dune':'sunny'];
 const xs=h.full.map(p=>p[0]),zs=h.full.map(p=>p[1]),M=h.w/2+ROUGH*.8,x0=Math.min(...xs)-M,x1=Math.max(...xs)+M,z0=Math.min(...zs)-M,z1=Math.max(...zs)+M;
 const ok=(x,z,cl)=>{const sf=surface(x,z);if(sf!=='rough'&&sf!=='oob')return false;if(distPath(x,z,h.full)<h.w/2+5)return false;if(Math.hypot(x,z)<16||(z>-30&&z<20&&Math.abs(x)<12))return false;
  if(Math.hypot(x-h.pin[0],z-h.pin[1])<h.gr+7)return false;for(const w of h.water)if(Math.hypot(x-w[0],z-w[1])<w[2]+3)return false;for(const w of h.sand)if(Math.hypot(x-w[0],z-w[1])<w[2]+2)return false;
  for(const t of trees)if(Math.hypot(x-t.x,z-t.z)<t.r+cl)return false;if(h.windmill&&Math.hypot(x-h.windmill[0],z-h.windmill[1])<6)return false;return true};
 const pick=()=>{for(let i=0;i<12;i++){const x=x0+R()*(x1-x0),z=z0+R()*(z1-z0);if(ok(x,z,1.5))return[x,z]}return null};
 const o=new THREE.Object3D(),C=new THREE.Color();
 const inst=(geo,mat,list,shadow)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,mat,list.length);im.userData.pos=[];list.forEach((q,i)=>{o.position.set(q.x,GY(q.x,q.z)+q.y,q.z);o.scale.set(q.sx,q.sy,q.sz);o.rotation.set(q.rx||0,q.ry||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);C.setHex(q.c).multiplyScalar(.92+R()*.16);im.setColorAt(i,C);im.userData.pos.push([q.x,q.z])});
  im.castShadow=shadow;im.receiveShadow=!D.glow;im.frustumCulled=false;courseG.add(im);S.decor.push(im)};
 const B=[],F=[],K=[];
 for(let n=0;n<D.nb;n++){const q=pick();if(!q)continue;const k=1+Math.floor(R()*3);for(let j=0;j<k;j++){const s=(TH.snow?1.1:CI===2&&!TH.night&&!TH.lava?.7:1)*(.9+R()*.9),x=q[0]+(R()-.5)*2.6,z=q[1]+(R()-.5)*2.6;B.push({x,z,y:s*.35,sx:s*1.25,sy:s*(TH.snow?.6:.85),sz:s*1.15,ry:R()*6,c:D.b[Math.floor(R()*D.b.length)]})}}
 for(let n=0;n<D.nf;n++){const q=pick();if(!q)continue;const c=D.f[Math.floor(R()*D.f.length)];for(let j=0;j<6;j++){const a=R()*6.28,r=R()*1.3,s=.16+R()*.1;F.push({x:q[0]+Math.cos(a)*r,z:q[1]+Math.sin(a)*r,y:.22+R()*.15,sx:s,sy:s*.8,sz:s,ry:a,c})}
  if(!D.glow)B.push({x:q[0],z:q[1],y:.12,sx:1.3,sy:.3,sz:1.3,ry:0,c:D.b[0]})}
 for(let n=0;n<D.nr;n++){const q=pick();if(!q)continue;const s=.35+R()*(TH.lava?1.4:.9);K.push({x:q[0],z:q[1],y:s*.25,sx:s*(1+R()*.5),sy:s*(.55+R()*.4),sz:s,rx:R(),ry:R()*6,c:D.r[Math.floor(R()*D.r.length)]})}
 inst(DG.bush,MC(0xffffff),B,true);inst(DG.fl,D.glow?new THREE.MeshBasicMaterial({color:0xffffff}):MC(0xffffff),F,false);inst(DG.rock,MC(0xffffff),K,true);
 // tee furniture
 if(h.path.length>1){const fy=(x,z)=>GY(x,z);const wd=TH.night?0x4a3a2a:0x9a6a3a;
  const bn=new THREE.Group();const st=mesh(G.box,wd,0,.55,0,bn);st.scale.set(2.2,.12,.6);const bk=mesh(G.box,wd,0,1,-.28,bn);bk.scale.set(2.2,.5,.1);for(const x of[-.9,.9]){mesh(G.box,0x444444,x,.27,0,bn).scale.set(.12,.55,.55)}
  bn.position.set(8.5,fy(8.5,4.5),4.5);bn.rotation.y=-.9;courseG.add(bn);trees.push({x:8.5,z:4.5,y:fy(8.5,4.5),r:1.2,h:1.2,g:bn});
  const bw=new THREE.Group();mesh(G.cyl,0x3a5a3a,0,.55,0,bw).scale.set(.07,1.1,.07);const hd=mesh(G.box,TH.night?0x00c8a0:0x2e7d4f,0,1.2,0,bw);hd.scale.set(.32,.4,.22);mesh(G.cyl,0xdddddd,0,1.5,0,bw).scale.set(.03,.3,.03);mesh(G.sph,0xffffff,.2,1.25,0,bw).scale.setScalar(.06);
  bw.position.set(5,fy(5,-4.5),-4.5);courseG.add(bw);trees.push({x:5,z:-4.5,y:fy(5,-4.5),r:.4,h:1.6,g:bw})}
 if(S.lowG)for(const d of S.decor)d.visible=false}
// graphics: 'auto' (drop to low if fps stays low), 'high', 'low'
let GFX=LS.get('gfx','auto');const DPR=Math.min(devicePixelRatio,2);
function setLowG(on){S.lowG=on?1:0;sun.castShadow=!on;renderer.setPixelRatio(on?Math.min(DPR,1.5):DPR);resize();for(const d of S.decor||[])d.visible=!on;if(on)for(const t of trees)if(t.sw&&t.g)t.g.rotation.set(0,t.g.rotation.y,0)}
const fpsW={t:0,n:0,bad:0};
function gfxTick(dt,t){if(!fpsW.init){fpsW.init=1;if(GFX==='low')setLowG(1)}if(GFX==='auto'&&!S.lowG&&!document.hidden&&(S.mode==='play'||S.mode==='title')){const nw=performance.now();if(!fpsW.p||nw-fpsW.p>500)fpsW.t=fpsW.n=0;else fpsW.t+=(nw-fpsW.p)/1000;fpsW.p=nw;fpsW.n++;if(fpsW.t>=3){const fps=fpsW.n/fpsW.t;S.fps=Math.round(fps);fpsW.bad=fps<24?fpsW.bad+1:0;fpsW.t=fpsW.n=0;if(fpsW.bad>=2){setLowG(1);S.lowAuto=1}}}
 if(!S.lowG){const ws=course&&course.wind?course.wind.s:2,A=.012+ws*.0025;for(const tr of trees)if(tr.sw){const g=tr.g;g.rotation.x=Math.sin(t*1.1+tr.x*.31)*A;g.rotation.z=Math.cos(t*.9+tr.z*.27)*A}}}
let pinG,flag,windmill=null,cartObj=null,trees=[],hills=[];
const GLOWC=[0xff2bd6,0x00e5ff,0xfff04a,0x7dff4a];
function makeCactus(x,z,s){const g=new THREE.Group();const cm=MC(0x3f8f3a);const tr=mesh(new THREE.CapsuleGeometry(.55*s,4*s,4,8),cm,0,2.6*s,0,g);for(const k of[-1,1]){const h=1.4+Math.abs(x*3+z)%1.2;const a=mesh(new THREE.CapsuleGeometry(.35*s,1*s,4,8),cm,k*1*s,h*s,0,g);a.rotation.z=k*Math.PI/2;const u=mesh(new THREE.CapsuleGeometry(.35*s,1.3*s,4,8),cm,k*1.6*s,(h+.8)*s,0,g)}mesh(G.sph,MC(0xff5fa0),0,5.2*s,0,g).scale.setScalar(.35*s);g.position.set(x,GY(x,z),z);g.rotation.y=x*.7;courseG.add(g);trees.push({x,z,y:GY(x,z),r:.9*s,h:5.5*s,g})}
function makeTree(x,z,s){if(TH.tree==='cactus')return makeCactus(x,z,s);if(TH.tree==='charred'){const g=new THREE.Group(),tm=MC(0x1a1411);mesh(G.cyl,tm,0,2.2*s,0,g).scale.set(.32*s,4.4*s,.32*s);for(const k of[-1,1]){const br=mesh(G.cyl,tm,k*.55*s,3.4*s,0,g);br.scale.set(.13*s,1.9*s,.13*s);br.rotation.z=-k*.85}mesh(G.sph,new THREE.MeshBasicMaterial({color:0xff6a10}),0,.35*s,.28*s,g).scale.setScalar(.12*s);g.position.set(x,GY(x,z),z);g.rotation.y=x*.9;courseG.add(g);trees.push({x,z,y:GY(x,z),r:.5*s,h:4.6*s,g});return}const g=new THREE.Group();mesh(G.cyl,TH.night?0x2a1a10:0x7a4b25,0,1.5*s,0,g).scale.set(.35*s,3*s,.35*s);const pal=TH.night?[0x0f3a22,0x123f2a,0x0c3020]:TH.snow?[0x2a6a4a,0x2f7a52,0x245e40]:[0x2e8b3a,0x3fa34d,0x267a33];const c=pal[Math.floor(Math.abs(x*7+z)%3)];const a=mesh(G.cone,c,0,4.5*s,0,g);a.scale.set(2.2*s,4*s,2.2*s);const b=mesh(G.cone,c,0,6.6*s,0,g);b.scale.set(1.6*s,3*s,1.6*s);
 if(TH.snow){const w=mesh(G.cone,0xffffff,0,7.6*s,0,g);w.scale.set(1.05*s,1.6*s,1.05*s);const w2=mesh(G.cone,0xf4f8ff,0,5.4*s,0,g);w2.scale.set(1.9*s,1.1*s,1.9*s)}
 if(TH.night){for(let k=0;k<5;k++){const a2=k*2.4+x,hh=3.2+k*.8;const o=mesh(G.sphL,new THREE.MeshBasicMaterial({color:GLOWC[(k+Math.floor(Math.abs(z)))%4]}),Math.cos(a2)*(2-k*.3)*s,hh*s,Math.sin(a2)*(2-k*.3)*s,g);o.scale.setScalar(.22*s);o.castShadow=false}}
 g.position.set(x,GY(x,z),z);courseG.add(g);trees.push({x,z,y:GY(x,z),r:1.6*s,h:8.5*s,g,sw:1})}
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
 toastClear();const keepG=new Set([...Object.values(G),pGeo]),keepM=new Set([...Object.values(matCache),LAVA]);courseG.traverse(o=>{if(o.geometry&&!keepG.has(o.geometry))o.geometry.dispose();const ms=o.material?[].concat(o.material):[];for(const m of ms)if(!keepM.has(m)){if(m.map&&m!==LAVA)m.map.dispose();m.dispose()}});
 while(courseG.children.length)courseG.remove(courseG.children[0]);trees=[];hills=[];windmill=null;cartObj=null;
 const h=course=Object.assign({},HOLES[i]);h.sand=h.sand||[];h.water=h.water||[];h.ice=h.ice||[];h.pin=h.pin||h.path[h.path.length-1];
 applyTheme();h.full=[...h.path,...(h.extra||[]),h.pin];h.hf=TH.lava&&h.el?makeHF(h):null;S.vSmoke=null;const HP=h.hf?h.hf.Hp:0,HT=h.hf?h.hf.Ht:0;
 if(h.hf)volcanoGround(h);else{const ground=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),gMat(TH.ground,0,0,{amp:TH.snow?.4:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;courseG.add(ground);
 // rough band
 ribbon(h.full,h.w+ROUGH*2,new THREE.Color(TH.rough).multiplyScalar(.95).getHex(),.01,0);
 ribbon(h.path,h.w,TH.fair,.02,1);
 if(h.extra)ribbon([h.extra[0],h.pin],h.w,TH.fair,.02,1);
 // stripes on fairway
 for(const w of h.water){flatDisc(w[2],TH.water,.05,w[0],w[1]).material=gMat(TH.water,4);flatDisc(w[2]+1.2,TH.shore,.045,w[0],w[1])}
 const sM=gMat(TH.sand,3);for(const s of h.sand)flatDisc(s[2],TH.sand,.06,s[0],s[1]).material=sM;
 for(const s of h.ice){flatDisc(s[2]+.8,0xffffff,.052,s[0],s[1]);const im=flatDisc(s[2],0xbfe8ff,.058,s[0],s[1]);im.material=new THREE.MeshLambertMaterial({color:0xbfe8ff,emissive:0x203848});for(let k=0;k<3;k++){const cr=new THREE.Mesh(new THREE.PlaneGeometry(s[2]*1.2,.12),MC(0xffffff));cr.rotation.set(-Math.PI/2,0,k*1.1+s[0]);cr.position.set(s[0],.06,s[1]);courseG.add(cr)}}
 if(h.island){flatDisc(h.gr+ISLE+1.2,TH.shore,.062,h.pin[0],h.pin[1]);flatDisc(h.gr+ISLE,TH.fair,.064,h.pin[0],h.pin[1]).material=gMat(TH.fair,1,[0,1])}}
 S.gDisc=[flatDisc(h.gr+2,TH.fringe,HP+.065,h.pin[0],h.pin[1]),flatDisc(h.gr,TH.green,HP+.07,h.pin[0],h.pin[1])];S.gDisc[0].material=gMat(TH.fringe,0,0,{amp:.5});S.gDisc[1].material=gMat(TH.green,2);if(TH.night){const gl=new THREE.Mesh(new THREE.RingGeometry(1,1.5,32),new THREE.MeshBasicMaterial({color:0x00ffcc}));gl.rotation.x=-Math.PI/2;gl.position.set(h.pin[0],.085,h.pin[1]);courseG.add(gl)}
 flatDisc(.75,0x111111,HP+.08,h.pin[0],h.pin[1]);
 // tee box
 const tb=mesh(G.box,gMat(0x8fe060,1,[0,1]),0,HT+.05,0,courseG);tb.scale.set(7,.12,7);tb.receiveShadow=true;
 for(const s of[-1,1]){const m=mesh(G.sph,0xff4040,s*2.5,HT+.3,-2,courseG);m.scale.setScalar(.3)}
 pinG=new THREE.Group();pinG.position.set(h.pin[0],HP,h.pin[1]);mesh(G.cyl,0xffffff,0,3,0,pinG).scale.set(.06,6,.06);
 flag=mesh(new THREE.PlaneGeometry(1.6,1,4,1),TH.night?new THREE.MeshBasicMaterial({color:0xff2bd6,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({color:0xff3030,side:THREE.DoubleSide}),.8,5.4,0,pinG);courseG.add(pinG);S.bar=null;if((i+CI)%2===0&&h.path&&h.path.length>1){const g=new THREE.Group();const bd=mesh(G.box,0xffffff,0,.9,0,g);bd.scale.set(2.2,1.1,1.3);const tp=mesh(G.box,0x3ccf6e,0,1.5,0,g);tp.scale.set(2.3,.12,1.4);for(const[x,z]of[[-.8,-.6],[.8,-.6],[-.8,.6],[.8,.6]]){const w=mesh(G.cyl,0x222222,x,.3,z,g);w.scale.set(.32,.2,.32);w.rotation.x=Math.PI/2;w.position.y=.32}const po=mesh(G.cyl,0xdddddd,0,2.4,0,g);po.scale.set(.05,1.8,.05);const um=new THREE.Mesh(new THREE.ConeGeometry(1.8,.8,8),new THREE.MeshLambertMaterial({color:0xff4060}));um.position.y=3.4;g.add(um);for(const[x,c]of[[-.6,0xff8c1a],[0,0xe8b030],[.6,0x9fe4ff]]){const bt=mesh(G.cyl,c,x,1.85,0,g);bt.scale.set(.18,.6,.18)}g.scale.setScalar(1.6);courseG.add(g);S.bar={g,path:h.path}}S.fakeF=[0,1].map(i=>{const g=pinG.clone(true);g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=0}});g.visible=false;courseG.add(g);return g});S.fakeP=[];S.gogA=0;
 const R=srand(h.seed*977);
 // trees along both sides
 for(let k=0;k<h.full.length-1;k++){const a=h.full[k],b=h.full[k+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/l,nz=(b[0]-a[0])/l;
  for(let d=10;d<l;d+=11+R()*10){for(const s of[-1,1]){if(R()<(TH.lava?.78:.35))continue;const off=h.w/2+6+R()*30,x=a[0]+(b[0]-a[0])*d/l+nx*off*s,z=a[1]+(b[1]-a[1])*d/l+nz*off*s;
   if(surface(x,z)==='rough'||surface(x,z)==='oob'){if(Math.hypot(x-h.pin[0],z-h.pin[1])>h.gr+6&&Math.hypot(x,z)>10)makeTree(x,z,.8+R()*.6)}}}}
 // a couple of nasty fairway trees
 if(CI===0){if(i===0)makeTree(-8,-120,1.1);if(i===4){makeTree(-4,-220,1);makeTree(20,-80,1)}}
 for(const q of h.cactus||[])makeCactus(q[0],q[1],1.1);
 // decor hills
 for(let k=0;k<14;k++){const a=k/14*Math.PI*2,r=360+R()*80;const m=mesh(G.sphL,TH.hill,h.pin[0]/2+Math.cos(a)*r,-30,h.pin[1]/2+Math.sin(a)*r,courseG);if(h.hf)m.position.y+=GY(m.position.x,m.position.z);m.scale.set(90+R()*60,70+R()*50,90);m.castShadow=false;hills.push(m)}
 {const cl=new THREE.InstancedMesh(G.sphL,cloudMat(),40),o=new THREE.Object3D();for(let k=0;k<10;k++){const cx=R()*700-350,cy=70+R()*40,cz=-R()*600+100;for(let j=0;j<4;j++){o.position.set(cx+j*9,cy+R()*4,cz+R()*5);o.scale.setScalar(7+R()*5);o.updateMatrix();cl.setMatrixAt(k*4+j,o.matrix)}}cl.frustumCulled=false;courseG.add(cl)}
 decorate(h,R);
 if(h.windmill){const g=new THREE.Group();g.position.set(h.windmill[0],0,h.windmill[1]);const t=mesh(new THREE.CylinderGeometry(2,3.2,10,8),0xc8553d,0,5,0,g);const r=mesh(G.cone,0x6b2e20,0,11.5,0,g);r.scale.set(3.4,3,3.4);
  const bl=new THREE.Group();bl.position.set(0,8,3.3);g.add(bl);for(let k=0;k<4;k++){const b=mesh(G.box,0xf4ecd8,0,4,0);b.scale.set(1.5,8,.2);const p=new THREE.Group();p.rotation.z=k*Math.PI/2;p.add(b);bl.add(p)}
  courseG.add(g);windmill={x:h.windmill[0],z:h.windmill[1],bl};trees.push({x:h.windmill[0],z:h.windmill[1],r:3.2,h:12})}
 if(h.cart!==undefined){const c=makeCart();c.scale.setScalar(1.6);c.position.set(0,0,h.cart);courseG.add(c);cartObj=c}
 // parked cart at tee
 const pc=makeCart(EQ().cart);pc.position.set(-7,GY(-7,3),3);pc.rotation.y=.3;courseG.add(pc);trees.push({x:-7,z:3,y:GY(-7,3),r:1.8,h:3,g:pc});
 h.wind={a:rand(0,Math.PI*2),s:Math.round(rand(0,i===5?9:7))};
 // hallucination props (absinthe): fake holes + hot tub green
 fakeHoles=[];for(let k=0;k<3;k++){const g=new THREE.Group();mesh(G.cyl,0xffffff,0,3,0,g).scale.set(.06,6,.06);const fl=mesh(G.box,new THREE.MeshBasicMaterial({color:[0x7dff4a,0xff2bd6,0xffd23f][k]}),.8,5.4,0,g);fl.scale.set(1.6,1,.05);const cup=new THREE.Mesh(new THREE.CircleGeometry(.75,20),MC(0x111111));cup.rotation.x=-Math.PI/2;cup.position.y=.09;g.add(cup);g.visible=false;courseG.add(g);fakeHoles.push(g)}
 hotTub=new THREE.Group();hotTub.position.set(h.pin[0],HP,h.pin[1]);const tw=new THREE.Mesh(new THREE.CircleGeometry(h.gr*.95,40),new THREE.MeshLambertMaterial({color:0x2fe0e0,emissive:0x0a5050,transparent:true,opacity:.85}));tw.rotation.x=-Math.PI/2;tw.position.y=.075;hotTub.add(tw);const rim=mesh(new THREE.TorusGeometry(h.gr*.97,.7,8,40),0x8b5a2b,0,.3,0,hotTub);rim.rotation.x=Math.PI/2;
 const duck=new THREE.Group();mesh(G.sph,0xffd23f,0,.5,0,duck).scale.set(.8,.6,1);mesh(G.sph,0xffd23f,0,1.1,.5,duck).scale.setScalar(.45);mesh(G.cone,0xff8a1a,0,1.05,1,duck).scale.set(.15,.4,.15);duck.children[2].rotation.x=Math.PI/2;duck.position.set(4,0,3);hotTub.add(duck);hotTub.userData.duck=duck;hotTub.visible=false;courseG.add(hotTub);
 // ambient: fireflies (night) / snowfall (frost) / dust (dune)
 amb=null;if(TH.night||TH.snow||CI===2||TH.lava){const N=TH.night?160:TH.snow?400:TH.lava?70:60,pa=new Float32Array(N*3);for(let k=0;k<N;k++){pa[k*3]=rand(-60,60);pa[k*3+1]=rand(.5,TH.snow?40:TH.lava?16:8);pa[k*3+2]=rand(-60,60)}const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pa,3));amb=new THREE.Points(gg,new THREE.PointsMaterial({color:TH.night?0xd8ff5a:TH.snow?0xffffff:TH.lava?0xff9a30:0xfff0c0,size:TH.night?.5:TH.snow?.35:TH.lava?.3:.25,transparent:true,opacity:TH.night?.95:.8,depthWrite:false}));amb.frustumCulled=false;amb.userData.base=pa.slice();courseG.add(amb)}
 if(TH.night){const mn=new THREE.Mesh(new THREE.SphereGeometry(18,20,14),new THREE.MeshBasicMaterial({color:0xfff8d8,fog:false}));mn.position.set(-160,140,-420);courseG.add(mn);const N=300,pa=new Float32Array(N*3);for(let k=0;k<N;k++){const a=rand(0,Math.PI*2),e=rand(.15,1.2);pa[k*3]=Math.cos(a)*Math.cos(e)*600;pa[k*3+1]=Math.sin(e)*600;pa[k*3+2]=Math.sin(a)*Math.cos(e)*600}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pa,3));const st=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false}));st.frustumCulled=false;courseG.add(st)}
 applyBallSkin();
}
let fakeHoles=[],hotTub=null,amb=null;
const cloudMats={};function cloudMat(){return cloudMats[TH.cloud]||(cloudMats[TH.cloud]=new THREE.MeshBasicMaterial({color:TH.cloud,fog:false}))}
function applyTheme(){scene.background=new THREE.Color(TH.sky);scene.fog.color.setHex(TH.sky);scene.fog.near=TH.fog?TH.fog[0]:TH.night?90:TH.lava?110:180;scene.fog.far=TH.fog?TH.fog[1]:TH.night?380:TH.lava?480:520;hemi.color.setHex(TH.hemi[0]);hemi.groundColor.setHex(TH.hemi[1]);hemi.intensity=TH.hemi[2];sun.intensity=TH.sun;sun.color.setHex(TH.sunC||(TH.night?0x9aa0ff:TH.lava?0xffb488:0xffffff))}
let ballPupil=null;
function applyBallSkin(){const k=EQ().ball,bm=ball.material;const C={white:[0xffffff,0x333333],gold:[0xffd700,0x664400],neon:[0x7dff4a,0x33aa00],eye:[0xffffff,0x333333],disco:[0xdddddd,0x444444]}[k]||[0xffffff,0x333333];bm.color.setHex(C[0]);bm.emissive.setHex(TH.night?(k==='white'?0x55ffcc:C[0]):C[1]);
 if(!ballPupil){ballPupil=new THREE.Group();const ir=mesh(G.sph,0x1f8fff,0,0,.22,ballPupil);ir.scale.set(.13,.13,.07);const pu=mesh(G.sph,0x111111,0,0,.26,ballPupil);pu.scale.set(.07,.07,.04);ball.add(ballPupil)}ballPupil.visible=k==='eye';
 const T2={white:0xffffff,fire:0xff7a1a,rainbow:0xff2bd6,bubbles:0xffd23f}[EQ().trail]||0xffffff;trail.material.color.setHex(T2)}
// ---------- particles ----------
const parts=[];const pGeo=new THREE.BoxGeometry(1,1,1);
function burst(pos,n,colors,spd=6,size=.25,up=4,life=1.2){n=Math.min(n,320-parts.length);for(let i=0;i<n;i++){const m=new THREE.Mesh(pGeo,MC(colors[i%colors.length]));m.position.copy(pos);m.scale.setScalar(size*rand(.5,1.3));scene.add(m);parts.push({m,v:new V3(rand(-1,1)*spd,rand(.3,1)*up+rand(0,spd*.5),rand(-1,1)*spd),l:life*rand(.6,1.2),r:new V3(rand(-5,5),rand(-5,5),0)})}}
const BUBM=new THREE.MeshBasicMaterial({color:0xeaf8ff,transparent:true,opacity:.55,depthWrite:false});
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
 {id:'dvit',e:'🧋',n:'Double Vodka Iced Tea',d:'+20% now · keeps creeping up for 4 strokes',amt:.2,col:0x9a5a1a,can:0xc98a3a,tall:1},
 {id:'vo1',e:'🍊',n:'Voddy Orange',d:'single · +16% smooth buzz',amt:.16,col:0xff8c1a,can:0xff8c1a,cup:1},
 {id:'vo2',e:'🍊',n:'Voddy Orange (Double)',d:'+28% bigger buzz',amt:.28,col:0xff7a00,can:0xff6a00,cup:1},
 {id:'dvsoda',e:'🫧',n:'Double Vodka Soda',d:'+27% · crisp, quick hit · +8% power',amt:.27,col:0xe8fbff,can:0x9fe4ff,cup:1},
 {id:'cola',e:'🥤',n:'Fizzy Pop',d:'+5% · giant burp',amt:.05,col:0xff3030,can:0xff3030}];
function frOf(s,c){return s==='green'&&c&&c.id!=='putter'?6:FR[s]}
const REST={green:.22,fairway:.3,rough:.18,sand:.04,ice:.5},KEEP={green:.5,fairway:.6,rough:.42,sand:.15,ice:.9},FR={green:1.7,fairway:6,rough:13,sand:16,ice:.9};
const windRes=()=>EQ().club==='neon'?.85:1;
function lieMult(c,s){if(c.id==='putter')return 1;return s==='sand'?(c.id==='wedge'?.85:.6):s==='rough'?.88:s==='ice'?.95:1}
// ---------- game state ----------
const APP_VER='v31';window.APP_VER=APP_VER;
const S={mode:'title',players:[],cur:0,hole:0,ballP:new V3(),ballV:new V3(),lastP:new V3(),aim:0,club:0,phase:'aim',power:0,pDir:1,acc:0,aDir:1,t:0,shake:0,flightT:0,golfer:null,cut:null,curve:0,camP:new V3(0,8,15),camL:new V3(),effects:{},spin:0,shotStart:new V3(),swingT:-1,lockedPow:0};
const P=()=>S.players[S.cur];const HV=()=>{const p=P();return p?clamp((p.drunk-.5)/.5,0,1):0};
// ---------- UI build ----------
function show(id,on=true){$(id).classList.toggle('show',on)}
function screen(id){for(const s of['title','setup','creator','how','pass','pause','card','courses','shop','trophy','online','lobby'])show(s,s===id);show('hud',id==='hud')}

// ---- reactions, replays, duck rescue
const RLINES=["Oh no. Oh no no no.","Folks, that is NOT how you play golf.","He's been practising that one. Clearly.","Somebody take his drinks away.","That ball had a family!","Let's slow it down... still terrible.","Textbook. If the textbook is on fire.","The fish are filing a complaint.","Bold strategy. Wrong, but bold.","And the crowd... goes silent.","A masterpiece of pure chaos.","I've seen better swings on a playground.","He meant to do that. Probably.","Let's never speak of this again.","Physics just called. It's crying."];
const cine=document.createElement('div');cine.id='cine';cine.innerHTML='<div class="rbadge">● REPLAY</div><div class="rcap"></div><div class="rskip">tap to skip</div>';document.body.appendChild(cine);
cine.addEventListener('pointerdown',e=>{e.preventDefault();if(S.rp)S.rp.t=9;if(S.dk)S.dk.t=9;if(S.bo)S.bo.t=Math.max(S.bo.t,3.4)});
function cineShow(cap,badge){cine.querySelector('.rcap').textContent=cap;cine.querySelector('.rbadge').style.display=badge?'':'none';cine.style.display='block'}
function react(kind){const p=P();if(!p||!S.golfer)return;if(kind==='good'||kind==='bad')netEv(kind);const d=p.drunk;if(kind==='bad'&&d>.6)kind='throw';S.react={kind,t:0,d};if(kind==='throw')throwClub()}
function throwClub(){const u=S.golfer.userData;if(S.clubFly)return;const m=u.club.clone();m.scale.multiplyScalar(1.8);const wp=new V3();u.club.getWorldPosition(wp);m.position.copy(wp).setY(1.4);const f=dirV(S.aim);S.clubFly={m,t:0,v:new V3(f.x*rand(6,9)+rand(-3,3),15,f.z*rand(6,9)+rand(-3,3)),o:wp.clone()};toast('🏌️💨 YEET!',true,1300);scene.add(m);setTimeout(()=>SFX.swing(),100)}
function maybeReplay(kind){S.dis=(S.dis||0)+1;if(S.clips&&S.rec&&S.rec.length>=10&&!S.reelOn){S.clips.push({kind,hole:S.hole,name:P().c.name,pts:S.rec.slice(-80).map(v=>v.clone()),sev:({water:2,oob:2,shank:1}[kind]||1)+(kind==='water'&&S.waterN>=3?2:0)+Math.random()*.5})}if(!S.rec||S.rec.length<10)return false;if(S.forceReplay)return true;return S.dis>1&&S.hole-(S.lastReplay??-9)>=3&&Math.random()<.35}
function startReplay(kind,then){S.lastReplay=S.hole;S.replays=(S.replays||0)+1;const pts=S.rec.slice(-80);S.rp={pts,t:0,dur:Math.min(2.8,pts.length/30),then,cur:pts[0].clone()};S.phase='replay';
 const tag={water:'💦 ',oob:'🚫 ',shank:'🙈 '}[kind]||'';cineShow(tag+RLINES[Math.floor(Math.random()*RLINES.length)],1);SFX.bad();SFX.ooh()}
function duckRescue(then,steal){const from=S.splashP.clone(),by=lavaLv(from.x,from.z);from.setY(by);const to=from.clone(),dir=S.lastP.clone().sub(from).setY(0);if(dir.length()<.1)dir.set(1,0,0);dir.normalize();for(let i=0;i<200&&surface(to.x,to.z)==='water';i++)to.addScaledVector(dir,1);to.addScaledVector(dir,-1.2);
 const g=makeDuck();g.scale.setScalar(2.4);mesh(G.sph,0xffffff,0,.78,-.18,g).scale.setScalar(.16);g.position.copy(from).setY(-1);g.rotation.y=Math.atan2(to.x-from.x,to.z-from.z);scene.add(g);if(TH.lava){mesh(G.sph,0xd8261c,0,.95,.33,g).scale.set(.24,.13,.26);mesh(G.cyl,0xd8261c,0,.89,.33,g).scale.set(.34,.03,.36);mesh(G.sph,0xffd23f,0,.98,.58,g).scale.setScalar(.06)}S.dk={g,from,to,t:0,dur:steal?2.3:2.1,then,q:0,steal,by};if(steal){S.dk.to=from.clone().addScaledVector(dir,-14)}S.phase='duck';cineShow(TH.lava?(steal?'🦆🔥 Third one? It\'s a hot potato now. Bye!':'🦆🧯 Fire Duck on duty! Ball\'s only a bit toasted.'):steal?'🦆 Third one? Nope. Finders keepers.':'🦆 Duck delivery! Your ball, sir.',0);SFX.quack()}
function cineClear(){if(S.dk)scene.remove(S.dk.g);if(S.clubFly)scene.remove(S.clubFly.m);S.rp=S.dk=S.cineCam=S.clubFly=S.react=null;cine.style.display='none'}
function updDeck(dt,t){const p=P(),on=S.mode==='play'&&p&&p.drunk>=.85&&S.club===4&&course&&surface(S.ballP.x,S.ballP.z)==='green'&&['aim','swing','fly'].includes(S.phase);
 const th=on?.03*Math.sin(t*.7):0,ax=t*.22,dx=Math.cos(ax),dz=Math.sin(ax);S.deck=on?{gx:dx*th*20,gz:dz*th*20,h:(x,z)=>((x-course.pin[0])*dx+(z-course.pin[1])*dz)*Math.sin(th)}:null;S.deckTh=th;
 if(S.gDisc)for(const m of S.gDisc){m.rotation.set(-Math.PI/2,0,0);m.rotateOnWorldAxis(new V3(1,0,0),-dz*th);m.rotateOnWorldAxis(new V3(0,0,1),dx*th)}}
function blackoutCheck(){const p=P();if(S.boDone||p.drunk<.97||p.strokes<2)return false;if(!S.boForce&&Math.random()>.4)return false;
 S.boDone=1;if(S.rc)raceFin('bo');if(p.st&&course.par===3)p.st.bo3=1;const sc=Math.max(p.strokes+1,course.par+1+Math.floor(Math.random()*3));p.strokes=Math.min(sc,course.par+5);p.drunk=.6;p.hang=1;S.phase='wait';SFX.bad();
 S.bo={t:0,sc:p.strokes,line:['…You don\'t want to know.','Caddie: You don\'t want to know.','Caddie: We\'re not talking about it. Ever.','Caddie: The duck saw everything.'][Math.floor(Math.random()*4)]};return true}
function updCine(dt,t){updDeck(dt,t);if(S.bo){S.bo.t+=dt;$('black').style.opacity=S.bo.t<.8?S.bo.t/.8:S.bo.t<3.4?1:Math.max(0,1-(S.bo.t-3.4)/.6);if(S.bo.t>1&&!S.bo.cap){S.bo.cap=1;cineShow(S.bo.line,false)}if(S.bo.t>=4){const b=S.bo;S.bo=null;cine.style.display='none';$('black').style.opacity=0;S.black=0;toast(`💀 Woke up. Hole done: ${b.sc} strokes`,false,2200);finishHole()}return}if(S.hints&&S.hints.length&&S.mode==='play'&&!S.onb){if($('toasts').children.length)S.hintT=Math.min(S.hintT,0);else if((S.hintT+=dt)>.7){toast(S.hints.shift(),true,3000);S.hintT=-3}}if(S.mode!=='play'&&(S.rp||S.dk))cineClear();
 if(S.clubFly){const c=S.clubFly;c.t+=dt;c.v.y-=22*dt;c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=dt*26;c.m.rotation.z+=dt*11;if(S.phase==='aim'&&!S.rp&&!S.dk){S.cineCam={p:c.o.clone().add(new V3(c.v.z*.0+5,3.5,5)).lerp(c.m.position.clone().add(new V3(5,2,5)),.4),l:c.m.position.clone()};c.cam=1}else if(c.cam){S.cineCam=null;c.cam=0}if(c.t>1.45){if(c.cam)S.cineCam=null;scene.remove(c.m);if(S.golfer)burst(S.golfer.position.clone().setY(1.2),10,[0xffffff,0xffd23f],3,.2,4);SFX.coin();S.clubFly=null}}
 if(S.rp){const r=S.rp;r.t+=dt;const k=clamp(r.t/r.dur,0,1),f=k*(r.pts.length-1),i=Math.floor(f);r.cur.copy(r.pts[i]).lerp(r.pts[Math.min(i+1,r.pts.length-1)],f-i);
  const a=r.pts[0],b=r.pts[r.pts.length-1],d=b.clone().sub(a).setY(0);if(d.length()<.1)d.set(1,0,0);d.normalize();S.cineCam={p:r.cur.clone().add(new V3(-d.z*12-d.x*4,4,d.x*12-d.z*4)),l:r.cur.clone()};
  if(r.t>=r.dur){S.rp=null;S.cineCam=null;cine.style.display='none';r.then()}}
 else if(S.dk&&S.dk.steal){const d=S.dk;d.t+=dt;const g=d.g;if(d.t<.35)g.position.y=lerp(-1,0,d.t/.35)+d.by;if(d.t<1){const cp=camera.position;g.rotation.y=Math.atan2(cp.x-g.position.x,cp.z-g.position.z);g.rotation.z=d.t>.6?Math.sin(d.t*20)*.15:0;if(d.t>.6&&!d.q){d.q=1;SFX.quack()}}else{const k=clamp((d.t-1)/1.2,0,1);g.rotation.y=Math.atan2(d.to.x-d.from.x,d.to.z-d.from.z);g.position.lerpVectors(d.from,d.to,k*k);g.position.y=d.by+Math.sin(t*14)*.08;if(TH.lava&&Math.random()<.7)burst(g.position.clone().add(new V3(0,2.1,0)),1,[0xff7a1a,0xffd23f,0xff3030],.8,.25,2,.5);g.rotation.z=Math.sin(t*14)*.18;if(d.q===1&&k>.3){d.q=2;SFX.quack()}}
  if(!d.cp){d.cp=d.from.clone().addScaledVector(d.to.clone().sub(d.from).normalize(),TH.lava?-11:-7).add(new V3(0,TH.lava?6.5:3.5,0))}S.cineCam={p:d.cp,l:g.position.clone().setY(d.by+.8)};
  if(d.t>=d.dur){scene.remove(g);S.dk=null;S.cineCam=null;cine.style.display='none';d.then()}}
 else if(S.dk){const d=S.dk;d.t+=dt;const k=clamp((d.t-.35)/1.4,0,1),e=k*k*(3-2*k);d.g.position.lerpVectors(d.from,d.to,e);d.g.position.y=d.by+(d.t<.35?lerp(-1,0,d.t/.35):Math.sin(t*9)*.06);d.g.rotation.z=Math.sin(t*12)*.12;
  if(k>=1&&!d.q){d.q=1;SFX.quack();burst(d.to.clone().setY(d.by+.5),12,TH.lava?[0xff7a1a,0x888888]:[0x8fd3ff,0xffffff],3,.2,4)}
  {const dv=d.to.clone().sub(d.from).setY(0);if(dv.length()<.1)dv.set(0,0,1);dv.normalize();S.cineCam={p:d.g.position.clone().addScaledVector(dv,-6).add(new V3(dv.z*4,4,-dv.x*4)),l:d.g.position.clone().addScaledVector(dv,2).setY(d.by+.8)}}
  if(d.t>=d.dur){scene.remove(d.g);S.dk=null;S.cineCam=null;cine.style.display='none';d.then()}}}
function reactAnim(g,u,dt,t,dr,r){if(S.mode!=='play')return;
 if(S.react){const R=S.react;R.t+=dt;const k=R.t,d=R.d;if(k>1.8||S.phase==='power'||S.phase==='acc'||S.swingT>=0||S.phase==='chug'||S.phase==='keg'||S.phase==='holed'){S.react=null;return}const fade=clamp((1.8-k)*3,0,1);
  if(R.kind==='good'){if(k<.6||d<.3){u.armR.rotation.set(0,0,2.5+Math.sin(k*18)*.35);u.swing.rotation.z=0;g.position.y=Math.abs(Math.sin(k*9))*.12*fade}
   else{const w=.15+d*.55;u.body.rotation.z=Math.sin(k*10)*w*fade;u.armL.rotation.set(0,0,-1.6-Math.sin(k*10)*w);u.armR.rotation.set(0,0,1.6-Math.sin(k*10)*w);g.position.y=Math.abs(Math.sin(k*10))*.18*fade;g.rotation.z=Math.sin(k*5)*.15*d*fade}}
  else if(R.kind==='bad'){if(d<.3){g.position.y=Math.abs(Math.sin(k*14))*.12*fade;u.head.rotation.x=.45*fade;u.armL.rotation.z=-.1;u.armR.rotation.z=.1}else{u.armL.rotation.set(-2.5*fade,0,-.35);u.armR.rotation.set(-2.5*fade,0,.35);u.head.rotation.x=.55*fade;u.body.rotation.x=.3*fade;g.rotation.z=Math.sin(k*6)*.08*fade}}
  else{const a=clamp(k/.25,0,1);u.armR.rotation.set(-2.9*fade*(k<.25?a:1),0,.3);u.body.rotation.z=Math.sin(k*8)*.2*fade;u.head.rotation.x=-.25*fade;g.position.y=Math.abs(Math.sin(k*12))*.1*fade}
  return}
 if(S.phase!=='aim'||dr<.3)return;g.rotation.z=Math.sin(t*1.3)*.07*dr;if(dr>.7){const st=(t+1)%4.5;if(st<1.2){const l=Math.sin(st/1.2*Math.PI),sg=Math.floor((t+1)/4.5)%2?1:-1;g.position.addScaledVector(r,l*.7*sg);g.rotation.z+=l*.35*sg;u.armL.rotation.z=-.4-1.6*l;u.armR.rotation.z=.4+1.6*l;u.head.rotation.z=-l*.3*sg}}}
let tCur=null;const TQ=[];
function toast(txt,sm=false,ms=2200){if(tCur&&tCur.txt===txt||TQ.some(q=>q.txt===txt))return;const q={txt,sm,ms};
 if(!tCur||tCur.ms<=1300)return tShow(q);TQ.push(q);if(TQ.length>2)TQ.shift();clearTimeout(tCur.to);tCur.to=setTimeout(tEnd,Math.max(0,Math.min(tCur.end-performance.now(),650)))}
function tShow(q){if(tCur){clearTimeout(tCur.to);tCur.w.remove()}const d=document.createElement('div');d.className='toast'+(q.sm?' sm':'');d.textContent=q.txt;d.style.animationDuration=q.ms+'ms';const w=document.createElement('div');w.appendChild(d);$('toasts').appendChild(w);q.w=w;q.end=performance.now()+q.ms;q.to=setTimeout(tEnd,q.ms);tCur=q}
function tEnd(){if(tCur){tCur.w.remove();tCur=null}const n=TQ.shift();if(n)tShow(n)}
function toastClear(){TQ.length=0;if(tCur){clearTimeout(tCur.to);tCur.w.remove();tCur=null}}
function fadeIn(ms=320){const f=$('fade');if(!f)return;f.style.transition='none';f.style.opacity=1;requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition=`opacity ${ms}ms ease-out`;f.style.opacity=0}))}
const bestTxt=()=>{const v=$('appVer');if(v)v.textContent=APP_VER;const b=LS.get('best_sunny',LS.get('best',null));$('bestTxt').textContent=b?`🏆 Sunny Links best: ${b.score} (${b.rel>0?'+':''}${b.rel}) by ${b.name}`:'5 courses · 30 holes of questionable decisions';$('coinTxt').textContent=`🪙 ${coins()}  ·  ⭐ ${LS.get('cstyle',0)} career style`};
function buildCourses(){const el=$('cList');el.innerHTML='';COURSES.forEach((c,i)=>{const open=courseOpen(i),b=LS.get('best_'+c.id,null),par=c.holes.reduce((a,h)=>a+h.par,0),th=THEMES[c.theme];const d=document.createElement('div');d.className='crs'+(open?'':' locked');d.style.background=`linear-gradient(135deg,#${th.sky.toString(16).padStart(6,'0')},#${th.fair.toString(16).padStart(6,'0')})`;
 d.innerHTML=`<div class="ce">${c.e}</div><div class="ct"><b>${c.n}</b><small>${c.d}</small><small>Par ${par} · ${c.holes.length} holes${(()=>{const pb=LS.get('pb_'+c.id,null),pw=LS.get('pw_'+c.id,null);return pb?` · 🌟 PB ${pb.score} · 💀 PW ${pw?pw.score:'-'}`:b?` · 🏆 ${b.score}`:''})()}${cleared().includes(c.id)?' · ✅':''}</small></div>${open?'<div class="cgo">▶</div>':`<div class="cbuy">🔒<br>${i>0&&!cleared().includes(COURSES[i-1].id)?'Clear '+COURSES[i-1].n.split(' ')[0]+'<br>or ':''}🪙${c.cost}</div>`}`;
 d.onclick=()=>{if(open){SFX.click();if(S.netIntent==='host'){S.netCi=i;startCreator(1)}else{setCourse(i);if(S.vsIntent)startCreator(1);else screen('setup')}}else if(coins()>=c.cost){addCoins(-c.cost);LS.set('owned',[...owned(),'course:'+c.id]);SFX.coin();celebrate(c.e,c.n,'Course unlocked!');buildCourses();bestTxt()}else{SFX.bad();toast(`Need 🪙${c.cost-coins()} more. Play rounds to earn!`,true,1500)}};el.appendChild(d)});$('cCoins').textContent='🪙 '+coins()}
let shopCat=0;
function buildShop(){$('sCoins').textContent='🪙 '+coins();const tabs=$('sTabs');tabs.innerHTML='';SHOP.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.cat;if(i===shopCat)b.className='sel';b.onclick=()=>{shopCat=i;SFX.click();buildShop()};tabs.appendChild(b)});
 const g=$('sGrid');g.innerHTML='';const cat=SHOP[shopCat],eq=EQ();for(const it of cat.items){const own=isOwned(it.id),[k,v]=it.id.split(':'),on=cat.slot&&eq[cat.slot]===v;const d=document.createElement('div');d.className='itm'+(own?' own':'')+(on?' on':'');
  const sw=v[0]==='#'?`<span class="swc" style="background:${v}"></span>`:'';d.innerHTML=`<div class="e">${it.e}</div><b>${it.n}</b>${sw}<small>${it.d||''}</small><div class="pr">${on?'EQUIPPED':own?(cat.slot?'Equip':'Owned ✓ (Creator)'):'🪙 '+it.p}</div>`;
  d.onclick=()=>{if(own){if(cat.slot){const e=EQ();e[cat.slot]=v;LS.set('eq',e);SFX.click();buildShop()}return}if(coins()>=it.p){addCoins(-it.p);SFX.coin();grant(it.id,cat.slot?'Equipped!':'Now in the Golfer Creator');buildShop();bestTxt()}else{SFX.bad();toast(`Need 🪙${it.p-coins()} more`,true,1100)}};g.appendChild(d)}}
$('bShop').onclick=()=>{SFX.click();buildShop();screen('shop')};$('bShopBack').onclick=()=>{SFX.click();bestTxt();screen('title')};$('bCrsBack').onclick=()=>{SFX.click();screen('title')};
bestTxt();
$('bVs').onclick=()=>{SFX.click();S.vs=0;S.vsIntent=1;buildCourses();screen('courses')};
$('bPlay').onclick=()=>{SFX.click();S.vs=0;S.vsIntent=0;buildCourses();screen('courses')};$('bHow').onclick=()=>{SFX.click();showIntro()};$('bHow2').onclick=()=>{SFX.click();showIntro()};$('bHowBack').onclick=()=>{screen(S.mode==='paused'?'pause':'title')};$('bSetupBack').onclick=()=>{buildCourses();screen('courses')};
for(let n=1;n<=4;n++){const b=document.createElement('button');b.className='big';b.textContent=n===1?'Solo':n+' Players';b.onclick=()=>{SFX.click();startCreator(n)};$('pcount').appendChild(b)}
// creator
let cIdx=0,cN=1,cChar=null,cGolfer=null;const cScene=new THREE.Scene();cScene.background=new THREE.Color(0x7cc6f2);
cScene.add(new THREE.HemisphereLight(0xffffff,0x557744,1.2));const cl=new THREE.DirectionalLight(0xffffff,1.4);cl.position.set(3,6,5);cScene.add(cl);
{const p=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,.3,32),MC(0x7ccf4f));p.position.y=-.15;cScene.add(p);const g=new THREE.Mesh(new THREE.CircleGeometry(30,32),MC(0x4f9a3a));g.rotation.x=-Math.PI/2;g.position.y=-.3;cScene.add(g)}
const cCam=new THREE.PerspectiveCamera(40,1,.1,100);
function startCreator(n){cN=n;cIdx=0;S.players=[];ac();editChar()}
function editChar(){const saved=LS.get('chars',[]);cChar=Object.assign(randomChar(cIdx),saved[cIdx]?Object.assign({},CDEF,saved[cIdx]):{});S.mode='creator';screen('creator');$('cTitle').textContent=cN>1?`Golfer ${cIdx+1}/${cN}`:'Create your golfer';$('cName').value=cChar.name;buildOpts();rebuildPreview()}
function rebuildPreview(){if(cGolfer)cScene.remove(cGolfer);cGolfer=makeGolfer(cChar);cGolfer.userData.club.visible=false;setPose(cGolfer,'rest');cScene.add(cGolfer)}
const LBL={skin:'Skin',shirt:'Shirt',pants:'Pants',hat:'Hat',hatC:'Hat color',face:'Face',stache:'Face fuzz',hair:'Hair',hairC:'Hair color',glasses:'Eyewear',body:'Body',pattern:'Shirt pattern',socks:'Socks',tan:'Tan'};
function buildOpts(){const o=$('cOpts');o.innerHTML='';for(const k of Object.keys(LBL)){const r=document.createElement('div');r.className='opt';r.innerHTML=`<b>${LBL[k]}</b>`;const ch=document.createElement('div');ch.className='ch';
 for(const v of OPTS[k]){const e=document.createElement('div');if(v[0]==='#'){e.className='sw';e.style.background=v}else{e.className='tx';e.textContent=v}const lk=isLocked(k,v);if(lk)e.classList.add('lock');if(cChar[k]===v)e.classList.add('sel');e.onclick=()=>{if(lk){SFX.bad();toast('🔒 Unlock it in the Shop',true,1100);return}cChar[k]=v;SFX.click();buildOpts();rebuildPreview();cGolfer.userData.body.rotation.y=0;tipsy=0};ch.appendChild(e)}r.appendChild(ch);o.appendChild(r)}}
let tipsy=0;
$('cRand').onclick=()=>{const n=cChar.name;cChar=randomChar();cChar.name=$('cName').value||cChar.name;SFX.hic();buildOpts();rebuildPreview()};
$('cName').oninput=e=>cChar.name=e.target.value;
$('cNext').onclick=()=>{SFX.click();cChar.name=($('cName').value||'Golfer '+(cIdx+1)).slice(0,12);const saved=LS.get('chars',[]);saved[cIdx]=cChar;LS.set('chars',saved);
 S.players.push({c:cChar,g:null,drunk:0,peak:0,hang:0,scores:[],style:0,strokes:0,steady:0,boost:0});cIdx++;if(cIdx<cN)editChar();else if(S.netIntent){const r=S.netIntent;S.netIntent=null;netLobby(r,S.netCode)}else if(S.vsIntent)startVs();else startRound()};
// HUD clubs
CLUBS.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.n;b.onclick=e=>{e.stopPropagation();if(S.phase!=='aim')return;SFX.click();setClub(i)};$('clubs').appendChild(b)});
function setClub(i){S.club=i;[...$('clubs').children].forEach((b,j)=>b.classList.toggle('sel',j===i))}
DRINKS.forEach(d=>{const b=document.createElement('button');b.className='dk';b.innerHTML=`<div class="e">${d.e}</div><div class="n">${d.n}</div><div class="d">${d.d}</div>`;b.onclick=()=>{show('drinks',false);drink(d)};$('drinks').appendChild(b)});
{const b=document.createElement('button');b.textContent='Never mind';b.onclick=()=>show('drinks',false);$('drinks').appendChild(b)}
$('bDrink').onclick=e=>{if(S.mode!=='play'||S.phase!=='aim')return;if(S.rc){toast('🏁 Race rules: house drink only',true,1300);return}SFX.click();show('drinks',!$('drinks').classList.contains('show'))};
$('bPause').onclick=()=>{engSet(0,0,0);if(S.mode!=='play')return;S.mode='paused';screen('pause')};
$('bResume').onclick=()=>{S.mode='play';screen('hud')};
$('bSound').onclick=()=>{soundOn=!soundOn;if(!soundOn)engSet(0,0,0);LS.set('sound',soundOn);$('bSound').textContent='Sound: '+(soundOn?'On':'Off')};$('bSound').textContent='Sound: '+(soundOn?'On':'Off');
$('bQuit').onclick=()=>{if(myCart){myCart.remove(S.golfer);courseG.remove(myCart);myCart=null;$('cartUI').style.display='none'}ball.visible=true;netLeave();S.mode='title';screen('title');bestTxt()};
$('bCard').onclick=()=>{showCard(false)};
// ---------- round flow ----------
const TROPHIES=[['race','🏁','Race Winner','Won a Pub Crawl Race online',ps=>S.raceWin?[ps[0]]:[]],['ducks','🦆','Duck Hunter','Most ducks hit in the cart',ps=>top(ps,p=>p.st.ducks,1)],['bo3','🌑','Blacked Out on a Par 3','Woke up on the shortest hole',ps=>ps.filter(p=>p.st.bo3)],['stolen','🦹','Duck Thief Victim','A duck kept your ball',ps=>ps.filter(p=>p.st.stolen)],['sober','😇','Sober Saint','Never passed 15% Buzz all round',ps=>ps.filter(p=>p.st.maxB<.15)],['shank','🙈','Shank Lord','Most shanks (2+)',ps=>top(ps,p=>p.st.shanks,2)],['splash','💦','Splash Zone','Most water balls (3+)',ps=>top(ps,p=>p.st.water,3)],['tab','🧾','Bar Tab Legend','6+ drinks in a round',ps=>ps.filter(p=>p.st.drinks>=6)],['dare','🎯','Daredevil','3+ dares completed',ps=>ps.filter(p=>p.st.dares>=3)]];
function top(ps,f,min){const m=Math.max(...ps.map(f));return m>=min?ps.filter(p=>f(p)===m):[]}
function awardTrophies(){if(S.trDone)return;S.trDone=1;const shelf=LS.get('trophies',{});let h='';for(const[id,e,n,d,fn]of TROPHIES){const w=S.players[0].st?fn(S.players.filter(p=>!p.ai)):[];if(w.length){shelf[id]=(shelf[id]||0)+1;h+=`<div class="trw">${e} <b>${n}</b> · ${w.map(p=>esc(p.c.name)).join(', ')}</div>`}}LS.set('trophies',shelf);S.trophyHtml=h?`<div class="troph"><b>🏆 Trophies</b>${h}</div>`:''}
function buildShelf(){const sh=LS.get('trophies',{});$('tList').innerHTML=TROPHIES.map(([id,e,n,d])=>`<div class="tr ${sh[id]?'':'lk'}"><div class="te">${sh[id]?e:'❔'}</div><b>${n}</b><small>${d}</small>${sh[id]?`<span>×${sh[id]}</span>`:''}</div>`).join('')}
function playReel(){const cl=[...S.clips].sort((a,b)=>b.sev-a.sev).slice(0,3);let i=0;S.reelOn=1;const last=S.hole;$('top').style.visibility='hidden';$('bottom').style.visibility='hidden';
 const next=()=>{if(i>=cl.length){S.reelOn=0;S.rp=null;S.cineCam=null;cine.style.display='none';S.hole=last;$('top').style.visibility='';$('bottom').style.visibility='';S.mode='card';screen('card');return}const c=cl[i++];S.mode='play';screen('hud');buildHole(c.hole);S.rec=c.pts;ball.visible=true;if(S.golfer)S.golfer.visible=false;startReplay(c.kind,next);const tag={water:'💦',oob:'🚫',shank:'🙈'}[c.kind]||'💥';cineShow(`🎬 ${i}/${cl.length} · Hole ${c.hole+1} · ${c.name}: ${tag} ${c.sev>=4?'The duck kept it.':RLINES[Math.floor(Math.random()*RLINES.length)]}`,1)};next()}
function startRound(){S.g5Done=0;S.g5=-1;S.force5=0;if(!S.net)S.race=0;S.trDone=0;S.pbDone=0;S.trophyHtml='';S.hole=0;S.paid=0;S.roundCoins=0;S.cur=0;for(const p of S.players){p.scores=[];p.style=0;p.bb=0;p.st={ducks:0,water:0,shanks:0,stolen:0,bo3:0,maxB:0,drinks:0,dares:0}}S.clips=[];S.reelOn=0;S.waterN=0;S.dis=0;S.lastReplay=-9;S.replays=0;S.boDone=0;S.bo=null;startTurn()}
// ---------- Play vs Slay ----------
const SLAY={name:'Slay',skin:'#f1c08a',shirt:'#3cc8bd',pants:'#2b2b3a',hat:'None',hatC:'#ffffff',face:'Grin',stache:'Goatee',glasses:'None',body:'Classic',hair:'Slay',hairC:'#6b4423',pattern:'Dots',socks:'Ankle',tan:'Normal',prop:'vodka'};
const VDR=['vsoda','dvsoda','dvit','vo1','vo2'];
const SLINES={drink:['Barkeep! {d} for me and my rival!','{d}? Excellent coolant choice.','My blood is 40% proof and rising. {d} please!','{d}! Fuel rods: loaded.','{d}s all round. Hydration is a mindset.','Calculating trajectory... carry the {d}...'],
 pure:['CRITICAL MASS, BABY! ☢️','ACHIEVING FISSION!','DID YOU SEE THAT?! SLAAAY!','Technically that was a controlled reaction 😎','Peer review THAT, nerd!','Half-life of that shot: FOREVER!'],
 shank:['Meltdown imminent 🚨','That was... an uncontrolled reaction.','Containment breach! Nobody saw that.','Calculating trajectory... carry the vodka...','Ball went rogue. Like my isotopes.'],
 jab:['Honestly? That was terrible. Cheers! 🍸','Wow. Even I hit better than that, and I\'m hammered.','Bold strategy. Wrong, but bold.','I love you, but that shot was garbage.','My grandma\'s Geiger counter swings better.'],
 cart:['You drive like my reactor: barely contained','Pull over, I need a refill 🍸','I\'m not spilling, I\'m sharing!','My blood is 40% proof and rising','Faster! My drink\'s getting warm!','Fun fact: this cart has less shielding than my liver.','Left! No, your OTHER left!','Best. Caddie. Ever.'],
 bump:['WOOO! Again!','My drink survived! 🙌','Radiation sickness? No, that\'s just the vodka.','AIRBORNE! Escape velocity!'],
 honk:['HONK HONK! 📯','Outta the way, ducks! Nuclear engineer coming through!','Beep beep, birdies!']};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function addShades(g){const h=g.userData.head;if(!h||h.userData.sh)return;h.userData.sh=1;
 const P5=[[0,.03,.36,0,0,0,0x111111,0x222222],[0,.1,.38,.12,0,0,0xff3fa4,0x7af0ff],[0,.27,.4,-.45,0,0,0xffd23f,0x3a2a10],[0,.45,.06,-1.35,0,0,0x2fd36b,0xff7b00],[0,.2,-.36,.3,Math.PI,0,0xffffff,0x4466ff],[.02,-.05,.39,0,0,.32,0xff2222,0x111111]];
 for(const[x,y,z,rx,ry,rz,fc,lc]of P5){const gg=new THREE.Group();gg.position.set(x,y,z);gg.rotation.set(rx,ry,rz);h.add(gg);
  for(const sd of[-1,1]){const l=mesh(G.sph,MC(lc),sd*.12,0,0,gg);l.scale.set(.1,.075,.03);const f=mesh(G.sph,MC(fc),sd*.12,0,-.008,gg);f.scale.set(.118,.09,.022)}
  mesh(G.cyl,MC(fc),0,.02,0,gg).scale.set(.06,.012,.012).constructor;const br=gg.children[gg.children.length-1];br.rotation.z=Math.PI/2}}
function softD(p){return p&&p.drunk>.5?1-.28*Math.min(1,(p.drunk-.5)/.3):1}
function want5(){const hu=S.players.find(p=>!p.ai);if(!S.vs||S.g5Done||!hu)return 0;if(hu.drunk>=.5||S.force5)S.w5=1;const mid=Math.max(0,Math.min(Math.floor((HOLES.length-1)/2),HOLES.length-2));if(S.hole>=mid)S.w5=1;return!!(S.w5||S.force5)}
function try5(){if(!want5()||S.cut5||S.mode!=='play')return;if(S.phase!=='aim'||S.cut||S.bo||S.rp||S.dk||S.onb||S.vsExtra)return;if(performance.now()<(S.aiHold||0))return;start5()}
function start5(ms){S.g5Done=1;S.g5=S.hole;S.cut5={t0:performance.now(),lock:performance.now()+1600};addShades(S.golfer);document.body.classList.add('cut5');
 slaySay('😎😎😎😎😎 "I got 5 pairs of sunglasses for 5 bucks."',5200,1);$('slayBub').classList.add('big5');
 SFX.drumroll&&SFX.drumroll();setTimeout(()=>{if(S.cut5){SFX.woo();SFX.cheer&&SFX.cheer()}},1700);S.cut5.to=setTimeout(end5,ms||5200)}
function end5(){if(!S.cut5)return;clearTimeout(S.cut5.to);S.cut5=null;document.body.classList.remove('cut5');$('slayBub').classList.remove('big5');$('slayBub').style.display='none';snapCam();setTimeout(vsDrink,600)}
function slaySay(t,ms=2400,f){const b=$('slayBub');if(!b||S.cut5&&!f)return;b.textContent=t;b.style.display='block';b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');clearTimeout(slaySay.to);slaySay.to=setTimeout(()=>b.style.display='none',ms)}
function vsDrink(){if(S.cut5)return;const p=P();if(!S.vs||!p||S.mode!=='play'||S.phase!=='aim')return;if(!p.ai&&S.vsDH===S.hole+'h')return;if(p.ai&&S.vsDH===S.hole+'s')return;
 if(p.ai){S.vsD=pick(VDR)}const d=DRINKS.find(x=>x.id===S.vsD)||DRINKS.find(x=>x.id==='vsoda');S.vsDH=S.hole+(p.ai?'s':'h');
 if(p.ai){slaySay('🍸 '+pick(SLINES.drink).replace('{d}',d.n),2800)}else toast(`🍸 Slay's round: ${d.e} ${d.n} for your golfer`,true,2200);
 const cap=p.ai?.93:.9;drink(d);p.drunk=Math.min(p.drunk,cap);
 if(p.ai)S.vsExtra={d:pick(VDR),h:S.hole}}
function slay2nd(){const x=S.vsExtra,p=P();S.vsExtra=null;if(!x||!p||!p.ai||!S.vs||x.h!==S.hole||S.phase!=='aim')return;const d=DRINKS.find(q=>q.id===x.d)||DRINKS.find(q=>q.id==='vsoda');slaySay('🍸 Slay orders another round! Double-fisting!',1900);S.aiHold=performance.now()+2300;
 setTimeout(()=>{if(P()!==p||S.phase!=='aim')return;const old=p.drunk;p.drunk=Math.min(.95,p.drunk+.08+Math.random()*.06);p.peak=Math.max(p.peak,p.drunk);startChug(d,`🍸 Round two! ${d.e} ${d.n} · +${Math.round((p.drunk-old)*100)}%`,old);S.cut.dur=1.35;S.cut.dbl=1;SFX.glug();setTimeout(()=>SFX.glug(),450);S.shake=.25;updHUD()},300)}
function slayTick(){if(S.vs&&S.mode==='play')try5();const p=P(),on=!!(S.vs&&p&&p.ai&&S.mode==='play');document.body.classList.toggle('aiturn',on);if(!on){S.aiW=0;return}
 const now=performance.now();if(S.cut5)return;if(S.phase==='aim'&&!S.cut&&!S.bo&&!S.rp&&!S.dk&&!S.onb&&S.vsDH===S.hole+'s'){if(!S.aiW)S.aiW=now+(S.aiFast?450:1500);else if(now>S.aiW&&now>(S.aiHold||0)){S.aiW=0;slayShot()}}else S.aiW=0}
function slayShot(){const p=P();calcHint();const h=S.hint,d=p.drunk;const ci=h.rec;setClub(ci);aimAtPin();let pw=h.pw[ci]||1,acc=0,aimE=0;const pure=Math.random()<.18||!!S.forcePure;S.aiPure=pure;const k=.6+d;
 if(!pure){const r=Math.random();if(ci===4){pw*=r<.55?rand(.5,.85):rand(.95,1.35);aimE=rand(-.1,.1)*k}
  else if(r<.25)pw*=rand(.2,.5);else if(r<.5)acc=rand(.35,.75)*(Math.random()<.8?1:-1)*k;else if(r<.62)aimE=rand(.45,.8)*(Math.random()<.5?1:-1);else{pw*=rand(.78,1.02);acc=rand(-.3,.3)*k}}
 S.aiRef=S.aim;S.aim+=aimE;S.lockedPow=clamp(pw,.02,1);S.acc=clamp(acc,-1,1);S.phase='acc';shoot()}
function slayPumped(){S.pumpCam=performance.now()+2200;S.react={kind:'good',t:0,d:.1};S.aiHold=performance.now()+2300;const l=pick(SLINES.pure);toast('🍸 '+l,false,1800);slaySay(l,1800);SFX.cheer();SFX.roar();setTimeout(SFX.woo,250);setTimeout(()=>{addCoins(5);SFX.coin();toast('+5 🪙 hype bonus',true,1200)},900)}
function startVs(){S.vs=1;S.g5Done=0;S.w5=0;S.vsIntent=0;S.players.unshift({c:Object.assign({},SLAY),ai:1,g:null,drunk:.1,peak:0,hang:0,scores:[],style:0,strokes:0,steady:0,boost:0});startRound()}
function startTurn(){cineClear();fadeIn();S.rc=null;$('raceHud').style.display='none';if(S.remotes)remoteClear();S.waterN=0;const p=P();p.hd={d:new Set()};S.barUsed=0;S.barFree=0;buildHole(S.hole);p.strokes=0;if(S.hole>0){p.drunk=Math.max(0,p.drunk-.05)}
 S.ballP.set(0,GY(0,0)+.35,0);S.ballV.set(0,0,0);S.lastP.copy(S.ballP);S.phase='aim';S.effects={};
 if(S.golfer&&S.golfer.parent)S.golfer.parent.remove(S.golfer);S.golfer=makeGolfer(p.c);scene.add(S.golfer);if(p.ai&&S.g5===S.hole)addShades(S.golfer);
 setClub(0);if(course.par===3&&holeDist()<170)setClub(2);aimAtPin();snapCam();calcHint();
 if(S.players.length>1&&!S.vs){S.mode='pass';screen('pass');$('passTxt').textContent=`Pass the phone to ${p.c.name}!`;$('passSub').textContent=`Hole ${S.hole+1}: ${course.name} · Par ${course.par} · Buzz ${Math.round(p.drunk*100)}%`}
 else{beginPlay();if(S.vs){S.aiFast=0;if(p.ai)slaySay(`🍸 Slay tees off first! (tap to fast-forward)`,1800);setTimeout(()=>{if(want5()){try5();if(S.cut5)return}setTimeout(vsDrink,p.ai?1600:500)},200)}}if(S.race&&S.net)raceReady()}
$('bPassGo').onclick=()=>{SFX.click();beginPlay()};
function beginPlay(){S.mode='play';screen('hud');updHUD();toast(`Hole ${S.hole+1}\n${course.name}\nPar ${course.par}`);S.hints=S.hints||[];S.hints.push('🎯 DARE: '+dareNow().t+' (+20 🪙)');S.hintT=Math.min(S.hintT||0,-1.5);
 if(S.hole===0&&!S.net&&!S.rc){const ob=()=>{if(!LS.get('tutDone',false)){LS.set('tutDone',true);onboard()}};if(!LS.get('htSeen',false)){S.onb=1;showIntro(()=>{S.onb=0;ob()})}else ob()}}
function showIntro(done){const o=$('intro'),tr=$('inTrack'),n=tr.children.length;LS.set('htSeen',true);o.classList.add('show');tr.scrollLeft=0;let i=0;const dots=$('inDots');dots.innerHTML='';for(let k=0;k<n;k++){const d=document.createElement('i');d.onclick=()=>go(k);dots.appendChild(d)}const upd=()=>{i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));[...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));$('inNext').textContent=i>=n-1?"Let's golf! ⛳":'Next ▶';$('inSkip').style.visibility=i>=n-1?'hidden':'visible'};const go=k=>{tr.scrollTo({left:k*tr.clientWidth,behavior:'smooth'});setTimeout(upd,350)};tr.onscroll=upd;upd();const close=()=>{SFX.click();o.classList.remove('show');tr.onscroll=null;done&&done()};$('inNext').onclick=()=>{ac();if(i>=n-1)close();else{SFX.click();go(i+1)}};$('inSkip').onclick=()=>{ac();close()};$('inRules').onclick=()=>{o.classList.remove('show');tr.onscroll=null;screen('how')}}
function onboard(){const o=$('onb');o.classList.add('show');S.onb=1;const go=sip=>{SFX.click();o.classList.remove('show');S.onb=0;S.hintT=-2.6;if(sip){drink(DRINKS[0]);setTimeout(()=>toast('Drinks = more power 💪',false,1400),300);setTimeout(()=>toast('and a wobblier screen 🥴',false,1400),1500)}S.hints=['Drag to aim ↔','Hold SWING, let go, then tap to stop the needle'];if(!sip)S.hints.push('Tap 🍺 any time for more power')};$('obSip').onclick=()=>go(1);$('obSober').onclick=()=>go(0)}
function elevTxt(){if(!course||!course.hf)return'';const dz=course.hf.Hp-(S.ballP.y-.35);return Math.abs(dz)<2?'':`<div style="font-size:11px">${dz>0?'⬆️ uphill ':'⬇️ downhill '}${Math.round(Math.abs(dz))}m</div>`}
function holeDist(){return Math.hypot(S.ballP.x-course.pin[0],S.ballP.z-course.pin[1])}
function aimAtPin(){let x=course.pin[0],z=course.pin[1];if(gogOn()&&S.fakeP&&S.fakeP.length){const k=Math.floor(Math.random()*3);if(k<2){x=S.fakeP[k][0];z=S.fakeP[k][1]}}S.aimT=S.aim=Math.atan2(x-S.ballP.x,-(z-S.ballP.z))}
function updBar(dt,t){const b=S.bar;if(!b)return;const P0=b.path,n=P0.length-1,u=(Math.sin(t*.06)*.5+.5)*n*.85+n*.05,i=Math.min(n-1,Math.floor(u)),f=u-i,a=P0[i],c=P0[i+1],x=lerp(a[0],c[0],f),z=lerp(a[1],c[1],f),dx=c[0]-a[0],dz=c[1]-a[1],L=Math.hypot(dx,dz)||1;
 const sx=-dz/L*20,sz=dx/L*20;b.g.position.set(x+sx,GY(x+sx,z+sz)+Math.abs(Math.sin(t*7))*.08,z+sz);b.g.rotation.y=Math.atan2(dx,dz)+(Math.cos(t*.06)>0?0:Math.PI)}
function barPos(){const b=S.bar;if(!b)return null;const v=b.g.position.clone().setY(2).project(camera);const r=canvas.getBoundingClientRect();return{x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height,z:v.z}}
function barHit(e){const b=S.bar;if(!b||S.rc||S.mode!=='play'||S.phase!=='aim')return false;const q=barPos();return q.z<1&&Math.hypot(e.clientX-q.x,e.clientY-q.y)<55}
function barTap(e){if(!barHit(e))return false;
 if(S.barUsed){SFX.honk();toast('🍹 Bar cart: "One per hole, sport."',true,1300);return true}S.barUsed=1;S.barFree=1;SFX.honk();setTimeout(()=>SFX.honk(),180);tone(880,.12,'square',.08,1320,.35);toast('🍹 BAR CART!\nNext drink: +10 🪙 back',true,1600);SFX.click();show('drinks',true);return true}
function gogOn(){const p=P();return S.mode==='play'&&p&&p.drunk>=.6&&S.phase!=='cart'&&holeDist()>30&&S.club!==4&&surface(S.ballP.x,S.ballP.z)!=='green'}
function updGoggles(dt,t){if(!S.fakeF)return;S.gogA+=((gogOn()?1:0)-S.gogA)*Math.min(1,dt*2.5);const a=S.gogA;S.fakeF.forEach((g,i)=>{const s=i?-1:1,ox=s*(9+Math.sin(t*.7+i)*3),oz=Math.cos(t*.5+i*2)*4;S.fakeP[i]=[course.pin[0]+ox,course.pin[1]+oz];g.position.set(S.fakeP[i][0],0,S.fakeP[i][1]);g.rotation.set(Math.sin(t*1.3+i)*.08,pinG.rotation.y,Math.sin(t*1.1+i*3)*.1);g.visible=a>.02;g.traverse(o=>{if(o.material)o.material.opacity=a})})}
function dirV(a){return new V3(Math.sin(a),0,-Math.cos(a))}
// ---------- drinking ----------
function drink(d){const p=P();p.ldh=S.hole;$('bDrink').classList.remove('pulse');ac();if(p.hd)p.hd.d.add(d.id);if(p.st)p.st.drinks++;if(S.barFree){S.barFree=0;setTimeout(()=>{addCoins(10);SFX.coin();toast('🍹 On the house! +10 🪙',true,1400)},2200)}let msg='';const old=p.drunk;
 if(d.id==='mystery'){const r=Math.floor(Math.random()*5);
  if(r===0){p.drunk+=.4;msg='DOUBLE TROUBLE! +40%'}else if(r===1){S.effects.moon=1;p.drunk+=.1;msg='MOON GRAVITY next shot!'}else if(r===2){S.effects.rocket=1;p.drunk+=.15;msg='ROCKET BALL next shot!'}else if(r===3){p.drunk=0;p.hang=0;msg='Instant sobriety?!'}else{S.effects.giant=1;p.drunk+=.12;msg='GIANT BALL!'}}
 else p.drunk+=d.amt;
 if(d.id==='keg'){return startKeg(d)}
 if(d.id==='dvit'){p.creep=4;setTimeout(()=>toast('🧋 It\'s creeping up on you…',true,1500),1800)}if(d.id==='vo1'||d.id==='vo2'){p.steady=1;setTimeout(()=>toast('🍊 Vitamin C counts as healthy, right?',true,1500),1800)}if(d.id==='dvsoda'){p.crisp=1;S.shake=.35}if(d.id==='vsoda'){p.steady=1;p.crisp=1;setTimeout(()=>quip('vsoda',1),1800)}if(d.id==='jager'){p.jager=1;setTimeout(()=>quip('jager',1),1800)}if(d.id==='tequila'){p.teq=2;setTimeout(()=>quip('tequila',1),1800)}if(d.id==='absinthe'){p.absH=S.hole;setTimeout(()=>quip('absinthe',1),1800)}if(d.id==='energy'){p.turbo=1;setTimeout(()=>quip('energy',1),1800)}if(d.id==='moon'){p.moon=1;setTimeout(()=>quip('moon',1),1800)}if(d.id==='hot'){S.redT=3.2;p.hang=0;setTimeout(()=>{SFX.sizzle();S.shake=.6;quip('hot',1)},900)}
 if(d.id==='beer'||d.id==='screw')p.steady=1;if(d.id==='vodka'){p.vodka=1;setTimeout(()=>quip('vodka',1),1800)}if(d.id==='screw')setTimeout(()=>quip('screw',1),1800);if(d.id==='whiskey')p.boost=1;if(!['mystery','cola'].includes(d.id))p.hang=0;
 p.drunk=Math.max(0,p.drunk);p.peak=Math.max(p.peak,p.drunk);if(p.st)p.st.maxB=Math.max(p.st.maxB,Math.min(1,p.drunk));
 startChug(d,msg,old)}
function startChug(d,msg,old){S.cut={t:0,d,msg,dur:d.shot?1.3:1.9,burped:false,old};S.phase='chug';const u=S.golfer.userData;u.can.visible=true;u.club.visible=false;u.canM.color.setHex(d.can);u.can.scale.set(d.shot?.7:d.cup?1.3:d.tall?.85:1,d.shot?.45:d.cup?.8:d.tall?1.9:1,d.shot?.7:d.cup?1.3:d.tall?.85:1);$('skip').style.display='block';$('bottom').style.visibility='hidden';updHUD();if(d.shot){SFX.click();setTimeout(SFX.slam,700);setTimeout(()=>{S.shake=.5;toast('SLAM! 🧊',true,700)},700)}else{SFX.open();setTimeout(SFX.glug,250)}show('drinks',false)}
function endChug(){const c=S.cut;if(!c)return;S.cut=null;const u=S.golfer.userData;u.can.visible=false;u.club.visible=true;setPose(S.golfer,'address');u.body.rotation.set(0,0,0);$('skip').style.display='none';$('bottom').style.visibility='';S.phase=S.rc&&S.rc.phase!=='run'?'wait':'aim';if(S.vsExtra&&!c.dbl)setTimeout(slay2nd,150);else setTimeout(try5,80);
 const p=P();if(!c.burped){SFX.burp()}if(c.msg)toast(c.msg);else toast(`${c.d.e} ${c.d.n}!`,true);
 if(p.drunk>=1){p.drunk=1;S.shake=1;toast('💀 MAXED OUT');SFX.bad();buzz([100,50,200])}
 const lvl=l=>l<.25?0:l<.5?1:l<.75?2:3;if(lvl(p.drunk)>lvl(c.old))setTimeout(()=>toast(['','Tipsy 🙂','Buzzed 🥴','WASTED 🤪'][lvl(p.drunk)],true),600);
 updHUD();snapCam();calcHint()}
function startKeg(d){const p=P();S.phase='keg';S.keg={t:0,hold:0,held:false,start:p.drunk,d,gl:0};show('drinks',false);$('keg').style.display='flex';$('bottom').style.visibility='hidden';const u=S.golfer.userData;u.club.visible=false;u.can.visible=false;if(!kegMesh){kegMesh=new THREE.Group();mesh(G.cyl,0xa8a8a8,0,0,0,kegMesh).scale.set(.45,.75,.45);for(const y of[-.25,.25])mesh(G.cyl,0x666666,0,y,0,kegMesh).scale.set(.47,.06,.47);mesh(G.cyl,0x333333,0,.42,0,kegMesh).scale.set(.06,.12,.06);scene.add(kegMesh)}kegMesh.visible=true;SFX.open();toast('🛢️ KEG STAND!',false,1200)}
let kegMesh=null;
function updKeg(dt){const k=S.keg,p=P();k.t+=dt;const btn=$('kegBtn');
 if(k.held){k.hold+=dt;p.drunk=Math.min(.99,p.drunk+dt*(.2+k.hold*.14));k.gl-=dt;if(k.gl<=0){k.gl=.28;SFX.glug();buzz(15)}S.shake=Math.max(S.shake,.12+k.hold*.05)}
 $('kFill').style.width=Math.min(100,p.drunk*100)+'%';$('dFill').style.width=Math.round(p.drunk*100)+'%';$('dPct').textContent=Math.round(p.drunk*100)+'%';$('kTxt').textContent=`${k.hold.toFixed(1)}s · buzz ${Math.round(p.drunk*100)}%`;btn.textContent=k.held?'CHUG CHUG CHUG!':'HOLD TO CHUG';
 if(p.drunk>=.99||(!k.held&&k.hold>.15)||(k.t>6&&!k.held))endKeg()}
function endKeg(){const k=S.keg,p=P();if(!k)return;S.keg=null;$('keg').style.display='none';if(kegMesh)kegMesh.visible=false;S.golfer.rotation.z=0;S.golfer.position.y=0;
 const gain=Math.max(0,p.drunk-k.start),bonus=Math.round(gain*400)+(k.hold>2.5?100:0);p.style+=bonus;p.peak=Math.max(p.peak,p.drunk);p.hang=0;p.steady=0;
 const msg=gain>0?`🛢️ KEG STAND! ${k.hold.toFixed(1)}s\n+${Math.round(gain*100)}% buzz · +${bonus} style`:'Chickened out of the keg 🐔';if(gain>.1)quip('keg',1);
 S.cut={t:0,d:k.d,msg,dur:0,burped:false,old:k.start};S.phase='chug';endChug()}
// ---------- distance help ----------
function simShot(ci,pw,dir){const e=simEnd(ci,pw,dir);return e.along}
function simEnd(ci,pw,dir,from){const c=CLUBS[ci],p=P(),b=(from||S.ballP).clone(),v=new V3(),d=dirV(dir),dt=1/60;let air=c.id!=='putter';const roll=c.roll||1;let fs=null;
 if(!air){const dist=c.carry*pw*(1+.3*p.drunk);v.copy(d).multiplyScalar(Math.sqrt(2*1.7*dist))}
 else{const carry=c.carry*pw*drunkMult(p)*(S.effects.rocket?1.8:1)*1.05*lieMult(c,surface(b.x,b.z)),th=c.ang*Math.PI/180,vv=Math.sqrt(carry*9.8/Math.sin(2*th));v.copy(d).multiplyScalar(vv*Math.cos(th));v.y=vv*Math.sin(th)}
 const wv=dirV(course.wind.a),ws=course.wind.s*windRes()*.11,g=9.8*(S.effects.moon?.45:1);
 for(let i=0;i<1200;i++){if(air){v.y-=g*dt;v.x+=wv.x*ws*dt;v.z+=wv.z*ws*dt;b.addScaledVector(v,dt);if(b.y<=GY(b.x,b.z)+.35){b.y=GY(b.x,b.z)+.35;const s=surface(b.x,b.z);if(s==='water'||s==='oob'){fs=s;break}v.y=-v.y*REST[s];const k=KEEP[s]*roll+(1-roll)*.3;v.x*=k;v.z*=k;if(v.y<1.8){v.y=0;air=false}}}
  else{const s=surface(b.x,b.z);if(s==='water'||s==='oob'){fs=s;break}const sp=Math.hypot(v.x,v.z),ns=Math.max(0,sp-frOf(s,c)*dt);if(sp>0){v.x*=ns/sp;v.z*=ns/sp}if(course.hf){const g2=GG(b.x,b.z);v.x-=g2[0]*SLP*dt;v.z-=g2[1]*SLP*dt}b.addScaledVector(v,dt);if(ns<.12)break}}
 const o=from||S.ballP;return{along:(b.x-o.x)*d.x+(b.z-o.z)*d.z,x:b.x,z:b.z,s:fs||surface(b.x,b.z)}}
function calcHint(){if(!course||!P())return;const d=holeDist(),dir=Math.atan2(course.pin[0]-S.ballP.x,-(course.pin[1]-S.ballP.z)),s=surface(S.ballP.x,S.ballP.z),pw=[];
 for(let ci=0;ci<CLUBS.length;ci++){if(simShot(ci,1,dir)<d){pw[ci]=1;continue}let lo=.02,hi=1;for(let k=0;k<10;k++){const m=(lo+hi)/2;if(simShot(ci,m,dir)<d)lo=m;else hi=m}pw[ci]=(lo+hi)/2}
 let rec=4;if(!(s==='green'||d<22)){rec=0;for(let ci=3;ci>=0;ci--){if(pw[ci]<=.92){rec=ci;break}}}S.hint={pw,rec,d,lie:s}}
// ---------- input ----------
let drag=null;
canvas.addEventListener('pointerup',e=>{const d=S.barDn;S.barDn=null;if(d&&Math.hypot(e.clientX-d[0],e.clientY-d[1])<10)barTap(e)});
canvas.addEventListener('pointerdown',e=>{if(S.cut5){if(performance.now()<(S.cut5.lock||0))return;end5();return}if(S.vs&&S.mode==='play'&&P()&&P().ai){S.aiFast=1;if(S.phase==='chug')endChug();return}S.barDn=barHit(e)?[e.clientX,e.clientY]:null;if(S.mode==='play'&&S.phase==='chug'){endChug();return}
 if(S.mode!=='play')return;if(S.phase==='acc'){shoot();return}if(S.phase==='aim'){drag={x:e.clientX,a:S.aimT=S.aim};show('drinks',false)}});
canvas.addEventListener('pointermove',e=>{if(drag&&S.phase==='aim'){const h=HV();S.aimT=drag.a+(e.clientX-drag.x)*.006*(S.club===4?.4:1)*((h>.55)!==!!P().teq?-1:1);if(P().teq&&!S.teqQ){S.teqQ=1;toast('🌵 Tequila: left is right!',true,1300)}if(h>.55&&!S.invQ){S.invQ=1;toast('🙃 Controls feel… backwards?',true,1500)}}});
addEventListener('pointerup',()=>drag=null);
const sw=$('bSwing');
sw.addEventListener('pointerdown',e=>{e.preventDefault();try{sw.setPointerCapture(e.pointerId)}catch(_){}ac();if(S.mode!=='play')return;if(S.phase==='aim'){S.phase='power';S.power=0;S.pDir=1;sw.classList.add('hold');sw.textContent='RELEASE';$('power').style.display='block'}else if(S.phase==='acc')shoot()});
const swUp=e=>{e.preventDefault();if(S.phase==='power'){S.lockedPow=clamp(S.dispPow,.02,1);S.phase='acc';S.acc=-1;S.aDir=1;sw.classList.remove('hold');sw.textContent='TAP!';$('acc').style.display='block';SFX.click()}};sw.addEventListener('pointerup',swUp);sw.addEventListener('pointercancel',swUp);addEventListener('pointerup',e=>{if(S.phase==='power')swUp(e)});
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('touchmove',e=>{if(!e.target.closest('#cOpts,#drinks,.sheet,.panel,#cardTbl,.ch,#sGrid,#cList'))e.preventDefault()},{passive:false});
let lastTouch=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTouch<300&&!e.target.closest('button,input,.sw,.tx,.dk'))e.preventDefault();lastTouch=n},{passive:false});
// ---------- shooting ----------
function drunkMult(p){return (1+.6*p.drunk)*(p.hang?(EQ().club==='candy'?.9:.82):1)*(p.boost?1.1:1)*(p.vodka?1.2:1)*(p.crisp?1.08:1)*(p.moon?1.35:1)*(EQ().club==='gold'?1.03:1)}
function shoot(){const p=P(),c=CLUBS[S.club];S.phase='swing';S.swingT=0;$('acc').style.display='none';$('power').style.display='none';sw.textContent='SWING';SFX.swing();
 const a=S.acc,perfect=Math.abs(a)<.08;if(perfect){toast('PERFECT!',true,1200);SFX.perfect()}
 S.pending={a,perfect,c}}
function launch(){const p=P(),{a,perfect,c}=S.pending,pw=S.lockedPow;const h=HV();
 if(h>0&&Math.random()<.14*h){p.strokes++;S.phase='aim';p.steady=0;p.boost=0;p.vodka=0;SFX.swing();toast('🙈 Swung at the WRONG ball!\n+1 stroke',false,2000);quip('wasted',1);S.shake=.4;buzz(80);updHUD();return}let mult=drunkMult(p)*lieMult(c,surface(S.ballP.x,S.ballP.z));if(S.effects.rocket)mult*=1.8;
 const sf=softD(p);let dir=S.aim+(S.wob+rand(-.07,.07)*h+a*.13*(c.id==='putter'?.35:1)+(Math.random()-.5)*.08*p.drunk)*sf+(p.moon&&Math.random()<.3?(S.black=1.8,toast('🌑 Moonshine brownout…\nwhere did it go?!',false,1800),SFX.bad(),rand(-.9,.9)):0);
 S.shotStart.copy(S.ballP);S.lastP.copy(S.ballP);p.strokes++;const rf=S.aiRef!=null?S.aiRef:S.aim;S.aiRef=null;S.shotRef=rf;dir=rf+clamp(dir-rf,-.9,.9);S.curve=c.id==='putter'?0:a*7*(1+p.drunk)*sf;S.flightT=0;S.rec=[S.ballP.clone()];S.shotA=Math.abs(a);try{S.shotExp=c.id==='putter'?0:simEnd(S.club,pw,S.aim,S.ballP).along}catch(e){S.shotExp=0}S.shotDev=Math.abs(dir-S.aim);trailPts=[];
 const d=dirV(dir);
 if(c.id==='putter'){const dist=c.carry*pw*(1+.3*p.drunk);const v=Math.sqrt(2*1.7*dist);S.ballV.copy(d).multiplyScalar(v);SFX.putt()}
 else{const carry=c.carry*pw*mult*(perfect?1.05:1)*(1-Math.abs(a)*.15),th=c.ang*Math.PI/180,g=9.8*(S.effects.moon?.45:1);const v=Math.sqrt(carry*9.8/Math.sin(2*th));S.ballV.copy(d).multiplyScalar(v*Math.cos(th));S.ballV.y=v*Math.sin(th);SFX.hit(pw,c.id);S.shake=.25+pw*.3;buzz(30);
  burst(S.ballP.clone(),10,[0x5aa840,0x7a4b25,0xffffff],4,.2,3,.6)}
 const jg=p.jager;p.steady=0;p.boost=0;p.vodka=0;p.crisp=0;p.moon=0;p.jager=0;S.effects.rocket=0;S.slowT=(c.id!=='putter'&&S.ballV.length()>40)?.9:0;if(jg&&c.id!=='putter'){S.slowT=2.4;S.flash=1;toast('💣 BULLET TIME',true,1200)}if(S.slowT){S.flash=1;if(p.drunk>.4)toast('🔥 SEND IT!',true,900)}S.phase='fly';S.airborne=c.id!=='putter';S.bounces=0;S.shotClub=c;S.shotDrunk=p.drunk;
 if(S.effects.giant){ball.scale.setScalar(3)}}
function settle(){const p=P(),s=surface(S.ballP.x,S.ballP.z);if(p.teq){p.teq--;S.teqQ=0}
 const carried=S.shotStart.distanceTo(new V3(S.ballP.x,S.shotStart.y,S.ballP.z));
 if(S.shotClub.id!=='putter'&&carried>=200&&S.shotDrunk>=.5){p.style+=100;toast(`🔥 LIQUID COURAGE! ${Math.round(carried)}m\n+100 style`);SFX.cheer();buzz([40,40,40])}
 else if(carried>=240){p.style+=50;toast(`BOOMER! ${Math.round(carried)}m`,true)}
 S.effects.moon=0;if(S.effects.giant){S.effects.giant=0;ball.scale.setScalar(1)}
 // sober-up per stroke
 p.drunk=Math.max(0,p.drunk-.018);
 if(p.creep>0){p.creep--;p.drunk=Math.min(.99,p.drunk+.07);p.peak=Math.max(p.peak,p.drunk)}
 if(p.peak>=.7&&p.drunk<.35&&!p.hang){p.hang=1;p.peak=p.drunk;toast('🤕 HANGOVER!\nWeak swings till you drink',true,3000);SFX.bad();quip('hang',1)}
 if(S.shotClub.id!=='putter'&&holeDist()>S.shotStart.distanceTo(new V3(course.pin[0],.35,course.pin[1]))-20&&s!=='green')quip('bad');
 {const mx=course.par+(p.ai?4:5);if(p.strokes>=mx){toast(p.ai?'🍸 Slay picks up. Gimme!':'Picked up. Max strokes!',true);p.strokes=mx;return finishHole()}}
 if(blackoutCheck())return;
 S.phase='aim';if(s==='green'||holeDist()<25)setClub(4);else if(holeDist()<75)setClub(3);else if(S.club===4||S.club===3)setClub(2);else if(S.club===0&&s!=='fairway'&&s!=='rough')setClub(2);else if(S.club===0&&s==='rough')setClub(1);
 aimAtPin();updHUD();if(s==='sand')quip('sand');else if(p.drunk>.75&&Math.random()<.6)quip('wasted');else if(p.drunk>.55&&Math.random()<.5)quip('drunk');else if(carried>150&&s==='fairway')quip('good');
 const shank=S.shotClub.id!=='putter'&&s!=='green'&&(S.shotExp>40&&carried<S.shotExp*.4||S.shotA>.8&&carried<S.shotExp*.7||S.shotDev>.45);if(shank){toast('SHANK! 🙈',true,1300);if(p.st)p.st.shanks++;if(maybeReplay('shank'))startReplay('shank',()=>{S.phase='aim';react('bad')});else react('bad')}else if(S.shotClub.id!=='putter'&&holeDist()>S.shotStart.distanceTo(new V3(course.pin[0],.35,course.pin[1]))-20&&s!=='green')react('bad');else if(s==='green'&&S.shotClub.id!=='putter'||carried>150&&s==='fairway'||S.shotClub.id==='putter'&&holeDist()<1.5)react('good');
 const sn={sand:'In the sand 🏖️',rough:'In the rough',fairway:'Fairway!',green:'On the green!',ice:'On the ice ⛸️'}[s];if(sn)toast(sn,true,1300);calcHint();if(S.aiPure){S.aiPure=0;slayPumped()}else if(S.vs&&S.react&&S.react.kind==='bad'&&Math.random()<.6){const ai=P().ai;setTimeout(()=>slaySay(pick(ai?SLINES.shank:SLINES.jab),2200),500)}}
function penalty(kind){const p=P();p.strokes++;if(p.st&&kind==='water'){p.st.water++;if((S.waterN||0)+1>=3)p.st.stolen++}let fwd=0;if(kind==='water'&&S.splashP){S.waterN=(S.waterN||0)+1;if(S.waterN>=2){const pin=new V3(course.pin[0],.35,course.pin[1]),q=S.splashP.clone().setY(.35),d=pin.clone().sub(q).setY(0).normalize();for(let i=0;i<250&&surface(q.x,q.z)==='water';i++)q.addScaledVector(d,1);q.addScaledVector(d,3);if(surface(q.x,q.z)!=='oob'&&surface(q.x,q.z)!=='water'){S.lastP.copy(q);fwd=1}}}S.ballP.copy(S.lastP);S.ballP.y=GY(S.ballP.x,S.ballP.z)+.35;S.ballV.set(0,0,0);S.airborne=false;
 if(kind==='water'){if(TH.lava){SFX.lava();const lp=S.splashP.clone().setY(lavaLv(S.splashP.x,S.splashP.z)+.2);burst(lp,26,[0xff5a10,0xffd040,0xff2000],6,.3,9);for(let i=0;i<14;i++){burst(lp.clone().add(new V3(rand(-1.5,1.5),.4,rand(-1.5,1.5))),1,[0x555555,0x888888,0x3a3a3a],1.2,.9,2,1.8);parts[parts.length-1].g=-.25}toast('SIZZLE! 🔥 +1',true);quip('lava',1)}else{SFX.splash();burst(S.splashP,30,[0x8fd3ff,0xffffff,0x2f9be0],5,.3,8);toast('SPLASH! 💦 +1',true);quip('water',1)}}else{SFX.bad();toast('Out of bounds! +1',true);quip('oob',1)}buzz(80);
 S.phase='wait';const resume=()=>{S.phase='aim';p.drunk=Math.max(0,p.drunk-.018);aimAtPin();updHUD();snapCam();calcHint();react('bad')},go=()=>{if(kind==='water'&&S.splashP)duckRescue(()=>{if(fwd)toast(TH.lava?'Forward drop ⛳ past the lava':'Forward drop ⛳ past the water',true,1800);resume()},S.waterN>=3);else resume()};
 setTimeout(()=>{if(maybeReplay(kind))startReplay(kind,go);else go()},900)}
const DARES=[{t:'Finish this hole on Tequila 🌵',ok:(p)=>p.hd.d.has('tequila')},{t:'Putt it in above 70% Buzz',ok:(p)=>(S.shotClub||{}).id==='putter'&&p.drunk>=.7},{t:'Use the Keg Stand 🛢️',ok:(p)=>p.hd.d.has('keg')},{t:'Mix it up: 2 different drinks',ok:(p)=>p.hd.d.size>=2},{t:'Par or better at 40%+ Buzz',ok:(p,rel)=>rel<=0&&p.drunk>=.4},{t:'Sink it after a Jäger Bomb 💣',ok:(p)=>p.hd.d.has('jager')},{t:'Voddy Orange 🍊 then par or better',ok:(p,rel)=>rel<=0&&(p.hd.d.has('vo1')||p.hd.d.has('vo2'))}];
function dareNow(){return DARES[(S.hole*3+CI*5)%DARES.length]}
function holed(){const p=P();netEv('holed');{const rel0=p.strokes-course.par;if(p.hd&&!p.ai&&dareNow().ok(p,rel0)){p.st.dares++;setTimeout(()=>{addCoins(20);SFX.coin();toast('🎯 DARE COMPLETE!\n+20 🪙');burst(new V3(course.pin[0],1,course.pin[1]),40,[0xffd23f,0xff5fd2],8,.3,10,2)},1500)}}S.celebT=0;SFX.cup();S.phase='holed';ball.visible=false;buzz([50,30,50,30,120]);
 const rel=p.strokes-course.par;const nm=p.strokes===1?'HOLE IN ONE!!!':{'-3':'ALBATROSS!','-2':'EAGLE!','-1':'BIRDIE!','0':'PAR','1':'Bogey','2':'Double Bogey'}[rel]||`+${rel}… yikes`;
 if(p.strokes===1){p.style+=1000;SFX.fanfare();for(let k=0;k<4;k++)setTimeout(()=>burst(new V3(course.pin[0],1,course.pin[1]),60,[0xff3030,0xffd23f,0x3ccf6e,0x1fa3ff,0xff5fd2],10,.4,14,2.5),k*300);S.shake=1.2;toast('⛳ HOLE IN ONE!!! ⛳\n+1000 style')}
 else{toast(nm);if(rel<0){SFX.fanfare();p.style+=200*-rel;burst(new V3(course.pin[0],1,course.pin[1]),50,[0xff3030,0xffd23f,0x3ccf6e,0x1fa3ff],8,.35,10,2)}else SFX.cheer()}
 if(p.drunk>=.5&&rel<=0){p.style+=150;setTimeout(()=>toast('🍻 Drunken Master +150',true),1200)}
 if(p.drunk>=.2){const bb=1+Math.round(p.drunk*7);p.bb=(p.bb||0)+bb;addCoins(bb);setTimeout(()=>{toast(`BUZZ BONUS +${bb} 🍺`);SFX.coin()},600)}
 if(S.rc)raceFin('in');setTimeout(()=>{if(S.rc)finishHole();else if(S.hole<HOLES.length-1&&!p.ai)startCart();else finishHole()},p.ai?1600:2600)}
function finishHole(){const p=P();if(S.rc&&S.rc.phase==='end')return;p.scores[S.hole]=p.strokes;ball.visible=true;S.phase='done';if(S.rc&&S.net){raceWaitTxt();$('netWait').style.display='flex';return}if(S.net&&S.net.started){netFinish(p);return}
 if(S.cur<S.players.length-1){S.cur++;startTurn()}else{S.cur=0;showCard(true)}}
function showCard(advance){cineClear();const done=advance&&S.hole===HOLES.length-1;S.mode='card';fadeIn(220);screen('card');$('cardTitle').textContent=done?'🏆 Final Scorecard':'Scorecard';
 let h='<table><tr><th>Hole</th>'+HOLES.map((x,i)=>`<th>${i+1}</th>`).join('')+'<th>Tot</th><th>Style</th><th>🍺</th></tr><tr><td>Par</td>'+HOLES.map(x=>`<td>${x.par}</td>`).join('')+`<td>${HOLES.reduce((a,x)=>a+x.par,0)}</td><td></td><td></td></tr>`;
 const res=[];if(done&&S.race&&S.net)S.raceWin=raceStand()[0].me?1:0;if(done&&!S.reelOn)awardTrophies();for(const p of cardPlayers()){let tot=0,par=0;h+=`<tr><td style="color:${p.c.shirt}">${esc(p.c.name)}</td>`+HOLES.map((x,i)=>{const s=p.scores[i];if(s==null)return'<td>-</td>';tot+=s;par+=x.par;return`<td class="${s<x.par?'under':s>x.par?'over':''}">${s}</td>`}).join('')+`<td><b>${tot}</b> (${tot-par>0?'+':''}${tot-par})</td><td>${p.style}</td><td>${p.bb||0}</td></tr>`;res.push({p,tot,rel:tot-par})}
 h+='</table>';if(S.race&&S.net)h=raceBoard(done);if(done){res.sort((a,b)=>a.tot-b.tot||b.p.style-a.p.style);if(S.vs){const me=res.find(x=>!x.p.ai),sl=res.find(x=>x.p.ai);h+=me.tot<sl.tot?`<h2>You beat Slay! 🍾</h2><div class="vsl">🍸 Slay demands a rematch. "Statistically impossible. Rerun the experiment!"</div>`:me.tot>sl.tot?`<h2>You lost to SLAY?! 🍸 "Nuclear engineer, nuclear golfer. Pour me another!"</h2><div class="vsl">He's already ordering a victory round.</div>`:`<h2>Dead heat! 🤝</h2><div class="vsl">🍸 Slay calls it a moral victory. Rematch?</div>`;if(res[0].p.ai)res.sort((a,b)=>a.p.ai-b.p.ai)}else if(!S.race)h+=`<h2>${esc(res[0].p.c.name)} wins! 🍾</h2>`;const cid=COURSES[CI].id,bk='best_'+cid,b=LS.get(bk,null);if(!S.race&&(!b||res[0].tot<b.score)){LS.set(bk,{score:res[0].tot,rel:res[0].rel,name:res[0].p.c.name});h+='<div>NEW COURSE RECORD! 🏆</div>';SFX.fanfare()}
  if(!S.paid){S.paid=1;const HP=S.players.filter(p=>!p.ai);const sty=HP.reduce((a,p)=>a+p.style,0),under=HP.reduce((a,p)=>a+p.scores.filter((x,i)=>x!=null&&x<HOLES[i].par).length,0),earn=25+Math.round(sty/8)+10*under;addCoins(earn);const cs0=LS.get('cstyle',0),cs1=cs0+sty;LS.set('cstyle',cs1);SFX.coin();
   h+=`<div class="earn">🪙 +${earn} coins <small>(round 25 · style ${Math.round(sty/8)} · under-par ${10*under})</small>${S.roundCoins?`<br><small>+ ${S.roundCoins} 🪙 already won in cart dashes</small>`:''}${S.players.some(p=>p.bb)?`<br><small>+ ${S.players.reduce((a,p)=>a+(p.bb||0),0)} 🪙 buzz bonus banked on the way</small>`:''}<br>Bank: 🪙 ${coins()}</div>`;
   const was=cleared().includes(cid);if(!was){LS.set('cleared',[...LS.get('cleared',[]),cid]);const nx=COURSES[CI+1];if(nx&&!owned().includes('course:'+nx.id))setTimeout(()=>celebrate(nx.e,nx.n,'New course unlocked!'),900)}
   for(const[th2,id]of MILESTONES)if(cs0<th2&&cs1>=th2)setTimeout(()=>grant(id,`${th2.toLocaleString()} career style!`),1600)}}
 {const cid=COURSES[CI].id;if(done&&!S.pbDone){S.pbDone=1;S.pbMsg='';for(const r of res){if(r.p.remote||r.p.ai)continue;if(r.p.scores.filter(x=>x!=null).length<HOLES.length)continue;const pb=LS.get('pb_'+cid,null),pw=LS.get('pw_'+cid,null);if(!pb||r.tot<pb.score){LS.set('pb_'+cid,{score:r.tot,rel:r.rel,name:r.p.c.name});S.pbMsg+=`<div class="pbnew">🌟 NEW PERSONAL BEST! ${r.tot} · ${esc(r.p.c.name)}</div>`;setTimeout(()=>{SFX.fanfare();burst(S.ballP.clone().setY(2),30,[0xffd23f,0x3ccf6e],6,.3,8,2)},300)}if(!pw){LS.set('pw_'+cid,{score:r.tot,rel:r.rel,name:r.p.c.name})}else if(r.tot>pw.score){LS.set('pw_'+cid,{score:r.tot,rel:r.rel,name:r.p.c.name});S.pbMsg+=`<div class="pwnew">💀 NEW PERSONAL WORST! ${r.tot} · ${esc(r.p.c.name)}</div>`;setTimeout(()=>{SFX.bad();SFX.ooh()},500)}}}
  if(done)h+=S.pbMsg+S.trophyHtml;const pb=LS.get('pb_'+cid,null),pw=LS.get('pw_'+cid,null);if(pb)h+=`<div class="small">${COURSES[CI].n}: PB ${pb.score} (${pb.rel>0?'+':''}${pb.rel}) · PW ${pw?pw.score:'-'}${pw?` (${pw.rel>0?'+':''}${pw.rel})`:''}</div>`;if(done&&S.clips&&S.clips.length)h+='<button id="bReel">🎬 Highlight Reel</button>'}
 $('cardTbl').innerHTML=h;if($('bReel'))$('bReel').onclick=()=>{SFX.click();playReel()};$('bCardGo').textContent=done?'Back to Title':advance?'Next Hole ▶':'Back';
 $('bCardGo').onclick=()=>{SFX.click();if(done){netLeave();S.mode='title';screen('title');bestTxt()}else if(advance){S.hole++;S.cur=0;startTurn()}else{S.mode='paused';screen('pause')}};
 S.cardAdv=advance}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const QUIPS={
 lava:['Caddie: That ball is now a rock.','Caddie: Smells like burnt rubber. And regret.','Caddie: The volcano accepts your offering.','Caddie: Hot tip: aim for the green bits.'],
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
function addMark(x,z,a){_q.setFromAxisAngle(new V3(0,1,0),a);_s.set(1,1,1);_p.set(x,GY(x,z)+.15,z);_m4.compose(_p,_q,_s);marks.setMatrixAt(markI,_m4);markI=(markI+1)%MARKN;marks.instanceMatrix.needsUpdate=true}
function makeDuck(){const d=new THREE.Group();mesh(G.sph,0xffffff,0,.45,0,d).scale.set(.38,.3,.5);mesh(G.sph,0x2f8f3a,0,.8,.35,d).scale.setScalar(.2);const b=mesh(G.cone,0xff8a1a,0,.78,.6,d);b.scale.set(.07,.2,.07);b.rotation.x=Math.PI/2;for(const s2 of[-1,1])mesh(G.cyl,0xff8a1a,s2*.12,.12,0,d).scale.set(.03,.25,.03);return d}
// keep the cart route clear: push decor hills off the path, pull trees/cacti off it
function hillFoot(m){const sx=Math.max(m.scale.x,m.scale.z),k=-m.position.y/m.scale.y;return k>=1?0:sx*Math.sqrt(1-k*k)}
function cartPathBlocked(path,PW){const hit=[];for(const m of hills){const d=distPath(m.position.x,m.position.z,path);if(d<hillFoot(m)+PW/2+8)hit.push('hill')}for(const t of trees){if(t.kind)continue;if(distPath(t.x,t.z,path)<PW/2+t.r+.8)hit.push('tree')}return hit}
function clearCartPath(path,PW){let mh=0,rt=0;const pts=[];for(let i=0;i<path.length-1;i++)for(let f=0;f<1;f+=.1)pts.push([path[i][0]+(path[i+1][0]-path[i][0])*f,path[i][1]+(path[i+1][1]-path[i][1])*f]);pts.push(path[path.length-1]);
 for(const m of hills){for(let it=0;it<8;it++){const need=hillFoot(m)+PW/2+12;let bi=0,bd=1e9;pts.forEach((q,i)=>{const d=Math.hypot(m.position.x-q[0],m.position.z-q[1]);if(d<bd){bd=d;bi=i}});if(bd>=need)break;const q=pts[bi];let dx=m.position.x-q[0],dz=m.position.z-q[1],l=Math.hypot(dx,dz)||1;m.position.x=q[0]+dx/l*(need+2);m.position.z=q[1]+dz/l*(need+2);if(!it)mh++}}
 for(let i=trees.length-1;i>=0;i--){const t=trees[i];if(t.g&&!t.kind&&distPath(t.x,t.z,path)<PW/2+t.r+1.5){courseG.remove(t.g);trees.splice(i,1);rt++}}
 for(const im of S.decor||[]){const z=new THREE.Matrix4().makeScale(0,0,0);let ch=0;im.userData.pos.forEach((q,i)=>{if(distPath(q[0],q[1],path)<PW/2+1.5){im.setMatrixAt(i,z);ch=1}});if(ch)im.instanceMatrix.needsUpdate=true}S.cartClear={hillsMoved:mh,treesRemoved:rt}}
// during the cart drive, hide anything standing between the chase camera and the cart (flag pole, trees, benches, parked carts)
function hideCamBlockers(){const on=S.phase==='cart'&&myCart;const cp=camera.position,kp=myCart?myCart.position:null,A=[cp.x,cp.z],B=kp?[kp.x,kp.z]:A;
 const blk=(x,z,r)=>on&&distSeg(x,z,A,B)<r+3;if(pinG)pinG.visible=!blk(pinG.position.x,pinG.position.z,.5);
 for(const t of trees){const g=t.g;if(g)g.visible=!blk(t.x,t.z,t.r)}}
function startCart(){const c=course;fadeIn(260);S.phase='cart';ball.visible=false;const pin=new V3(c.pin[0],0,c.pin[1]);const pp=c.full.filter(q=>Math.hypot(q[0]-c.pin[0],q[1]-c.pin[1])>1);const lp=pp[pp.length-1]||[0,0];const back=new V3(c.pin[0]-lp[0],0,c.pin[1]-lp[1]).normalize();const side=new V3(back.z,0,-back.x);
 const start=pin.clone().addScaledVector(back,8),R=srand(S.hole*31+7+CI*101),N=12,L=190,amp=16+R()*8,ph=R()*6;
 const path=[];for(let i=0;i<=N;i++){const f=i/N;const q=start.clone().addScaledVector(back,f*L).addScaledVector(side,Math.sin(f*Math.PI*(TH.lava?3.2:2.4)+ph)*amp*(TH.lava?1.3:1)*Math.min(1,f*3));path.push([q.x,q.z])}
 let len=0;for(let i=0;i<N;i++)len+=Math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]);
 const tgt=new V3(path[N][0],0,path[N][1]);const PW=7.5;
 clearCartPath(path,PW);
 const pg=new THREE.Group();courseG.add(pg);const pathM=MC(TH.path),edgeM=MC(TH.night?0x00ffcc:0xffffff);
 const segA=[];for(let i=0;i<N;i++){const a=path[i],b=path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);segA.push(ang);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(PW,l+.5,2,c.hf?Math.ceil(l/2):1),pathM);m.rotation.set(-Math.PI/2,0,ang);m.position.set((a[0]+b[0])/2,.12,(a[1]+b[1])/2);m.receiveShadow=true;pg.add(m);drape(m,.25);
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.PlaneGeometry(.35,l+.5,1,c.hf?Math.ceil(l/2):1),edgeM);e.rotation.set(-Math.PI/2,0,ang);const nx=Math.cos(ang),nz=-Math.sin(ang);e.position.set((a[0]+b[0])/2+nx*s*PW/2,.13,(a[1]+b[1])/2+nz*s*PW/2);pg.add(e);drape(e,.28)}
  const dsh=new THREE.Mesh(new THREE.PlaneGeometry(.2,l*.5,1,c.hf?Math.ceil(l/4):1),MC(0xffd23f));dsh.rotation.set(-Math.PI/2,0,ang);dsh.position.set((a[0]+b[0])/2,.125,(a[1]+b[1])/2);pg.add(dsh);drape(dsh,.27);
  const j=new THREE.Mesh(new THREE.CircleGeometry(PW/2,16),pathM);j.rotation.x=-Math.PI/2;j.position.set(b[0],.115,b[1]);pg.add(j);drape(j,.24)}
 const ptAt=(i,f,lat)=>{const a=path[i],b=path[i+1],ang=segA[i],nx=Math.cos(ang),nz=-Math.sin(ang);return[a[0]+(b[0]-a[0])*f+nx*lat,a[1]+(b[1]-a[1])*f+nz*lat,ang]};
 // scenery: trees + benches + parked carts off the path edges
 for(let i=1;i<N;i++){const ang=segA[i],nx=Math.cos(ang),nz=-Math.sin(ang),a=path[i];
  for(const s of[-1,1]){if(R()<.55){const o=PW/2+3+R()*7,tx=a[0]+nx*s*o,tz=a[1]+nz*s*o,ts=.7+R()*.4;if(distPath(tx,tz,path)>PW/2+2.5)makeTree(tx,tz,ts)}}
  const r=R(),s=R()<.5?-1:1,[x,z]=ptAt(i,.5,s*(PW/2+1.6));
  if(r<.25){const bn=new THREE.Group();mesh(G.box,0x8b5a2b,0,.6,0,bn).scale.set(2.4,.15,.7);mesh(G.box,0x8b5a2b,0,1.1,-.3,bn).scale.set(2.4,.6,.12);for(const q of[-1,1])mesh(G.box,0x333333,q*1,.3,0,bn).scale.set(.12,.6,.6);bn.position.set(x,GY(x,z),z);bn.rotation.y=ang+Math.PI/2*s;courseG.add(bn);trees.push({x,z,y:GY(x,z),r:1.2,h:2,kind:'bench',g:bn})}
  else if(r<.45){const pc=makeCart(['classic','fire','camo','pink'][Math.floor(R()*4)]);pc.position.set(x,GY(x,z),z);pc.rotation.y=ang+R();courseG.add(pc);trees.push({x,z,y:GY(x,z),r:1.7,h:3,kind:'cart',g:pc})}}
 // ramps
 const ramps=[];for(const i of[3,8]){const [x,z,ang]=ptAt(i,.5,0);const rg=new THREE.Group();rg.position.set(x,GY(x,z),z);rg.rotation.y=ang;const th=Math.atan2(1.3,6);const rp=mesh(G.box,0xffcc33,0,.62,0,rg);rp.scale.set(4.6,.22,6.1);rp.rotation.x=-th;for(let k=-1;k<=1;k++){const st=mesh(G.box,0x222222,k*1.5,.66,0,rg);st.scale.set(.5,.23,6.12);st.rotation.x=-th}const sd=mesh(G.box,0x555555,0,.65,3,rg);sd.scale.set(4.6,1.3,.2);courseG.add(rg);ramps.push({x,z,ang})}
 // cones
 const cones=[];for(let i=1;i<N;i++){if(i===3||i===8)continue;const n=R()<.6?2:0;for(let k=0;k<n;k++){const[x,z]=ptAt(i,.25+k*.35,(R()-.5)*PW*.7);const cg=new THREE.Group();mesh(G.cone,0xff7a1a,0,.45,0,cg).scale.set(.32,.9,.32);mesh(G.box,0xff7a1a,0,.04,0,cg).scale.set(.7,.08,.7);mesh(G.cyl,0xffffff,0,.5,0,cg).scale.set(.2,.1,.2);cg.position.set(x,GY(x,z),z);courseG.add(cg);cones.push({g:cg,x,z,v:null,by:GY(x,z)})}}
 // duck crossing
 const ducks=[];{const i=5,[x,z,ang]=ptAt(i,.5,0);const sg=new THREE.Group();mesh(G.cyl,0x888888,0,1.2,0,sg).scale.set(.06,2.4,.06);const sb=mesh(G.box,0xffd23f,0,2.5,0,sg);sb.scale.set(1.2,1.2,.08);sb.rotation.z=Math.PI/4;const [sx,sz]=ptAt(i,.1,PW/2+1.4);sg.position.set(sx,GY(sx,sz),sz);sg.rotation.y=ang;courseG.add(sg);
  for(let k=0;k<4;k++){const d=makeDuck();d.scale.setScalar(1.3);courseG.add(d);ducks.push({g:d,cx:x,cz:z,nx:Math.cos(ang),nz:-Math.sin(ang),ph:k*.9,flee:0,hit:0,fx:0,fz:0})}}
 // sprinklers
 const sprinks=[];for(const i of[7,10]){const s=R()<.5?-1:1,[x,z]=ptAt(i,.4,s*(PW/2-.6));const sg=new THREE.Group();mesh(G.cyl,0x444444,0,.25,0,sg).scale.set(.15,.5,.15);mesh(G.sph,0x888888,0,.55,0,sg).scale.setScalar(.15);sg.position.set(x,GY(x,z),z);courseG.add(sg);sprinks.push({x,z,a:R()*6,s})}
 // checkpoint gates
 const cps=[];for(const i of[4,9]){const[x,z,ang]=ptAt(i,0,0);const gg=new THREE.Group();gg.position.set(x,GY(x,z),z);gg.rotation.y=ang;for(const s of[-1,1]){mesh(G.cyl,0xffffff,s*(PW/2+.4),1.8,0,gg).scale.set(.12,3.6,.12);const fl=mesh(G.box,0xff3030,s*(PW/2+.4)+.5*s,3.2,0,gg);fl.scale.set(1,.7,.05)}const ban=mesh(G.box,0x1fa3ff,0,3.6,0,gg);ban.scale.set(PW+.8,.5,.08);courseG.add(gg);cps.push({x,z,ang,hit:false,g:gg,ban})}
 // finish tee
 const tee=new THREE.Group();tee.position.copy(tgt);tee.position.y=GY(tgt.x,tgt.z);const pad=mesh(G.box,TH.fair,0,.1,0,tee);pad.scale.set(9,.2,9);for(const s of[-1,1]){mesh(G.cyl,0x111111,s*4,2.2,0,tee).scale.set(.15,4.4,.15)}const chk=new THREE.Mesh(new THREE.PlaneGeometry(8,1.2),new THREE.MeshBasicMaterial({map:(()=>{const cv=document.createElement('canvas');cv.width=128;cv.height=16;const x=cv.getContext('2d');for(let i=0;i<16;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#fff':'#111';x.fillRect(i*8,j*8,8,8)}const tx=new THREE.CanvasTexture(cv);tx.magFilter=THREE.NearestFilter;return tx})(),side:THREE.DoubleSide}));chk.position.y=4.4;tee.add(chk);tee.rotation.y=segA[N-1];
 const bc=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,60,16,1,true),new THREE.MeshBasicMaterial({color:0xffdd33,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));bc.position.y=30;tee.add(bc);courseG.add(tee);
 myCart=makeCart(EQ().cart);myCart.scale.setScalar(1.2);myCart.position.copy(start);const a0=Math.atan2(path[1][0]-path[0][0],path[1][1]-path[0][1]);myCart.rotation.y=a0;courseG.add(myCart);
 S.golfer.position.set(.4,.93,-.12);S.golfer.rotation.set(0,0,0);S.golfer.scale.setScalar(.75);myCart.add(S.golfer);S.slayG=null;if(S.vs){const sg=makeGolfer(SLAY);sg.position.set(-.4,.93,-.12);sg.scale.setScalar(.75);setPose(sg,'rest');myCart.add(sg);S.slayG=sg;if(S.g5===S.hole)addShades(sg);S.slayT=3;setTimeout(()=>slaySay('🍸 Shotgun! Let\'s ride!',1800),900)}
 const gold=Math.round(len/15.5*10)/10,silver=Math.round(len/11.5*10)/10,bronze=Math.round(len/8.5*10)/10;const p=P();const turbo=!!p.turbo;
 S.cartS={v:0,a:a0,t:0,tgt,path,PW,hits:0,done:false,av:0,on:0,tot:0,flip:0,buf:[],stick:0,auto:0,y:0,vy:0,air:0,airT:0,lastG:0,sy:0,svy:0,pitch:0,ramps,cones,ducks,sprinks,cps,medals:[gold,silver,bronze],len,turbo,coneHits:0,wet:0,honkT:0,slow:0,style:0,spin:0,start:false};
 S.camP.copy(start).addScaledVector(back,-10);S.camP.y=6+GY(S.camP.x,S.camP.z);markI=0;clearMarks();
 ctl.gas=ctl.brake=ctl.wheel=0;$('cartUI').style.display='flex';$('cartUI').classList.toggle('lefty',LS.get('hand','right')==='left');show('hud',false);
 toast(`🛺 CART DASH!\n🥇 ${gold}s  🥈 ${silver}s  🥉 ${bronze}s`,true,3000);if(turbo)setTimeout(()=>toast('⚡ ROCKET FUEL TURBO!',true,1400),1500);if(p.drunk>.5)quip('cart',1)}
function honk(){SFX.honk();if(S.slayG&&Math.random()<.7)slaySay('🍸 '+pick(SLINES.honk),1400);const cs=S.cartS;if(!cs||!myCart)return;cs.honkT=.3;for(const d of cs.ducks){if(!d.flee&&d.g.position.distanceTo(myCart.position)<30){d.flee=1;d.fx=rand(-1,1);d.fz=rand(-1,1);SFX.quack()}}}
function cartFail(cs,c,msg){cs.hits++;cs.v*=.3;toast(msg,true,900)}
function updCart(dt0,dr){const cs=S.cartS,c=myCart,ud=c.userData;let dt=dt0;if(cs.slow>0){cs.slow-=dt0;dt=dt0*.4}cs.t+=dt;if(cs.done){cs.v*=Math.exp(-dt*3);return}const hcv=HV();
 if(cs.honkT>0)cs.honkT-=dt;
 // ducks + sprinklers animate always
 for(const d of cs.ducks){if(d.flee){d.flee+=dt;d.g.position.x+=d.fx*6*dt;d.g.position.z+=d.fz*6*dt;d.g.position.y+=dt*(d.flee>.4?5:0);d.g.rotation.z=Math.sin(d.flee*30)*.3;if(d.g.position.y>30)d.g.visible=false}else if(!d.hit){const o=Math.sin(S.t*.6+d.ph)*cs.PW*.75;d.g.position.set(d.cx+d.nx*o+d.ph*.3*d.nz,0,d.cz+d.nz*o-d.ph*.3*d.nx);d.g.rotation.y=Math.atan2(d.nx,d.nz)*(Math.cos(S.t*.6+d.ph)>0?1:-1)+(Math.cos(S.t*.6+d.ph)>0?0:Math.PI);d.g.position.y=GY(d.g.position.x,d.g.position.z)+Math.abs(Math.sin(S.t*8+d.ph))*.08}}
 for(const sp of cs.sprinks){sp.a+=dt*2.4;if(Math.random()<dt*25){const dir=new V3(Math.sin(sp.a),0,Math.cos(sp.a));burst(new V3(sp.x,GY(sp.x,sp.z)+.7,sp.z),1,[0x8fd3ff,0xffffff],0,.14,5,.8);const pt=parts[parts.length-1];pt.v.set(dir.x*7,4.5,dir.z*7)}}
 if(cs.flip>0){cs.flip-=dt;c.rotation.z+=dt*7;c.rotation.x+=dt*2;c.position.y=GY(c.position.x,c.position.z)+Math.sin((1.2-cs.flip)/1.2*Math.PI)*3.5;if(cs.flip<=0){c.rotation.z=0;c.rotation.x=0;c.position.y=0;const[,bi]=distPathPt(c.position.x,c.position.z,cs.path);const q=cs.path[bi],n=cs.path[bi+1];c.position.set(q[0],0,q[1]);cs.a=Math.atan2(n[0]-q[0],n[1]-q[1]);cs.v=0;cs.y=0;cs.air=0}return}
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
 if(cs.turbo&&gas&&cs.v>8&&Math.random()<dt*30){const f2=new V3(Math.sin(cs.a),0,Math.cos(cs.a));burst(c.position.clone().addScaledVector(f2,-2.4).setY(c.position.y+.7),1,[0xff7a1a,0xffd23f,0x4aa0ff],1,.25,1,.35)}
 const steer=-clamp(wheel,-1.6,1.6)*2.2;cs.av=lerp(cs.av,steer,1-Math.exp(-6*dt));cs.a+=cs.av*dt*clamp(cs.v/8,-1,1)+cs.spin*dt;cs.spin*=Math.exp(-dt*3);
 const f=new V3(Math.sin(cs.a),0,Math.cos(cs.a));c.position.addScaledVector(f,cs.v*dt);c.rotation.y=cs.a;
 // ramps / air
 let ground=0;for(const r of cs.ramps){const dx=c.position.x-r.x,dz=c.position.z-r.z,al=dx*Math.sin(r.ang)+dz*Math.cos(r.ang),lat=dx*Math.cos(r.ang)-dz*Math.sin(r.ang);if(Math.abs(lat)<2.5&&al>-3&&al<3)ground=Math.max(ground,(al+3)/6*1.3)}
 if(cs.air){cs.vy-=22*dt;cs.y+=cs.vy*dt;cs.airT+=dt;if(cs.y<=ground){cs.y=ground;cs.air=0;if(S.slayG&&cs.airT>.25)slaySay('🍸 '+pick(SLINES.bump),1500);cs.svy=-Math.min(6,Math.abs(cs.vy))*.9;S.shake=Math.max(S.shake,.5);SFX.bounce();buzz(40);burst(c.position.clone().setY(c.position.y+.3),10,[0xcccccc,TH.rough],3,.25,2,.6);if(cs.airT>.45){const sb=Math.round(cs.airT*40);cs.style+=sb;toast(`🚀 AIR TIME ${cs.airT.toFixed(1)}s +${sb}`,true,1100)}cs.airT=0}}
 else{if(cs.lastG>1.1&&ground<.2&&cs.v>5){cs.air=1;cs.vy=3+cs.v*.32;cs.airT=0;SFX.swing()}else cs.y=ground}cs.lastG=ground;
 // suspension
 const bump=(onP?0:Math.sin(cs.t*17)*.5)*Math.abs(cs.v)/15;cs.svy+=(-cs.sy*90-cs.svy*9+bump*25)*dt;cs.sy+=cs.svy*dt;
 const acc=(cs.v-(cs.pv??cs.v))/Math.max(dt,1e-3);cs.pv=cs.v;cs.pitch=lerp(cs.pitch,clamp(-acc*.006,-.08,.08),.15);
 ud.body.position.y=.55+cs.sy*.25;ud.body.rotation.x=cs.pitch+(cs.air?-.12:0);ud.body.rotation.z=lerp(ud.body.rotation.z,cs.av*.05*Math.abs(cs.v)/15,.2);
 c.position.y=GY(c.position.x,c.position.z)+cs.y;if(course.hf){c.rotation.order='YXZ';const px=c.position.x,pz=c.position.z,sf=(GY(px+f.x*1.5,pz+f.z*1.5)-GY(px-f.x*1.5,pz-f.z*1.5))/3,sr=(GY(px+f.z,pz-f.x)-GY(px-f.z,pz+f.x))/2;c.rotation.x=(cs.air?-cs.vy*.02:0)-Math.atan(sf);c.rotation.z=Math.atan(sr);if(!cs.air)cs.v-=sf*9.8*.55*dt}else c.rotation.x=cs.air?-cs.vy*.02:0;
 for(const w of ud.wheels)w.rotation.x+=cs.v*dt/.46;for(const fp of ud.front)fp.rotation.y=clamp(-wheel*.5,-.6,.6);ud.sw.rotation.z=wheel*2;
 // drift smoke + tire marks
 const slip=Math.abs(cs.av)*Math.abs(cs.v);if(!cs.air&&(slip>22||(brake&&cs.v>10))){const rg=new V3(Math.cos(cs.a),0,-Math.sin(cs.a));for(const sd of[-1,1]){const wp=c.position.clone().addScaledVector(f,-1.35).addScaledVector(rg,sd*1.05);if(Math.random()<.5)addMark(wp.x,wp.z,cs.a);if(Math.random()<dt*25){burst(wp.setY(c.position.y+.4),1,[0xdddddd,0xbbbbbb],1.2,.45,1.2,.9);parts[parts.length-1].g=-.15}}if(!cs.drQ&&slip>30){cs.drQ=1;cs.style+=15;toast('💨 DRIFT KING',true,900);setTimeout(()=>cs.drQ=0,2500)}}
 if(!onP&&Math.abs(cs.v)>4&&Math.random()<dt*8)burst(c.position.clone().addScaledVector(f,-2).setY(c.position.y+.3),1,[TH.rough,0x7a4b25],1.5,.2,1.5,.5);
 // collisions: trees/benches/carts
 if(!cs.air)for(const t of(cs.auto?[]:trees)){const dx=c.position.x-t.x,dz=c.position.z-t.z,l=Math.hypot(dx,dz);if(l<t.r+1.8){c.position.x=t.x+dx/l*(t.r+1.9);c.position.z=t.z+dz/l*(t.r+1.9);const hard=Math.abs(cs.v)>13;cs.hits++;S.shake=hard?1:.6;SFX.tree();SFX.bounce();buzz(60);burst(c.position.clone().setY(c.position.y+2),14,[0x2e8b3a,0xffffff,0x3fa34d],5,.3,5);
  if(hard){cs.flip=1.2;cs.slow=1.4;SFX.bad();toast(t.kind==='cart'?'💥 CART-ON-CART CRIME! FLIPPED!':'🤸 FLIPPED IT!',false,1600);quip('cart',1)}else{cs.v=-cs.v*.4;cs.a+=rand(-.6,.6);toast(t.kind==='bench'?'BENCHED! 🪑':t.kind==='cart'?'Fender bender! 🛺':['CRUNCH!','BONK!','OOF!'][cs.hits%3],true,900)}break}}
 // cones
 for(const k of cs.cones){if(k.v){k.v.y-=20*dt;k.g.position.addScaledVector(k.v,dt);k.g.rotation.x+=dt*9;k.g.rotation.z+=dt*6;if(k.g.position.y<k.by){k.g.position.y=k.by;k.v.multiplyScalar(.3);if(k.v.length()<.5)k.v.set(0,0,0)}continue}
  if(!cs.auto&&Math.hypot(c.position.x-k.x,c.position.z-k.z)<1.6&&cs.y<1){k.v=f.clone().multiplyScalar(Math.abs(cs.v)*.9+3).add(new V3(rand(-3,3),6+Math.abs(cs.v)*.2,rand(-3,3)));cs.coneHits++;SFX.bounce();tone(260,.1,'square',.08,120);if(cs.coneHits===1||cs.coneHits%3===0)toast(`🚧 CONE! (${cs.coneHits})`,true,700)}}
 // ducks
 if(!cs.auto)for(const d of cs.ducks){if(d.flee||d.hit)continue;if(d.g.position.distanceTo(c.position)<2&&cs.y<1){d.hit=1;d.flee=1;if(P()&&P().st)P().st.ducks++;d.fx=rand(-1,1);d.fz=rand(-1,1);SFX.quack();burst(d.g.position.clone().setY(c.position.y+1),16,[0xffffff,0xeeeeee],4,.18,4,1.2);cartFail(cs,c,'🦆 QUACK ATTACK! (-speed)');cs.spin=rand(-2,2)}}
 // sprinklers
 for(const sp of cs.sprinks){if(Math.hypot(c.position.x-sp.x,c.position.z-sp.z)<4.5&&cs.wet<=0&&!cs.auto){cs.wet=1.4;SFX.splash();toast('💦 SPRINKLED! slippery!',true,900);$('flash').style.background='#8fd3ff';S.flash=.8;setTimeout(()=>$('flash').style.background='',600)}}if(cs.wet>0)cs.wet-=dt;
 // checkpoints
 for(const cp of cs.cps){if(cp.hit)continue;const dx=c.position.x-cp.x,dz=c.position.z-cp.z,al=dx*Math.sin(cp.ang)+dz*Math.cos(cp.ang),lat=dx*Math.cos(cp.ang)-dz*Math.sin(cp.ang);if(Math.abs(al)<2.5&&Math.abs(lat)<cs.PW/2+1){cp.hit=true;cp.ban.material=MC(0x3ccf6e);SFX.ding();const n=cs.cps.filter(q=>q.hit).length;toast(`✅ CHECKPOINT ${n}/${cs.cps.length} · ${cs.t.toFixed(1)}s`,true,1000);burst(new V3(cp.x,3.6,cp.z),20,[0x3ccf6e,0xffd23f,0xffffff],5,.25,4,1)}}
 const s=surface(c.position.x,c.position.z);if(s==='water'&&!cs.air){SFX.splash();burst(c.position.clone(),30,[0x8fd3ff,0xffffff],6,.3,8);toast(TH.lava?'🔥 Cart got toasted! Back on the path':'Cart went for a swim 🛺💦',true);const[,bi]=distPathPt(c.position.x,c.position.z,cs.path);c.position.set(cs.path[bi][0],0,cs.path[bi][1]);cs.v=0;cs.hits++}
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
 if(S.slayG){const g=S.slayG,u=g.userData,t=S.t;g.rotation.z=Math.sin(t*2.3)*.12;u.head.rotation.z=Math.sin(t*1.7)*.2;const k=Math.max(0,Math.sin(t*1.1));u.armL.rotation.set(-.3-1.7*k,0,-.3);u.armR.rotation.set(cs&&cs.air?-2.8:0,0,cs&&cs.air?.4:.3+Math.abs(Math.sin(t*6))*.3*(cs&&cs.honkT>0?1:0));u.vg.visible=true;u.club.visible=false;g.position.y=.93+(cs&&cs.air?.25:0);if(cs&&!cs.done&&cs.start!==false){S.slayT-=1/60;if(S.slayT<0){S.slayT=6+Math.random()*4;slaySay('🍸 '+pick(SLINES.cart),2200)}}}
 S.golfer.position.y=.93+(cs&&cs.flip>0?Math.abs(Math.sin(cs.flip*6))*1.4:0)+(cs&&cs.air?.15:0)}
function endCart(){engSet(0,0,0);if(!myCart)return;S.slayG=null;myCart.remove(S.golfer);scene.add(S.golfer);S.golfer.scale.setScalar(1);S.golfer.position.y=0;courseG.remove(myCart);myCart=null;$('cartUI').style.display='none';ball.visible=true;resize();finishHole()}
// ---------- HUD ----------
function hudLayout(){const h=$('hud');if(!h||!h.classList.contains('show'))return;const bt=e=>e&&e.offsetParent?e.getBoundingClientRect().bottom:0;const hr=h.getBoundingClientRect().top;const t=Math.max(bt($('hInfo')),bt($('hDist')),bt($('bPause')))-hr+6;h.style.setProperty('--ht',Math.round(t)+'px');const d=$('drunk'),w=$('wind'),hd=$('hDare');const dt_=Math.round(Math.max(bt(d),bt(w))-hr+4);if(hd)hd.style.top=dt_+'px';$('toasts').style.top='max(28%,'+(dt_+(hd?hd.offsetHeight:0)+34)+'px)'}
function updHUD(){const p=P();if(!p)return;$('bDrink').classList.toggle('pulse',!S.rc&&!S.net&&S.hole-(p.ldh??-1)>=2);$('hInfo').innerHTML=`<span style="color:${p.c.shirt}">●</span> ${esc(p.c.name)}<br>Hole ${S.hole+1}/${HOLES.length} · Par ${course.par}<br>Stroke ${p.strokes+1}`;{let d=$('hDare');if(!d){d=document.createElement('div');d.id='hDare';$('hud').appendChild(d)}d.textContent='🎯 '+dareNow().t};
 $('dFill').style.width=Math.round(p.drunk*100)+'%';$('dPct').textContent=Math.round(p.drunk*100)+'%';
 const st=[];if(p.hang)st.push('🤕 Hangover');if(p.steady)st.push('🍺 Steady');if(p.boost)st.push('🥃 Power');if(p.vodka)st.push('🧊 Vodka rush');if(S.effects.moon)st.push('🌙 Moon');if(S.effects.rocket)st.push('🚀 Rocket');if(S.effects.giant)st.push('🎈 Giant');if(p.crisp)st.push('🫧 Crisp');if(p.jager)st.push('💣 Bullet time');if(p.teq)st.push('🌵 Flipped');if(p.absH===S.hole)st.push('🧚 Seeing things');if(p.turbo)st.push('⚡ Cart turbo');if(p.moon)st.push('🏺 Moonshine');st.push(`×${drunkMult(p).toFixed(2)} dist`);$('status').textContent=st.join(' · ');
 $('wTxt').textContent=course.wind.s+' m/s'}
// ---------- camera ----------
function snapCam(){const d=dirV(S.aim);const cp=S.ballP.clone().addScaledVector(d,-11);cp.y=Math.max(5+S.ballP.y-.35,GY(cp.x,cp.z)+2.2);S.camP.copy(cp);S.camL.copy(S.ballP).addScaledVector(d,25)}
// ---------- main loop ----------
let last=performance.now();S.wob=0;S.dispPow=0;
function physics(dt){const p=P(),b=S.ballP,v=S.ballV,c=course;
 if(S.airborne){const g=9.8*(S.effects.moon?.45:1);v.y-=g*dt;const wv=dirV(c.wind.a),wr=windRes();v.x+=wv.x*c.wind.s*.11*wr*dt;v.z+=wv.z*c.wind.s*.11*wr*dt;
  // curve
  const hv=Math.hypot(v.x,v.z)||1,cpx=-v.z/hv,cpz=v.x/hv;v.x+=cpx*S.curve*dt;v.z+=cpz*S.curve*dt;{const hh=Math.hypot(v.x,v.z),dv=Math.atan2(Math.sin(Math.atan2(v.x,-v.z)-S.shotRef),Math.cos(Math.atan2(v.x,-v.z)-S.shotRef));if(S.shotRef!=null&&Math.abs(dv)>.9&&hh>.01){const na=S.shotRef+Math.sign(dv)*.9;v.x=Math.sin(na)*hh;v.z=-Math.cos(na)*hh;S.curve=0}}
  b.addScaledVector(v,dt);
  // trees
  for(const t of trees){if(b.y-(t.y||0)<t.h&&Math.hypot(b.x-t.x,b.z-t.z)<t.r+.35){const nx=(b.x-t.x),nz=(b.z-t.z),l=Math.hypot(nx,nz)||1;b.x=t.x+nx/l*(t.r+.4);b.z=t.z+nz/l*(t.r+.4);const dot=(v.x*nx+v.z*nz)/l;v.x=(v.x-2*dot*nx/l)*.35;v.z=(v.z-2*dot*nz/l)*.35;SFX.tree();burst(b.clone(),12,[0x2e8b3a,0x3fa34d],4,.25,2);S.shake=.4;if(!S.tTo){toast('TIMBER! 🌲',true,1000);quip('tree');S.tTo=1;setTimeout(()=>S.tTo=0,1500)}}}
  if(cartObj){const cp=cartObj.position;if(Math.abs(b.x-cp.x)<2.2&&Math.abs(b.z-cp.z)<3.5&&b.y-cp.y<4){v.x=-v.x*.6+rand(-6,6);v.z=-v.z*.4;v.y=Math.abs(v.y)+6;b.addScaledVector(v,dt*3);SFX.bounce();SFX.bad();toast('BONK! Rogue cart! 🛺',true,1200);S.shake=.6}}
  if(windmill&&b.y<16&&b.y>2&&Math.hypot(b.x-windmill.x,b.z-(windmill.z+3.3))<8&&Math.abs(b.z-(windmill.z+3.3))<1.2){const ang=((windmill.bl.rotation.z%(Math.PI/2))+Math.PI/2)%(Math.PI/2);if(ang<.5){v.z=Math.abs(v.z)*.5;v.x+=rand(-8,8);v.y+=4;SFX.tree();toast('WHACKED by the windmill!',true,1300);S.shake=.6}}
  if(b.y<=GY(b.x,b.z)+.35){b.y=GY(b.x,b.z)+.35;const s=surface(b.x,b.z);if(s==='water'){S.splashP=b.clone();return penalty('water')}if(s==='oob')return penalty('oob');
   const rest=REST[s],keep=KEEP[s];if(s==='ice'&&S.bounces===0){toast('⛸️ Skiiiiid!',true,1000);SFX.putt()}
   if(S.bounces===0){if(s==='sand'){SFX.land('sand');burst(b.clone(),16,[0xf1df9a,0xe0c070],3,.2,3)}else{SFX.land(s);burst(b.clone(),6,[0x5aa840,0x7a4b25],2,.15,2)}}
   S.bounces++;v.y=-v.y*rest;v.x*=keep*(S.shotClub.roll||1)+(1-(S.shotClub.roll||1))*.3;v.z*=keep*(S.shotClub.roll||1)+(1-(S.shotClub.roll||1))*.3;if(v.y<1.8){v.y=0;S.airborne=false}}
 }else{b.y=GY(b.x,b.z)+.35;const s=surface(b.x,b.z);const sp=Math.hypot(v.x,v.z);
  if(s==='water'){S.splashP=b.clone();return penalty('water')}if(s==='oob')return penalty('oob');
  const dh=Math.hypot(b.x-c.pin[0],b.z-c.pin[1]);if(dh<.9&&sp<7.5)return holed();
  if(dh<.9&&sp>=7.5){v.x*=.8;v.z*=.8}
  const fr=frOf(s,S.shotClub);const ns=Math.max(0,sp-fr*dt);if(sp>0){v.x*=ns/sp;v.z*=ns/sp}if(c.hf){const g2=GG(b.x,b.z);v.x-=g2[0]*SLP*dt;v.z-=g2[1]*SLP*dt}
  // slight drunk drift on green
  if(S.deck&&s==='green'){v.x+=S.deck.gx*dt;v.z+=S.deck.gz*dt;b.y=GY(b.x,b.z)+.35+S.deck.h(b.x,b.z)}
  b.addScaledVector(v,dt);
  for(const t of trees){if(Math.hypot(b.x-t.x,b.z-t.z)<t.r+.35){v.x*=-.4;v.z*=-.4}}
  if(ns<.12){v.set(0,0,0);return settle()}}
}
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;if(S.vs&&S.mode==='play'&&P()&&P().ai&&S.phase!=='chug'&&S.phase!=='aim')dt=Math.min(.066,dt*(S.aiFast?2.6:1.6));S.t+=dt;const t=S.t;let hv=HV();
 if(S.mode==='creator'||(S.mode==='title'&&false)){if(cGolfer){if(S.noSpin)cGolfer.rotation.y=S.noSpin-1;else cGolfer.rotation.y+=dt*.8;tipsy+=dt*.1;golferMood(cGolfer,(Math.sin(t*.5)*.5+.5)*.6,t,0);const u=cGolfer.userData;u.armL.rotation.z=-.25-Math.sin(t*2)*.08;u.armR.rotation.z=.25+Math.sin(t*2)*.08}
  const w=innerWidth,h=innerHeight,land_=w>h;cCam.aspect=w/h;cCam.updateProjectionMatrix();if(land_){cCam.position.set(2.4,1.4,6);cCam.lookAt(2.4,1,0)}else{cCam.position.set(0,1.9,7.5);cCam.lookAt(0,-.55,0)}
  renderer.setRenderTarget(null);renderer.render(cScene,cCam);return}
 if(S.mode==='title'&&!course){buildHole(0);S.ballP.set(0,.35,0);aimAtPin();if(S.golfer){if(S.golfer.parent)S.golfer.parent.remove(S.golfer)}S.golfer=makeGolfer(randomChar());scene.add(S.golfer)}
 const p=P()||{drunk:Math.sin(t*.3)*.35+.35,hang:0};const dr=p.drunk;
 if(S.mode==='play'){
  // meters
  const jgs=P()&&P().jager?.35:1;
  if(S.phase==='power'){const sp=1.1*(1+dr*1.4+hv*1.6)*jgs;S.power+=S.pDir*sp*dt;if(S.power>1){S.power=1;S.pDir=-1}if(S.power<0){S.power=0;S.pDir=1}S.dispPow=clamp(S.power+Math.sin(t*14)*.08*dr+Math.sin(t*5.3)*.05*dr+Math.sin(t*23)*.1*hv,0,1);$('pFill').style.height=(S.dispPow*100)+'%'}
  if(S.phase==='acc'){const sp=1.6*(1+dr*1.6+hv*1.4)*(p.steady?.55:1)*jgs*(EQ().club==='wood'?.94:1);S.acc+=S.aDir*sp*dt+Math.sin(t*9)*dr*.9*dt*3+Math.sin(t*17)*hv*dt*4;if(S.acc>1){S.acc=1;S.aDir=-1}if(S.acc<-1){S.acc=-1;S.aDir=1;}$('needle').style.left=((S.acc+1)/2*100)+'%'}
  if(S.phase==='swing'){S.swingT+=dt;if(S.swingT>.22&&S.pending){launch();S.pending=null}if(S.swingT>.6)S.swingT=-1}
  if(S.phase==='fly'){let ts=1;if(S.slowT>0){S.slowT-=dt;ts=.35}const nearCup=!S.airborne&&Math.hypot(S.ballP.x-course.pin[0],S.ballP.z-course.pin[1])<4&&S.ballV.length()<6&&S.ballV.length()>.5;if(nearCup)ts=.45;const pdt=dt*ts,steps=4;for(let i=0;i<steps&&S.phase==='fly';i++)physics(pdt/steps);S.flightT+=dt;if(S.phase==='fly'&&S.flightT>25){S.ballV.set(0,0,0);S.airborne=false;settle()}
   trailPts.push(S.ballP.clone());if(trailPts.length>trailN)trailPts.shift();if(S.rec&&S.rec.length<3000)S.rec.push(S.ballP.clone())}
  if(S.phase==='cart'&&myCart)updCart(dt,dr);updCine(dt,t);
  if(S.phase==='keg'&&S.keg)updKeg(dt);
  if(S.phase==='chug'){const c=S.cut;c.t+=dt;if(c.t>1.15&&!c.burped){c.burped=true;SFX.burp();const u=S.golfer.userData;const mp=new V3();u.mouthG.getWorldPosition(mp);for(let i=0;i<10;i++){burst(mp,1,[0xffffff],1,.07,1.2,.6);const q=parts[parts.length-1];if(q){q.g=-.15;q.m.geometry=G.sph;q.m.material=BUBM}}toast('*BUUURP*',true,900);S.shake=.3;buzz(60)}if(c.t>c.dur)endChug()}
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
 else if(S.golfer&&S.phase==='keg'){const g=S.golfer,u=g.userData,d=dirV(S.aim),r=new V3(-d.z,0,d.x),gp=S.ballP.clone().addScaledVector(r,-.9);g.position.set(gp.x,1.75+GY(gp.x,gp.z),gp.z);g.rotation.y=Math.atan2(-r.x,-r.z);g.rotation.z=Math.PI;golferMood(g,dr,t,0);u.armL.rotation.set(0,0,-.9);u.armR.rotation.set(0,0,.9);u.swing.rotation.set(0,0,0);const kk=S.keg&&S.keg.held?1:.3;u.legs[0].rotation.x=Math.sin(t*9)*.6*kk;u.legs[1].rotation.x=-Math.sin(t*9)*.6*kk;if(kegMesh)kegMesh.position.set(gp.x,.45+GY(gp.x,gp.z),gp.z)}
 else if(S.golfer){const g=S.golfer,u=g.userData;const ad=S.aim+(S.phase==='aim'||S.phase==='power'||S.phase==='acc'?S.wob:0);const d=dirV(ad),r=new V3(-d.z,0,d.x);
  if(S.phase!=='fly'||S.flightT<.8){const gp=S.ballP.clone().addScaledVector(r,-.9);if(S.phase!=='fly'){g.position.set(gp.x,0,gp.z);g.rotation.y=S.phase==='chug'?Math.atan2(-r.x,-r.z):Math.atan2(r.x,r.z)}}
  golferMood(g,dr,t,p.hang||0);
  if(S.phase==='chug')animGolfer(u,'chug',S.cut.d.shot?Math.min(S.cut.t*1.5,1.05)+Math.max(0,S.cut.t-.7):S.cut.t,t,dr);else if(S.phase==='holed'){S.celebT=(S.celebT||0)+dt;animGolfer(u,'celebrate',S.celebT,t,dr);g.position.y=Math.abs(Math.sin(S.celebT*7))*.35}else if(S.swingT>=0){animGolfer(u,'swing',S.swingT,t,dr);if(hv>0){u.body.rotation.z+=Math.sin(S.swingT*25)*.25*hv;g.position.x+=Math.sin(t*11)*.04*hv}}else animGolfer(u,S.phase==='power'?'power':'idle',0,t,dr);if(S.phase!=='holed'){g.position.y=0;if(S.phase!=='chug')u.club.visible=!S.clubFly}g.rotation.z=0;reactAnim(g,u,dt,t,dr,r);if(u.vg){const idle=S.phase==='aim'&&S.swingT<0&&!S.react;u.vg.visible=S.phase!=='chug'&&S.swingT<0||!!(S.cut&&S.cut.dbl);if(S.cut&&S.cut.dbl){const k=Math.min(1,S.cut.t*3);u.armL.rotation.set(-.6-1.6*k,0,-.25);u.head.rotation.x=-.25*k}if(idle){const k=Math.max(0,Math.sin(t*1.4));u.armL.rotation.set(-.45-1.5*k,0,-.38-.25*k);u.head.rotation.x=-.15*k}}if(course&&course.hf&&g.parent===scene)g.position.y+=GY(g.position.x,g.position.z)}
 // world anim
 if(windmill)windmill.bl.rotation.z+=dt*1.1;if(cartObj){cartObj.position.x=Math.sin(t*.45)*38;cartObj.position.y=GY(cartObj.position.x,cartObj.position.z);cartObj.rotation.y=Math.cos(t*.45)>0?Math.PI/2:-Math.PI/2}
 if(flag){const pa=flag.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i)+.8;pa.setZ(i,Math.sin(t*6+x*3)*.15*x)}pa.needsUpdate=true;const wa=course.wind.a;pinG.rotation.y=-wa+Math.PI/2;updGoggles(dt,t);updBar(dt,t);netTick(dt)}
 ghosts.forEach((g,i)=>{const on=hv>0&&S.mode==='play'&&ball.visible&&(i===0||hv>.5);g.visible=on;if(on){const s=i?-1:1;g.position.set(S.ballP.x+Math.sin(t*.8+i*2)*2.2*hv*s,S.ballP.y,S.ballP.z+Math.cos(t*.6+i)*1.5*hv)}});
 ghostPins.forEach((g,i)=>{const on=hv>0&&S.mode==='play'&&course&&(i===0||hv>.5);g.visible=on;if(on)g.position.set(course.pin[0]+Math.sin(t*.5+i*3)*6*hv*(i?-1:1),HPf(),course.pin[1]+Math.cos(t*.4+i)*4*hv)});
 const absOn=S.mode==='play'&&P()&&P().absH===S.hole&&S.phase!=='cart';if(hotTub){hotTub.visible=absOn;if(absOn){hotTub.userData.duck.position.set(Math.cos(t*.4)*course.gr*.6,Math.sin(t*3)*.08,Math.sin(t*.4)*course.gr*.6);hotTub.userData.duck.rotation.y=-t*.4;if(Math.random()<dt*14){burst(new V3(course.pin[0]+rand(-1,1)*course.gr*.8,.2,course.pin[1]+rand(-1,1)*course.gr*.8),1,[0xffffff,0xbff8ff],.5,.25,2.5,.9);parts[parts.length-1].g=-.4}}}
 fakeHoles.forEach((g,i)=>{g.visible=absOn;if(absOn){const a=t*.15+i*2.1,r2=course.gr+10+i*6;g.position.set(course.pin[0]+Math.cos(a)*r2,HPf(),course.pin[1]+Math.sin(a)*r2*.7)}});
 if(amb){const pa=amb.geometry.attributes.position,b0=amb.userData.base,cx=S.camL.x,cz=S.camL.z,g0=GY(cx,cz);for(let i=0;i<pa.count;i++){let x=b0[i*3],y=b0[i*3+1],z=b0[i*3+2];if(TH.snow){y=((y-t*2.2)%40+40)%40;x+=Math.sin(t*.7+i)*1.2}else if(TH.lava){y=(y+t*1.6)%16;x+=Math.sin(t*.9+i)*1.6;z+=Math.cos(t*.7+i*1.3)*1.6}else if(TH.night){x+=Math.sin(t*.6+i)*2;y+=Math.sin(t*1.3+i*.7)*.8;z+=Math.cos(t*.5+i*1.3)*2}else{x+=((t*6+i*7)%120)-60;y=.3+Math.abs(Math.sin(t+i))*1.5}pa.setXYZ(i,cx+x,y+g0,cz+z)}pa.needsUpdate=true;if(TH.night)amb.material.opacity=.6+Math.sin(t*4)*.35}
 if(S.phase==='fly'&&ball.visible){const tk=EQ().trail;if(tk==='rainbow')trail.material.color.setHSL((t*.8)%1,1,.6);if(tk==='fire'&&Math.random()<.7)burst(S.ballP.clone(),1,[0xff7a1a,0xffd23f,0xff3030],.6,.18,.5,.45);if(tk==='bubbles'&&Math.random()<.6){burst(S.ballP.clone(),1,[0xffd23f,0xffffff],.5,.16,1,.8);parts[parts.length-1].g=-.2}}
 if(LAVA&&TH.lava&&course){LAVA.map.offset.set(Math.sin(t*.13)*.3,t*.025);LAVA.color.setScalar(.88+Math.sin(t*2.1)*.08+Math.sin(t*5.3)*.04);if(course.hf)for(const w of course.hf.W)if(Math.random()<dt*w[2]*.12){burst(new V3(w[0]+rand(-.7,.7)*w[2],w[3]+.3,w[1]+rand(-.7,.7)*w[2]),1,Math.random()<.3?[0xff8a20]:[0x666060,0x8a8080],.6,.7,1.6,2.2);parts[parts.length-1].g=-.2}}
 if(S.vSmoke)S.vSmoke.forEach((p,k)=>{const f=((t*.05+k/6)%1);p.position.set(Math.sin(k*2.3+t*.1)*12*f,190+f*170,Math.cos(k*1.7)*10*f);p.scale.setScalar(28+f*60);p.material.opacity=.55*(1-f)});
 if(EQ().ball==='disco')ball.material.emissive.setHSL((t*1.5)%1,.9,.35);
 if(S.redT>0)S.redT-=dt;if(S.black>0)S.black-=dt;if(!S.bo)$('black').style.opacity=S.black>0?Math.min(1,S.black*1.4):0;
 // distance hint: ideal power tick
 {const pi=$('pIdeal');if(S.hint&&S.mode==='play'&&(S.phase==='power'||S.phase==='aim')){const pw=S.hint.pw[S.club];pi.style.display='block';pi.style.bottom=(pw*100)+'%';pi.style.transform=`translateY(${(Math.sin(t*6.3)*16+Math.sin(t*2.1)*10)*dr*dr}px)`;pi.style.filter=dr>.3?`blur(${(dr-.3)*4}px)`:'';pi.classList.toggle('full',pw>=1)}else pi.style.display='none'}
 updParts(dt);
 ball.position.copy(S.rp?S.rp.cur:S.ballP);ballShadowRing.position.set(S.ballP.x,S.ballP.y-.25,S.ballP.z);ballShadowRing.visible=S.phase==='aim';ballShadowRing.material.opacity=.5+Math.sin(t*5)*.3;
 // trail
 const tp=trail.geometry.attributes.position;for(let i=0;i<trailN;i++){const q=trailPts[Math.min(i,trailPts.length-1)]||S.ballP;tp.setXYZ(i,q.x,q.y,q.z)}tp.needsUpdate=true;trail.visible=S.phase==='fly'&&trailPts.length>1;
 // aim preview
 const aiming=S.mode==='play'&&(S.phase==='aim'||S.phase==='power'||S.phase==='acc');dots.visible=land.visible=aiming;
 if(aiming){const c=CLUBS[S.club],d=dirV(S.aim+S.wob),m=new THREE.Matrix4();const pw=S.phase==='aim'?1:(S.phase==='power'?S.dispPow:S.lockedPow);
  if(c.id==='putter'){const L=c.carry*pw*(1+.3*dr);for(let i=0;i<DOTS;i++){const k=i/DOTS*L;m.makeTranslation(S.ballP.x+d.x*k,GY(S.ballP.x+d.x*k,S.ballP.z+d.z*k)+.3,S.ballP.z+d.z*k);dots.setMatrixAt(i,m)}land.position.set(S.ballP.x+d.x*L,GY(S.ballP.x+d.x*L,S.ballP.z+d.z*L)+.12,S.ballP.z+d.z*L);land.scale.setScalar(.4)}
  else{const L=c.carry*pw*drunkMult(p)*(S.effects.rocket?1.8:1),th=c.ang*Math.PI/180,hmax=L*Math.tan(th)/4;for(let i=0;i<DOTS;i++){const k=i/(DOTS-1);m.makeTranslation(S.ballP.x+d.x*L*k,lerp(S.ballP.y-.35,GY(S.ballP.x+d.x*L,S.ballP.z+d.z*L),k)+.4+4*hmax*k*(1-k),S.ballP.z+d.z*L*k);dots.setMatrixAt(i,m)}land.position.set(S.ballP.x+d.x*L,GY(S.ballP.x+d.x*L,S.ballP.z+d.z*L)+.12,S.ballP.z+d.z*L);land.scale.setScalar(1+dr*1.5)}
  dots.instanceMatrix.needsUpdate=true;
  {const hd=S.hint;let ht='';if(hd){const fz=dr>.45?'~':'';const jit=v=>Math.round(clamp(v+(dr>.45?Math.sin(t*3.7)*dr*(S.gogA>.5?.25:.12):0),0,1)*100);ht=`<div class="hint">🎯 ${CLUBS[hd.rec].n} ${fz}${hd.pw[hd.rec]>=1?'FULL':jit(hd.pw[hd.rec])+'%'}${hd.rec!==S.club?' · tap':''}</div><div style="font-size:11px">${CLUBS[S.club].n}: ${hd.pw[S.club]>=1?'can\'t reach':fz+jit(hd.pw[S.club])+'% power'}</div>`}$('hDist').innerHTML=`${S.gogA>.5?'~'+Math.round(holeDist()*(1+Math.sin(t*1.3)*.18)):Math.round(holeDist())}m<div style="font-size:11px">to pin</div>${elevTxt()}${ht}`}
  const cy=Math.atan2(S.camL.x-S.camP.x,-(S.camL.z-S.camP.z));$('wArrow').style.transform=`rotate(${(course.wind.a-cy)*180/Math.PI-90}deg)`}
 // camera targets
 let tp2,tl,k=4;
 if(S.mode==='title'){const a=t*.12;tl=new V3(course.pin[0]*.3,0,course.pin[1]*.3);tp2=new V3(Math.sin(a)*60,30,Math.cos(a)*60+course.pin[1]*.3);k=2}
 else if(S.cineCam){tp2=S.cineCam.p;tl=S.cineCam.l;k=5}
 else if(S.phase==='cart'&&myCart){const cs=S.cartS;const f=new V3(Math.sin(myCart.rotation.y),0,Math.cos(myCart.rotation.y));const sp=Math.abs(cs.v);
  if(cs.flip>0){const oa=S.t*.9;tp2=myCart.position.clone().add(new V3(Math.sin(oa)*9,5,Math.cos(oa)*9));tl=myCart.position.clone();k=3}
  else{tp2=myCart.position.clone().addScaledVector(f,-(8.5+sp*.12));tp2.y=myCart.position.y+3.6+sp*.05;tl=myCart.position.clone().addScaledVector(f,7+sp*.4);tl.y+=1.2;k=5}
  const bf=(innerWidth<innerHeight?62:50)+Math.min(sp,30)*.45;camera.fov=lerp(camera.fov,bf,.08);camera.updateProjectionMatrix()}
 else if((S.phase==='chug'||S.phase==='keg')&&S.golfer){const g=S.golfer;const f=new V3(Math.sin(g.rotation.y),0,Math.cos(g.rotation.y));const side=new V3(f.z,0,-f.x);tp2=g.position.clone().addScaledVector(f,3.6).addScaledVector(side,1.2);tp2.y=1.9+GY(g.position.x,g.position.z);tl=g.position.clone();tl.y=1.25+GY(g.position.x,g.position.z);k=8}
 else if(S.phase==='fly'||S.phase==='holed'||S.phase==='wait'){const hv=new V3(S.ballV.x,0,S.ballV.z);if(hv.length()<.5)hv.copy(dirV(S.aim));hv.normalize();tp2=S.ballP.clone().addScaledVector(hv,-14);tp2.y=Math.max(S.ballP.y+5,5+GY(tp2.x,tp2.z));tl=S.ballP.clone().addScaledVector(hv,6);k=3.5;
  if(S.phase==='holed'){tp2=new V3(course.pin[0]+8,6+HPf(),course.pin[1]+8);tl=new V3(course.pin[0],1+HPf(),course.pin[1])}}
 else{const d=dirV(S.aim+S.wob*.5),pin=S.club===4;tp2=S.ballP.clone().addScaledVector(d,pin?-7:-11);tp2.y=(pin?3.2:5)+S.ballP.y-.35;tl=S.ballP.clone().addScaledVector(d,pin?12:28);if(course.hf)tl.y=lerp(S.ballP.y,GY(tl.x,tl.z)+.35,.6);k=6}
 if(course&&course.hf&&S.mode!=='title'){const gc=GY(tp2.x,tp2.z)+2.2;if(tp2.y<gc)tp2.y=gc}
 const kk=1-Math.exp(-k*dt);S.camP.lerp(tp2,kk);S.camL.lerp(tl,kk);
 camera.position.copy(S.camP);camera.position.x+=Math.sin(t*.9)*dr*1.2;camera.position.y+=Math.sin(t*1.3)*dr*.6;
 if(S.shake>0){S.shake=Math.max(0,S.shake-dt*2);camera.position.x+=rand(-1,1)*S.shake*.6;camera.position.y+=rand(-1,1)*S.shake*.6}
 hideCamBlockers();
 camera.lookAt(S.camL);camera.rotateZ((S.deckTh||0)*3+Math.sin(t*.8)*dr*.12+Math.sin(t*2.1)*dr*.03+Math.sin(t*.25)*.45*hv);
 GT.value=t;gfxTick(dt,t);{const cs=S.cartS;slayTick();engSet(!!(myCart&&cs&&!cs.done&&S.mode!=='paused'&&!document.hidden),myCart&&ctl.gas?1:0,cs?cs.v||0:0)}if((S.hudT=(S.hudT||0)+dt)>.25){S.hudT=0;hudLayout()}sun.position.set(S.camL.x+30,60,S.camL.z+20);sun.target.position.copy(S.camL);
 if(S.flash>0)S.flash=Math.max(0,S.flash-dt*3);$('flash').style.opacity=S.flash*.6;
 const H=p.hang?1:0;const pd=S.mode==='title'?.15:dr;const Rr=Math.max(0,Math.min(1,(S.redT||0)/1.5)),Aa=absOn?.85:0;postMat.uniforms.R.value=Rr;postMat.uniforms.A.value=Aa;
 if(S.pumpCam&&!S.cut5&&S.golfer){if(performance.now()<S.pumpCam&&S.mode==='play'){const h=S.golfer.userData.head,hw=h.getWorldPosition(new V3());camera.position.copy(h.localToWorld(new V3(.9,-.6,4.2)));camera.lookAt(hw.x,hw.y-.35,hw.z)}else{S.pumpCam=0;snapCam()}}
 if(S.cut5&&S.golfer){const k=Math.min(1,(performance.now()-S.cut5.t0)/1300),e=1-Math.pow(1-k,3),h=S.golfer.userData.head,hw=h.getWorldPosition(new V3());const cp=h.localToWorld(new V3(.45*(1-e),.12+.4*(1-e),2.5+7*(1-e)));camera.position.copy(cp);camera.lookAt(hw.x,hw.y+.06,hw.z)}
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
// ---- original procedural music (lookahead scheduler)
let musicOn=LS.get('music',true);
const MUS={out:null,lp:null,duck:null,players:[],cur:null,timer:null,b:0};
const SC={maj:[0,2,4,5,7,9,11],dor:[0,2,3,5,7,9,10],phr:[0,1,4,5,7,8,10],mix:[0,2,4,5,7,9,10],min:[0,2,3,5,7,8,10]};
const TRACKS={
 title:{bpm:108,root:55,sc:'maj',style:'ska',ch:[0,5,3,4],lead:'square',mel:['4-.4.2.4-.5.4.2.','0-..2.4.5-.4-2-.','3-.3.5.7-.5.3.2.','4---.2.1.4---...'],alt:'6-.5.4.2-.1.4---'},
 sunny:{bpm:116,root:60,sc:'maj',style:'ska',ch:[0,5,1,4],lead:'square',mel:['4-.4.5.7---.5.4.','2-.2.4.5---.4.2.','3-.5.7.8---.7.5.','6-.4.6.8-.7-6-4-'],alt:'7---.6.4.2---....'},
 frost:{bpm:98,root:57,sc:'dor',style:'bossa',ch:[0,3,6,4],lead:'sine',mel:['7--5-4--2--4-5--','4--2-0--1--2-4--','6--4-3--2--3-4--','5-----4-2-----..'],alt:'7--8-9--7-----..'},
 dune:{bpm:104,root:52,sc:'phr',style:'bossa',ch:[0,6,5,1],lead:'sawtooth',mel:['0.1.2-4-2.1.0---','6.5.4-2-1.2.4---','5.4.2-1-0.1.2-4-','1-----0-1-2-....'],alt:'4.5.7-5-4.2.1---'},
 night:{bpm:90,root:53,sc:'maj',style:'lounge',ch:[0,5,1,4],lead:'sine',mel:['4--2-4-5--7--5..','2--0-2-4--5--4..','3--1-3-5--8--7..','6---5-4---2-----'],alt:'7---8-7---4-----'},
 volcano:{bpm:122,root:50,sc:'min',style:'tiki',ch:[0,5,3,4],lead:'triangle',mel:['0-.2.3-5-.3.2.0-','5-.7.8-7-.5.3.2-','3-.5.7-8-.7.5.3-','2-.0.2-3-.2.0---'],alt:'7.8.7.5-3-2.0---'},
 cart:{bpm:152,root:57,sc:'min',style:'surf',ch:[0,5,6,4],lead:'sawtooth',mel:['7.7.7.6.7-..4.5.','7.7.7.9.7-..5.4.','2.2.2.4.5-..7.5.','4.4.6.4.2-..1.2.'],alt:'7.9.a.9.7.5.4---'}};
function musInit(){const a=ac();if(!a||MUS.out)return;MUS.out=a.createGain();MUS.out.gain.value=musicOn?.55:0;MUS.duck=a.createGain();MUS.lp=a.createBiquadFilter();MUS.lp.type='lowpass';MUS.lp.frequency.value=6500;MUS.lp.Q.value=.7;
 MUS.duck.connect(MUS.lp);MUS.lp.connect(MUS.out);MUS.out.connect(a.destination);const n=a.sampleRate*.5,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;MUS.nb=b;MUS.timer=setInterval(musTick,25)}
function musDuck(amt,dur){if(!MUS.duck||!AC)return;const t=AC.currentTime;MUS.duck.gain.cancelScheduledValues(t);MUS.duck.gain.setTargetAtTime(amt,t,.04);MUS.duck.gain.setTargetAtTime(1,t+dur,.25)}
function mNote(pl,f,t,dur,type,vol,det=0,vib=0){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.detune.setValueAtTime(det,t);if(vib){const l=a.createOscillator(),lg=a.createGain();l.frequency.value=5.5;lg.gain.value=vib;l.connect(lg);lg.connect(o.detune);l.start(t);l.stop(t+dur+.1)}
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.setTargetAtTime(vol*.6,t+.03,.08);g.gain.setTargetAtTime(0,t+dur,.05);o.connect(g);g.connect(pl.g);o.start(t);o.stop(t+dur+.3)}
function mNoise(pl,t,dur,vol,freq,type){const a=AC,s=a.createBufferSource();s.buffer=MUS.nb;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.value=freq;const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(pl.g);s.start(t,Math.random()*.3);s.stop(t+dur+.02)}
function mKick(pl,t,v){const a=AC,o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(pl.g);o.start(t);o.stop(t+.25)}
const mf=m=>440*Math.pow(2,(m-69)/12);
function deg(tr,d,oct=0){const s=SC[tr.sc],n=s.length;const o=Math.floor(d/n);return tr.root+s[((d%n)+n)%n]+12*(o+oct)}
function musPlayer(name){const a=AC,g=a.createGain();g.gain.setValueAtTime(0,a.currentTime);g.gain.linearRampToValueAtTime(1,a.currentTime+.9);g.connect(MUS.duck);return{name,tr:TRACKS[name],g,step:0,next:a.currentTime+.06,hic:-1}}
function musSet(name){if(!MUS.out)return;if(MUS.cur&&MUS.cur.name===name)return;const a=AC;if(MUS.cur){const o=MUS.cur;o.g.gain.cancelScheduledValues(a.currentTime);o.g.gain.setValueAtTime(o.g.gain.value,a.currentTime);o.g.gain.linearRampToValueAtTime(0,a.currentTime+.9);o.dying=a.currentTime+1;setTimeout(()=>{try{o.g.disconnect()}catch(e){}},1500)}MUS.cur=musPlayer(name);MUS.players=MUS.players.filter(p=>!p.dying||p.dying>a.currentTime);MUS.players.push(MUS.cur)}
function musWant(){if(!['play','card','paused','pass'].includes(S.mode))return'title';if(S.phase==='cart')return'cart';const th=(COURSES[CI]||{}).theme;return TRACKS[th]?th:'sunny'}
function musTick(){const a=AC;if(!a||a.state!=='running'||!musicOn)return;let b=0;try{b=S.mode==='play'&&P()?P().drunk:0}catch(e){}MUS.b+=(b-MUS.b)*.05;b=MUS.b;
 const t0=a.currentTime;MUS.lp.frequency.setTargetAtTime(b>.15?2200+1800*(1-b)+Math.sin(t0*2.6)*1300*b:6500,t0,.05);MUS.lp.Q.setTargetAtTime(.7+b*7,t0,.1);
 for(const pl of MUS.players){if(pl.dying&&pl.dying<t0)continue;const tr=pl.tr,sp=60/(tr.bpm*(1-.12*b))/4;
  while(pl.next<t0+.12){const st=pl.step%16,bar=Math.floor(pl.step/16)%8,t=pl.next+(tr.style==='lounge'&&st%4===2?sp*.33:0)+(b>.3?(Math.random()-.5)*.025*b:0);musStep(pl,tr,st,bar,t,sp,b);
   if(st===0&&b>.4&&Math.random()<b*.35)pl.hic=1+Math.floor(Math.random()*14);if(st===pl.hic){pl.hic=-1;mNote(pl,1300,t+sp*.5,.05,'square',.05);/*stutter: repeat this step*/}else pl.step++;pl.next+=sp}}}
function musStep(pl,tr,st,bar,t,sp,b){const ci=tr.ch[bar%4],det=()=>(Math.random()-.5)*b*55+Math.sin(t*1.7)*b*30,sty=tr.style;
 // drums
 if(sty==='ska'){if(st%8===0)mKick(pl,t,.5);if(st===4||st===12)mNoise(pl,t,.14,.28,1800,'bandpass');if(st%2===0)mNoise(pl,t,.04,.09,7000,'highpass')}
 else if(sty==='bossa'){if([0,3,8,11].includes(st))mKick(pl,t,.38);if([0,3,6,10,12].includes(st))mNote(pl,tr===TRACKS.frost?620:1700,t,.05,tr===TRACKS.frost?'sine':'square',tr===TRACKS.frost?.07:.05);mNoise(pl,t,.03,tr===TRACKS.frost?(st%2?.015:.03):(st%2?.04:.07),tr===TRACKS.frost?4000:6000,'highpass')}
 else if(sty==='lounge'){if(st===0||st===10)mKick(pl,t,.35);if(st===4||st===12)mNoise(pl,t,.22,.12,2500,'bandpass');if(st%4!==1&&st%2===0)mNoise(pl,t,.06,.06,8000,'highpass')}
 else if(sty==='tiki'){if(st===0||st===6||st===10)mNote(pl,82,t,sp*2,'sine',.42);if(st===3||st===12||st===14)mNote(pl,124,t,sp*1.5,'sine',.3);if(st===8)mKick(pl,t,.45);mNoise(pl,t,.03,st%2?.05:.08,5000,'highpass')}
 else{if(st===0||st===8||st===10)mKick(pl,t,.55);if(st===4||st===12)mNoise(pl,t,.16,.32,1500,'bandpass');mNoise(pl,t,.03,.07,8000,'highpass')}
 // bass
 const bs={ska:[[0,0],[4,4],[8,7],[12,4]],bossa:[[0,0],[6,4],[8,4],[14,0]],lounge:[[0,0],[4,2],[8,4],[12,6]],surf:[[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[12,4],[14,7]],tiki:[[0,0],[3,0],[6,4],[8,0],[11,0],[14,4]]}[sty];
 for(const[s2,iv]of bs)if(s2===st)mNote(pl,mf(deg(tr,ci+iv,-2)),t,sp*(sty==='surf'?1.6:3),'triangle',.32,det());
 // chords
 const chord=[0,2,4,6].map(i=>mf(deg(tr,ci+i,-1)));
 if(sty==='ska'&&st%4===2)for(const f of chord.slice(0,3))mNote(pl,f,t,sp*.7,'square',.035,det());
 if(sty==='bossa'&&[0,3,6,10,13].includes(st))for(const f of chord)mNote(pl,f,t,sp*2.2,tr===TRACKS.frost?'sine':'triangle',tr===TRACKS.frost?.06:.05,det(),tr===TRACKS.frost?5:0);
 if(tr===TRACKS.frost&&st===0)for(const f of chord.slice(0,3))mNote(pl,f/2,t,sp*15,'sine',.035,det(),4);
 if(sty==='lounge'&&(st===0||st===6||st===10))for(const f of chord)mNote(pl,f,t,sp*3.5,'sine',.06,det(),6);
 if(sty==='tiki'&&st%4===0)for(const f of chord.slice(0,3))mNote(pl,f,t,sp*3,'sine',.045,det(),7);
 if(sty==='surf'&&st%2===0)for(const f of chord.slice(0,3))mNote(pl,f,t,sp*.8,'sawtooth',.02,det());
 // melody
 const line=bar===7?tr.alt:tr.mel[bar%4],c=line[st];if(c&&c!=='.'&&c!=='-'){let len=1;while(line[st+len]==='-')len++;const d=parseInt(c,16);const v=tr.lead==='sawtooth'?.07:tr.lead==='square'?.06:.11;
  mNote(pl,mf(deg(tr,d,0)),t,sp*len*.95,tr.lead,v,det(),tr.lead==='sine'||tr.lead==='triangle'?8+b*30:b*40);if(tr.style==='surf'||tr.lead==='square')mNote(pl,mf(deg(tr,d,1)),t,sp*len*.9,'triangle',v*.35,det())}}
function musUnlock(){musInit();if(MUS.out&&!MUS.cur)musSet(musWant())}
document.addEventListener('pointerdown',musUnlock,true);document.addEventListener('touchend',musUnlock,true);
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()});
setInterval(()=>{if(MUS.out&&musicOn)musSet(musWant())},300);
function setMusic(on){musicOn=on;LS.set('music',on);if(MUS.out)MUS.out.gain.setTargetAtTime(on?.55:0,AC.currentTime,.1);const e=$('bMusic');if(e)e.textContent='Music: '+(on?'On':'Off')}
{const bs=$('bSound');if(bs){const bm=document.createElement('button');bm.id='bMusic';bm.textContent='Music: '+(musicOn?'On':'Off');bs.after(bm);bm.onclick=()=>{ac();musUnlock();setMusic(!musicOn)};const bg=document.createElement('button');bg.id='bGfx';const gl=()=>bg.textContent='Graphics: '+({auto:'Auto',high:'High',low:'Low'})[GFX];gl();bm.after(bg);bg.onclick=()=>{GFX={auto:'high',high:'low',low:'auto'}[GFX];LS.set('gfx',GFX);gl();S.lowAuto=0;fpsW.bad=0;setLowG(GFX==='low')}}}

window.__MUS=MUS;window.__setMusic=setMusic;$('bTroph').onclick=()=>{SFX.click();buildShelf();screen('trophy')};$('bTrBack').onclick=()=>{SFX.click();screen('title')};
// ===== Online private rooms (PeerJS public broker, host-authoritative)
const NETP='tipsytee-room-',NCH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function loadPeer(){return window.Peer?Promise.resolve():new Promise((ok,no)=>{const sc=document.createElement('script');sc.src='peerjs.min.js';sc.onload=ok;sc.onerror=()=>no(new Error('load'));document.head.appendChild(sc)})}
function netCode(){let s='';for(let i=0;i<5;i++)s+=NCH[Math.floor(Math.random()*NCH.length)];return s}
function cleanC(c,e){const o={name:String(c.name||'Golfer').slice(0,12)};for(const k of['body','face','glasses','hair','hairC','hat','hatC','pants','shirt','skin','stache','pattern','socks','tan'])if(c[k]!==undefined)o[k]=String(c[k]).slice(0,16);e=e||EQ();o.club=String(e.club||'std').slice(0,16);o.ball=String(e.ball||'white').slice(0,16);o.trail=String(e.trail||'white').slice(0,16);return o}
function netMsg(t){$('lbMsg').textContent=t}
function netSend(m,except){const N=S.net;if(!N)return;if(N.host){for(const[id,c]of N.conns)if(id!==except&&c.open)c.send(m)}else if(N.conn&&N.conn.open)N.conn.send(m)}
function netRoster(){const N=S.net;$('lbList').innerHTML=N.list.map((p,i)=>`<div class="lbp"><span style="color:${p.c.shirt}">●</span> ${esc(p.c.name)}${i===0?' 👑':''}${p.id===N.me?' (you)':''}</div>`).join('')+(N.list.length<4?`<div class="lbp dim">${4-N.list.length} open seat${N.list.length<3?'s':''}…</div>`:'');
 $('bLbStart').style.display=N.host?'':'none';$('bLbStart').disabled=N.list.length<2;$('lbCrs').textContent=`${COURSES[N.ci].e} ${COURSES[N.ci].n} · ${HOLES_OF(N.ci)} holes · ${N.mode==='race'?'🏁 Pub Crawl Race':'⛳ Classic'}`;$('lbMode').style.display=N.host?'':'none';for(const b of $('lbMode').children)b.classList.toggle('on',b.dataset.m===N.mode)}
function HOLES_OF(ci){return COURSES[ci].holes.length}
function netLobby(role,code){S.mode='lobby';screen('lobby');$('lbList').innerHTML='';$('bLbStart').style.display='none';$('lbCode').textContent='…';$('lbLink').textContent='';netMsg('Connecting to the matchmaker…');
 loadPeer().then(()=>role==='host'?netHost(0):netJoin(code)).catch(()=>netMsg('Could not load online mode. Check your connection.'))}
const NPROTO=3;

const PCFG={debug:0,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']},{urls:['stun:stun3.l.google.com:19302','stun:stun4.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]}};
// Relay: when a direct phone-to-phone link can't open, game messages ride the matchmaker's own secure websocket (port 443, no account).
function rlyHook(peer,fn){const o=peer._handleMessage.bind(peer);peer._handleMessage=e=>{if(e&&e.type==='CANDIDATE'&&e.payload&&e.payload.tt!==undefined){try{fn(e.src,e.payload.tt)}catch(x){}return}o(e)}}
function rlySend(peer,dst,m){try{peer.socket.send({type:'CANDIDATE',dst,payload:{candidate:{candidate:'',sdpMid:'0',sdpMLineIndex:0},type:'data',connectionId:'dc_tt',tt:m}})}catch(e){}}
function netHost(tries){const code=netCode(),peer=new Peer(NETP+code,PCFG);const N=S.net={host:1,peer,code,v:NPROTO,me:'host',ci:S.netCi||0,conns:new Map(),list:[{id:'host',c:cleanC(cChar)}],sc:{},done:{},started:0,mode:'classic'};
 peer.on('open',()=>{N.ok=1;N.retry=0;if(N.rc){N.rc=0;if(S.mode==='lobby')netMsg('Room is back online ✅ Share the code or link.');else toast('📡 Room back online',true,1400)}if(N.url)return;$('lbCode').textContent=code;const url=location.origin+location.pathname+'?room='+code;$('lbLink').textContent=url;N.url=url;netMsg('Share the code or link. Up to 4 golfers. Keep this screen open until friends join — sending the invite? Come right back.');netRoster()});
 peer.on('error',e=>{if(S.net!==N)return;if(e.type==='unavailable-id'&&!N.ok&&tries<4){peer.destroy();netHost(tries+1);return}if(N.ok&&['unavailable-id','network','server-error','socket-error','socket-closed','disconnected'].includes(e.type)){hostReconnect(N);return}if(e.type!=='peer-unavailable')netMsg('Online error: '+e.type+'. Try again.')});
 peer.on('disconnected',()=>{if(S.net===N&&!peer.destroyed)hostReconnect(N)});
 peer.on('connection',c=>{c.on('data',m=>netHostRx(c,m));c.on('close',()=>{if(!c.relay&&N.conns.get(c.peer)&&N.conns.get(c.peer).relay)return;netDrop(c.peer)});c.on('error',()=>{if(N.conns.get(c.peer)&&N.conns.get(c.peer).relay)return;netDrop(c.peer)})});
 N.rc2={};rlyHook(peer,(src,m)=>{if(S.net!==N||!m)return;if(m.ping){rlySend(peer,src,{t:'pong'});return}
  let c=N.rc2[src];if(!c||!c.open){const ex=N.conns.get(src);if(ex&&!ex.relay&&ex.open)return;c=N.rc2[src]={peer:src,open:true,relay:1,_h:{},on(e,f){this._h[e]=f},send(x){if(this.open)rlySend(N.peer,src,x)},close(){this.open=false}};c.on('data',x=>netHostRx(c,x))}
  if(m.bye){c.open=false;netDrop(src);return}c._h.data(m)})}
function hostReconnect(N,force){if(S.net!==N||!N.host||N.left||N.peer.destroyed)return;if(N.rcT&&!force)return;N.rc=1;if(S.mode==='lobby')netMsg('📡 Reconnecting room…');
 N.rcT=setTimeout(()=>{N.rcT=0;if(S.net!==N||N.left)return;try{if(force&&!N.peer.disconnected)N.peer.disconnect();N.peer.reconnect()}catch(e){}N.retry=(N.retry||0)+1;setTimeout(()=>{if(S.net===N&&N.peer.disconnected&&!N.peer.destroyed)hostReconnect(N)},4000)},force?150:Math.min(4000,600+(N.retry||0)*800))}
// iOS freezes the page when you switch to Messages: re-register the same room code as soon as we're back
let netHid=0;function netResume(){const N=S.net;if(!N||!N.host||N.left||!N.peer||N.peer.destroyed)return;const away=netHid?Date.now()-netHid:0;netHid=0;const ws=N.peer.socket&&N.peer.socket._socket;if(N.peer.disconnected||!ws||ws.readyState!==1||away>2500)hostReconnect(N,true)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)netHid=Date.now();else netResume()});addEventListener('pageshow',netResume);addEventListener('focus',netResume);
setInterval(()=>{const N=S.net;if(N&&N.host&&!N.left&&N.peer&&!N.peer.destroyed&&N.peer.disconnected&&!N.rcT)hostReconnect(N)},5000);
function netHostRx(c,m){const N=S.net;if(!N||!m)return;(N.seen||(N.seen={}))[c.peer]=Date.now();if(m.t==='hb')return;
 if(m.t==='hi'){if(m.v!==NPROTO){c.send({t:'no',up:1,why:(m.v||0)<NPROTO?'Update the game: close it fully and reopen it, then join again.':'The host needs to update: close the game fully and reopen it, then make a new room.'});setTimeout(()=>c.close(),800);return}if(N.started){c.on('open',()=>{});c.send({t:'no',why:'That round already started.'});setTimeout(()=>c.close(),500);return}if(N.list.length>=4){c.send({t:'no',why:'Room is full (4 max).'});setTimeout(()=>c.close(),500);return}
  N.conns.set(c.peer,c);N.list.push({id:c.peer,c:cleanC(m.c||{},m.c||{})});SFX.honk();netBroad();return}
 if(m.t==='done'){N.sc[c.peer]=N.sc[c.peer]||[];N.sc[c.peer][m.hole]=m.s;N.done[c.peer]=m.hole;netCheck();return}
 if(m.t==='rdy'){raceHostRdy(c.peer,m.h);return}if(m.t==='rfin'){raceHostFin(c.peer,m.h,m.k,m.s);return}
 if(m.t==='pos'){netSend({...m,id:c.peer},c.peer);ghost(c.peer,m)}if(m.t==='ev'){netSend({...m,id:c.peer},c.peer);remoteEv(c.peer,m)}}
function netBroad(){const N=S.net;netSend({t:'roster',v:NPROTO,list:N.list,gone:N.gone||[],ci:N.ci,sc:N.sc,mode:N.mode});netRoster()}
function netDrop(id){const N=S.net;if(!N||!N.host||!N.conns.has(id))return;const p=N.list.find(q=>q.id===id);N.conns.delete(id);N.list=N.list.filter(q=>q.id!==id);if(p&&N.started)(N.gone=N.gone||[]).push({...p,left:1});ghostRm(id);if(p){toast(`📡 ${p.c.name} left the room`,true,1600)}netBroad();if(N.started){netCheck();raceHostCheck()}}
function netNorm(c){return String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/0/g,'O').replace(/1/g,'I')}
function netJoin(code){code=netNorm(code);if(code.length!==5){netMsg('Room codes are 5 letters.');return}
 const peer=new Peer(PCFG);const N=S.net={host:0,peer,code,ci:0,list:[],sc:{},started:0};$('lbCode').textContent=code;
 const fail=t=>{if(S.net===N&&!N.me){if(N.seenR)return useRelay();netMsg(t);clearTimeout(N.to);N.failed=1}};let tries=0,miss=0;const H=NETP+code;
 const joined=c=>{if(N.me)return;N.me=peer.id;clearTimeout(N.to);clearTimeout(N.rT);N.conn=c;N.via=c.relay?'relay':'direct';c.send({t:'hi',v:NPROTO,c:cleanC(cChar)});netMsg('Joined! Waiting for the host to start…')};
 const useRelay=()=>{if(N.me||!N.seenR||S.net!==N)return;joined({relay:1,open:true,peer:H,send(m){if(this.open)rlySend(peer,H,m)},close(){if(this.open){this.open=false;rlySend(peer,H,{bye:1})}}})};
 rlyHook(peer,(src,m)=>{if(S.net!==N||src!==H||!m)return;if(m.t==='pong'){if(!N.seenR){N.seenR=1;if(N.failed||window.__noRTC)useRelay()}return}if(N.conn&&N.conn.relay)netClientRx(m)});
 peer.on('open',()=>{const ping=()=>{if(!N.seenR&&!N.me&&S.net===N)rlySend(peer,H,{ping:1})};ping();setTimeout(ping,1500);setTimeout(ping,3500);setTimeout(ping,6000)});
 N.rT=setTimeout(()=>{if(!N.me)useRelay()},5000);
 const attempt=()=>{if(S.net!==N||N.me||N.rejected)return;tries++;if(tries>1)netMsg(`Looking for room ${code}… (try ${tries}/4)`);
  const c=peer.connect(NETP+code,{reliable:true});N.conn=c;
  c.on('open',()=>{if(N.me||window.__noRTC)return;joined(c)});
  c.on('data',m=>{if(c===N.conn)netClientRx(m)});c.on('close',()=>{if(c===N.conn&&N.me)netLost()});
  c.on('iceStateChanged',st=>{if(st==='failed'&&!N.me)fail("Found the room but couldn't connect. Try Wi-Fi on both phones (or both on mobile data), then try again.")})};
 const next=()=>{if(tries<4)setTimeout(attempt,tries?2500:0);else fail('No room found with that code. Check the code, and make sure the host has the game open on the lobby screen.')};
 N.to=setTimeout(()=>fail(miss>0&&!N.seenR?'No room with that code. Ask the host to open the lobby.':"Found the room but couldn't connect. Try Wi-Fi on both phones (or both on mobile data), then try again."),22000);
 peer.on('open',()=>next());
 peer.on('error',e=>{if(S.net!==N)return;if(e.type==='peer-unavailable'){miss++;if(N.seenR)useRelay();else if(!N.me)next()}else if(!N.me)fail('Online error: '+e.type+'. Check your connection and try again.')})}
function netClientRx(m){const N=S.net;if(!N||!m)return;N.seenH=Date.now();if(m.t==='hb')return;
 if(m.t==='no'){N.rejected=1;clearTimeout(N.to);netMsg(m.why);return}
 if(m.t==='roster'){if(m.v!==NPROTO){N.rejected=1;netMsg('The host needs to update: close the game fully and reopen it, then make a new room.');try{N.peer.destroy()}catch(e){}return}N.list=m.list;N.gone=m.gone||N.gone;N.ci=m.ci;N.sc=m.sc||N.sc;N.mode=m.mode||'classic';for(const id of Object.keys(S.remotes||{}))if(!N.list.some(p=>p.id===id))ghostRm(id);if(S.mode==='lobby')netRoster();return}
 if(m.t==='start'){N.list=m.list;N.ci=m.ci;N.mode=m.mode||'classic';netStart();return}
 if(m.t==='rgo'){raceGo(m.h,m.d);return}if(m.t==='rpl'){raceGotPl(m);return}if(m.t==='rend'){raceEnd(m);return}
 if(m.t==='next'){N.sc=m.sc;netNext(m.hole);return}
 if(m.t==='pos'){ghost(m.id,m)}if(m.t==='ev'&&m.id!==N.me)remoteEv(m.id,m)}
function netLost(){const N=S.net;if(!N||N.left)return;if(N.rejected){return}if(!N.started){netMsg('Lost connection to the host.');return}
 toast('📡 Host left. Finishing solo',true,2600);S.net=null;raceOff();ghostClear();if(S.waitNet){S.waitNet=0;$('netWait').style.display='none';soloAdvance()}}
function netLeave(){const N=S.net;raceOff();if(!N)return;N.left=1;S.net=null;S.waitNet=0;$('netWait').style.display='none';ghostClear();try{if(N.conn&&N.conn.relay)N.conn.close()}catch(e){}setTimeout(()=>{try{N.peer.destroy()}catch(e){}},150)}
function netStart(){const N=S.net;N.started=1;N.gone=[];N.sc={};N.done={};S.race=N.mode==='race'?1:0;N.pts={};N.rdy={};N.rh={};S.raceWin=0;setCourse(N.ci);S.players=[{c:cChar,g:null,drunk:0,peak:0,hang:0,scores:[],style:0,strokes:0,steady:0,boost:0}];startRound()}
function netFinish(p){const N=S.net;S.waitNet=1;const w=$('netWait');w.style.display='flex';netWaitTxt();if(N.host){N.sc.host=N.sc.host||[];N.sc.host[S.hole]=p.strokes;N.done.host=S.hole;netCheck()}else netSend({t:'done',hole:S.hole,s:p.strokes})}
function netWaitTxt(){const N=S.net;if(!N)return;const wait=N.list.filter(q=>q.id!==N.me&&!((N.sc[q.id]||[])[S.hole]!=null)).map(q=>q.c.name);$('netWait').innerHTML=`<div>⛳ Holed out!<br><small>${wait.length?'Waiting for '+wait.map(esc).join(', ')+'…':'Syncing…'}</small></div>`}
function netCheck(){const N=S.net;if(!N||!N.host)return;const h=S.hole;if(S.waitNet)netWaitTxt();if(!S.waitNet)return;if(N.list.every(q=>(N.sc[q.id]||[])[h]!=null)){netSend({t:'next',hole:h,sc:N.sc});netNext(h)}}
function netNext(h){const N=S.net;if(!S.waitNet&&!N.host)return;S.waitNet=0;$('netWait').style.display='none';showCard(true)}
// ---------- Pub Crawl Race (online mode) ----------
const RACE_CAP=10,RACE_TO=25000,RACE_PTS=[4,3,2,1],RACE_DK=()=>DRINKS.filter(d=>!['keg','mystery','water','espresso','cola'].includes(d.id));
for(const b of $('lbMode').children)b.onclick=()=>{const N=S.net;if(!N||!N.host||N.started)return;SFX.click();N.mode=b.dataset.m;netBroad()};
function raceOff(){S.race=0;S.rc=null;$('raceHud').style.display='none';$('raceBig').style.display='none'}
function raceBig(h,ms){const e=$('raceBig');e.innerHTML=h;e.style.display=h?'flex':'none';e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');clearTimeout(S.rbT);if(ms)S.rbT=setTimeout(()=>e.style.display='none',ms)}
function raceReady(){const N=S.net;S.rc={h:S.hole,phase:'ready',ord:[],me:0};S.phase='wait';raceBig('<div>🏁 Hole '+(S.hole+1)+'<br><small>Waiting for everyone to step up…</small></div>');
 if(N.pend&&N.pend.h===S.hole){const g=N.pend;N.pend=null;raceGo(g.h,g.d);return}
 if(N.host)raceHostRdy('host',S.hole);else netSend({t:'rdy',h:S.hole})}
function raceHostRdy(id,h){const N=S.net;if(!N||!N.host)return;(N.rdy[h]=N.rdy[h]||{})[id]=1;if(id==='host')N.rdyT=Date.now();const st=N.rh[h];if(st&&id!=='host'){const c=N.conns.get(id);if(c&&c.open)c.send({t:'rgo',h,d:st.d})}raceHostCheck()}
function raceHostCheck(){const N=S.net;if(!N||!N.host||!N.started||!S.race)return;const h=S.hole,r=N.rdy[h]||{},st=N.rh[h];
 if(!st&&r.host&&(N.list.every(q=>r[q.id])||Date.now()-N.rdyT>15000)){const ds=RACE_DK(),d=ds[Math.floor(Math.random()*ds.length)].id;N.rh[h]={t0:Date.now()+7600,ord:[],win:0,end:0,d};netSend({t:'rgo',h,d});raceGo(h,d);return}
 if(st&&!st.end&&Date.now()>st.t0){const all=N.list.every(q=>st.ord.some(o=>o.id===q.id));if(all||(st.win&&Date.now()-st.win>RACE_TO))raceHostEnd(h)}}
function raceGo(h,did){const N=S.net;if(!N)return;if(S.hole!==h||!S.rc){N.pend={h,d:did};return}if(S.rc.phase!=='ready')return;const d=DRINKS.find(x=>x.id===did)||DRINKS[0];S.rc.phase='reveal';S.rc.d=d;
 SFX.honk();raceBig(`<div><small>THIS ROUND:</small><br><span class="rbE">${d.e}</span><br>${esc(d.n)}!</div>`);
 setTimeout(()=>{if(S.rc&&S.rc.h===h){raceBig('');S.phase='aim';drink(d)}},2200);
 [3,2,1].forEach((n,i)=>setTimeout(()=>{if(S.rc&&S.rc.h===h){raceBig(`<div class="rbN">${n}</div>`);tone(520,.15,'square',.08)}},4600+i*1000));
 setTimeout(()=>{if(!S.rc||S.rc.h!==h)return;if(S.cut)endChug();S.rc.phase='run';S.rc.t0=performance.now();if(S.phase==='wait'||S.phase==='aim'){S.phase='aim';aimAtPin();updHUD()}raceBig('<div class="rbN">GO!</div>',900);tone(880,.3,'square',.1,1320,.2);$('raceHud').style.display='block'},7600)}
function raceFin(k){const N=S.net;if(!N||!S.rc||S.rc.me)return;S.rc.me=k;const s=P().strokes;if(N.host)raceHostFin('host',S.hole,k,s);else netSend({t:'rfin',h:S.hole,k,s})}
function raceHostFin(id,h,k,s){const N=S.net;const st=N&&N.rh[h];if(!st||st.end||st.ord.some(o=>o.id===id))return;st.ord.push({id,k,ms:Math.max(0,Date.now()-st.t0)});(N.sc[id]=N.sc[id]||[])[h]=s;if(k==='in'&&!st.win)st.win=Date.now();
 const m={t:'rpl',h,ord:raceSort(st.ord),left:st.win?Math.max(0,RACE_TO-(Date.now()-st.win)):-1};netSend(m);raceGotPl(m);raceHostCheck()}
function raceSort(o){return [...o.filter(x=>x.k==='in'),...o.filter(x=>x.k!=='in')]}
function raceHostEnd(h){const N=S.net,st=N.rh[h];st.end=1;const ord=raceSort(st.ord);for(const q of N.list)if(!ord.some(o=>o.id===q.id))ord.push({id:q.id,k:'time'});
 let i=0;for(const o of ord){o.p=o.k==='in'?RACE_PTS[i++]||0:0;(N.pts[o.id]=N.pts[o.id]||[])[h]=o.p}const m={t:'rend',h,ord,pts:N.pts,sc:N.sc};netSend(m);raceEnd(m)}
function raceGotPl(m){if(S.rc&&S.rc.h===m.h){S.rc.ord=m.ord;if(m.left>=0)S.rc.dl=performance.now()+m.left;if(S.phase==='done')raceWaitTxt()}}
function raceName(id){const q=S.net&&S.net.list.find(p=>p.id===id);return q?q.c:{name:'?',shirt:'#fff'}}
const RMED=['🥇','🥈','🥉','4️⃣'],RTAG={bo:'💀 blackout',cap:'🧢 stroke cap',time:'⏰ timed out'};
function raceTime(ms){return (ms/1000).toFixed(1)+'s'}
function raceWaitTxt(){const r=S.rc;if(!r)return;const N=S.net,mine=r.ord.findIndex(o=>o.id===N.me);const why=RTAG[r.me];
 $('netWait').innerHTML=`<div>${r.me==='in'?(mine>=0?RMED[mine]+' You finished '+['1st','2nd','3rd','4th'][mine]+'!':'⛳ In the hole!'):why?why+' — last this hole':'⛳'}<br><small>${r.dl?'Hole closes in '+Math.ceil(Math.max(0,r.dl-performance.now())/1000)+'s':'Waiting for the others…'}</small></div>`}
function raceTick(){const r=S.rc;if(!r)return;if(r.phase==='run'){const p=P();if(!r.me&&S.phase==='aim'&&p.strokes>=RACE_CAP){toast(`🧢 Stroke cap (${RACE_CAP}). You're out this hole`,true,1800);raceFin('cap');finishHole()}
  const el=(performance.now()-r.t0)/1000;$('raceHud').innerHTML=`⏱ ${el.toFixed(1)}s${r.dl?` · ⏰ ${Math.ceil(Math.max(0,r.dl-performance.now())/1000)}s left`:''}<div>${r.ord.map((o,i)=>`<span style="color:${raceName(o.id).shirt}">${o.k==='in'?RMED[i]:'💤'} ${esc(raceName(o.id).name)}${o.k==='in'?' '+raceTime(o.ms):''}</span>`).join(' ')}</div>`;if(S.phase==='done'&&((S.wtT=(S.wtT||0)+1)%15===0))raceWaitTxt()}
 if(S.net&&S.net.host)raceHostCheck()}
function raceEnd(m){const N=S.net;if(!N||!S.rc||S.rc.h!==m.h)return;N.pts=m.pts;N.sc=m.sc;const p=P();S.rc.phase='end';S.rc.ord=m.ord;
 if(S.phase!=='done'){p.scores[S.hole]=p.strokes;S.phase='done';ball.visible=true}if(S.bo){S.bo=null;$('black').style.opacity=0;S.black=0}if(S.cut)endChug();cineClear();raceBig('');$('raceHud').style.display='none';$('netWait').style.display='none';showCard(true)}
function raceStand(){const N=S.net;return N.list.concat((N.gone||[]).filter(q=>(N.pts[q.id]||[]).some(x=>x))).map(q=>{const pts=N.pts[q.id]||[];return{q,me:q.id===N.me,pts,tot:pts.reduce((a,x)=>a+(x||0),0)}}).sort((a,b)=>b.tot-a.tot)}
function raceBoard(done){const st=raceStand(),last=(S.rc&&S.rc.ord)||[];let h='';
 if(!done&&last.length)h+='<div class="rRes">'+last.map((o,i)=>`<div><span style="color:${raceName(o.id).shirt}">${o.k==='in'?RMED[i]:'💤'} ${esc(raceName(o.id).name)}</span> ${o.k==='in'?raceTime(o.ms):RTAG[o.k]} · <b>+${o.p||0}</b></div>`).join('')+'</div>';
 if(done){const pod=[st[1],st[0],st[2]];h+='<div class="podium">'+pod.map((x,i)=>x?`<div class="pd pd${[2,1,3][i]}"><div class="pn" style="color:${x.q.c.shirt}">${esc(x.q.c.name)}</div><div class="pb">${['🥈','🥇','🥉'][i]}<br>${x.tot}</div></div>`:'<div class="pd"></div>').join('')+'</div>'+`<h2>${esc(st[0].q.c.name)} wins the Pub Crawl Race! 🏁</h2>`}
 h+='<table><tr><th>🏁</th>'+HOLES.map((x,i)=>`<th>${i+1}</th>`).join('')+'<th>Pts</th></tr>'+st.map(x=>`<tr><td style="color:${x.q.c.shirt}">${esc(x.q.c.name)}${x.me?' (you)':x.q.left?' (left)':''}</td>`+HOLES.map((_,i)=>`<td>${x.pts[i]==null?'-':x.pts[i]}</td>`).join('')+`<td><b>${x.tot}</b></td></tr>`).join('')+'</table>';return h}

function soloAdvance(){S.cur=0;showCard(true)}
function cardPlayers(){const N=S.net;if(!N||!N.started)return S.players;return N.list.map(q=>q.id===N.me?S.players[0]:{remote:1,c:q.c,scores:N.sc[q.id]||[],style:0,bb:0})}
setInterval(()=>{const N=S.net;if(!N||N.left)return;const now=Date.now();if(N.host){netSend({t:'hb'});raceHostCheck();for(const id of [...N.conns.keys()])if(now-((N.seen||{})[id]||now)>9000){try{N.conns.get(id).close()}catch(e){}netDrop(id)}}else if(N.me){netSend({t:'hb'});if(now-(N.seenH||now)>10000){try{N.conn.close()}catch(e){}netLost()}}},2000);
// remote golfers: full avatars for other players in a room
const BSK={white:[0xffffff,0x333333],gold:[0xffd700,0x664400],neon:[0x7dff4a,0x33aa00],eye:[0xffffff,0x333333],disco:[0xdddddd,0x444444]},TRC={white:0xffffff,fire:0xff7a1a,rainbow:0xff2bd6,bubbles:0xffd23f};
S.remotes={};
function nameTag(txt,col){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.font='900 34px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=7;x.strokeStyle='rgba(0,0,0,.75)';x.strokeText(txt,128,34);x.fillStyle=col||'#fff';x.fillText(txt,128,34);const tx=new THREE.CanvasTexture(cv);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));sp.scale.set(3.2,.8,1);return sp}
function remoteGet(id){let R=S.remotes[id];if(R)return R;const N=S.net;const q=N&&N.list.find(p=>p.id===id);if(!q)return null;const c=q.c;
 const g=makeGolfer(c);g.userData.remote=1;const mats=[];g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.castShadow=false;mats.push([o.material,o.material.opacity])}});
 const tag=nameTag(c.name,c.shirt);tag.position.y=3.3;g.add(tag);
 const sk=BSK[c.ball]||BSK.white,bl=new THREE.Mesh(ball.geometry,M(sk[0],{emissive:sk[1]}));bl.castShadow=false;
 const tn=24,tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(tn*3),3));const tr=new THREE.Line(tg,new THREE.LineBasicMaterial({color:TRC[c.trail]||0xffffff,transparent:true,opacity:.7}));tr.frustumCulled=false;
 scene.add(g);scene.add(bl);scene.add(tr);
 R=S.remotes[id]={id,c,g,tag,bl,tr,tn,pts:[],mats,cur:new V3(0,.35,0),tgt:new V3(0,.35,0),h:-1,d:0,f:0,sw:-1,re:null,holed:0,ht:0,alpha:1,shotP:new V3(),name:c.name};return R}
function remoteRm(id){const R=S.remotes[id];if(!R)return;scene.remove(R.g);scene.remove(R.bl);scene.remove(R.tr);R.tr.geometry.dispose();R.tag.material.map.dispose();R.tag.material.dispose();R.mats.forEach(m=>m[0].dispose());delete S.remotes[id]}
function remoteClear(){for(const id of Object.keys(S.remotes))remoteRm(id)}
function remotePos(id,m){const R=remoteGet(id);if(!R)return;if(m.h!==R.h){R.h=m.h;R.holed=0;R.pts=[];R.cur.set(m.x,m.y??.35,m.z)}R.tgt.set(m.x,m.y??.35,m.z);R.d=m.d||0;if(m.f&&!R.f){R.shotP.copy(R.cur);R.pts=[]}R.f=m.f||0}
function remoteEv(id,m){const R=remoteGet(id);if(!R)return;if(m.h!==undefined&&m.h!==S.hole)return;if(m.k==='swing'){R.sw=.22;R.shotP.copy(R.cur);R.f=1;R.pts=[]}else if(m.k==='holed'){R.holed=1;R.ht=0;R.f=0}else R.re={k:m.k,t:0}}
function remoteTag(R,txt){if(R.tagTxt===txt)return;R.tagTxt=txt;const sp=nameTag(txt,R.c.shirt);R.tag.material.map.dispose();R.tag.material.map=sp.material.map;sp.material.dispose()}
function setAlpha(R,a){if(Math.abs(R.alpha-a)<.01)return;R.alpha=a;for(const[m,b]of R.mats){m.opacity=b*a;const tr=a<.99||b<1;if(m.transparent!==tr){m.transparent=tr;m.needsUpdate=true}m.depthWrite=a>.99}}
function updRemotes(dt,t){const play=S.mode==='play'&&course;const camL=play?S.ballP.clone().sub(camera.position):null;
 for(const R of Object.values(S.remotes)){const on=play&&R.h===S.hole;R.g.visible=on;R.bl.visible=on&&!R.holed;R.tr.visible=on&&R.f&&R.pts.length>1;if(!on)continue;const u=R.g.userData;
  R.cur.lerp(R.tgt,1-Math.exp(-dt*(R.f?9:6)));R.bl.position.copy(R.cur);if(R.f){if(R.cur.distanceTo(R.pts[R.pts.length-1]||R.shotP)>.3){R.pts.push(R.cur.clone());if(R.pts.length>R.tn)R.pts.shift()}const tp=R.tr.geometry.attributes.position;for(let i=0;i<R.tn;i++){const q=R.pts[Math.min(i,R.pts.length-1)]||R.cur;tp.setXYZ(i,q.x,q.y,q.z)}tp.needsUpdate=true;if(R.c.trail==='rainbow')R.tr.material.color.setHSL((t*.8)%1,1,.6)}
  const pin=new V3(course.pin[0],0,course.pin[1]);let base=R.f?R.shotP:R.cur;if(R.holed){const k=Object.keys(S.remotes).indexOf(R.id);base=pin.clone().add(new V3(Math.cos(k*2.1)*2.4,0,Math.sin(k*2.1)*2.4))}
  const a=Math.atan2(pin.x-base.x,-(pin.z-base.z)),d=dirV(a),r=new V3(-d.z,0,d.x);const gp=R.holed?base:base.clone().addScaledVector(r,-.9);R.g.position.set(gp.x,0,gp.z);R.g.rotation.set(0,R.holed?Math.atan2(-d.x,-d.z)+Math.PI:Math.atan2(r.x,r.z),0);
  golferMood(R.g,R.d,t+R.id.length,0);
  if(R.holed){R.ht+=dt;if(R.ht<2.2){animGolfer(u,'celebrate',R.ht,t,R.d);R.g.position.y=Math.abs(Math.sin(R.ht*7))*.3}else animGolfer(u,'idle',0,t,R.d);remoteTag(R,'⛳ '+R.name)}
  else{remoteTag(R,R.name);if(R.sw>=0){R.sw+=dt;animGolfer(u,'swing',R.sw,t,R.d);if(R.sw>.6)R.sw=-1}else{animGolfer(u,'idle',0,t,R.d);const E=R.re;if(E){E.t+=dt;const k=E.t,f=clamp((1.6-k)*3,0,1);if(k>1.6)R.re=null;else if(E.k==='good'){u.armR.rotation.set(0,0,2.5+Math.sin(k*18)*.35);R.g.position.y=Math.abs(Math.sin(k*9))*.15*f}else{u.head.rotation.x=.5*f;u.armL.rotation.set(-2.5*f,0,-.35);u.armR.rotation.set(-2.5*f,0,.35);R.g.rotation.z=Math.sin(k*6)*.08*f}}
   if(R.d>.55){R.g.rotation.z+=Math.sin(t*2.3+R.id.length)*.12*(R.d-.5);R.g.position.x+=Math.sin(t*1.7)*.15*R.d}}}
  R.g.position.y+=GY(R.g.position.x,R.g.position.z);
  // never block your view: fade when near the camera->ball line
  let al=1;if(camL){const L=camL.length(),v=R.g.position.clone().setY(1).sub(camera.position),s=clamp(v.dot(camL)/L,0,L),dd=v.addScaledVector(camL,-s/L).length();if(dd<3&&s<L+2)al=.3;else if(R.holed&&R.ht>2.2)al=.6}setAlpha(R,al)}}

function ghostRm(id){remoteRm(id)}
function ghostClear(){remoteClear()}
function ghost(id,m){if(S.net)remotePos(id,m)}
function netEv(k){const N=S.net;if(!N||!N.started)return;const m={t:'ev',k,h:S.hole};if(N.host)netSend({...m,id:'host'});else netSend(m)}
function netTick(dt){const N=S.net;if(!N||!N.started)return;const t=performance.now()/1000;updRemotes(dt,t);raceTick();const sw=S.swingT>=.22&&S.swingT<.6;if(sw&&!S.swSent){S.swSent=1;netEv('swing')}if(!sw)S.swSent=0;
 const fly=S.phase==='fly'?1:0;S.posT=(S.posT||0)-dt;if(S.posT<=0&&S.mode==='play'){S.posT=fly?.1:.3;const m={t:'pos',x:+S.ballP.x.toFixed(2),y:+S.ballP.y.toFixed(2),z:+S.ballP.z.toFixed(2),h:S.hole,d:+(P()?P().drunk:0).toFixed(2),f:fly};if(N.host){netSend({...m,id:'host'})}else netSend(m)}}
$('bOnline').onclick=()=>{SFX.click();screen('online');S.mode='online'};
$('bOnBack').onclick=()=>{SFX.click();S.mode='title';screen('title')};
$('bHost').onclick=()=>{SFX.click();S.netIntent='host';buildCourses();screen('courses')};
$('bJoin').onclick=()=>{SFX.click();const c=netNorm($('joinCode').value);if(c.length!==5){SFX.bad();toast('Room codes are 5 letters',true,1300);return}S.netIntent='join';S.netCode=c;startCreator(1)};
$('bLbStart').onclick=()=>{const N=S.net;if(!N||!N.host||N.list.length<2)return;SFX.click();netSend({t:'start',list:N.list,ci:N.ci,mode:N.mode});netStart()};
$('bLbLeave').onclick=()=>{SFX.click();netLeave();S.mode='title';screen('title')};
$('bShare').onclick=()=>{const N=S.net;if(!N||!N.url&&N.host)return;const url=N.url||(location.origin+location.pathname+'?room='+N.code),txt=`Join my Tipsy Tee room ${N.code}: ${url}`;if(navigator.share)navigator.share({title:'Tipsy Tee',text:txt,url}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>toast('Invite link copied 📋',true,1200)).catch(()=>{})};
{const rq=new URLSearchParams(location.search).get('room');if(rq){setTimeout(()=>{$('joinCode').value=netNorm(rq).slice(0,5);screen('online');S.mode='online'},400)}}

window.__TT=S;window.__TTapi={SLAY,previewChar(c){cChar=c;rebuildPreview()},startCart,finishHole,start5:(ms)=>{S.force5=1;S.g5Done=0;start5(ms)},slaySay,aimAtPin,get GY(){return GY},makeGolfer,setPose,golferMood,animGolfer,get remotes(){return S.remotes},blackoutCheck,netCheck,cardPlayers,get net(){return S.net},barPos,camera,snapCam,holeDist,playReel,awardTrophies,DARES,dareNow,barTap,CLUBS,react,startReplay,duckRescue,maybeReplay,cartPathBlocked,get hills(){return hills},renderer,get trees(){return trees},scene,simEnd,surface,COURSES,buildHole,P,get course(){return course},shoot,launch,drink,DRINKS,setClub,holed,finishHole,showCard,addCoins,grant,setCourse,calcHint,startCart,honk,buildShop,buildCourses,coins};
})();
