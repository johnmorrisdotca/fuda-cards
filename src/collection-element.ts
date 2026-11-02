import {collectionViews, parseCollection, randomDrawIndex, movePage, type CollectionCard, type CollectionView} from './collection.js';
import {zoomView, type ZoomView} from './zoom.js';
const STYLE=`<style>
:host{display:block;color:#f6f4f1;font:16px system-ui}*{box-sizing:border-box}.shell{background:#20212c;padding:1rem;border-radius:1rem}header,.nav{display:flex;gap:.6rem;align-items:center;justify-content:center;flex-wrap:wrap}button,select{font:inherit;color:inherit;background:#353747;border:1px solid #79798c;border-radius:.5rem;padding:.55rem .8rem;cursor:pointer}button:focus-visible,select:focus-visible{outline:3px solid #ffd27e}
.stage{position:relative;height:var(--fuda-stage-height,clamp(300px,calc(100svh - 440px),620px));overflow:hidden;border-radius:1rem;margin:1rem 0 .5rem;background:radial-gradient(ellipse,#52495a,#222330 68%)}.stage:focus-visible{outline:3px solid #ffd27e;outline-offset:2px}.v{position:absolute;inset:0}kazoku-view-controls{display:block;margin-bottom:.75rem}
.card{padding:0;border:0;background:transparent;line-height:0}.card img{width:100%;height:100%;object-fit:contain;border-radius:5%;box-shadow:0 6px 16px #0009}
.stack .card{position:absolute;width:min(64vw,300px);height:86%;top:7%;left:50%;transition:transform .25s}
.grid{display:grid;grid-template-columns:repeat(var(--columns,3),minmax(0,1fr));gap:1rem;padding:1rem;align-content:start}.grid .card{height:clamp(130px,24vw,220px)}
.v.case{perspective:800px}.stage.case{background:linear-gradient(#615346,#222)}.case .card{transform:perspective(600px) rotateX(-15deg)}
.wall{display:flex;gap:1rem;align-items:center;padding:1rem}.wall .card{height:90%;flex:0 0 190px}
.story{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1rem}.story .card{width:min(75%,300px);flex:0 0 90%}
.plane{position:absolute;left:0;top:0;display:grid;gap:18px;grid-template-columns:repeat(var(--atlas-cols,5),140px);padding:30px}.plane .card{height:195px}
.stage.jukebox{border:12px solid #aa7147;box-shadow:inset 0 0 20px #fbb579}.stage.spotlight{background:radial-gradient(ellipse at center,#e5ce99,#454054 40%,#171822 78%)}
dialog{color:white;background:#242632;border:1px solid #777;border-radius:1rem;text-align:center;max-width:95vw;max-height:95vh}dialog::backdrop{background:#000c}.detail{display:block;height:min(70vh,600px);max-width:80vw;object-fit:contain;margin:1rem auto}.empty{text-align:center;padding:3rem}
@media(max-width:500px){.grid{grid-template-columns:repeat(min(2,var(--columns,3)),minmax(0,1fr))}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>`;
const SHELL=`<section class="shell"><header><label>Display <select aria-label="Collection display"></select></label></header><div class="stage" tabindex="0" role="group" aria-label="Collection"><div class="v"></div></div><div class="nav"><button class="prev">← Previous</button><span class="count" aria-live="polite"></span><button class="next">Next →</button><label class="draw-filter" hidden>Filter cards <input type="search" aria-label="Filter cards for random draw"></label><button class="draw" hidden>Draw a card</button></div><dialog aria-label="Card detail"></dialog></section>`;
const pages: CollectionView[]=['binder','case'];
const scrolling: CollectionView[]=['wall','story','atlas'];
export class FudaCollection extends HTMLElement {
  private root = this.attachShadow({mode:'open'}); private data: CollectionCard[]=[]; private index=0; private pageSize=9; private selected: CollectionCard | null=null; private back=false; private drawFilter=""; private zoom: ZoomView | null=null;
  static get observedAttributes(){return ['view','page-size','columns']}
  set cards(value: CollectionCard[]){this.data=parseCollection(value);this.index=Math.min(this.index,Math.max(0,this.data.length-1));this.render()}
  get cards(){return this.data.map(c=>({...c, ...(c.metadata ? {metadata:{...c.metadata}} : {})}))}
  connectedCallback(){this.render()}
  attributeChangedCallback(name: string){this.pageSize=Math.min(100,Math.max(1,Math.floor(Number(this.getAttribute('page-size'))||9)));this.index=0;this.render(name==='view')}
  private get currentView(): CollectionView {let v=this.getAttribute('view');return collectionViews.some(x=>x.id===v)?v as CollectionView:'deck'}
  private get stacked(){return ![...pages,...scrolling].includes(this.currentView)}
  private q<T extends HTMLElement=HTMLElement>(selector: string){return this.root.querySelector(selector) as T}
  private move(n:number){if(!this.data.length)return;if(pages.includes(this.currentView)){this.index=movePage(this.index,this.data.length,this.pageSize,n)}else{this.index=(this.index+n+this.data.length)%this.data.length}this.render()}
  private image(c:CollectionCard):HTMLButtonElement {let button=document.createElement('button');button.className='card';button.setAttribute('aria-label',`Inspect ${c.name}`);let img=document.createElement('img');img.src=c.image;img.alt=c.name;img.loading='lazy';img.onerror=()=>{img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`))};button.append(img);button.onclick=()=>this.open(c);return button}
  private open(c:CollectionCard){this.selected=c;this.back=false;this.renderDialog()}
  private renderDialog(){let dlg=this.q<HTMLDialogElement>('dialog');dlg.replaceChildren();let close=document.createElement('button');close.textContent='Close';close.onclick=()=>dlg.close();dlg.append(close);if(this.selected){let img=document.createElement('img');img.className='detail';img.src=this.back&&this.selected.backImage?this.selected.backImage:this.selected.image;img.alt=`${this.selected.name}, ${this.back?'back':'front'}`;let label=document.createElement('p');label.textContent=this.selected.name;dlg.append(img,label);if(this.selected.backImage){let flip=document.createElement('button');flip.textContent=this.back?'Show front':'Show back';flip.onclick=()=>{this.back=!this.back;this.renderDialog()};dlg.append(flip)}}if(!dlg.open)dlg.showModal()}
  private canDraw(){const query=this.drawFilter.trim().toLocaleLowerCase();return this.data.some(c=>c.name.toLocaleLowerCase().includes(query))}
  private build(){
    if(this.zoom)return;
    this.root.innerHTML=STYLE+SHELL;
    const select=this.q<HTMLSelectElement>('select');collectionViews.forEach(v=>select.add(new Option(v.label,v.id)));select.onchange=()=>this.setAttribute('view',select.value);
    this.q('.prev').onclick=()=>this.move(-1);this.q('.next').onclick=()=>this.move(1);
    const input=this.q<HTMLInputElement>('.draw-filter input'),draw=this.q<HTMLButtonElement>('.draw');
    input.oninput=()=>{this.drawFilter=input.value;draw.disabled=!this.canDraw()};
    draw.onclick=()=>{const next=randomDrawIndex(this.data,this.index,this.drawFilter);if(next===null)return;this.index=next;this.render()};
    const stage=this.q('.stage');
    this.zoom=zoomView(stage,this.q('.v'),{address:this.hasAttribute('address')});
    let startX=0;stage.addEventListener('touchstart',e=>{if(e.touches.length===1)startX=e.touches[0].clientX},{passive:true});
    stage.addEventListener('touchend',e=>{if(!this.stacked||this.zoom!.zoomed()||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45){if(e.cancelable)e.preventDefault();this.move(dx<0?1:-1)}},{passive:false});
    stage.addEventListener('keydown',(e:KeyboardEvent)=>{if(!this.stacked||(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'))return;e.preventDefault();this.move(e.key==='ArrowRight'?1:-1);this.q('.stack .card:last-child')?.focus()});
  }
  private render(reset=false){
    if(!this.isConnected)return;this.build();
    let view=this.currentView,stage=this.q('.stage'),v=this.q('.v');
    this.q<HTMLSelectElement>('select').value=view;
    this.q('.count').textContent=this.data.length?(pages.includes(view)?`Page ${Math.floor(this.index/this.pageSize)+1} / ${Math.ceil(this.data.length/this.pageSize)}`:`${this.index+1} / ${this.data.length}`):'No cards';
    for(const selector of ['.prev','.next'])this.q<HTMLButtonElement>(selector).disabled=!this.data.length;
    const random=view==='random';this.q('.draw-filter').hidden=!random;this.q('.draw').hidden=!random;this.q<HTMLInputElement>('.draw-filter input').value=this.drawFilter;this.q<HTMLButtonElement>('.draw').disabled=!this.canDraw();
    stage.className=`stage ${view}`;v.className='v';v.replaceChildren();v.style.removeProperty('--columns');this.zoom!.minOpen=scrolling.includes(view)?.5:0;
    if(!this.data.length){v.innerHTML='<p class="empty">No cards in this collection.</p>'}
    else if(pages.includes(view)){v.classList.add('grid',view);const columns=Math.min(10,Math.max(1,Math.floor(Number(this.getAttribute('columns'))||3)));v.style.setProperty('--columns',String(columns));let start=Math.floor(this.index/this.pageSize)*this.pageSize;this.data.slice(start,start+this.pageSize).forEach(c=>v.append(this.image(c)))}
    else if(view==='wall'||view==='story'){v.classList.add(view);this.data.forEach(c=>v.append(this.image(c)))}
    else if(view==='atlas'){v.classList.add('atlas');let plane=document.createElement('div');plane.className='plane';this.data.forEach(c=>plane.append(this.image(c)));v.append(plane)}
    else{v.classList.add('stack',view);let count=Math.min(3,this.data.length);for(let d=count-1;d>=0;d--){let c=this.data[(this.index+d)%this.data.length],el=this.image(c);let offset=view==='rolodex'?d*42:view==='spotlight'?d*70:d*14;let rotation=view==='rolodex'?d*12:view==='tower'?0:d*5;el.style.transform=`translateX(calc(-50% + ${offset}px)) rotate(${rotation}deg) scale(${1-d*.08})`;el.style.opacity=String(1-d*.2);v.append(el)}}
    this.zoom!.refresh(reset);
  }
}
if(!customElements.get('fuda-collection'))customElements.define('fuda-collection',FudaCollection);
