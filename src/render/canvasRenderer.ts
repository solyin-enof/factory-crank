import type { State } from '../game/simulation';
import { currentRecipe } from '../game/workshop';
import { unlocks } from '../ui/unlocks';

export function render(canvas: HTMLCanvasElement, s: State, reduced: boolean) {
 const c = canvas.getContext('2d')!;
 const width = 390, height = 300, ratio = devicePixelRatio || 1;
 if(canvas.width!==width*ratio||canvas.height!==height*ratio) { canvas.width=width*ratio; canvas.height=height*ratio; }
 c.setTransform(ratio,0,0,ratio,0,0); c.clearRect(0,0,width,height);
 const box=(x:number,y:number,w:number,h:number,color:string,r=4)=>{
  c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
 };
 const text=(value:string,x:number,y:number,size=10,color='#b2bfa3')=>{
  c.fillStyle=color;c.font=`600 ${size}px sans-serif`;c.textAlign='center';c.fillText(value,x,y);
 };
 const line=(points:number[],color:string,thickness:number)=>{
  c.strokeStyle=color;c.lineWidth=thickness;c.lineCap='round';c.beginPath();c.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.stroke();
 };
 const circle=(x:number,y:number,radius:number,color:string)=>{
  c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();
 };
 const recipe = currentRecipe(s);
 const poweredPress = s.workshop.beltDrive && s.automatic && s.plates >= recipe.plates;
 const pressPosition = poweredPress
  ? reduced ? 0 : .5 - .5 * Math.cos(s.pressProgress * Math.PI * 2)
  : s.press.position;
 c.strokeStyle='#334a39';c.lineWidth=1;
 for(let x=15;x<width;x+=24){c.beginPath();c.moveTo(x,25);c.lineTo(x,280);c.stroke();}
 for(let y=30;y<280;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(width,y);c.stroke();}
 box(21,209,349,24,'#14281e',12);box(26,211,339,5,'#7e8865');
 for(let i=0;i<17;i++)box(30+i*20+(reduced?0:s.furnace.angle*4)%20,222,10,3,'#4c6347');
 const shown = unlocks(s);
 if(s.workshop.signalMast){
  // A raised mast stays readable above the installed machines.
  box(369,82,5,122,'#a3ad7c',2);box(360,203,23,7,'#647b52',2);
  line([371,101,354,119,371,119],'#697d57',3);
  box(363,73,17,14,'#263e2c',4);
  const glow=reduced?.8:.7+Math.sin(s.elapsed*2)*.2;
  c.save();c.globalAlpha=glow*.2;circle(371,80,16,'#f5d38a');c.restore();
  circle(371,80,5,'#f5d38a');line([371,69,371,64,379,60],'#b6be8c',2);
 }
 c.save();if(!shown.press)c.translate(52,0);
 if(s.workshop.oreHoist){
  // The hoist lifts ore from the seam at the left edge into the existing hopper.
  box(31,43,7,86,'#879779',2);box(28,125,17,7,'#526a49',2);
  line([35,47,84,47,84,55],'#c5b57e',5);
  line([35,68,56,47],'#75896a',3);
  const lift=reduced?0:(1-Math.cos(s.supplyTime*Math.PI/6))*10;
  line([78,48,78,61+lift],'#d0bd88',1.5);
  box(68,60+lift,20,11,'#7e8c69',2);
  box(72,57+lift,6,5,'#acac91',1);box(80,58+lift,5,4,'#939686',1);
  circle(35,51,6,'#bcb17e');circle(35,51,2,'#304930');
  text('ORE HOIST',68,36,7,'#d4c898');
 }
 // Gravity hopper feeds ore into the hot chamber. It is not the press.
 box(51,62,58,38,'#9eaa82');box(57,67,46,21,'#394b36');
 for(let i=0;i<Math.min(s.ore,7);i++)box(62+i%4*10,71+Math.floor(i/4)*9,8,7,'#939686',2);
 c.fillStyle='#7d8b67';c.beginPath();c.moveTo(51,98);c.lineTo(109,98);c.lineTo(88,124);c.lineTo(72,124);c.fill();
 box(73,121,16,20,'#4c6143');
 box(130,50,23,60,'#647354');box(134,50,4,50,'#8b9571');box(125,47,33,8,'#a1a982');
 if(s.workshop.thermalJacket){
  box(57,122,117,89,'#b9a574',9);box(62,127,107,79,'#4f6547',7);
  for(const x of [60,170])for(const y of [132,152,177,201])circle(x,y,1.5,'#e1ca8e');
 }
 box(62,131,107,79,'#172d21',9);box(66,126,99,72,'#829269',7);box(71,132,89,58,'#576e49');box(83,142,62,45,'#283c28',7);
 const heat=Math.max(.12,(s.temperature-20)/65);
 box(88,147,52,35,`rgba(255,${Math.round(140-heat*50)},50,${heat})`,5);
 if(s.temperature>30){
  c.fillStyle='#f4c26b';for(let i=0;i<3;i++){const rise=reduced?0:Math.sin(s.furnace.angle*2+i)*4;c.beginPath();c.moveTo(94+i*15,177);c.quadraticCurveTo(88+i*15,165,99+i*15,157+rise);c.quadraticCurveTo(107+i*15,173,94+i*15,177);c.fill();}
 }
 text('FURNACE',115,140,8,'#e2dbad');
 if(!s.workshop.crawler)text('HEAT MELTS ORE',115,250,9);
 box(72,194,88*s.furnaceProgress,4,'#f4be6b');
 // Crank axle → belt → fan → duct entering the fire.
 line([158,182,187,150,207,154,168,194],'#0f251a',5);
 line([195,176,172,176,172,165,145,165],'#879b69',10);
 c.save();c.translate(195,159);c.fillStyle='#1a3023';c.strokeStyle='#a8b77d';c.lineWidth=4;c.beginPath();c.arc(0,0,22,0,Math.PI*2);c.fill();c.stroke();
 c.rotate(reduced?0:s.furnace.angle*2);c.fillStyle='#d1c18c';
 for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.ellipse(0,-10,5,10,.6,0,Math.PI*2);c.fill();}c.restore();
 text('BLOWER',195,197,8,'#d5cf99');
 if(s.furnace.speed>1){for(let i=0;i<3;i++){const x=166-(reduced?i*5:(s.furnace.angle*5+i*6)%20);line([x+3,162,x,165,x+3,168],'#e7cf8b',1.5);}}
 if(s.automatic){box(221,149,25,28,'#cead61',5);text('M',234,168,13,'#233e2b');line([221,163,215,163],'#d4b56c',3);}
 text('ORE HOPPER',79,55,8);
 box(20,110,8,76,'#182e22');box(20,134,8,34,'#7b9862');
 box(20,186-(s.temperature-20)/90*76,8,3,'#f5c278');text(`${Math.round(s.temperature)}°`,24,201,9,'#f1c27a');
 c.restore();
 if(shown.press){
  if(s.workshop.beltDrive){
   // The motor's second belt reaches the press axle; it stops when stock runs out.
   line([234,151,314,105,326,126,242,175,234,151],'#10271c',8);
   line([234,151,314,105,326,126,242,175,234,151],'#a29665',2);
   circle(320,116,13,'#243c29');circle(320,116,8,'#b8ac76');
   if(poweredPress){
    const offset=reduced?0:s.pressProgress;
    for(let i=0;i<5;i++){
     const t=(i/5+offset)%1;
     const x=234+t*80,y=151-t*46;
     line([x,y,x+3,y-2],'#e0c17e',3);
    }
   }
  }
  box(253,87,67,13,'#9da77a');box(258,100,9,92,'#74875d');box(306,100,9,92,'#74875d');
  box(272,103,29,35,'#526d48');const stroke=pressPosition*25;
  box(275,117+stroke,22,30,'#bec49a');box(267,142+stroke,38,8,'#a9b987');
  if(s.plates>=recipe.plates)for(let i=0;i<recipe.plates;i++)box(272,177-i*6,28,4,i%2?'#d6dcc2':'#b7cba3');
  box(260,183,52,8,'#8e9b70');box(249,193,78,17,'#657e52');box(253,197,70*s.pressProgress,4,'#e4bd72');
  line([286,127+stroke,314,117],'#d9bb79',4);
  c.save();c.translate(314,117);c.rotate(pressPosition*85*Math.PI/180);
  line([0,0,31,-37],'#d9bb79',6);box(20,-44,23,12,'#f3ca7e',6);c.restore();
  text(`${recipe.name.toUpperCase()} DIE`,285,78,7,'#d4c898');
  if(!s.workshop.crawler)text('FORCE SHAPES METAL',290,250,9);
  if(s.workshop.toolBench){
   box(334,181,42,6,'#9da77a',2);box(337,187,5,22,'#687e55',1);box(369,187,5,22,'#687e55',1);
   box(341,177,9,5,'#586e4b',1);box(340,169,4,9,'#a4b28b',1);
   text('TOOL BENCH',355,141,6,'#b9c5a5');
  }
  const stock=s.pressRecipe==='spring'?s.springs:s.pressRecipe==='frame'?s.frames:s.gears;
  c.save();c.translate(s.workshop.toolBench?358:349,s.workshop.toolBench?168:203);
  c.globalAlpha=stock>0?1:.25;
  if(s.pressRecipe==='spring'){
   line([-10,12,-10,8,9,3,-9,-2,9,-7,-9,-12,10,-16,10,-20],'#d3bd7e',3);
  }else if(s.pressRecipe==='frame'){
   line([-12,-13,11,-13,11,12,-12,12,-12,-13],'#d3bd7e',5);
   line([-8,-8,7,7],'#a49669',2);
  }else{
   c.fillStyle='#d3bd7e';for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillRect(-3,-12,6,8);}
   circle(0,0,9,'#d3bd7e');circle(0,0,4,'#30452d');
  }
  c.restore();
 }
 if(s.firstPlate!==null){const x=shown.press?180:235;box(x,202,19,7,'#bbc9ae',2);box(x+2,202,15,2,'#e0e6cb',1);}
 if(s.workshop.crawler){
  const hauling=s.crawlerJob==='haul';
  text(hauling?'CRAWLER / HAULING ORE':'CRAWLER / TENDING FURNACE',195,241,8,'#d4c898');
  const travel=reduced?.5:(Math.sin(s.elapsed*.45)+1)/2;
  const x=hauling?55+travel*270:103+travel*112;
  c.save();c.translate(x,259);c.scale(reduced||Math.cos(s.elapsed*.45)>=0?1:-1,1);
  box(-23,0,46,9,'#13291e',5);box(-20,1,40,5,'#6a7e54',3);
  for(let i=0;i<6;i++){
   const tread=-17+(i*6+(reduced?0:s.elapsed*12)%6);
   line([tread,3,tread+2,3],'#b5ba8a',2);
  }
  box(-20,-7,40,9,'#b6a36c',3);box(7,-11,12,8,'#7d9566',2);
  box(10,-10,6,4,'#263f2b',1);
  if(hauling){
   for(let i=0;i<3;i++)box(-17+i*7,-12-i%2*2,6,6,'#a1a28c',1);
  }else{
   box(-16,-12,17,8,'#7f9465',2);line([-13,-11,-10,-6,-7,-11,-4,-6],'#d3c28a',1.5);
  }
  circle(-14,4,3,'#30462d');circle(14,4,3,'#30462d');
  c.restore();
 }
}
