export type Material = 'plate'|'gear'|'spring'|'frame';
type Item = {kind:Material;age:number};
/** Short-lived completion objects. Visual-only; simulation owns every resource. */
export class MaterialTrail {
 private items:Item[]=[];
 emit(kind:Material) {this.items.push({kind,age:0});if(this.items.length>12)this.items.shift();}
 clear() {this.items=[];}
 update(dt:number) {this.items=this.items.filter(item=>(item.age+=dt)<2.2);}
 draw(canvas:HTMLCanvasElement,reduced:boolean) {
  const c=canvas.getContext('2d')!;
  for(const item of this.items){
   const x=(item.kind==='plate'?172:323)+(reduced?0:item.age*18),y=203-(reduced?0:Math.sin(Math.min(1,item.age/.35)*Math.PI)*8);
   c.save();c.translate(x,y);c.globalAlpha=Math.min(1,(2.2-item.age)*2);c.fillStyle='#efd28d';c.strokeStyle='#efd28d';c.lineWidth=2;
   if(item.kind==='plate'){c.fillRect(-8,-4,16,6);c.fillStyle='#fbf0cb';c.fillRect(-6,-4,12,2);}
   else if(item.kind==='gear'){for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillRect(-2,-9,4,6);}c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fill();c.fillStyle='#30452d';c.beginPath();c.arc(0,0,2.5,0,Math.PI*2);c.fill();}
   else if(item.kind==='frame'){c.strokeRect(-7,-7,14,14);}
   else{c.beginPath();c.moveTo(-9,5);for(let i=0;i<5;i++)c.lineTo(-9+i*4,i%2?-6:5);c.lineTo(10,-5);c.stroke();}
   c.restore();
  }
 }
}
