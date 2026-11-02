import {collectionViews, deckLandings, fanLayout, parseCollection, randomDrawIndex, movePage, type CollectionCard, type CollectionView, type DeckLanding} from './collection.js';
import {zoomView, type ZoomView} from './zoom.js';
import {createChoice, CHOICE_CSS, CHOICE_VARS, type ChoiceHandle} from './choice.js';
import {stackLayout} from './stack.js';

const STYLE=`<style>
:host{display:block;${CHOICE_VARS.dark};color:var(--fc-text);font:16px system-ui}@media(prefers-color-scheme:light){:host(:not([theme="dark"])){${CHOICE_VARS.light}}}:host([theme="light"]){${CHOICE_VARS.light}}:host([theme="dark"]){${CHOICE_VARS.dark}}
*{box-sizing:border-box}.shell{background:var(--fc-surface);padding:1rem;border-radius:1rem;display:grid;gap:.9rem}.nav{display:flex;gap:.6rem;align-items:center;justify-content:center;flex-wrap:wrap}.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:.9rem}.opts:not(:has(.choice:not([hidden]))){display:none}
button,input{font:inherit;color:inherit}.nav button,dialog button{min-height:48px;min-width:48px;background:var(--fc-btn);border:2px solid var(--fc-btn-border);border-radius:.7rem;padding:.5rem 1rem;cursor:pointer}.nav button:disabled{opacity:.45;cursor:default}.nav input{min-height:48px;background:var(--fc-btn);border:2px solid var(--fc-btn-border);border-radius:.7rem;padding:.5rem .8rem}
button:focus-visible,input:focus-visible,.card:focus-visible{outline:3px solid var(--fc-focus);outline-offset:3px}${CHOICE_CSS}
.displays .choice-list{grid-template-columns:repeat(3,minmax(0,1fr))}@media(min-width:340px){.displays .choice-list{grid-template-columns:repeat(4,minmax(0,1fr))}.displays .choice-list button{min-height:50px;padding:.3rem .25rem;font-size:.7rem}.displays .choice-list svg{width:28px;height:18px}}@media(min-width:800px){.displays .choice-list{grid-template-columns:repeat(6,minmax(0,1fr))}.displays .choice-list button{min-height:56px;padding:.45rem .7rem;font-size:.8rem}.displays .choice-list svg{width:34px;height:22px}}
.stage{position:relative;height:var(--fuda-stage-height,clamp(300px,calc(100svh - 440px),620px));overflow:hidden;border-radius:1rem;background:radial-gradient(ellipse,var(--fc-stage-1),var(--fc-stage-2) 68%)}.stage:focus-visible{outline:3px solid var(--fc-focus);outline-offset:2px}.v{position:absolute;inset:0}kazoku-view-controls{display:block}
.card{padding:0;border:0;background:transparent;line-height:0}.card img{width:100%;height:100%;object-fit:contain;border-radius:5%;box-shadow:0 6px 16px #0009}
.stack .card{position:absolute;width:min(64vw,300px);height:86%;top:7%;left:50%;transition:transform .25s}
.grid{display:grid;grid-template-columns:repeat(var(--columns,3),minmax(0,1fr));gap:1rem;padding:1rem;align-content:start}.grid .card{height:clamp(130px,24vw,220px)}
.v.case{perspective:800px}.stage.case{background:linear-gradient(#615346,#222)}.case .card{transform:perspective(600px) rotateX(-15deg)}
.wall{display:flex;gap:1rem;align-items:center;padding:1rem}.wall .card{height:90%;flex:0 0 190px}
.story{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1rem}.story .card{width:min(75%,300px);flex:0 0 90%}
.plane{position:absolute;left:0;top:0;display:grid;gap:18px;grid-template-columns:repeat(var(--atlas-cols,5),140px);padding:30px}.plane .card{height:195px}
.stage.jukebox{border:12px solid #aa7147;box-shadow:inset 0 0 20px #fbb579}.stage.spotlight{background:radial-gradient(ellipse at center,#e5ce99,#454054 40%,#171822 78%)}
.stage.deck{perspective:1800px}.v.deck{--w:200px;display:flex;align-items:center;justify-content:center;gap:56px;transform-style:preserve-3d}.pile,.slot{position:relative;flex:none;width:var(--w);aspect-ratio:2.5/3.5;transform-style:preserve-3d}.slot{border:2px dashed var(--fc-btn-border);border-radius:5%;opacity:.55}
.pile .card{position:absolute;inset:0;display:block;transform-style:preserve-3d;transform:translate3d(calc(var(--x,0) * var(--w)),calc(var(--y,0) * var(--w)),calc(var(--k,0) * .9px)) rotate(calc(var(--r,0) * 1deg))}.pile .card:not(.top){pointer-events:none}.pile .card.top{cursor:pointer}
.fly,.turn{position:absolute;inset:0;transform-style:preserve-3d}.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:5%;overflow:hidden}.face img{display:block;width:100%;height:100%;object-fit:contain;border-radius:3%;box-shadow:0 4px 10px #0008}.face.back{transform:rotateY(180deg)}
.generic-back{display:grid;place-items:center;background:radial-gradient(ellipse at center,#b78745 0 12%,#152d46 13% 27%,#386988 28% 31%,#10233b 32% 62%,#d2b074 63% 66%,#182c45 67%);border:6px solid #b39158;color:#f7e9bf;font:bold 18px Georgia;letter-spacing:.12em;box-shadow:0 4px 10px #0008}
.pile.discard[data-land=face-down] .card .turn{transform:rotateY(180deg)}.pile.discard[data-land=upside-down] .card .turn{transform:rotate(180deg)}
.v.fan{--w:190px;display:grid;place-items:end center;padding-bottom:1rem}.fan .card{grid-area:1/1;position:relative;width:var(--w);aspect-ratio:2.5/3.5;height:auto;transform-origin:50% 165%;z-index:var(--z);transform:translate(calc(var(--cx) * var(--w)),calc(var(--cy) * var(--w))) rotate(calc(var(--cr) * 1deg));transition:transform .7s cubic-bezier(.2,.8,.2,1);transition-delay:calc((var(--n) - var(--i)) * 22ms)}.fan.open .card{transform:translate(calc(var(--x) * var(--w)),0) rotate(calc(var(--a) * 1deg));transition-delay:calc(var(--i) * 28ms)}.fan.open .card:hover,.fan.open .card:focus-visible{translate:0 -14px}.fan .card img{border-radius:6%}
dialog{color:var(--fc-text);background:var(--fc-dialog);border:1px solid var(--fc-btn-border);border-radius:1rem;text-align:center;max-width:95vw;max-height:95vh}dialog::backdrop{background:#000c}.detail{display:block;height:min(70vh,600px);max-width:80vw;object-fit:contain;margin:1rem auto}.empty{text-align:center;padding:3rem}
@media(max-width:600px){.stage{height:var(--fuda-stage-height,clamp(220px,calc(100svh - 570px),620px))}}@media(max-width:500px){.grid{grid-template-columns:repeat(min(2,var(--columns,3)),minmax(0,1fr))}.shell{padding:.7rem}.v.deck{--w:150px;gap:28px}.v.fan{--w:150px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>`;
const SHELL=`<section class="shell"><div class="displays"></div><div class="stage" tabindex="0" role="group" aria-label="Collection"><div class="v"></div></div><div class="opts"></div><div class="nav"><button class="prev">← Previous</button><span class="count" aria-live="polite"></span><button class="next">Next →</button><label class="draw-filter" hidden>Filter cards <input type="search" aria-label="Filter cards for random draw"></label><button class="draw" hidden>Draw a card</button></div><dialog aria-label="Card detail"></dialog></section>`;
const pages: CollectionView[]=['binder','case'];
const scrolling: CollectionView[]=['wall','story','atlas'];
const rects=(cols:number,rows:number,w:number,h:number,gx:number,gy:number,x0=1,y0=1)=>Array.from({length:cols*rows},(_,k)=>`<rect x="${x0+(k%cols)*gx}" y="${y0+Math.floor(k/cols)*gy}" width="${w}" height="${h}" rx="1" opacity="${0.55+((k%cols+Math.floor(k/cols))%2)*0.4}"/>`).join('');
const ICONS: Record<CollectionView,string>={
  deck:'<rect x="9" y="4" width="14" height="14" rx="2" opacity=".45"/><rect x="6" y="2" width="14" height="14" rx="2" opacity=".7"/><rect x="3" y="0" width="14" height="14" rx="2"/>',
  rolodex:'<rect x="2" y="9" width="12" height="10" rx="1.5" opacity=".4"/><rect x="8" y="5" width="12" height="10" rx="1.5" opacity=".7"/><rect x="14" y="1" width="12" height="10" rx="1.5"/>',
  binder:rects(3,2,9,9,11,10,2,1),
  case:'<path d="M3 4h28l-3 6H6z" opacity=".5"/><path d="M6 12h22l-3 8H9z"/>',
  jukebox:'<path d="M5 20V9a12 9 0 0 1 24 0v11z" opacity=".5"/><rect x="11" y="9" width="12" height="9" rx="1.5"/>',
  random:'<rect x="9" y="1" width="16" height="18" rx="3"/><circle cx="14" cy="6" r="1.6" fill="#0008"/><circle cx="20" cy="14" r="1.6" fill="#0008"/><circle cx="17" cy="10" r="1.6" fill="#0008"/>',
  story:'<rect x="11" y="0" width="12" height="7" rx="1.5"/><rect x="11" y="8" width="12" height="7" rx="1.5" opacity=".7"/><rect x="11" y="16" width="12" height="6" rx="1.5" opacity=".4"/>',
  wall:'<rect x="0" y="3" width="9" height="14" rx="1.5" opacity=".5"/><rect x="12" y="3" width="10" height="14" rx="1.5"/><rect x="25" y="3" width="9" height="14" rx="1.5" opacity=".5"/>',
  tower:'<rect x="9" y="1" width="16" height="4" rx="1"/><rect x="9" y="7" width="16" height="4" rx="1" opacity=".8"/><rect x="9" y="13" width="16" height="4" rx="1" opacity=".6"/><rect x="9" y="19" width="16" height="3" rx="1" opacity=".4"/>',
  spotlight:'<rect x="11" y="0" width="12" height="18" rx="2"/><rect x="1" y="5" width="8" height="12" rx="1.5" opacity=".4"/><rect x="25" y="5" width="8" height="12" rx="1.5" opacity=".4"/>',
  atlas:rects(4,3,6,5.5,8,7,2,1),
  fan:[-30,-15,0,15,30].map((a,i)=>`<rect x="14" y="1" width="7" height="13" rx="1.2" transform="rotate(${a} 17.5 21)" opacity="${0.45+i*0.1}"/>`).join('')
};
const icon=(view:CollectionView)=>`<svg viewBox="0 0 34 22" aria-hidden="true">${ICONS[view]}</svg>`;
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const ADDRESS_KEYS=['view','fan','land'] as const;

export class FudaCollection extends HTMLElement {
  private root = this.attachShadow({mode:'open'}); private data: CollectionCard[]=[]; private index=0; private pageSize=9; private selected: CollectionCard | null=null; private back=false; private drawFilter=""; private zoom: ZoomView | null=null;
  private tiles?: ChoiceHandle; private landing?: ChoiceHandle; private fanChoice?: ChoiceHandle; private flip: 'off' | 'back' | null=null; private addressTimer=0;
  static get observedAttributes(){return ['view','page-size','columns','fan','fan-size','deck-land','deck-messiness','deck-seed','theme']}
  set cards(value: CollectionCard[]){this.data=parseCollection(value);this.index=Math.min(this.index,Math.max(0,this.data.length-1));this.flip=null;this.render()}
  get cards(){return this.data.map(c=>({...c, ...(c.metadata ? {metadata:{...c.metadata}} : {})}))}
  /** The card on top of the deck, or the first card of the page or fan (counting from 0). */
  get position(){return this.index}
  connectedCallback(){if(this.hasAttribute('address'))this.readAddress();this.render()}
  disconnectedCallback(){clearTimeout(this.addressTimer)}
  attributeChangedCallback(name: string){this.pageSize=Math.min(100,Math.max(1,Math.floor(Number(this.getAttribute('page-size'))||9)));if(name==='view'||name==='page-size'||name==='columns'){this.index=0;this.flip=null}this.render(name==='view')}
  private get currentView(): CollectionView {let v=this.getAttribute('view');return collectionViews.some(x=>x.id===v)?v as CollectionView:'deck'}
  private get land(): DeckLanding {const v=this.getAttribute('deck-land');return deckLandings.some(l=>l.id===v)?v as DeckLanding:'face-up'}
  private get fanOpen(){return this.getAttribute('fan')==='open'}
  private get stacked(){return ![...pages,...scrolling].includes(this.currentView)}
  private q<T extends HTMLElement=HTMLElement>(selector: string){return this.root.querySelector(selector) as T}
  /** With `address`, the display, the fan and the landing are kept in the page's address (`?view=fan&fan=open&land=face-down`), and a link to it opens the same. */
  private readAddress(){try{const params=new URLSearchParams(location.search);for(const key of ADDRESS_KEYS){const value=params.get(key);if(value===null)continue;const attr=key==='land'?'deck-land':key;if(this.getAttribute(attr)!==value)this.setAttribute(attr,value)}}catch{}}
  private writeAddress(){if(!this.hasAttribute('address'))return;clearTimeout(this.addressTimer);this.addressTimer=window.setTimeout(()=>{try{const url=new URL(location.href);const want:Record<string,string|null>={view:this.currentView==='deck'?null:this.currentView,fan:this.fanOpen?'open':null,land:this.land==='face-up'?null:this.land};for(const [k,v] of Object.entries(want)){if(v===null)url.searchParams.delete(k);else url.searchParams.set(k,v)}history.replaceState(history.state,'',url)}catch{}},250)}
  private move(n:number){
    if(!this.data.length)return;const view=this.currentView;
    if(pages.includes(view)){this.index=movePage(this.index,this.data.length,this.pageSize,n)}
    else{const next=(this.index+n+this.data.length)%this.data.length;this.flip=view==='deck'&&Math.abs(n)===1&&next===this.index+n?(n>0?'off':'back'):null;this.index=next}
    this.render()
  }
  private image(c:CollectionCard):HTMLButtonElement {let button=document.createElement('button');button.className='card';button.setAttribute('aria-label',`Inspect ${c.name}`);let img=document.createElement('img');img.src=c.image;img.alt=c.name;img.loading='lazy';img.onerror=()=>{img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`))};button.append(img);button.onclick=()=>this.open(c);return button}
  private open(c:CollectionCard){this.selected=c;this.back=false;this.renderDialog()}
  private renderDialog(){let dlg=this.q<HTMLDialogElement>('dialog');dlg.replaceChildren();let close=document.createElement('button');close.textContent='Close';close.onclick=()=>dlg.close();dlg.append(close);if(this.selected){let img=document.createElement('img');img.className='detail';img.src=this.back&&this.selected.backImage?this.selected.backImage:this.selected.image;img.alt=`${this.selected.name}, ${this.back?'back':'front'}`;let label=document.createElement('p');label.textContent=this.selected.name;dlg.append(img,label);if(this.selected.backImage){let flip=document.createElement('button');flip.textContent=this.back?'Show front':'Show back';flip.onclick=()=>{this.back=!this.back;this.renderDialog()};dlg.append(flip)}}if(!dlg.open)dlg.showModal()}
  private canDraw(){const query=this.drawFilter.trim().toLocaleLowerCase();return this.data.some(c=>c.name.toLocaleLowerCase().includes(query))}
  private build(){
    if(this.zoom)return;
    this.root.innerHTML=STYLE+SHELL;
    this.tiles=createChoice({label:'Display',layout:'tiles',value:this.currentView,options:collectionViews.map(v=>({value:v.id,label:v.label,icon:icon(v.id)})),onChange:value=>{this.setAttribute('view',value);this.writeAddress()}});
    this.q('.displays').append(this.tiles.element);
    this.landing=createChoice({label:'A card flipped off the deck lands',value:this.land,options:deckLandings.map(l=>({value:l.id,label:l.label})),onChange:value=>{this.setAttribute('deck-land',value);this.writeAddress()}});
    this.fanChoice=createChoice({label:'Fan',value:this.fanOpen?'open':'closed',options:[{value:'closed',label:'Closed deck'},{value:'open',label:'Open fan'}],onChange:value=>{if(value==='open')this.setAttribute('fan','open');else this.removeAttribute('fan');this.writeAddress()}});
    this.q('.opts').append(this.landing.element,this.fanChoice.element);
    this.q('.prev').onclick=()=>this.move(-1);this.q('.next').onclick=()=>this.move(1);
    const input=this.q<HTMLInputElement>('.draw-filter input'),draw=this.q<HTMLButtonElement>('.draw');
    input.oninput=()=>{this.drawFilter=input.value;draw.disabled=!this.canDraw()};
    draw.onclick=()=>{const next=randomDrawIndex(this.data,this.index,this.drawFilter);if(next===null)return;this.index=next;this.render()};
    const stage=this.q('.stage');
    this.zoom=zoomView(stage,this.q('.v'),{address:this.hasAttribute('address'),items:'.card,.slot',theme:this.getAttribute('theme')??undefined});
    let startX=0;stage.addEventListener('touchstart',e=>{if(e.touches.length===1)startX=e.touches[0].clientX},{passive:true});
    stage.addEventListener('touchend',e=>{if(!this.stacked||this.currentView==='deck'||this.zoom!.zoomed()||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45){if(e.cancelable)e.preventDefault();this.move(dx<0?1:-1)}},{passive:false});
    stage.addEventListener('keydown',(e:KeyboardEvent)=>{if(!this.stacked||this.currentView==='deck'||(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'))return;e.preventDefault();this.move(e.key==='ArrowRight'?1:-1);this.q('.stack .card:last-child')?.focus()});
  }
  /** One pile of the deck. `positions` are data indexes from the bottom of the pile to its top; the cards under the top one lie nudged and turned from the seed and the top one lies square. */
  private pile(kind:'deck'|'discard',positions:number[]):HTMLElement {
    const pile=document.createElement('div');pile.className=`pile ${kind}-pile${kind==='discard'?' discard':''}`;pile.dataset.land=this.land;
    const messy=Math.min(1,Math.max(0,Number(this.getAttribute('deck-messiness')??0.3)));const seed=Number(this.getAttribute('deck-seed')??1)||1;
    const depth=Math.min(9,positions.length-1);const shown=positions.slice(positions.length-1-depth);
    const places=stackLayout(positions.length,{messiness:messy,seed,depth:9});
    shown.forEach((at,j)=>{
      const top=j===shown.length-1,c=this.data[at],place=places[j];
      const el=document.createElement('div');el.className=`card${top?' top':''}`;el.dataset.i=String(at);
      if(place&&!top){el.style.setProperty('--x',String(place.x));el.style.setProperty('--y',String(place.y));el.style.setProperty('--r',String(place.rotate))}
      el.style.setProperty('--k',String(j));
      const fly=document.createElement('div');fly.className='fly';const turn=document.createElement('div');turn.className='turn';
      const front=document.createElement('div');front.className='face front';const img=document.createElement('img');img.src=c.image;img.alt=top?c.name:'';img.loading='lazy';img.onerror=()=>{img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`))};front.append(img);
      const back=document.createElement('div');back.className='face back';
      if(c.backImage){const b=document.createElement('img');b.src=c.backImage;b.alt='';b.loading='lazy';back.append(b)}else{back.classList.add('generic-back');back.textContent='FUDA'}
      turn.append(front,back);fly.append(turn);el.append(fly);
      if(top){el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',`Inspect ${c.name}`);el.onclick=()=>this.open(c);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.open(c)}}}
      pile.append(el)
    });
    return pile
  }
  private renderDeck(v:HTMLElement){
    const n=this.data.length,deckPositions:number[]=[],discardPositions:number[]=[];
    // The deck is the cards from the top card down (bottom first); the pile is the cards already flipped off, the last one on top.
    for(let p=0;p<n-this.index;p++)deckPositions.push(n-1-p);
    for(let p=0;p<this.index;p++)discardPositions.push(p);
    v.classList.add('deck');
    const slot=()=>{const s=document.createElement('div');s.className='slot';return s};
    // The deck is on the left and the pile on its other side; an empty pile is a dashed slot, so Fit does not jump when the first card lands.
    v.append(deckPositions.length?this.pile('deck',deckPositions):slot(),discardPositions.length?this.pile('discard',discardPositions):slot());
    if(this.flip&&!reduced()&&n>1)this.playFlip(this.flip,v);
    this.flip=null
  }
  /** The card that just moved flies between the two piles, turning over on the way if it lands face down (or spinning if it lands upside down). The same element, so the card is never drawn twice. */
  private playFlip(direction:'off'|'back',v:HTMLElement){
    const deck=v.querySelector<HTMLElement>('.deck-pile'),discard=v.querySelector<HTMLElement>('.discard-pile');
    const moved=direction==='off'?discard?.querySelector<HTMLElement>('.card.top'):deck?.querySelector<HTMLElement>('.card.top');
    if(!moved||!deck||!discard)return;
    const dx=discard.offsetLeft-deck.offsetLeft,dy=discard.offsetTop-deck.offsetTop;
    const fly=moved.querySelector<HTMLElement>('.fly')!,turn=moved.querySelector<HTMLElement>('.turn')!;
    const from=direction==='off'?{x:-dx,y:-dy}:{x:dx,y:dy};
    const options:KeyframeAnimationOptions={duration:700,easing:'cubic-bezier(.3,.1,.2,1)'};
    fly.animate([{transform:`translate3d(${from.x}px,${from.y}px,0)`},{transform:`translate3d(${from.x/2}px,${from.y/2-34}px,80px) scale(1.07)`,offset:.5},{transform:'translate3d(0,0,0)'}],options);
    const land=this.land,final=land==='face-down'?'rotateY(180deg)':land==='upside-down'?'rotate(180deg)':'none';
    if(final!=='none')turn.animate(direction==='off'?[{transform:'none'},{transform:final}]:[{transform:final},{transform:'none'}],options)
  }
  private renderFan(v:HTMLElement){
    v.classList.add('fan');v.classList.toggle('open',this.fanOpen);
    const size=Math.min(20,Math.max(2,Math.floor(Number(this.getAttribute('fan-size'))||10))),count=Math.min(size,this.data.length);
    const places=fanLayout(count,Number(this.getAttribute('deck-seed')??1)||1);
    places.forEach((p,i)=>{
      const c=this.data[(this.index+i)%this.data.length],el=this.image(c);
      el.style.setProperty('--i',String(i));el.style.setProperty('--n',String(count));el.style.setProperty('--z',String(count-i));
      el.style.setProperty('--a',String(p.angle));el.style.setProperty('--x',String(p.x));el.style.setProperty('--cr',String(p.closedAngle));el.style.setProperty('--cx',String(p.closedX));el.style.setProperty('--cy',String(p.closedY));
      v.append(el)
    })
  }
  private render(reset=false){
    if(!this.isConnected)return;this.build();
    let view=this.currentView,stage=this.q('.stage'),v=this.q('.v');
    this.tiles!.set(view);this.landing!.set(this.land);this.fanChoice!.set(this.fanOpen?'open':'closed');
    this.landing!.hidden=view!=='deck';this.fanChoice!.hidden=view!=='fan';
    this.q('.count').textContent=this.data.length?(pages.includes(view)?`Page ${Math.floor(this.index/this.pageSize)+1} / ${Math.ceil(this.data.length/this.pageSize)}`:`${this.index+1} / ${this.data.length}`):'No cards';
    for(const selector of ['.prev','.next'])this.q<HTMLButtonElement>(selector).disabled=!this.data.length;
    const random=view==='random';this.q('.draw-filter').hidden=!random;this.q('.draw').hidden=!random;this.q<HTMLInputElement>('.draw-filter input').value=this.drawFilter;this.q<HTMLButtonElement>('.draw').disabled=!this.canDraw();
    stage.className=`stage ${view}`;v.className='v';v.replaceChildren();v.style.removeProperty('--columns');this.zoom!.minOpen=scrolling.includes(view)?.5:0;this.zoom!.setTurnable(view==='deck'&&this.data.length>0);
    if(!this.data.length){v.innerHTML='<p class="empty">No cards in this collection.</p>'}
    else if(view==='deck')this.renderDeck(v);
    else if(view==='fan')this.renderFan(v);
    else if(pages.includes(view)){v.classList.add('grid',view);const columns=Math.min(10,Math.max(1,Math.floor(Number(this.getAttribute('columns'))||3)));v.style.setProperty('--columns',String(columns));let start=Math.floor(this.index/this.pageSize)*this.pageSize;this.data.slice(start,start+this.pageSize).forEach(c=>v.append(this.image(c)))}
    else if(view==='wall'||view==='story'){v.classList.add(view);this.data.forEach(c=>v.append(this.image(c)))}
    else if(view==='atlas'){v.classList.add('atlas');let plane=document.createElement('div');plane.className='plane';this.data.forEach(c=>plane.append(this.image(c)));v.append(plane)}
    else{v.classList.add('stack',view);let count=Math.min(3,this.data.length);for(let d=count-1;d>=0;d--){let c=this.data[(this.index+d)%this.data.length],el=this.image(c);let offset=view==='rolodex'?d*42:view==='spotlight'?d*70:d*14;let rotation=view==='rolodex'?d*12:view==='tower'?0:d*5;el.style.transform=`translateX(calc(-50% + ${offset}px)) rotate(${rotation}deg) scale(${1-d*.08})`;el.style.opacity=String(1-d*.2);v.append(el)}}
    this.zoom!.refresh(reset);
  }
}
if(!customElements.get('fuda-collection'))customElements.define('fuda-collection',FudaCollection);
