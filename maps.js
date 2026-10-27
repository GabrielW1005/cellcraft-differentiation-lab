/* Map context and navigation. Decorative fibers and fine soil texture are not obstacles. */
(function(){
 'use strict';
 const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const finite=v=>Number.isFinite(v),point=p=>p&&finite(p.x)&&finite(p.y);
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const palettes={immune:['#35536a','#8ea8bd'],flow:['#654151','#b896a8'],signal:['#344b6b','#96adc7'],root:['#5d5143','#c3aa82']};
 function circle(c,x,y,r,fill,stroke,lw=1){if(!finite(x)||!finite(y)||!finite(r)||r<=0)return;c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
 function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
 function inside(v,x,y,r=0){return x+r>=v.x&&x-r<=v.x+v.w&&y+r>=v.y&&y-r<=v.y+v.h;}
 function viewFor(g,v){return v&&[v.x,v.y,v.w,v.h].every(finite)?v:{x:0,y:0,w:g.worldW,h:g.worldH};}
 function text(c,s,x,y,color='#aec6d6',size=11,align='center'){c.font='600 '+size+'px system-ui,sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineWidth=4;c.strokeStyle='#102536d9';c.strokeText(String(s),x,y);c.fillStyle=color;c.fillText(String(s),x,y);}
 function fibers(c,g,v){
  // Schematic extracellular fibers provide context without creating fake walls.
  const step=260,x0=Math.max(0,Math.floor((v.x-250)/step)),x1=Math.min(Math.ceil(g.worldW/step),Math.ceil((v.x+v.w+250)/step));
  const y0=Math.max(0,Math.floor((v.y-160)/step)),y1=Math.min(Math.ceil(g.worldH/step),Math.ceil((v.y+v.h+160)/step));
  for(let iy=y0;iy<=y1;iy++)for(let ix=x0;ix<=x1;ix++){
   const id=ix+iy*97+(g.level||1)*113,x=ix*step+hash(id)*55,y=iy*step+hash(id+3)*95;
   c.strokeStyle='#8aa9b41a';c.lineWidth=1.2;
   for(let k=0;k<3;k++){c.beginPath();c.moveTo(x-80,y+k*5);c.bezierCurveTo(x-10,y-55+k*4,x+90,y+44+k*4,x+180,y-20+k*4);c.stroke();}
   circle(c,x+200,y+15,3,'#9fc4cb18');
  }
 }
 function soil(c,g,v){
  const step=130,x0=Math.max(0,Math.floor(v.x/step)),x1=Math.min(Math.ceil(g.worldW/step),Math.ceil((v.x+v.w)/step));
  const y0=Math.max(0,Math.floor(v.y/step)),y1=Math.min(Math.ceil(g.worldH/step),Math.ceil((v.y+v.h)/step));
  // Broad strata and tiny flecks are a background texture; only outlined particles block growth.
  c.strokeStyle='#b8a58419';c.lineWidth=2;
  for(let y=Math.floor(v.y/280)*280;y<v.y+v.h+100;y+=280){c.beginPath();c.moveTo(v.x,y);c.bezierCurveTo(v.x+v.w*.28,y-30,v.x+v.w*.7,y+46,v.x+v.w,y+20);c.stroke();}
  for(let iy=y0;iy<=y1;iy++)for(let ix=x0;ix<=x1;ix++){
   const id=ix+iy*131+(g.level||1)*167,x=ix*step+hash(id)*step,y=iy*step+hash(id+15)*step,r=2+hash(id+19)*4;
   c.fillStyle=hash(id+6)>.5?'#b9a27d20':'#d5be9820';c.beginPath();c.moveTo(x-r,y-r*.5);c.lineTo(x+r*.9,y-r*.8);c.lineTo(x+r*.6,y+r*.7);c.lineTo(x-r*.7,y+r);c.closePath();c.fill();
  }
 }
 function bloodContext(c,g,v){
  const C=window.CellGameCore;if(!C)return;
  const step=330,x0=Math.max(0,Math.floor((v.x-100)/step)),x1=Math.min(Math.ceil(g.worldW/step),Math.ceil((v.x+v.w+100)/step));
  for(let ix=x0;ix<=x1;ix++)for(const side of [-1,1]){
   const id=ix*11+side+(g.level||1)*59,x=ix*step+hash(id)*90,y=C.flowCenter(x,g)+side*(C.flowHalf(x,g)+260+hash(id+1)*80),r=46+hash(id+2)*35;
   if(!inside(v,x,y,r)||y-r<30||y+r>g.worldH-30)continue;
   c.beginPath();for(let k=0;k<7;k++){const a=k/7*TAU,rrr=r*(.92+hash(id+k)*.12);if(k)c.lineTo(x+Math.cos(a)*rrr,y+Math.sin(a)*rrr);else c.moveTo(x+Math.cos(a)*rrr,y+Math.sin(a)*rrr);}c.closePath();c.fillStyle='#89617217';c.fill();c.strokeStyle='#d19bab1e';c.lineWidth=2;c.stroke();circle(c,x-5,y+5,r*.27,'#9d8dbb12');
  }
 }
 function nerveContext(c,g,v){
  // Stationary connective scenery stays faint so only the active axon reads as a route.
  const step=400,x0=Math.max(0,Math.floor(v.x/step)),x1=Math.min(Math.ceil(g.worldW/step),Math.ceil((v.x+v.w)/step));
  for(let ix=x0;ix<=x1;ix++){
   const id=ix+71*(g.level||1),x=ix*step+120,y=125+hash(id)*70;
   c.strokeStyle='#8ca9c514';c.lineWidth=2;c.beginPath();c.moveTo(x-130,y+30);c.bezierCurveTo(x-40,y-35,x+60,y+65,x+175,y+10);c.stroke();
   circle(c,x+40,g.worldH-110-hash(id+1)*40,12,'#a6a7cb0c','#a6a7cb12');
  }
 }
 function regions(c,g,v){
  const palette=palettes[g.mode]||palettes.immune;
  (g.regions||[]).forEach((r,i)=>{
   if(!point(r))return;const radius=finite(r.r)&&r.r>0?r.r:230;
   if(!inside(v,r.x,r.y,radius+60))return;
   c.save();c.globalAlpha=.045;c.fillStyle=r.color||palette[0];c.beginPath();c.ellipse(r.x,r.y,radius,radius*.68,0,0,TAU);c.fill();c.globalAlpha=1;
   const lx=r.x,ly=Math.max(130,r.y-radius*.68-20);
   // Headings are region names, not claims that the tissue has literal game sectors.
   if(inside(v,lx,ly,120)){
    c.strokeStyle=palette[1]+'40';c.lineWidth=1;c.beginPath();c.moveTo(lx-40,ly-15);c.lineTo(lx+40,ly-15);c.stroke();
    text(c,String(i+1).padStart(2,'0')+'  '+String(r.name||'REGION').toUpperCase(),lx,ly,palette[1],10);
   }
   c.restore();
  });
 }
 function draw(c,g,t,viewport){
  if(!c||!g||!finite(g.worldW)||!finite(g.worldH))return;const v=viewFor(g,viewport);
  c.save();c.beginPath();c.rect(v.x,v.y,v.w,v.h);c.clip();regions(c,g,v);
  if(g.mode==='immune')fibers(c,g,v);else if(g.mode==='root')soil(c,g,v);else if(g.mode==='flow')bloodContext(c,g,v);else if(g.mode==='signal')nerveContext(c,g,v);
  c.restore();
 }
 function minimap(c,g,rect,view){
  if(!c||!g||!rect||![rect.x,rect.y,rect.w,rect.h,g.worldW,g.worldH].every(finite)||rect.w<70||rect.h<65||g.worldW<=0||g.worldH<=0)return;
  const pad=9,header=22,footer=17,availableW=rect.w-pad*2,availableH=rect.h-header-footer;
  if(availableH<10)return;
  const s=Math.min(availableW/g.worldW,availableH/g.worldH),mw=g.worldW*s,mh=g.worldH*s;
  const ox=rect.x+(rect.w-mw)/2,oy=rect.y+header+(availableH-mh)/2;
  const X=x=>ox+x*s,Y=y=>oy+y*s,R=r=>Math.max(1,r*s),C=window.CellGameCore;
  c.save();rr(c,rect.x,rect.y,rect.w,rect.h,12);c.fillStyle='#102438';c.fill();c.strokeStyle='#779bb54a';c.lineWidth=1;c.stroke();
  c.font='700 8px system-ui,sans-serif';c.textBaseline='middle';c.textAlign='left';c.fillStyle='#b1c9db';c.fillText('MAP  ·  LEVEL '+(g.level||1),rect.x+pad,rect.y+11);
  c.save();c.beginPath();c.rect(ox,oy,mw,mh);c.clip();c.fillStyle='#0b1b2a';c.fillRect(ox,oy,mw,mh);
  if(g.mode==='immune'){
   for(const o of g.obstacles||[])if(point(o))circle(c,X(o.x),Y(o.y),R(o.r||30),'#73586c');
   for(const b of g.bacteria||[])if(b.alive&&point(b)){
    c.fillStyle=b.threat>.7?'#ffa46f':b.role==='divider'?'#efc59b':'#8ed8ee';
    if(b.role==='divider')c.fillRect(X(b.x)-1.8,Y(b.y)-1.8,3.6,3.6);else circle(c,X(b.x),Y(b.y),1.7,c.fillStyle);
   }
  }else if(g.mode==='flow'&&C){
   c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#996679';c.beginPath();const count=90;
   for(let k=0;k<=count;k++){const x=g.worldW*k/count,y=C.flowCenter(x,g);if(k)c.lineTo(X(x),Y(y));else c.moveTo(X(x),Y(y));}c.stroke();
   for(const a of g.targets||[])if(finite(a.x)){const x=X(a.x),y=Y(C.flowCenter(a.x,g))+a.side*5,done=a.delivered>=(a.need||4)-.001;c.strokeStyle=done?'#99d8c7':'#f3c48d';c.lineWidth=1.5;c.strokeRect(x-2.5,y-2.5,5,5);if(done){c.fillStyle='#99d8c7';c.fillRect(x-1,y-1,2,2);}}
  }else if(g.mode==='root'){
   for(const p of g.patches||[])if(point(p)&&p.water>0)circle(c,X(p.x),Y(p.y),R(p.r||40),'#5f9bb5');
   for(const p of g.salt||[])if(point(p)){c.fillStyle='#ae806c';c.fillRect(X(p.x)-R(p.r||30)*.65,Y(p.y)-R(p.r||30)*.65,R(p.r||30)*1.3,R(p.r||30)*1.3);}
   for(const o of g.obstacles||[])if(point(o))circle(c,X(o.x),Y(o.y),R(o.r||30),'#8c7b64');
   c.strokeStyle='#d9e4b1';c.lineWidth=1.5;c.lineCap='round';c.beginPath();let begun=false;for(const p of g.points||[])if(point(p)){if(begun)c.lineTo(X(p.x),Y(p.y));else{c.moveTo(X(p.x),Y(p.y));begun=true;}}if(point(g.tip)&&begun)c.lineTo(X(g.tip.x),Y(g.tip.y));if(begun)c.stroke();
  }else if(g.mode==='signal'){
   c.strokeStyle='#9da5d7';c.lineWidth=2;c.beginPath();let begun=false;for(const p of g.path||[])if(point(p)){if(begun)c.lineTo(X(p.x),Y(p.y));else{c.moveTo(X(p.x),Y(p.y));begun=true;}}if(begun)c.stroke();if(point(g.nextCell))circle(c,X(g.nextCell.x),Y(g.nextCell.y),3,'#d0b0d9');
  }
  // A view rectangle makes scrolling understandable without implying a playable boundary.
  if(view&&[view.x,view.y,view.w,view.h].every(finite)){
   const x=clamp(view.x,0,g.worldW),y=clamp(view.y,0,g.worldH),right=clamp(view.x+view.w,0,g.worldW),bottom=clamp(view.y+view.h,0,g.worldH);
   c.strokeStyle='#c6dcea80';c.lineWidth=.8;c.strokeRect(X(x),Y(y),Math.max(1,(right-x)*s),Math.max(1,(bottom-y)*s));
  }
  let p=g.player||g.tip;if(g.mode==='signal')p=g.wave&&C?C.pointAt(g,g.wave.d):(g.path||[])[0];
  if(point(p)){
   const x=X(p.x),y=Y(p.y);circle(c,x,y,4,'#102438','#f8e0bc',1.2);
   c.fillStyle='#fff1cf';c.beginPath();c.moveTo(x,y-3);c.lineTo(x+2.8,y+2.5);c.lineTo(x-2.8,y+2.5);c.closePath();c.fill();
  }
  c.restore();
  c.font='600 7px system-ui,sans-serif';c.textAlign='left';c.fillStyle='#f2d7b1';c.fillText('▲ '+(g.mode==='signal'?'SIGNAL':g.mode==='root'?'GROWING TIP':'YOU'),rect.x+pad,rect.y+rect.h-8);
  if(rect.w>130){c.textAlign='right';c.fillStyle='#8ca9bd';c.fillText('□ VIEW',rect.x+rect.w-pad,rect.y+rect.h-8);}
  c.restore();
 }
 window.CellMaps={draw,minimap};
})();
