/* Deterministic simulation core. Scores, controls, sizes and times are game abstractions. */
(function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
function nearestOn(a,b,p){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return{x:a.x+dx*t,y:a.y+dy*t};}
function flowCenter(x,g){const c=g?.levelConfig?.curve||{base:430,a:80,b:25,p:320,q:135};return c.base+c.a*Math.sin(x/c.p)+c.b*Math.sin(x/c.q);}
function flowHalf(x,g){let h=120;for(const p of g?.gates||[850,1700,2530])h-=106*Math.exp(-Math.pow((x-p)/100,4));return Math.max(14,h);}
function event(g,text,type='note'){g.events.push({text,type});if(g.events.length>8)g.events.shift();}
function collide(p,o){const d=dist(p,o),min=p.r+o.r;if(d<min){const a=Math.atan2(p.y-o.y,p.x-o.x)||0;p.x=o.x+Math.cos(a)*min;p.y=o.y+Math.sin(a)*min;return true;}return false;}
const DIFFICULTIES={
 relaxed:{immuneLimit:250,enemySpeed:.75,tissueDamage:.22,divisionTime:24,engulfTime:.7,boostCost:10,flowSpeed:130,flowPenalty:.55,signalWindow:.32,signalPenalty:.65,rootAbsorb:6.5,rootLimit:250,rootEnergy:1.8},
 standard:{immuneLimit:175,enemySpeed:1,tissueDamage:.55,divisionTime:18,engulfTime:.85,boostCost:14,flowSpeed:155,flowPenalty:1,signalWindow:.21,signalPenalty:1,rootAbsorb:5.5,rootLimit:150,rootEnergy:2.4},
 challenge:{immuneLimit:125,enemySpeed:1.3,tissueDamage:.9,divisionTime:12,engulfTime:.95,boostCost:17,flowSpeed:185,flowPenalty:1.4,signalWindow:.13,signalPenalty:1.35,rootAbsorb:4,rootLimit:100,rootEnergy:3.5}
};
function create(mode,difficulty='standard',random=Math.random,level=1){
 if(typeof difficulty==='boolean')difficulty=difficulty?'relaxed':'standard';
 if(!DIFFICULTIES[difficulty])difficulty='standard';
 level=clamp(Math.floor(Number(level)||1),1,3);const cfg=window.CELL_LEVELS?.[mode]?.[level-1];if(!cfg)throw Error('Missing level configuration');
 const relaxed=difficulty==='relaxed',rules={...DIFFICULTIES[difficulty]};
 const g={mode,difficulty,rules,relaxed,random,level,levelConfig:cfg,regions:cfg.regions.map(r=>({...r})),status:'play',time:0,score:0,count:0,resource:100,events:[],hint:'',particles:[],worldW:cfg.worldW,worldH:cfg.worldH};
 if(mode==='immune'){
  g.waveGoal=cfg.waveSizes.length;g.goal=cfg.waveSizes.reduce((a,b)=>a+b,0);g.limit=rules.immuneLimit+55+45*(level-1);g.integrity=100;
  rules.tissueDamage*=.30/(1+.10*(level-1));
  g.player={...cfg.start,r:34,angle:0,engulf:null,vacuoles:[],boosting:false};
  g.obstacles=cfg.obstacles.map(o=>({...o,damageFlash:0}));g.bacteria=[];
  g.wave=1;g.wavesCleared=0;g.waveIncoming=0;g.activeCount=0;g.damageFlash=0;g.nextBacteriumId=0;g.boostExhausted=false;
  g.engulfTarget=null;g.engulfProgress=0;g.lastCapture=-99;g.combo=0;spawnWave(g);
 }else if(mode==='flow'){
  g.goal=cfg.targets.length;g.limit=Math.ceil(cfg.worldW/(rules.flowSpeed*.75)+40);g.gates=[...cfg.gates];g.oxygenCapacity=g.goal*4;g.lungEnd=cfg.lungEnd;
  g.player={x:130,y:flowCenter(130,g),r:33,flex:0,oxygen:0};g.targets=cfg.targets.map(t=>({...t,need:4,delivered:0}));g.squeezes=0;g.passed=new Set();
 }else if(mode==='signal'){
  g.goal=cfg.goal;g.path=cfg.path.map(p=>({...p}));g.pathLength=0;for(let i=1;i<g.path.length;i++)g.pathLength+=dist(g.path[i-1],g.path[i]);
  const end=g.path[g.path.length-1];g.nextCell={x:end.x+120,y:end.y};
  g.limit=Math.ceil(g.goal*(g.pathLength/450+3.1)+(relaxed?100:difficulty==='challenge'?25:55));g.cue=0;g.wave=null;g.ring=135;g.resource=100;g.misses=0;
 }else if(mode==='root'){
  g.goal=cfg.goal;g.limit=rules.rootLimit+Math.round(cfg.worldW/45);g.rootMinY=150;g.rootMaxY=cfg.worldH-150;
  g.points=[{x:150,y:cfg.start.y},{...cfg.start}];g.tip={...cfg.start};g.angle=0;g.length=95;g.water=0;g.contactClock=0;
  g.obstacles=cfg.obstacles.map(o=>({...o}));g.patches=cfg.patches.map(p=>({...p,water:p.capacity,contact:null}));g.salt=cfg.salt.map(p=>({...p}));g.growing=false;
 }else throw Error('Unknown mission');
 return g;
}
function pointAt(g,d){let remain=d;for(let i=1;i<g.path.length;i++){const a=g.path[i-1],b=g.path[i],len=dist(a,b);if(remain<=len)return{x:lerp(a.x,b.x,remain/len),y:lerp(a.y,b.y,remain/len),angle:Math.atan2(b.y-a.y,b.x-a.x)};remain-=len;}return {...g.path[g.path.length-1],angle:0};}
function step(g,dt,input={}){
 if(g.status!=='play')return;dt=clamp(dt,0,.05);g.time+=dt;g.hint='';input.x=Number(input.x)||0;input.y=Number(input.y)||0;
 if(g.mode==='immune')immune(g,dt,input);else if(g.mode==='flow')flow(g,dt,input);else if(g.mode==='signal')signal(g,dt,input);else root(g,dt,input);
 if(g.mode==='immune'?g.wavesCleared>=g.waveGoal:g.count>=g.goal){g.status='win';g.score+=Math.round(Math.max(0,g.limit-g.time)*3+g.resource*2);event(g,'Mission complete!','win');}
 else if(g.time>=g.limit||g.resource<=0||(g.mode==='immune'&&g.integrity<=0)){g.status='fail';event(g,g.time>=g.limit?'Time to try a fresh cell.':'Your model needs another attempt.','fail');}
}
function spawnWave(g){
 // Waves and short division timers represent a sped-up infection scenario.
 const total=g.levelConfig.waveSizes[g.wave-1],zone=g.levelConfig.waveCenters[g.wave-1];
 const localCells=g.obstacles.slice().sort((a,b)=>dist(a,zone)-dist(b,zone)).slice(0,Math.min(8,g.obstacles.length));
 for(let j=0;j<total;j++){
  const role=j%3===1?'divider':'swimmer',r=role==='divider'?15:12;let b;
  for(let attempt=0;attempt<100;attempt++){
   const nearStart=g.wave===1&&j<2,o=nearStart?g.player:localCells[Math.floor(g.random()*localCells.length)],a=g.random()*Math.PI*2,d=nearStart?225+g.random()*75:o.r+r+50+g.random()*100;
   b={id:g.nextBacteriumId++,x:clamp(o.x+Math.cos(a)*d,70,g.worldW-70),y:clamp(o.y+Math.sin(a)*d,145,g.worldH-70),r,angle:g.random()*Math.PI*2,turn:g.random(),kind:role==='divider'?'coccus':'rod',role,alive:true,threat:0,canDivide:role==='divider',divisionLeft:g.rules.divisionTime+g.random()*5,divisionTotal:g.rules.divisionTime+5};
   if(g.obstacles.every(c=>dist(b,c)>c.r+r+20)&&dist(b,g.player)>(nearStart?220:180)&&g.bacteria.every(c=>!c.alive||dist(b,c)>r+c.r+10))break;
  }
  g.bacteria.push(b);
 }
 g.activeCount=g.bacteria.filter(b=>b.alive).length;
 event(g,'Wave '+g.wave+' / '+g.waveGoal+' — '+g.regions[g.wave-1].name,'wave');
}
function immune(g,dt,i){
 const p=g.player;let dx=i.x,dy=i.y;
 if(i.pointer&&i.drag){const d=dist(p,i.pointer);if(d>9){dx=(i.pointer.x-p.x)/d;dy=(i.pointer.y-p.y)/d;}else dx=dy=0;}
 const norm=Math.hypot(dx,dy);if(norm>1){dx/=norm;dy/=norm;}const locked=i.action&&g.engulfTarget;
 if(g.resource<12)g.boostExhausted=true;if(g.resource>=32)g.boostExhausted=false;
 p.boosting=!!(i.boost&&norm>.1&&!locked&&!g.boostExhausted);
 if(!locked){const speed=p.boosting?350:220;p.x+=dx*speed*dt;p.y+=dy*speed*dt;if(norm>.03)p.angle=Math.atan2(dy,dx);}
 p.x=clamp(p.x,p.r+12,g.worldW-p.r-12);p.y=clamp(p.y,p.r+100,g.worldH-p.r-40);for(const o of g.obstacles)collide(p,o);
 // Energy is an arcade reserve, not a literal measurement of cellular ATP.
 g.resource=clamp(g.resource+(p.boosting?-g.rules.boostCost:!locked&&norm>.1?1.5:10)*dt,0,100);
 g.damageFlash=Math.max(0,g.damageFlash-dt*3);for(const o of g.obstacles)o.damageFlash=Math.max(0,o.damageFlash-dt*2);
 if(g.waveIncoming>0){g.waveIncoming=Math.max(0,g.waveIncoming-dt);g.hint='Wave cleared! Rest and reposition. Next wave in '+Math.ceil(g.waveIncoming)+'…';if(g.waveIncoming===0){g.wave++;spawnWave(g);}}
 for(const b of g.bacteria.slice()){
  if(!b.alive)continue;
  if(b===g.engulfTarget&&i.action){b.threat=0;continue;}
  b.turn-=dt;
  const near=g.obstacles.reduce((best,o)=>dist(b,o)-o.r<dist(b,best)-best.r?o:best,g.obstacles[0]);
  if(b.turn<=0){
   // A simplified nutrient gradient biases motile bacteria; they do not hunt cells.
   const toward=Math.atan2(near.y-b.y,near.x-b.x);b.angle=b.role==='swimmer'?toward+(g.random()-.5)*2.8:b.angle+(g.random()-.5)*2;
   b.turn=.55+g.random()*1.3;
  }
  const speed=(b.role==='swimmer'?58:18)*g.rules.enemySpeed;
  b.x+=Math.cos(b.angle)*speed*dt;b.y+=Math.sin(b.angle)*speed*dt;
  for(const o of g.obstacles)if(collide(b,o))b.angle+=1.2;
  if(collide(b,{x:p.x,y:p.y,r:p.r+2}))b.angle+=1.1;
  if(b.x<50||b.x>g.worldW-50){b.angle=Math.PI-b.angle;b.x=clamp(b.x,50,g.worldW-50);}
  if(b.y<125||b.y>g.worldH-50){b.angle=-b.angle;b.y=clamp(b.y,125,g.worldH-50);}
  const nearby=dist(b,near)<near.r+b.r+48;
  b.threat=clamp(b.threat+(nearby?.65:-1.2)*dt,0,1);
  if(b.threat>.7){g.integrity=Math.max(0,g.integrity-g.rules.tissueDamage*b.threat*dt);near.damageFlash=b.threat;g.damageFlash=Math.max(g.damageFlash,.25);}
  if(b.canDivide){
   b.divisionLeft=Math.max(0,b.divisionLeft-dt);
   if(b.divisionLeft===0&&g.bacteria.filter(a=>a.alive).length<18){
    // One division per initial dividing bacterium keeps this encounter bounded.
    let daughter=null;
    for(let k=0;k<12;k++){const a=b.angle+k*Math.PI/6,q={...b,id:g.nextBacteriumId,x:b.x+Math.cos(a)*(b.r*2+5),y:b.y+Math.sin(a)*(b.r*2+5),angle:a,canDivide:false,divisionLeft:0,threat:0};if(q.x>50&&q.x<g.worldW-50&&q.y>125&&q.y<g.worldH-50&&g.obstacles.every(o=>dist(q,o)>q.r+o.r+2)&&dist(q,p)>q.r+p.r+5&&g.bacteria.every(other=>!other.alive||dist(q,other)>q.r+other.r+2)){daughter=q;break;}}
    if(daughter){b.canDivide=false;g.nextBacteriumId++;g.bacteria.push(daughter);g.goal++;g.score=Math.max(0,g.score-15);event(g,'Binary fission: one bacterium became two','divide');}
   }
  }
 }
 if(i.action){
  if(!g.engulfTarget){const near=g.bacteria.filter(b=>b.alive&&dist(p,b)<p.r+b.r+28).sort((a,b)=>dist(p,a)-dist(p,b));if(near.length){g.engulfTarget=near[0];g.engulfProgress=0;p.boosting=false;}else g.hint='Crawl close to a bacterium, then hold Engulf.';}
  if(g.engulfTarget){const b=g.engulfTarget;if(dist(p,b)>p.r+b.r+33){g.engulfTarget=null;p.engulf=null;}else{g.engulfProgress+=dt/g.rules.engulfTime;p.engulf={x:b.x,y:b.y,r:b.r,progress:clamp(g.engulfProgress,0,1)};g.hint='Hold steady: pseudopods surround the bacterium; the membrane seals.';if(g.engulfProgress>=1){b.alive=false;g.combo=g.time-g.lastCapture<6?g.combo+1:1;g.lastCapture=g.time;g.count++;g.score+=100+Math.min(5,g.combo)*10;g.resource=Math.max(1,g.resource-8);p.vacuoles.push({dx:Math.cos(p.angle)*18,dy:Math.sin(p.angle)*18,fromX:b.x-p.x,fromY:b.y-p.y,r:b.r,progress:0});event(g,g.combo>1?'Engulfed! '+g.combo+'-capture streak':'Engulfed → sealed phagosome → digestion','capture');g.engulfTarget=null;p.engulf=null;}}}
 }else {g.engulfTarget=null;g.engulfProgress=0;p.engulf=null;}
 for(const v of p.vacuoles)v.progress+=dt/3;p.vacuoles=p.vacuoles.filter(v=>v.progress<1);
 g.activeCount=g.bacteria.filter(b=>b.alive).length;
 if(g.activeCount===0&&g.waveIncoming===0&&g.wavesCleared<g.wave){g.wavesCleared=g.wave;g.score+=200;if(g.wave<g.waveGoal){g.waveIncoming=2;event(g,'Wave '+g.wave+' cleared — next wave approaching','wave');}}
 g.hint=g.hint||(g.boostExhausted&&i.boost?'Quick crawl recharging. Release it or rest to restore energy.':g.integrity<30?'Tissue is under pressure! Prioritize bacteria with red warning rings.':'Hold Shift / Quick crawl for faster crawling. Engulf dividers before they multiply.');
}
function flow(g,dt,i){
 const p=g.player;p.flex=lerp(p.flex,i.action?1:0,dt*9);const effectiveR=33*.72*(1-.48*p.flex);let next=p.x+g.rules.flowSpeed*(1-.25*p.flex)*dt;
 if(flowHalf(next,g)<effectiveR+1){next=p.x;g.resource-=5*g.rules.flowPenalty*dt;g.hint='Narrow capillary: hold Deform to squeeze through.';}
 p.x=next;let vy=i.y;if(i.pointer&&i.drag)vy=clamp((i.pointer.y-p.y)/75,-1,1);p.y+=vy*215*dt;const c=flowCenter(p.x,g),half=flowHalf(p.x,g),room=Math.max(1,half-effectiveR-2);
 if(Math.abs(p.y-c)>room){p.y=clamp(p.y,c-room,c+room);g.resource-=7*g.rules.flowPenalty*dt;}
 if(p.x<g.lungEnd){p.oxygen=clamp(p.oxygen+9*dt,0,g.oxygenCapacity);g.hint='Lung capillary: oxygen diffuses in and binds to hemoglobin.';}
 for(const gate of g.gates)if(p.x>gate+100&&!g.passed.has(gate)){g.passed.add(gate);g.squeezes++;g.score+=100;event(g,'Flexible shape: narrow capillary passed','pass');}
 for(const target of g.targets){if(target.delivered>=target.need-.001)continue;const close=Math.abs(p.x-target.x)<220;if(close){g.hint='Tissue needs O₂: guide toward the '+(target.side>0?'lower':'upper')+' side of the vessel.';if((p.y-c)*target.side>22&&p.oxygen>0){const take=Math.min(6*dt,target.need-target.delivered,p.oxygen);target.delivered+=take;p.oxygen-=take;g.score+=take*70;if(target.delivered>=target.need-.001)event(g,'Oxygen diffused to tissue '+(g.targets.indexOf(target)+1),'deliver');}}
 }
 g.count=g.targets.filter(t=>t.delivered>=t.need-.001).length;g.hint=g.hint||'The current carries the cell. Steer the model; hold Deform at narrow spots.';
 if(p.x>g.worldW-80&&g.count<g.goal){g.status='fail';event(g,'Some tissue targets still need oxygen. Try another flow run.','fail');}
}
function signal(g,dt,i){
 if(g.wave){g.wave.d+=450*dt;if(g.wave.d>=g.pathLength){g.wave.d=g.pathLength;g.wave.released+=dt;if(g.wave.released>.48){g.count++;g.score+=90;g.resource=clamp(g.resource+4,0,100);g.wave=null;g.cue=-.4;event(g,'Electrical wave → chemical messengers → next cell','signal');}}g.hint='The neuron stays fixed. The glow is a wave of electrical change.';return;}
 g.cue+=dt;g.ring=135-(g.cue/2.35)*110;const target=1.78,window=g.rules.signalWindow;
 if(i.press){if(Math.abs(g.cue-target)<=window){g.wave={d:0,released:0};g.score+=70;event(g,'Action potential started','signal');}else{g.resource-=8*g.rules.signalPenalty;g.misses++;g.cue=0;event(g,'Tap when the moving ring meets the gold target ring.','miss');}}
 else if(g.cue>2.5){g.resource-=7*g.rules.signalPenalty;g.misses++;g.cue=0;event(g,'Missed the timing window. Watch the next ring.','miss');}
 g.hint=Math.abs(g.cue-target)<window?'NOW — tap Signal!':'Wait for the incoming ring to meet the gold ring, then tap Signal.';
}
function contactFor(g,patch){let best=null,bd=Infinity;for(let i=1;i<g.points.length;i++){const q=nearestOn(g.points[i-1],g.points[i],patch),d=dist(q,patch);if(d<bd){bd=d;best=q;}}return bd<patch.r+9?best:null;}
function root(g,dt,i){
 let desired=0;if(i.pointer&&!i.x&&!i.y){desired=Math.atan2(i.pointer.y-g.tip.y,Math.max(1,i.pointer.x-g.tip.x));}else if(Math.hypot(i.x,i.y)>.1)desired=Math.atan2(i.y,Math.max(.5,i.x));else desired=g.angle;
 desired=clamp(desired,-1.03,1.03);g.angle=lerp(g.angle,desired,dt*4);g.growing=false;
 if(i.action&&g.resource>2&&g.tip.x<g.worldW-80){const next={x:g.tip.x+Math.cos(g.angle)*83*dt,y:clamp(g.tip.y+Math.sin(g.angle)*83*dt,g.rootMinY,g.rootMaxY)};
  if(g.obstacles.every(o=>dist(next,o)>o.r+13)){g.tip=next;g.growing=true;g.length+=83*dt;g.resource-=g.rules.rootEnergy*dt;const last=g.points[g.points.length-1];if(dist(last,g.tip)>8)g.points.push({...g.tip});}else g.hint='Soil particle ahead: steer up or down while growing.';
 }else g.resource=clamp(g.resource+4*dt,0,100);
 g.contactClock-=dt;if(g.contactClock<=0){g.contactClock=.08;for(const p of g.patches)p.contact=contactFor(g,p);for(const p of g.salt)p.contact=contactFor(g,p);}
 for(const p of g.patches)if(p.contact&&p.water>0){const take=Math.min(p.water,g.rules.rootAbsorb*dt);p.water-=take;g.water+=take;g.score+=take*10;}
 for(const p of g.salt)if(p.contact){g.water=Math.max(0,g.water-3*dt);g.hint='Very salty soil can cause net water loss by osmosis. Reach more moist soil to offset the loss.';}
 g.count=Math.floor(g.water);g.hint=g.hint|| (g.patches.some(p=>p.contact&&p.water>0)?'Water enters across the contacted membrane by osmosis—even when growth stops.':'Grow one hair toward blue moist-soil patches. The base stays anchored.');
}
window.CellGameCore={create,step,pointAt,flowCenter,flowHalf,nearestOn,clamp,dist,DIFFICULTIES};
})();
