/* Deterministic simulation core. Scores, controls, sizes and times are game abstractions. */
(function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
function nearestOn(a,b,p){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return{x:a.x+dx*t,y:a.y+dy*t};}
function flowCenter(x){return 430+80*Math.sin(x/320)+25*Math.sin(x/135);}
function flowHalf(x){let h=120;for(const p of [850,1700,2530])h-=106*Math.exp(-Math.pow((x-p)/100,4));return Math.max(14,h);}
function event(g,text,type='note'){g.events.push({text,type});if(g.events.length>8)g.events.shift();}
function collide(p,o){const d=dist(p,o),min=p.r+o.r;if(d<min){const a=Math.atan2(p.y-o.y,p.x-o.x)||0;p.x=o.x+Math.cos(a)*min;p.y=o.y+Math.sin(a)*min;return true;}return false;}
function create(mode,relaxed=false,random=Math.random){
 const g={mode,relaxed,random,status:'play',time:0,score:0,count:0,resource:100,events:[],hint:'',particles:[],worldW:1600,worldH:1000};
 if(mode==='immune'){
  g.goal=10;g.limit=relaxed?240:170;g.integrity=100;g.player={x:260,y:500,r:34,angle:0,engulf:null,vacuoles:[]};g.obstacles=[];
  const positions=[[540,220,78],[850,190,75],[1220,220,91],[500,720,85],[870,800,80],[1250,720,85],[760,480,77],[1100,460,73]];
  g.obstacles=positions.map(([x,y,r])=>({x,y,r}));g.bacteria=[];
  for(let i=0;i<12;i++){let b;for(let j=0;j<70;j++){b={id:i,x:160+random()*1280,y:155+random()*690,r:12+random()*3,angle:random()*6.28,turn:random()*2,kind:i%3?'rod':'coccus',alive:true};if(g.obstacles.every(o=>dist(b,o)>o.r+b.r+12)&&dist(b,g.player)>100)break;}g.bacteria.push(b);}
  g.engulfTarget=null;g.engulfProgress=0;g.lastCapture=-99;g.combo=0;
 }else if(mode==='flow'){
  g.goal=3;g.limit=85;g.worldW=3400;g.worldH=850;g.player={x:130,y:flowCenter(130),r:33,flex:0,oxygen:0};g.targets=[{x:1320,side:1,delivered:0},{x:2120,side:-1,delivered:0},{x:3000,side:1,delivered:0}];g.squeezes=0;g.passed=new Set();
 }else if(mode==='signal'){
  g.goal=8;g.limit=relaxed?240:150;g.worldW=1350;g.worldH=800;g.path=[{x:230,y:400},{x:430,y:400},{x:550,y:310},{x:730,y:310},{x:850,y:420},{x:1110,y:420}];g.pathLength=0;for(let i=1;i<g.path.length;i++)g.pathLength+=dist(g.path[i-1],g.path[i]);g.cue=0;g.wave=null;g.ring=135;g.resource=100;g.misses=0;
 }else if(mode==='root'){
  g.goal=100;g.limit=relaxed?260:190;g.worldW=1750;g.worldH=1000;g.points=[{x:150,y:500},{x:245,y:500}];g.tip={x:245,y:500};g.angle=0;g.length=95;g.water=0;g.contactClock=0;g.obstacles=[{x:450,y:550,r:65},{x:690,y:270,r:58},{x:910,y:720,r:64},{x:1130,y:300,r:63},{x:1380,y:700,r:70},{x:1550,y:220,r:58}];
  g.patches=[{x:430,y:355,r:110},{x:660,y:635,r:105},{x:850,y:440,r:115},{x:1090,y:660,r:100},{x:1270,y:430,r:110},{x:1500,y:530,r:115}].map(p=>({...p,water:45,contact:null}));g.salt=[{x:800,y:875,r:80},{x:1200,y:130,r:85}];g.growing=false;
 }else throw Error('Unknown mission');
 return g;
}
function pointAt(g,d){let remain=d;for(let i=1;i<g.path.length;i++){const a=g.path[i-1],b=g.path[i],len=dist(a,b);if(remain<=len)return{x:lerp(a.x,b.x,remain/len),y:lerp(a.y,b.y,remain/len),angle:Math.atan2(b.y-a.y,b.x-a.x)};remain-=len;}return {...g.path[g.path.length-1],angle:0};}
function step(g,dt,input={}){
 if(g.status!=='play')return;dt=clamp(dt,0,.05);g.time+=dt;g.hint='';input.x=Number(input.x)||0;input.y=Number(input.y)||0;
 if(g.mode==='immune')immune(g,dt,input);else if(g.mode==='flow')flow(g,dt,input);else if(g.mode==='signal')signal(g,dt,input);else root(g,dt,input);
 if(g.count>=g.goal){g.status='win';g.score+=Math.round(Math.max(0,g.limit-g.time)*3+g.resource*2);event(g,'Mission complete!','win');}
 else if(g.time>=g.limit||g.resource<=0||(g.mode==='immune'&&g.integrity<=0)){g.status='fail';event(g,g.time>=g.limit?'Time to try a fresh cell.':'Your model needs another attempt.','fail');}
}
function immune(g,dt,i){
 const p=g.player;let dx=i.x,dy=i.y;
 if(i.pointer&&i.drag){const d=dist(p,i.pointer);if(d>9){dx=(i.pointer.x-p.x)/d;dy=(i.pointer.y-p.y)/d;}else dx=dy=0;}
 const norm=Math.hypot(dx,dy);if(norm>1){dx/=norm;dy/=norm;}const locked=i.action&&g.engulfTarget;
 if(!locked){p.x+=dx*220*dt;p.y+=dy*220*dt;if(norm>.03)p.angle=Math.atan2(dy,dx);}
 p.x=clamp(p.x,p.r+12,g.worldW-p.r-12);p.y=clamp(p.y,p.r+100,g.worldH-p.r-40);for(const o of g.obstacles)collide(p,o);
 g.resource=clamp(g.resource+(norm>.1?-1.2:6)*dt,0,100);
 for(const b of g.bacteria){if(!b.alive)continue;if(b===g.engulfTarget&&i.action)continue;b.turn-=dt;if(b.turn<=0){b.angle+=(g.random()-.5)*2;b.turn=.7+g.random()*1.5;}b.x+=Math.cos(b.angle)*34*dt;b.y+=Math.sin(b.angle)*34*dt;for(const o of g.obstacles)if(collide(b,o))b.angle+=1.2;if(collide(b,{x:p.x,y:p.y,r:p.r+2}))b.angle+=1.1;if(b.x<50||b.x>g.worldW-50){b.angle=Math.PI-b.angle;b.x=clamp(b.x,50,g.worldW-50);}if(b.y<125||b.y>g.worldH-50){b.angle=-b.angle;b.y=clamp(b.y,125,g.worldH-50);}}
 if(i.action){
  if(!g.engulfTarget){const near=g.bacteria.filter(b=>b.alive&&dist(p,b)<p.r+b.r+28).sort((a,b)=>dist(p,a)-dist(p,b));if(near.length){g.engulfTarget=near[0];g.engulfProgress=0;}else g.hint='Crawl close to a bacterium, then hold Engulf.';}
  if(g.engulfTarget){const b=g.engulfTarget;if(dist(p,b)>p.r+b.r+33){g.engulfTarget=null;p.engulf=null;}else{g.engulfProgress+=dt/.85;p.engulf={x:b.x,y:b.y,r:b.r,progress:clamp(g.engulfProgress,0,1)};g.hint='Pseudopods surround the bacterium; the membrane will seal.';if(g.engulfProgress>=1){b.alive=false;g.combo=g.time-g.lastCapture<6?g.combo+1:1;g.lastCapture=g.time;g.count++;g.score+=100+Math.min(5,g.combo)*10;g.resource=Math.max(8,g.resource-13);p.vacuoles.push({dx:Math.cos(p.angle)*18,dy:Math.sin(p.angle)*18,fromX:b.x-p.x,fromY:b.y-p.y,r:b.r,progress:0});event(g,'Engulfed → sealed phagosome → digestion','capture');g.engulfTarget=null;p.engulf=null;}}}
 }else {g.engulfTarget=null;g.engulfProgress=0;p.engulf=null;}
 for(const v of p.vacuoles)v.progress+=dt/3;p.vacuoles=p.vacuoles.filter(v=>v.progress<1);
 const alive=g.bacteria.filter(b=>b.alive).length;g.integrity=Math.max(0,g.integrity-alive*(g.relaxed?.035:.085)*dt);g.hint=g.hint||'Healthy cells are obstacles. Only invading bacteria are targets.';
}
function flow(g,dt,i){
 const p=g.player;p.flex=lerp(p.flex,i.action?1:0,dt*9);const effectiveR=33*.72*(1-.48*p.flex);let next=p.x+155*(1-.25*p.flex)*dt;
 if(flowHalf(next)<effectiveR+1){next=p.x;g.resource-=5*dt;g.hint='Narrow capillary: hold Deform to squeeze through.';}
 p.x=next;let vy=i.y;if(i.pointer&&i.drag)vy=clamp((i.pointer.y-p.y)/75,-1,1);p.y+=vy*215*dt;const c=flowCenter(p.x),half=flowHalf(p.x),room=Math.max(1,half-effectiveR-2);
 if(Math.abs(p.y-c)>room){p.y=clamp(p.y,c-room,c+room);g.resource-=7*dt;}
 if(p.x<430){p.oxygen=clamp(p.oxygen+9*dt,0,12);g.hint='Lung capillary: oxygen diffuses in and binds to hemoglobin.';}
 for(const gate of [850,1700,2530])if(p.x>gate+100&&!g.passed.has(gate)){g.passed.add(gate);g.squeezes++;g.score+=100;event(g,'Flexible shape: narrow capillary passed','pass');}
 for(const target of g.targets){if(target.delivered>=3.999)continue;const close=Math.abs(p.x-target.x)<220;if(close){g.hint='Tissue needs O₂: guide toward the '+(target.side>0?'lower':'upper')+' side of the vessel.';if((p.y-c)*target.side>22&&p.oxygen>0){const take=Math.min(6*dt,4-target.delivered,p.oxygen);target.delivered+=take;p.oxygen-=take;g.score+=take*70;if(target.delivered>=3.999)event(g,'Oxygen diffused to tissue '+(g.targets.indexOf(target)+1),'deliver');}}
 }
 g.count=g.targets.filter(t=>t.delivered>=3.999).length;g.hint=g.hint||'The current carries the cell. Steer the model; hold Deform at narrow spots.';
 if(p.x>3300&&g.count<3){g.status='fail';event(g,'Some tissue targets still need oxygen. Try another flow run.','fail');}
}
function signal(g,dt,i){
 if(g.wave){g.wave.d+=450*dt;if(g.wave.d>=g.pathLength){g.wave.d=g.pathLength;g.wave.released+=dt;if(g.wave.released>.48){g.count++;g.score+=90;g.resource=clamp(g.resource+4,0,100);g.wave=null;g.cue=-.4;event(g,'Electrical wave → chemical messengers → next cell','signal');}}g.hint='The neuron stays fixed. The glow is a wave of electrical change.';return;}
 g.cue+=dt;g.ring=135-(g.cue/2.35)*110;const target=1.78,window=g.relaxed?.32:.21;
 if(i.press){if(Math.abs(g.cue-target)<=window){g.wave={d:0,released:0};g.score+=70;event(g,'Action potential started','signal');}else{g.resource-=8;g.misses++;g.cue=0;event(g,'Tap when the moving ring meets the gold target ring.','miss');}}
 else if(g.cue>2.5){g.resource-=7;g.misses++;g.cue=0;event(g,'Missed the timing window. Watch the next ring.','miss');}
 g.hint=Math.abs(g.cue-target)<window?'NOW — tap Signal!':'Wait for the incoming ring to meet the gold ring, then tap Signal.';
}
function contactFor(g,patch){let best=null,bd=Infinity;for(let i=1;i<g.points.length;i++){const q=nearestOn(g.points[i-1],g.points[i],patch),d=dist(q,patch);if(d<bd){bd=d;best=q;}}return bd<patch.r+9?best:null;}
function root(g,dt,i){
 let desired=0;if(i.pointer&&!i.x&&!i.y){desired=Math.atan2(i.pointer.y-g.tip.y,Math.max(1,i.pointer.x-g.tip.x));}else if(Math.hypot(i.x,i.y)>.1)desired=Math.atan2(i.y,Math.max(.5,i.x));else desired=g.angle;
 desired=clamp(desired,-1.03,1.03);g.angle=lerp(g.angle,desired,dt*4);g.growing=false;
 if(i.action&&g.resource>2&&g.tip.x<g.worldW-80){const next={x:g.tip.x+Math.cos(g.angle)*83*dt,y:clamp(g.tip.y+Math.sin(g.angle)*83*dt,170,840)};
  if(g.obstacles.every(o=>dist(next,o)>o.r+13)){g.tip=next;g.growing=true;g.length+=83*dt;g.resource-=2.4*dt;const last=g.points[g.points.length-1];if(dist(last,g.tip)>8)g.points.push({...g.tip});}else g.hint='Soil particle ahead: steer up or down while growing.';
 }else g.resource=clamp(g.resource+4*dt,0,100);
 g.contactClock-=dt;if(g.contactClock<=0){g.contactClock=.08;for(const p of g.patches)p.contact=contactFor(g,p);for(const p of g.salt)p.contact=contactFor(g,p);}
 for(const p of g.patches)if(p.contact&&p.water>0){const take=Math.min(p.water,5.5*dt);p.water-=take;g.water+=take;g.score+=take*10;}
 for(const p of g.salt)if(p.contact){g.water=Math.max(0,g.water-3*dt);g.hint='Very salty soil can cause net water loss by osmosis. Reach more moist soil to offset the loss.';}
 g.count=Math.floor(g.water);g.hint=g.hint|| (g.patches.some(p=>p.contact&&p.water>0)?'Water enters across the contacted membrane by osmosis—even when growth stops.':'Grow one hair toward blue moist-soil patches. The base stays anchored.');
}
window.CellGameCore={create,step,pointAt,flowCenter,flowHalf,nearestOn,clamp,dist};
})();
