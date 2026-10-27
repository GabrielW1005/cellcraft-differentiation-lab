/* Hand-built, schematic environments. Distances are game units, not cell measurements. */
(function(){'use strict';
const circle=(x,y,r)=>({x,y,r});
const region=(name,x,y,r,color)=>({name,x,y,r,color});
function tissueMap(w,h,level){
 // Organic tissue islands, with three deliberately different open passage plans.
 const plans=[
  [[.10,.50],[.30,.56],[.49,.37],[.69,.55],[.93,.42]],
  [[.09,.50],[.30,.52],[.42,.28],[.58,.70],[.75,.31],[.94,.62]],
  [[.08,.50],[.30,.50],[.49,.50],[.69,.23],[.91,.23]]
 ];
 const passages=[plans[level-1]];
 if(level===3)passages.push([[.49,.50],[.69,.76],[.92,.76]],[[.49,.50],[.73,.51],[.95,.49]]);
 const segments=[];for(const line of passages)for(let i=1;i<line.length;i++)segments.push([{x:line[i-1][0]*w,y:line[i-1][1]*h},{x:line[i][0]*w,y:line[i][1]*h}]);
 const distanceToSegment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
 let seed=17713+level*919;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const cells=[],count=[20,32,46][level-1];
 for(let attempt=0;attempt<10000&&cells.length<count;attempt++){
  const r=60+level*10+random()*(32+level*4),x=460+random()*(w-620),y=180+random()*(h-330),p={x:Math.round(x),y:Math.round(y),r:Math.round(r)};
  if(p.x-p.r<390||p.x+p.r>w-70||p.y-p.r<115||p.y+p.r>h-65)continue;
  if(segments.some(([a,b])=>distanceToSegment(p,a,b)<p.r+105))continue;
  if(cells.some(c=>Math.hypot(c.x-p.x,c.y-p.y)<c.r+p.r+110))continue;
  cells.push(p);
 }
 return cells;
}

const immune=[
 {id:1,name:'Tissue Trail',description:'Follow a curved trail around irregular tissue islands.',challenge:'Clear 3 waves across a larger tissue region. Use the map to find distant bacteria.',worldW:2400,worldH:1500,start:{x:260,y:750},waveSizes:[4,5,6],regions:[region('Entry region',450,750,420,'#568e9c'),region('Tissue islands',1250,450,430,'#a0768d'),region('Outer tissue',1900,1030,440,'#8c879d')]},
 {id:2,name:'Winding Passages',description:'Follow a zigzag passage between scattered tissue islands.',challenge:'Navigate staggered passages while clearing 3 waves. Watch dividing bacteria on the far side.',worldW:3100,worldH:1900,start:{x:260,y:950},waveSizes:[5,6,7],regions:[region('Entry region',550,950,470,'#568e9c'),region('Central passage',1600,580,510,'#a0768d'),region('Far tissue',2520,1300,520,'#8c879d')]},
 {id:3,name:'Wide Patrol',description:'Choose branching passages around a broad central clearing.',challenge:'Clear 3 waves across the widest tissue map. Plan your route and use Quick crawl to reach distant threats.',worldW:3800,worldH:2300,start:{x:260,y:1150},waveSizes:[6,7,8],regions:[region('Entry region',620,1150,550,'#568e9c'),region('Central tissue',1970,700,600,'#a0768d'),region('Far passage',3080,1540,610,'#8c879d')]}
].map((c,i)=>({...c,obstacles:tissueMap(c.worldW,c.worldH,i+1),waveCenters:[{x:650,y:c.start.y},c.regions[1],c.regions[2]]}));
const flow=[
 {id:1,name:'Capillary Bend',description:'A longer vessel with gentle bends and four narrow passages.',challenge:'Supply 3 tissue targets along a longer blood-flow route.',worldW:5000,worldH:1250,curve:{base:625,a:135,b:40,p:490,q:205},gates:[1050,2170,3350,4200],targets:[{x:1650,side:1},{x:2850,side:-1},{x:4580,side:1}],lungEnd:640,regions:[region('Lung exchange',340,330,230,'#5f9ab1'),region('Middle exchange',2700,900,300,'#ad7785'),region('Final exchange',4480,800,300,'#ad7785')]},
 {id:2,name:'Twisting Current',description:'More sweeping turns, tighter planning, and four tissue stops.',challenge:'Supply 4 tissue targets; alternate sides as the vessel bends.',worldW:6500,worldH:1450,curve:{base:720,a:180,b:55,p:540,q:235},gates:[1120,2350,3550,4700,5680],targets:[{x:1700,side:-1},{x:2900,side:1},{x:4150,side:-1},{x:6080,side:1}],lungEnd:720,regions:[region('Lung exchange',360,390,250,'#5f9ab1'),region('Broad bend',3300,1000,350,'#ad7785'),region('Far exchange',6000,380,330,'#ad7785')]},
 {id:3,name:'Long Delivery',description:'The longest route: five stops and six narrow capillaries.',challenge:'Deliver oxygen at all 5 tissue targets along the complete route.',worldW:8000,worldH:1600,curve:{base:800,a:220,b:50,p:600,q:250},gates:[1150,2480,3820,5100,6350,7200],targets:[{x:1750,side:1},{x:3070,side:-1},{x:4450,side:1},{x:5740,side:-1},{x:7610,side:1}],lungEnd:800,regions:[region('Lung exchange',400,460,280,'#5f9ab1'),region('Middle passage',3900,500,360,'#ad7785'),region('Far exchange',7400,1130,350,'#ad7785')]}
];
const signal=[
 {id:1,name:'Long Axon',description:'Follow electrical changes along a long, gently curving axon.',challenge:'Relay 6 messages; follow each electrical wave to the synapse.',worldW:2200,worldH:1200,goal:6,path:[{x:230,y:600},{x:600,y:600},{x:860,y:400},{x:1250,y:400},{x:1510,y:660},{x:1910,y:660}],regions:[region('Cell body',260,600,230,'#5f97ad'),region('Long axon',1100,500,380,'#7874a7'),region('Synapse',2010,660,180,'#aa80a5')]},
 {id:2,name:'Axon Bends',description:'Track a longer membrane wave through broad bends.',challenge:'Relay 8 messages across the winding axon without missing the timing cue.',worldW:2800,worldH:1500,goal:8,path:[{x:230,y:750},{x:580,y:750},{x:870,y:460},{x:1230,y:460},{x:1530,y:900},{x:1900,y:900},{x:2150,y:580},{x:2510,y:580}],regions:[region('Cell body',260,750,230,'#5f97ad'),region('Axon bend',1470,710,450,'#7874a7'),region('Synapse',2610,580,180,'#aa80a5')]},
 {id:3,name:'Distant Connection',description:'A sweeping axon links the cell body to a distant synapse.',challenge:'Relay 10 messages along the longest axon. The cell stays fixed as the signal spreads.',worldW:3400,worldH:1650,goal:10,path:[{x:230,y:820},{x:650,y:820},{x:980,y:480},{x:1400,y:480},{x:1750,y:1080},{x:2180,y:1080},{x:2490,y:660},{x:3110,y:660}],regions:[region('Cell body',260,820,230,'#5f97ad'),region('Long membrane',1770,780,520,'#7874a7'),region('Synapse',3210,660,180,'#aa80a5')]}
];
function rootMap(id,w,h,count,goal,name,description){
 const base=h*.5,route=[];for(let i=0;i<count;i++)route.push({x:500+i*(w-850)/(count-1),y:base+(i%2?115:-115)});
 const obstacles=[];
 for(let i=0;i<route.length-1;i++){const a=route[i],b=route[i+1];obstacles.push(circle((a.x+b.x)/2,base+(i%2?250:-250),78+(i*17)%26));}
 for(let i=0;i<count;i++){const x=route[i].x;obstacles.push(circle(x,base-390-(i%2)*45,55+i%3*12),circle(x+50,base+390+(i%2)*40,60+i%2*18));}
 return{id,name,description,challenge:'Grow through the soil to collect '+goal+' game water units. Use moist pockets and plan around particles and very salty soil.',worldW:w,worldH:h,goal,start:{x:245,y:base},route,obstacles,patches:route.map((p,i)=>({...p,r:95+(i%2)*10,capacity:30})),salt:[circle(w*.40,base+345,95),circle(w*.72,base-345,105)],regions:[region('Root surface',250,base,210,'#87906b'),region('Moist pockets',w*.47,base,350,'#5c91a0'),region('Deep soil',w*.83,base,380,'#9d8969')]};
}
const root=[rootMap(1,2400,1300,5,120,'Moist Corridor','Trace a longer path between moist pockets.'),rootMap(2,3100,1550,7,160,'Pebble Pass','Weave around staggered particles to find more water.'),rootMap(3,3900,1800,9,200,'Dry Pockets','Reach scattered water reserves across a broad soil region.')];
window.CELL_LEVELS={immune,flow,signal,root};
})();
