/* Cellcraft: original Canvas 2D biological schematics. No external assets. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const pal = {
    ink: '#112b3b', text: '#e9f2f5', muted: '#9bb9c7', membrane: '#8dd7d5',
    phago: '#96d8cb', phagoDeep: '#3c9f99', nucleus: '#7182ae', nucleusDark: '#3a4c7a',
    coral: '#f58e79', coralDark: '#b84e51', coralPale: '#ffc4ad',
    blue: '#79c7f4', gold: '#f4d27c', green: '#c6da92', wall: '#79965a'
  };
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const fract = x => x - Math.floor(x);
  const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
  function circle(c,x,y,r,fill,stroke,width=1){c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function rr(c,x,y,w,h,r){const rad=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+rad,y);c.lineTo(x+w-rad,y);c.quadraticCurveTo(x+w,y,x+w,y+rad);c.lineTo(x+w,y+h-rad);c.quadraticCurveTo(x+w,y+h,x+w-rad,y+h);c.lineTo(x+rad,y+h);c.quadraticCurveTo(x,y+h,x,y+h-rad);c.lineTo(x,y+rad);c.quadraticCurveTo(x,y,x+rad,y);c.closePath();}
  function smooth(c,points,close=true){if(!points.length)return;c.beginPath();if(close){const last=points[points.length-1],first=points[0];c.moveTo((last.x+first.x)/2,(last.y+first.y)/2);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];c.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2);}c.closePath();}else{c.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)c.lineTo(points[i].x,points[i].y);}}
  function label(c,text,x,y,align='center'){c.save();c.font='600 13px system-ui, sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineWidth=4;c.strokeStyle='#0b202ee6';c.strokeText(text,x,y);c.fillStyle=pal.text;c.fillText(text,x,y);c.restore();}
  function mitochondrion(c,x,y,r,angle){c.save();c.translate(x,y);c.rotate(angle||0);rr(c,-r,-r*.45,r*2,r*.9,r*.45);c.fillStyle='#f0b291';c.fill();c.strokeStyle='#b7746b';c.lineWidth=Math.max(1,r*.11);c.beginPath();c.moveTo(-r*.6,0);c.lineTo(-r*.3,-r*.22);c.lineTo(0,r*.22);c.lineTo(r*.3,-r*.22);c.lineTo(r*.6,0);c.stroke();c.restore();}
  function background(c,w,h,mode,t){
    c.save();
    const root = mode==='root', flow=mode==='flow', signal=mode==='signal';
    c.fillStyle=root?'#293332':signal?'#102533':flow?'#231e30':'#122f3d';c.fillRect(0,0,w,h);
    const count=Math.min(100,Math.ceil(w*h/20000));
    for(let i=0;i<count;i++){
      const x=hash(i+11)*w,y=hash(i+477)*h,r=3+hash(i+919)*13;
      c.globalAlpha=root?.12:.055;
      circle(c,x,y,r,root?'#d5bd8d':flow?'#e4a5a5':'#97dce1');
      if(!root&&i%4===0){c.globalAlpha=.025;circle(c,x,y,r*3,'#c6e7ed');}
    }
    c.globalAlpha=1;
    if(root){
      c.strokeStyle='#a6a17d0d';c.lineWidth=1;
      const bands=Math.min(18,Math.ceil(h/70));for(let k=0;k<bands;k++){c.beginPath();c.moveTo(0,k*76+25);c.bezierCurveTo(w*.3,k*76-12,w*.65,k*76+65,w,k*76+20);c.stroke();}
    }else{
      c.strokeStyle=flow?'#f1a89c09':'#89becb08';c.lineWidth=1;
      for(let y=60;y<h;y+=110){c.beginPath();c.moveTo(0,y);c.bezierCurveTo(w*.3,y+20,w*.6,y-20,w,y);c.stroke();}
    }
    c.restore();
  }
  function macrophage(c,p,t){
    c.save();const r=p.r||34,a=p.angle||0,eng=p.engulf;
    let targetA=0,targetD=0,ep=0;
    if(eng){targetA=Math.atan2(eng.y-p.y,eng.x-p.x);targetD=Math.hypot(eng.x-p.x,eng.y-p.y);ep=clamp(eng.progress||0,0,1);}
    const nodes=[];
    for(let i=0;i<44;i++){
      const th=i/44*TAU;
      let rad=r*(1+.075*Math.sin(th*3+t*1.3)+.045*Math.cos(th*5-t*.9)+.06*Math.cos((th-a)*2));
      if(eng){let d=Math.atan2(Math.sin(th-targetA),Math.cos(th-targetA));const broad=Math.exp(-d*d/0.22);const reach=Math.max(0,targetD-r+12);rad+=reach*(.3+.7*ep)*broad;
        // Two raised lobes form the visible pseudopod arms around the fixed target.
        const spread=.33*(1-ep*.4),upper=Math.exp(-Math.pow((d-spread)/.16,2)),lower=Math.exp(-Math.pow((d+spread)/.16,2));
        rad+=r*.22*ep*(upper+lower);
      }
      nodes.push({x:p.x+Math.cos(th)*rad,y:p.y+Math.sin(th)*rad});
    }
    c.shadowColor='#75d6c629';c.shadowBlur=18;smooth(c,nodes);c.fillStyle=pal.phago;c.fill();c.shadowBlur=0;c.strokeStyle='#cfefe1';c.lineWidth=2.6;c.stroke();
    c.save();c.clip();
    // Cytoplasm detail is deliberately inside the membrane.
    for(let i=0;i<13;i++){const th=i*2.39996,dist=r*(.3+.45*hash(i+20));circle(c,p.x+Math.cos(th)*dist,p.y+Math.sin(th)*dist,1.6+hash(i)*1.6,'#2d868555');}
    mitochondrion(c,p.x+r*.42,p.y-r*.25,r*.15,.7);
    mitochondrion(c,p.x-r*.13,p.y+r*.5,r*.14,-.35);
    c.save();c.translate(p.x-r*.18,p.y-r*.03);c.rotate(a*.15-.35);c.beginPath();c.moveTo(-r*.24,-r*.37);c.bezierCurveTo(r*.2,-r*.42,r*.32,-r*.03,r*.1,r*.2);c.bezierCurveTo(-r*.06,r*.42,-r*.43,r*.2,-r*.26,r*.04);c.bezierCurveTo(-r*.08,-r*.08,-r*.4,-r*.17,-r*.24,-r*.37);c.fillStyle=pal.nucleus;c.fill();c.strokeStyle=pal.nucleusDark;c.lineWidth=1.5;c.stroke();circle(c,-r*.06,-r*.17,r*.07,pal.nucleusDark);c.restore();
    (p.vacuoles||[]).forEach((v,i)=>{const vx=Number.isFinite(v.x)?v.x:p.x+r*.35,vy=Number.isFinite(v.y)?v.y:p.y+r*.2,vr=v.r||r*.19;circle(c,vx,vy,vr,'#cceadd','#428e87',1.6);const fade=1-clamp(v.progress||0,0,1);c.globalAlpha=.75*fade;circle(c,vx,vy,vr*.4,'#b28b75');c.globalAlpha=1;});
    c.restore();
    // Membrane wraps the target without implying a projectile or a separate tentacle.
    if(eng&&ep>.1){const tr=7+(eng.r||5);c.strokeStyle='#c8f1df';c.lineWidth=3;c.beginPath();c.arc(eng.x,eng.y,tr,targetA+Math.PI-Math.PI*ep,targetA+Math.PI+Math.PI*ep);c.stroke();}
    c.restore();
  }
  function rbc(c,p,t){
    c.save();c.translate(p.x,p.y);const r=p.r||26,flex=clamp(p.flex||0,0,1);c.rotate((p.angle||0)+Math.sin(t*1.4)*.05);c.scale(1+flex*.44,1-flex*.48);
    c.shadowColor='#ed786c28';c.shadowBlur=14;c.beginPath();c.ellipse(0,0,r,r*.72,0,0,TAU);c.fillStyle=pal.coral;c.fill();c.shadowBlur=0;c.strokeStyle='#ffb9a2';c.lineWidth=2;c.stroke();
    c.beginPath();c.ellipse(0,-r*.04,r*.58,r*.36,0,0,TAU);c.fillStyle='#f8bb9d';c.fill();c.beginPath();c.ellipse(0,-r*.06,r*.38,r*.2,0,0,TAU);c.fillStyle='#e78f80';c.fill();
    c.beginPath();c.ellipse(0,r*.1,r*.76,r*.49,0,.2,Math.PI-.2);c.strokeStyle=pal.coralDark;c.globalAlpha=.45;c.lineWidth=3;c.stroke();c.globalAlpha=1;
    const n=Math.min(12,Math.max(0,Math.round(p.oxygen||0)));
    for(let i=0;i<n;i++){const a=i/12*TAU,rrr=r*.78;circle(c,Math.cos(a)*rrr,Math.sin(a)*rrr*.58,Math.max(1.8,r*.075),'#9fe0ff');}
    c.restore();
  }
  function bacterium(c,b,t){
    c.save();c.translate(b.x,b.y);c.rotate(b.angle||0);const r=b.r||9,rod=b.kind!=='coccus';
    c.strokeStyle=b.flash?'#fff7b5':'#88a596';c.fillStyle=b.flash?'#ffe1a3':'#b7cf98';c.lineWidth=1.7;
    if(rod){rr(c,-r*1.25,-r*.58,r*2.5,r*1.16,r*.58);c.fill();c.stroke();c.strokeStyle='#6d8c66';c.lineWidth=1.15;c.beginPath();c.moveTo(-r*.6,-r*.08);c.bezierCurveTo(-r*.3,-r*.35,r*.2,r*.35,r*.6,-r*.08);c.stroke();
      c.strokeStyle='#9db989';c.beginPath();c.moveTo(r*1.2,0);c.bezierCurveTo(r*1.75,r*.6+Math.sin(t*4)*r*.25,r*2.1,-r*.6,r*2.6,0);c.stroke();
    }else{circle(c,0,0,r,b.flash?'#ffe1a3':'#b7cf98','#88a596',1.6);circle(c,-r*.17,-r*.12,r*.29,'#859e70');}
    c.restore();
  }
  function tissueCell(c,o,t){
    c.save();const r=o.r||44,n=7,pts=[];for(let i=0;i<n;i++){const th=i/n*TAU;const s=1+.07*Math.sin(i*7+(o.x||0)*.02);pts.push({x:o.x+Math.cos(th)*r*s,y:o.y+Math.sin(th)*r*s});}
    smooth(c,pts);c.fillStyle=o.color||'#895a69';c.fill();c.strokeStyle='#d79ba655';c.lineWidth=3;c.stroke();circle(c,o.x-r*.08,o.y+r*.04,r*.28,'#615478','#bea4c066',1.5);circle(c,o.x-r*.12,o.y,r*.08,'#a894b4');
    for(let i=0;i<4;i++){const a=i*1.7;circle(c,o.x+Math.cos(a)*r*.62,o.y+Math.sin(a)*r*.62,2,'#d4a3ae55');}
    c.restore();
  }
  function pathLength(points){let total=0;const seg=[];for(let i=1;i<points.length;i++){const d=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);seg.push(d);total+=d;}return{total,seg};}
  function atDistance(points,dist,metrics){let left=dist;for(let i=1;i<points.length;i++){const d=metrics.seg[i-1];if(left<=d||i===points.length-1){const f=d?clamp(left/d,0,1):0,a=points[i-1],b=points[i];return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,angle:Math.atan2(b.y-a.y,b.x-a.x)};}left-=d;}return{...points[0],angle:0};}
  function neuron(c,path,t,opts={}){
    if(!path||path.length<2)return;c.save();const start=path[0],end=path[path.length-1],r=opts.radius||36,metrics=pathLength(path);
    c.lineCap='round';c.lineJoin='round';smooth(c,path,false);c.strokeStyle='#366685';c.lineWidth=19;c.stroke();c.strokeStyle='#80bdd4';c.lineWidth=12;c.stroke();c.strokeStyle='#acd5df';c.lineWidth=3;c.globalAlpha=.4;c.stroke();c.globalAlpha=1;
    if(opts.myelin!==false){for(let d=r+32;d<metrics.total-55;d+=67){const q=atDistance(path,d,metrics);c.save();c.translate(q.x,q.y);c.rotate(q.angle);rr(c,-23,-13,46,26,11);c.fillStyle='#9f9ac5';c.fill();c.strokeStyle='#d1c9e7';c.lineWidth=1.5;c.stroke();c.restore();}}
    // The soma and dendrites remain anchored while electrical changes are drawn by the game.
    c.strokeStyle='#8dc8dc';c.lineWidth=6;
    for(let i=0;i<5;i++){const a=Math.PI*.55+i*Math.PI*.26,x=start.x+Math.cos(a)*r*.8,y=start.y+Math.sin(a)*r*.8,x2=start.x+Math.cos(a)*r*1.8,y2=start.y+Math.sin(a)*r*1.8;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.lineTo(x2+Math.cos(a-.55)*r*.55,y2+Math.sin(a-.55)*r*.55);c.moveTo(x2,y2);c.lineTo(x2+Math.cos(a+.55)*r*.6,y2+Math.sin(a+.55)*r*.6);c.stroke();}
    const soma=[];for(let i=0;i<10;i++){const a=i/10*TAU;soma.push({x:start.x+Math.cos(a)*r*(i%2?1:.82),y:start.y+Math.sin(a)*r*(i%2?1:.82)});}smooth(c,soma);c.fillStyle='#8cbfd2';c.fill();c.strokeStyle='#c0e2e8';c.lineWidth=2;c.stroke();circle(c,start.x-r*.05,start.y,r*.37,'#8e8fbc','#5c658c',1.5);circle(c,start.x+r*.02,start.y-r*.05,r*.12,'#575d8d');
    const last=atDistance(path,metrics.total,metrics);c.strokeStyle='#8dc8dc';c.lineWidth=4;
    for(let i=-1;i<=1;i++){const a=last.angle+i*.65;const bx=end.x+Math.cos(a)*23,by=end.y+Math.sin(a)*23;c.beginPath();c.moveTo(end.x,end.y);c.lineTo(bx,by);c.stroke();circle(c,bx,by,6.5,'#c0a9cc','#e2c9db',1);}
    if(opts.labels){label(c,'Cell body',start.x,start.y+r+29);const mid=atDistance(path,metrics.total*.53,metrics);label(c,'Axon',mid.x,mid.y-30);label(c,'Axon endings',end.x,end.y+48);}
    c.restore();
  }
  function rootHair(c,points,t,opts={}){
    if(!points||!points.length)return;c.save();const base=points[0],width=opts.width||21;
    if(points.length>1){c.lineCap='round';c.lineJoin='round';smooth(c,points,false);c.strokeStyle='#718d57';c.lineWidth=width+7;c.stroke();c.strokeStyle='#d3dfad';c.lineWidth=width+3;c.stroke();c.strokeStyle='#e8eed0';c.lineWidth=width;c.stroke();
      // A continuous watery vacuole continues into the extension, not into branches.
      c.globalAlpha=.7;c.strokeStyle='#abcbd0';c.lineWidth=width*.52;c.stroke();c.globalAlpha=1;}
    const bw=70,bh=106;rr(c,base.x-bw*.73,base.y-bh/2,bw,bh,18);c.fillStyle='#d7e2b4';c.fill();c.strokeStyle='#718d57';c.lineWidth=4;c.stroke();rr(c,base.x-bw*.73+5,base.y-bh/2+5,bw-10,bh-10,14);c.strokeStyle='#b2c88d';c.lineWidth=1.2;c.stroke();
    rr(c,base.x-bw*.73+12,base.y-bh/2+12,bw-28,bh-24,13);c.fillStyle='#b5d1d4';c.fill();circle(c,base.x-4,base.y+bh*.22,9,'#a599c3','#796b9e',1.4);circle(c,base.x-2,base.y+bh*.21,3,'#766294');
    const tip=points[points.length-1];if(opts.growing){circle(c,tip.x,tip.y,width*.52,'#e6eec6');c.strokeStyle='#f3de9d';c.lineWidth=2;c.beginPath();c.arc(tip.x,tip.y,width*.7,0,TAU);c.stroke();}
    if(opts.labels){label(c,'Root cell',base.x-bw*.22,base.y-bh*.68);if(points.length>1){const mid=points[Math.floor(points.length*.6)];label(c,'Root hair · one cell extension',mid.x,mid.y+width+24);}}
    c.restore();
  }
  function molecule(c,x,y,type,t,r=7){
    c.save();const size=Math.max(3,r),key=String(type||'water').toLowerCase();
    if(key==='oxygen'||key==='o2'||key==='o₂'){
      c.shadowColor='#83d7ff50';c.shadowBlur=7;circle(c,x-size*.3,y,size*.58,'#81cbf0','#bcecff',1);circle(c,x+size*.3,y,size*.58,'#81cbf0','#bcecff',1);c.shadowBlur=0;if(size>=9)label(c,'O₂',x,y+size+9);
    }else if(key==='glucose'||key==='sugar'){
      const pts=[];for(let i=0;i<6;i++){const a=i/6*TAU;pts.push({x:x+Math.cos(a)*size,y:y+Math.sin(a)*size});}smooth(c,pts);c.fillStyle='#efcb78';c.fill();c.strokeStyle='#ffe6a5';c.lineWidth=1.3;c.stroke();if(size>=10)label(c,'Glucose',x,y+size+10);
    }else{
      circle(c,x,y,size*.65,'#83c5e7','#c6ebf5',1);circle(c,x-size*.55,y-size*.35,size*.3,'#d7eef1');circle(c,x+size*.55,y-size*.35,size*.3,'#d7eef1');if(size>=10)label(c,'H₂O',x,y+size+10);
    }c.restore();
  }
  function soilParticle(c,o){
    c.save();const x=o.x,y=o.y,r=o.r||28,n=8,pts=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=.84+hash(i+(o.seed||Math.round(x+y)))*.24;pts.push({x:x+Math.cos(a)*r*k,y:y+Math.sin(a)*r*k});}smooth(c,pts);c.fillStyle=o.color||'#76654d';c.fill();c.strokeStyle='#b69e7480';c.lineWidth=2;c.stroke();c.globalAlpha=.25;c.strokeStyle='#d7c19a';c.lineWidth=1;c.beginPath();c.moveTo(x-r*.35,y-r*.3);c.lineTo(x+r*.1,y-r*.42);c.lineTo(x+r*.36,y-r*.16);c.stroke();c.restore();
  }
  window.CellDraw={background,macrophage,rbc,bacterium,tissueCell,neuron,rootHair,molecule,soilParticle};
})();
