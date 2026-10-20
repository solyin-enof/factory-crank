import type { State } from '../game/simulation';
export function render(canvas: HTMLCanvasElement, s: State, reduced: boolean) {
 const c = canvas.getContext('2d')!; const w=390,h=300;
 const ratio=devicePixelRatio||1;if(canvas.width!==w*ratio||canvas.height!==h*ratio){canvas.width=w*ratio;canvas.height=h*ratio;}c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,w,h);
 const box=(x:number,y:number,a:number,b:number,color:string,r=4)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,a,b,r);c.fill();};
 const text=(t:string,x:number,y:number,size=10,color='#b2bfa3')=>{c.fillStyle=color;c.font=`600 ${size}px monospace`;c.textAlign='center';c.fillText(t,x,y);};
 c.strokeStyle='#334a39';c.lineWidth=1;for(let x=15;x<w;x+=24){c.beginPath();c.moveTo(x,25);c.lineTo(x,280);c.stroke();}for(let y=30;y<280;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
 box(15,250,360,3,'#506142');box(15,254,360,22,'#203328');
 // Conveyor and traveling material: advances with actual wheel motion.
 box(21,205,349,24,'#14281e',12);box(26,208,339,5,'#7e8865');
 for(let i=0;i<17;i++){let x=30+i*20+(reduced?0:s.furnace.angle*4)%20;box(x,216,10,3,'#4c6347');}
 const furnaceX=110,pressX=281;
 box(51,64,58,39,'#9eaa82');box(57,69,46,21,'#394b36');for(let i=0;i<7;i++)box(62+i%4*10,73+Math.floor(i/4)*9,8,7,'#8c9080',2);
 c.fillStyle='#7d8b67';c.beginPath();c.moveTo(51,100);c.lineTo(109,100);c.lineTo(88,126);c.lineTo(72,126);c.fill();
 box(73,123,16,20,'#4c6143');box(130,52,23,57,'#647354');box(134,52,4,50,'#8b9571');box(125,49,33,8,'#a1a982');
 box(62,132,107,78,'#172d21',9);box(66,127,99,72,'#829269',7);box(71,133,89,58,'#576e49');box(83,143,62,45,'#283c28',7);
 const glow=Math.max(.15,(s.temperature-20)/65);box(88,148,52,35,`rgba(255,${Math.round(140-glow*50)},50,${glow})`,5);
 text('FE  /  01',115,140,8,'#e2dbad');text('SMELTER',115,245,9);
 box(72,193,88*s.furnaceProgress,4,'#f4be6b');
 box(244,92,77,13,'#9da77a');box(250,105,9,87,'#74875d');box(307,105,9,87,'#74875d');box(265,108,35,34,'#526d48');const stroke=reduced?0:Math.sin(s.press.angle)*5;box(270,137+stroke,25,25,'#bec49a');box(256,174,54,13,'#8e9b70');box(240,190,87,18,'#657e52');box(244,194,78*s.pressProgress,4,'#e4bd72');text('GEAR PRESS',284,245,9);
 function gear(x:number,y:number){c.save();c.translate(x,y);c.rotate(reduced?0:s.press.angle);c.fillStyle='#d3bd7e';for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillRect(-3,-12,6,7);}c.beginPath();c.arc(0,0,9,0,7);c.fill();c.fillStyle='#30452d';c.beginPath();c.arc(0,0,4,0,7);c.fill();c.restore();}
 gear(283,176);if(s.gears)gear(349,199);
 if(s.firstPlate!==null){let x=170+(reduced?25:(s.elapsed*16)%62);box(x,199,19,7,'#bbc9ae',2);box(x+2,199,15,2,'#e0e6cb',1);}
 if(s.automatic){box(167,155,35,32,'#cead61',6);box(173,160,24,20,'#3b5540');text('M',185,174,13,'#edcd87');c.strokeStyle='#d4b56c';c.lineWidth=3;c.beginPath();c.moveTo(169,169);c.lineTo(148,180);c.stroke();}
 text('ORE HOPPER',79,58,8);
 // Temperature gauge with explicit operating band.
 box(20,110,8,76,'#182e22');box(20,134,8,34,'#7b9862');box(20,186-(s.temperature-20)/90*76,8,3,'#f5c278');text(`${Math.round(s.temperature)}°`,24,201,9,'#f1c27a');
}
