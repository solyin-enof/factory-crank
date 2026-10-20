import type { State } from '../game/simulation';
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
 c.strokeStyle='#334a39';c.lineWidth=1;
 for(let x=15;x<width;x+=24){c.beginPath();c.moveTo(x,25);c.lineTo(x,280);c.stroke();}
 for(let y=30;y<280;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(width,y);c.stroke();}
 box(21,209,349,24,'#14281e',12);box(26,211,339,5,'#7e8865');
 for(let i=0;i<17;i++)box(30+i*20+(reduced?0:s.furnace.angle*4)%20,222,10,3,'#4c6347');
 const shown = unlocks(s);
 c.save();if(!shown.press)c.translate(52,0);
 // Gravity hopper feeds ore into the hot chamber. It is not the press.
 box(51,62,58,38,'#9eaa82');box(57,67,46,21,'#394b36');
 for(let i=0;i<Math.min(s.ore,7);i++)box(62+i%4*10,71+Math.floor(i/4)*9,8,7,'#939686',2);
 c.fillStyle='#7d8b67';c.beginPath();c.moveTo(51,98);c.lineTo(109,98);c.lineTo(88,124);c.lineTo(72,124);c.fill();
 box(73,121,16,20,'#4c6143');
 box(130,50,23,60,'#647354');box(134,50,4,50,'#8b9571');box(125,47,33,8,'#a1a982');
 box(62,131,107,79,'#172d21',9);box(66,126,99,72,'#829269',7);box(71,132,89,58,'#576e49');box(83,142,62,45,'#283c28',7);
 const heat=Math.max(.12,(s.temperature-20)/65);
 box(88,147,52,35,`rgba(255,${Math.round(140-heat*50)},50,${heat})`,5);
 if(s.temperature>30){
  c.fillStyle='#f4c26b';for(let i=0;i<3;i++){const rise=reduced?0:Math.sin(s.furnace.angle*2+i)*4;c.beginPath();c.moveTo(94+i*15,177);c.quadraticCurveTo(88+i*15,165,99+i*15,157+rise);c.quadraticCurveTo(107+i*15,173,94+i*15,177);c.fill();}
 }
 text('FURNACE',115,140,8,'#e2dbad');text('HEAT MELTS ORE',115,250,9);
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
  box(253,87,67,13,'#9da77a');box(258,100,9,92,'#74875d');box(306,100,9,92,'#74875d');
  box(272,103,29,35,'#526d48');const stroke=s.press.position*25;
  box(275,117+stroke,22,30,'#bec49a');box(267,142+stroke,38,8,'#a9b987');
  if(s.plates>=2){box(272,171,28,4,'#d6dcc2');box(272,177,28,4,'#b7cba3');}
  box(260,183,52,8,'#8e9b70');box(249,193,78,17,'#657e52');box(253,197,70*s.pressProgress,4,'#e4bd72');
  line([286,127+stroke,314,117],'#d9bb79',4);
  c.save();c.translate(314,117);c.rotate(s.press.position*85*Math.PI/180);
  line([0,0,31,-37],'#d9bb79',6);box(20,-44,23,12,'#f3ca7e',6);c.restore();
  text('FORCE SHAPES METAL',290,250,9);
  if(s.gears){c.save();c.translate(349,203);c.fillStyle='#d3bd7e';for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillRect(-3,-12,6,8);}c.beginPath();c.arc(0,0,9,0,7);c.fill();c.fillStyle='#30452d';c.beginPath();c.arc(0,0,4,0,7);c.fill();c.restore();}
 }
 if(s.firstPlate!==null){const x=shown.press?180:235;box(x,202,19,7,'#bbc9ae',2);box(x+2,202,15,2,'#e0e6cb',1);}
}
