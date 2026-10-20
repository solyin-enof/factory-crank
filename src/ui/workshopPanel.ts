import { PROJECTS, buildProject, projectStatus, setCrawlerJob, type ProjectId } from '../game/workshop';
import type { State } from '../game/types';

const symbols: Record<ProjectId,string> = {oreHoist:'⛏',toolBench:'⌑',beltDrive:'⚙',crawler:'▰',thermalJacket:'♨',signalMast:'⌁'};
const stock = (s:State,key:string) => key==='plates'?s.plates+s.reserve:s[key as 'gears'|'springs'|'frames'];
export class WorkshopPanel {
 private page = 0;
 private previousKey = ''; 
 private trackedId: ProjectId|null = null;
 private cards = new Map<ProjectId,HTMLElement>();
 private stockLine: HTMLElement;
 private message: HTMLElement;
 private installed: HTMLElement;
 private jobs: HTMLElement;
 private next: HTMLButtonElement;
 readonly dialog: HTMLDialogElement;
 constructor(private getState:()=>State, private changed:()=>void) {
  this.dialog=document.getElementById('workshop') as HTMLDialogElement;
  this.stockLine=this.dialog.querySelector('#workshop-stock')!;
  this.message=this.dialog.querySelector('#workshop-message')!;
  this.installed=this.dialog.querySelector('#installed-projects')!;
  this.jobs=this.dialog.querySelector('#crawler-jobs')!;
  this.next=this.dialog.querySelector('#more-projects')!;
  try {const saved=localStorage.getItem('crank-tracked-project');if(PROJECTS.some(p=>p.id===saved))this.trackedId=saved as ProjectId;}catch{/* Optional UI preference. */}
  const list=this.dialog.querySelector('#project-list')!;
  for(const project of PROJECTS) {
   const card=document.createElement('article'); card.className='project-card';card.dataset.project=project.id;
   const heading=document.createElement('h3');heading.textContent=`${symbols[project.id]} ${project.name}`;
   const description=document.createElement('p');description.textContent=project.description;
   const cost=document.createElement('p');cost.className='project-cost';
   const shortage=document.createElement('p');shortage.className='project-shortage';
   const actions=document.createElement('div');actions.className='project-actions';
   const track=document.createElement('button');track.className='track-project';track.textContent='Plan this';track.setAttribute('aria-label',`Plan ${project.name}`);
   track.onclick=()=>{this.trackedId=project.id;try{localStorage.setItem('crank-tracked-project',project.id);}catch{}this.message.textContent=`Next up: ${project.name}. You can change your plan anytime.`;this.update(this.getState());};
   const build=document.createElement('button');build.className='build-project';build.textContent='Build';build.setAttribute('aria-label',`Build ${project.name}`);
   build.onclick=()=>{const s=this.getState();if(buildProject(s,project.id)){this.message.textContent=`${project.name} built. ${project.description}`;this.changed();this.update(s);}};
   actions.append(track,build);card.append(heading,description,cost,shortage,actions);list.append(card);this.cards.set(project.id,card);
  }
  this.dialog.querySelector('#close-workshop')!.addEventListener('click',()=>this.dialog.close());
  this.next.onclick=()=>{this.page+=1;this.update(this.getState());};
  for(const job of ['haul','tend'] as const)this.dialog.querySelector(`#crawler-${job}`)!.addEventListener('click',()=>{
   if(setCrawlerJob(this.getState(),job)){this.changed();this.update(this.getState());}
  });
 }
 open() {this.page=0;this.message.textContent='';this.update(this.getState());this.dialog.showModal();}
 get tracked() {return this.trackedId;}
 update(s:State) {
  const key=JSON.stringify([s.gears,s.plates,s.reserve,s.springs,s.frames,s.gearsMade,s.springsMade,s.framesMade,s.automatic,s.workshop,s.crawlerJob,this.page,this.trackedId]);
  if(key===this.previousKey)return;this.previousKey=key;
  const tracked=PROJECTS.find(p=>p.id===this.trackedId);
  const trigger=document.getElementById('workshop-launch')!;
  const pending=PROJECTS.filter(p=>{const status=projectStatus(s,p.id);return status.unlocked&&!status.built;});
  const ready=pending.filter(p=>projectStatus(s,p.id).canBuild).length;
  trigger.textContent=tracked&&!s.workshop[tracked.id]?`Workshop · ${tracked.name} ↗`:`Workshop${ready?` · ${ready} ready`:''} ↗`;
  this.stockLine.textContent=`${s.gears} gears · ${s.plates+s.reserve} plates${s.workshop.toolBench?` · ${s.springs} springs · ${s.frames} frames`:''}`;
  const pages=Math.max(1,Math.ceil(pending.length/3));this.page%=pages;
  const visible=pending.slice(this.page*3,this.page*3+3);
  for(const project of PROJECTS) {
   const card=this.cards.get(project.id)!;card.hidden=!visible.includes(project);
   const status=projectStatus(s,project.id);
   card.classList.toggle('ready',status.canBuild);
   card.querySelector('.project-cost')!.textContent=Object.entries(project.costs).map(([key,n])=>`${stock(s,key)}/${n} ${key}`).join(' + ');
   card.querySelector('.project-shortage')!.textContent=status.canBuild?'Ready to build':`Need ${status.missing.join(' + ')}`;
   (card.querySelector('.build-project') as HTMLButtonElement).disabled=!status.canBuild;
   const track=card.querySelector('.track-project') as HTMLButtonElement;track.textContent=this.trackedId===project.id?'Planned':'Plan this';track.setAttribute('aria-pressed',String(this.trackedId===project.id));
  }
  this.next.hidden=pages<=1;this.next.textContent=`More projects · ${this.page+1}/${pages} ↗`;
  this.dialog.querySelector('#no-projects')!.toggleAttribute('hidden',pending.length>0);
  this.installed.textContent=PROJECTS.filter(p=>s.workshop[p.id]).map(p=>p.name).join(' · ')||'Your first build changes what you can do.';
  this.jobs.hidden=!s.workshop.crawler;
  for(const job of ['haul','tend'] as const) {const button=this.dialog.querySelector(`#crawler-${job}`)!;button.classList.toggle('active',s.crawlerJob===job);button.setAttribute('aria-pressed',String(s.crawlerJob===job));}
  this.dialog.querySelector('#crawler-effect')!.textContent=s.crawlerJob==='haul'?`The crawler brings ${s.workshop.signalMast?3:2} extra ore per delivery.`:`The crawler helps feed the fire: ${s.workshop.signalMast?'75':'50'}% faster smelting.`;
 }
}
