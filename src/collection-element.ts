import {collectionViewAliases, collectionViews, isCard, parseCollection, randomDrawIndex, movePage, type CollectionCard, type CollectionView} from './collection.js';
import {BINDER_CSS, binderCovers, binderLayout, buildLeaf, buildSide, sideCount, spreadCount, spreadOf, spreadSides, type BinderLayout} from './binder.js';
import {deckLandings, fanBounds, fanLayout, fanShift, flight, normalizeLanding, timing, type FanPlace} from './pile.js';
import {zoomView, type ZoomView} from './zoom.js';
import {createChoice, CHOICE_CSS, CHOICE_VARS, type ChoiceHandle} from './choice.js';
import {stackLayout} from './stack.js';

const STYLE=`<style>
:host{display:block;${CHOICE_VARS.dark};color:var(--fc-text);font:16px system-ui}@media(prefers-color-scheme:light){:host(:not([theme="dark"])){${CHOICE_VARS.light}}}:host([theme="light"]){${CHOICE_VARS.light}}:host([theme="dark"]){${CHOICE_VARS.dark}}
*{box-sizing:border-box}.shell{background:var(--fc-surface);padding:1rem;border-radius:1rem;display:grid;gap:.9rem}.nav{display:flex;gap:.6rem;align-items:center;justify-content:center;flex-wrap:wrap}.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13.5rem),1fr));gap:.9rem}.opts:not(:has(.choice:not([hidden]))){display:none}.opts .choice{--choice-min:4.6rem}
button,input{font:inherit;color:inherit}.nav button,dialog button{min-height:48px;min-width:48px;background:var(--fc-btn);border:2px solid var(--fc-btn-border);border-radius:.7rem;padding:.5rem 1rem;cursor:pointer}.nav button:disabled{opacity:.45;cursor:default}.nav input{min-height:48px;background:var(--fc-btn);border:2px solid var(--fc-btn-border);border-radius:.7rem;padding:.5rem .8rem}
button:focus-visible,input:focus-visible,.card:focus-visible{outline:3px solid var(--fc-focus);outline-offset:3px}${CHOICE_CSS}${BINDER_CSS}
.displays .choice-list{grid-template-columns:repeat(3,minmax(0,1fr))}@media(min-width:340px){.displays .choice-list{grid-template-columns:repeat(4,minmax(0,1fr))}.displays .choice-list button{min-height:50px;padding:.3rem .25rem;font-size:.7rem}.displays .choice-list svg{width:28px;height:18px}}@media(min-width:800px){.displays .choice-list{grid-template-columns:repeat(6,minmax(0,1fr))}.displays .choice-list button{min-height:56px;padding:.45rem .7rem;font-size:.8rem}.displays .choice-list svg{width:34px;height:22px}}
.stage{position:relative;height:var(--fuda-stage-height,clamp(300px,calc(100svh - 440px),620px));overflow:hidden;border-radius:1rem;background:radial-gradient(ellipse,var(--fc-stage-1),var(--fc-stage-2) 68%)}.stage:focus-visible{outline:3px solid var(--fc-focus);outline-offset:2px}.v{position:absolute;inset:0}kazoku-view-controls{display:block}
.card{padding:0;border:0;background:transparent;line-height:0}.card img{width:100%;height:100%;object-fit:contain;border-radius:5%;box-shadow:0 6px 16px #0009}
.stack .card{position:absolute;width:min(64vw,300px);height:86%;top:7%;left:50%;transition:transform .25s}
.grid{display:grid;grid-template-columns:repeat(var(--columns,3),minmax(0,1fr));gap:1rem;padding:1rem;align-content:start}.grid .card{height:clamp(130px,24vw,220px)}
.v.case{perspective:800px}.stage.case{background:linear-gradient(#4a3f33,#1d1914);border:10px solid #6b5436;box-shadow:inset 0 0 26px #000a}.stage.case::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(115deg,#ffffff30 0,#ffffff00 28%,#ffffff12 55%,#ffffff00 78%,#ffffff22 100%)}.case .card{transform:perspective(600px) rotateX(-15deg);box-shadow:0 12px 0 -3px #2c251d,0 18px 8px -4px #000a}.case .card img{box-shadow:0 4px 10px #0009}
.wall{display:flex;gap:1rem;align-items:center;padding:1rem}.wall .card{height:90%;flex:0 0 190px}
.story{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1rem}.story .card{width:min(75%,300px);flex:0 0 90%;min-height:0}
.plane{position:absolute;left:0;top:0;display:grid;gap:18px;grid-template-columns:repeat(var(--atlas-cols,5),140px);padding:30px}.plane .card{height:195px}
.stage.spotlight{background:radial-gradient(ellipse at center,#e5ce99,#454054 40%,#171822 78%)}
.stage:is(.deck,.random,.fan){perspective:1800px}.v.deck{--w:200px;--gap:56px;--fl:0;--fr:0;--ft:0;--fb:0;--ease:cubic-bezier(.2,.8,.2,1);transform-style:preserve-3d}
.v.deck .pile,.v.deck .slot{position:absolute;left:50%;top:50%;width:var(--w);aspect-ratio:2.5/3.5;margin:calc(var(--w) * -.7) 0 0 calc(var(--w) * -.5);transform-style:preserve-3d}.slot{border:2px dashed var(--fc-btn-border);border-radius:5%;opacity:.55}
.v.deck .deck-pile{translate:calc(((var(--fl) - var(--fr) - 1) * var(--w) - var(--gap)) / 2) 0}.v.deck .discard-pile,.v.deck .slot{translate:calc(((var(--fl) + var(--fr) + 1) * var(--w) + var(--gap)) / 2) 0}.v.deck.fanonly .deck-pile{translate:calc((var(--fl) - var(--fr)) * var(--w) / 2) 0}
.v.deck .deck-pile,.v.deck .discard-pile,.v.deck .slot{transition:translate var(--t,0s) var(--ease)}
.extent{position:absolute;left:50%;top:50%;width:calc((var(--fl) + var(--fr) + 2) * var(--w) + var(--gap));height:calc((1.4 + var(--ft) + var(--fb)) * var(--w));translate:-50% calc(-50% + (var(--fb) - var(--ft)) * var(--w) / 2);visibility:hidden;pointer-events:none}.fanonly .extent{width:calc((var(--fl) + var(--fr) + 1) * var(--w))}
.pile .card{position:absolute;inset:0;display:block;transform-style:preserve-3d;transform-origin:50% 50%;transform:translate3d(calc(var(--x,0) * var(--w)),calc(var(--y,0) * var(--w)),calc(var(--k,0) * .9px)) rotate(calc(var(--r,0) * 1deg));transition:transform var(--t,0s) var(--ease),transform-origin var(--t,0s) var(--ease);transition-delay:calc(var(--j,0) * var(--stag,22ms))}.pile .card:not(.top){pointer-events:none}.pile .card.top{cursor:pointer}
.fan-open .deck-pile .card{transform-origin:50% 165%;transform:translate3d(calc(var(--fx,0) * var(--w)),0,calc(var(--k,0) * .9px)) rotate(calc(var(--fa,0) * 1deg));transition-delay:calc(var(--i,0) * var(--stag,28ms));pointer-events:auto;cursor:pointer}.fan-open .deck-pile .card:hover,.fan-open .deck-pile .card:focus-visible{translate:0 -14px}
.fly,.turn{position:absolute;inset:0;transform-style:preserve-3d}.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:5%;overflow:hidden}.face img{display:block;width:100%;height:100%;object-fit:contain;border-radius:3%;box-shadow:0 4px 10px #0008}.face.back{transform:rotateY(180deg)}
.generic-back{display:grid;place-items:center;background:radial-gradient(ellipse at center,#b78745 0 12%,#152d46 13% 27%,#386988 28% 31%,#10233b 32% 62%,#d2b074 63% 66%,#182c45 67%);border:6px solid #b39158;color:#f7e9bf;font:bold 18px Georgia;letter-spacing:.12em;box-shadow:0 4px 10px #0008}
.pile.discard[data-land=face-down] .card:not(.flat) .turn{transform:rotateY(180deg)}.card.flat .turn{transform:rotateY(calc(var(--fuda-yaw,0) * -1deg)) rotateX(calc(var(--fuda-tilt,0) * -1deg))}.ghost{pointer-events:none}
dialog{color:var(--fc-text);background:var(--fc-dialog);border:1px solid var(--fc-btn-border);border-radius:1rem;text-align:center;max-width:95vw;max-height:95vh}dialog::backdrop{background:#000c}.detail{display:block;height:min(70vh,600px);max-width:80vw;object-fit:contain;margin:1rem auto}.empty{text-align:center;padding:3rem}
@media(max-width:600px){.stage{height:var(--fuda-stage-height,clamp(220px,calc(100svh - 570px),620px))}}@media(max-width:500px){.opts{grid-template-columns:repeat(2,minmax(0,1fr))}.opts .speed{grid-column:1/-1}.v.deck{--gap:28px}.grid{grid-template-columns:repeat(min(2,var(--columns,3)),minmax(0,1fr))}.shell{padding:.7rem}.v.deck{--w:150px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>`;
const SHELL=`<section class="shell"><div class="displays"></div><div class="stage" tabindex="0" role="group" aria-label="Collection"><div class="v"></div></div><div class="nav"><button class="prev">← Previous</button><span class="count" aria-live="polite"></span><button class="next">Next →</button><label class="draw-filter" hidden>Filter cards <input type="search" aria-label="Filter cards for random draw"></label><button class="draw" hidden>Draw a card</button></div><div class="opts"></div><dialog aria-label="Card detail"></dialog></section>`;
const pages: CollectionView[]=['binder','case'];
const scrolling: CollectionView[]=['wall','story','atlas'];
/** The displays that draw a pile of cards: they turn in 3D, fan open and closed, and a card comes off them onto a pile at their side. The Fan of Cards is the same pile with only the fan. */
const pileViews: CollectionView[]=['deck','random'];
/** The displays whose cards sit on top of each other: moving to another card glides the cards that stay and lets the one that leaves go. */
const gliding: CollectionView[]=['rolodex','spotlight','fan'];
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
const ADDRESS_KEYS=['view','fan','land','animate','speed','binder','cover','sheet','pockets'] as const;
const NAMES:Record<string,string>={land:'deck-land'};

export class FudaCollection extends HTMLElement {
  private root = this.attachShadow({mode:'open'}); private data: CollectionCard[]=[]; private index=0; private pageSize=9; private selected: CollectionCard | null=null; private back=false; private drawFilter=""; private zoom: ZoomView | null=null;
  private tiles?: ChoiceHandle; private landing?: ChoiceHandle; private fanChoice?: ChoiceHandle; private animateChoice?: ChoiceHandle; private speedChoice?: ChoiceHandle; private binderChoices: Record<string,ChoiceHandle>={}; private turn: {from:number;to:number}|null=null; private flip: 'off' | 'back' | null=null; private addressTimer=0;
  private fanPlaces: FanPlace[]=[];
  static get observedAttributes(){return ['view','page-size','columns','fan','fan-size','deck-land','deck-messiness','deck-seed','theme','animate','speed','binder','cover','sheet','pockets']}
  set cards(value: CollectionCard[]){this.data=parseCollection(value);this.index=Math.min(this.index,Math.max(0,this.data.length-1));this.flip=null;this.render()}
  get cards(){return this.data.map(c=>({...c, ...(c.metadata ? {metadata:{...c.metadata}} : {})}))}
  /** The card on top of the deck, or the first card of the page or fan (counting from 0). */
  get position(){return this.index}
  connectedCallback(){if(this.hasAttribute('address'))this.readAddress();this.render()}
  disconnectedCallback(){clearTimeout(this.addressTimer)}
  attributeChangedCallback(name: string){
    this.pageSize=Math.min(100,Math.max(1,Math.floor(Number(this.getAttribute('page-size'))||9)));
    if(name==='fan'&&this.setFan())return;
    if(name==='animate'||name==='speed'){this.timeVars();this.syncChoices();return}
    if(name==='view'||name==='page-size'||name==='columns'){this.index=0;this.flip=null}
    this.render(name==='view',name==='view'?{kind:'view',dir:1}:undefined)
  }
  private get currentView(): CollectionView {let v=this.getAttribute('view')??'';v=collectionViewAliases[v]??v;return collectionViews.some(x=>x.id===v)?v as CollectionView:'deck'}
  /** How a card taken off lands: still facing up, or turned over sideways. The 0.6.0 value `upside-down` is still accepted and means turned over. */
  private get land(): 'face-up'|'face-down' {return normalizeLanding(this.getAttribute('deck-land'))}
  private get fanOpen(){return this.getAttribute('fan')==='open'}
  private get stacked(){return ![...pages,...scrolling].includes(this.currentView)}
  private get piled(){return pileViews.includes(this.currentView)}
  /** Only a card turns: a collection of objects (no card in it) never turns, and in a mixed one the objects stay square to the reader while the cards turn. */
  private get hasCards(){return this.data.some(isCard)}
  private get turnable(){return (this.piled||this.currentView==='fan')&&this.hasCards}
  private q<T extends HTMLElement=HTMLElement>(selector: string){return this.root.querySelector(selector) as T}
  /** With `address`, the display, the fan, the landing, the animation and its speed are kept in the page's address (`?view=fan&fan=open&land=face-down&animate=off`), and a link to it opens the same. */
  private readAddress(){try{const params=new URLSearchParams(location.search);for(const key of ADDRESS_KEYS){const value=params.get(key);if(value===null)continue;const attr=NAMES[key]??key;if(this.getAttribute(attr)!==value)this.setAttribute(attr,value)}}catch{}}
  private writeAddress(){if(!this.hasAttribute('address'))return;clearTimeout(this.addressTimer);this.addressTimer=window.setTimeout(()=>{try{const url=new URL(location.href);const want:Record<string,string|null>={view:this.currentView==='deck'?null:this.currentView,fan:this.fanOpen?'open':null,land:this.land==='face-up'?null:this.land,animate:this.getAttribute('animate')==='off'?'off':null,speed:['slow','quick'].includes(this.getAttribute('speed')??'')?this.getAttribute('speed'):null,binder:this.getAttribute('binder')==='zip'?'zip':null,cover:binderCovers.some(c=>c.id===this.getAttribute('cover'))&&this.getAttribute('cover')!=='green'?this.getAttribute('cover'):null,sheet:this.getAttribute('sheet')==='black'?'black':null,pockets:['4','12'].includes(this.getAttribute('pockets')??'')?this.getAttribute('pockets'):null};for(const [k,v] of Object.entries(want)){if(v===null)url.searchParams.delete(k);else url.searchParams.set(k,v)}history.replaceState(history.state,'',url)}catch{}},250)}
  private move(n:number){
    if(!this.data.length)return;const view=this.currentView;
    if(view==='binder'){const per=this.binderLay().per,spreads=spreadCount(sideCount(this.data.length,per)),from=spreadOf(this.index,per),to=(from+n+spreads*Math.abs(n))%spreads;this.turn={from,to};this.index=this.spreadFirst(to)}
    else if(pages.includes(view)){this.index=movePage(this.index,this.data.length,this.pageSize,n)}
    else{const next=(this.index+n+this.data.length)%this.data.length;this.flip=this.piled&&Math.abs(n)===1&&next===this.index+n?(n>0?'off':'back'):null;this.index=next}
    this.render(false,{kind:'move',dir:n>0?1:-1})
  }
  private binderLay():BinderLayout{return binderLayout(this.getAttribute('pockets'),this.getAttribute('columns'),this.getAttribute('page-size'))}
  /** The first card of an opening of the binder: the right-hand page's first card, or the left-hand page's when the right-hand page is past the end. */
  private spreadFirst(spread:number){const per=this.binderLay().per,sides=sideCount(this.data.length,per);return Math.min(this.data.length-1,(2*spread<sides?2*spread:2*spread-1)*per)}
  private image(c:CollectionCard,at:number):HTMLButtonElement {let button=document.createElement('button');button.className='card';button.dataset.i=String(at);button.setAttribute('aria-label',`Inspect ${c.name}`);let img=document.createElement('img');img.src=c.image;img.alt=c.name;img.loading='lazy';img.onerror=()=>{img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`))};button.append(img);button.onclick=()=>this.open(c);return button}
  private open(c:CollectionCard){this.selected=c;this.back=false;this.renderDialog()}
  private renderDialog(){let dlg=this.q<HTMLDialogElement>('dialog');dlg.replaceChildren();let close=document.createElement('button');close.textContent='Close';close.onclick=()=>dlg.close();dlg.append(close);if(this.selected){let img=document.createElement('img');img.className='detail';img.src=this.back&&this.selected.backImage?this.selected.backImage:this.selected.image;img.alt=`${this.selected.name}, ${this.back?'back':'front'}`;let label=document.createElement('p');label.textContent=this.selected.name;dlg.append(img,label);if(this.selected.backImage){let flip=document.createElement('button');flip.textContent=this.back?'Show front':'Show back';flip.onclick=()=>{this.back=!this.back;this.renderDialog()};dlg.append(flip)}}if(!dlg.open)dlg.showModal()}
  private canDraw(){const query=this.drawFilter.trim().toLocaleLowerCase();return this.data.some(c=>c.name.toLocaleLowerCase().includes(query))}
  /** The one length every move takes, in a custom property the stylesheet reads: `animate="off"` and reduced motion make it 0, `speed` stretches it. */
  private timeVars(){const t=timing(this,true),shell=this.root.querySelector<HTMLElement>('.shell');if(!shell)return t;shell.style.setProperty('--t',t.on?`${t.ms}ms`:'0s');if(t.on)shell.style.removeProperty('--stag');else shell.style.setProperty('--stag','0ms');return t}
  private syncChoices(){this.animateChoice?.set(this.getAttribute('animate')==='off'?'off':'on');this.speedChoice?.set(['slow','quick'].includes(this.getAttribute('speed')??'')?this.getAttribute('speed')!:'normal')}
  private build(){
    if(this.zoom)return;
    this.root.innerHTML=STYLE+SHELL;
    const keep=(attr:string,value:string|null)=>{if(value===null)this.removeAttribute(attr);else this.setAttribute(attr,value);this.writeAddress()};
    this.tiles=createChoice({label:'Display',layout:'tiles',value:this.currentView,options:collectionViews.map(v=>({value:v.id,label:v.label,icon:icon(v.id)})),onChange:value=>{this.setAttribute('view',value);this.writeAddress()}});
    this.q('.displays').append(this.tiles.element);
    this.landing=createChoice({label:'A card taken off lands',value:this.land,options:deckLandings.map(l=>({value:l.id,label:l.label})),onChange:value=>{this.setAttribute('deck-land',value);this.writeAddress()}});
    this.fanChoice=createChoice({label:'Fan',value:this.fanOpen?'open':'closed',options:[{value:'closed',label:'Closed'},{value:'open',label:'Open'}],onChange:value=>{if(value==='open')this.setAttribute('fan','open');else this.removeAttribute('fan');this.writeAddress()}});
    this.animateChoice=createChoice({label:'Animate',value:'on',options:[{value:'on',label:'On'},{value:'off',label:'Off'}],onChange:value=>keep('animate',value==='off'?'off':'on')});
    this.speedChoice=createChoice({label:'Speed',value:'normal',options:[{value:'slow',label:'Slow'},{value:'normal',label:'Normal'},{value:'quick',label:'Quick'}],onChange:value=>keep('speed',value)});
    const bin=(attr:string,label:string,value:string,options:{value:string;label:string}[])=>{const h=createChoice({label,value,options,onChange:v=>{this.setAttribute(attr,v);this.writeAddress()}});this.binderChoices[attr]=h;return h.element};
    this.q('.opts').append(this.landing.element,this.fanChoice.element,bin('binder','Binder','ring',[{value:'ring',label:'Ring'},{value:'zip',label:'Zip'}]),bin('cover','Cover','green',binderCovers.map(c=>({value:c.id,label:c.label}))),bin('sheet','Sheet','clear',[{value:'clear',label:'Clear'},{value:'black',label:'Black'}]),bin('pockets','Pockets','9',[{value:'4',label:'4'},{value:'9',label:'9'},{value:'12',label:'12'}]),this.animateChoice.element,this.speedChoice.element);this.speedChoice.element.classList.add('speed');
    this.q('.prev').onclick=()=>this.move(-1);this.q('.next').onclick=()=>this.move(1);
    const input=this.q<HTMLInputElement>('.draw-filter input'),draw=this.q<HTMLButtonElement>('.draw');
    input.oninput=()=>{this.drawFilter=input.value;draw.disabled=!this.canDraw()};
    draw.onclick=()=>{const next=randomDrawIndex(this.data,this.index,this.drawFilter);if(next===null)return;this.index=next;this.render(false,{kind:'move',dir:1})};
    const stage=this.q('.stage');
    this.zoom=zoomView(stage,this.q('.v'),{address:this.hasAttribute('address'),items:'.card,.slot',theme:this.getAttribute('theme')??undefined});
    let startX=0;stage.addEventListener('touchstart',e=>{if(e.touches.length===1)startX=e.touches[0].clientX},{passive:true});
    stage.addEventListener('touchend',e=>{if(!this.stacked||this.piled||this.zoom!.zoomed()||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45){if(e.cancelable)e.preventDefault();this.move(dx<0?1:-1)}},{passive:false});
    stage.addEventListener('keydown',(e:KeyboardEvent)=>{if(!this.stacked||this.piled||(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'))return;e.preventDefault();this.move(e.key==='ArrowRight'?1:-1);this.q('.stack .card:last-child')?.focus()});
  }
  /** One pile of the deck. `positions` are data indexes from the bottom of the pile to its top; the cards under the top one lie nudged and turned from the seed and the top one lies square. A deck's cards also carry where they lie when the fan is open. */
  private pile(kind:'deck'|'discard',positions:number[],fan:FanPlace[]=[]):HTMLElement {
    const pile=document.createElement('div');pile.className=`pile ${kind}-pile${kind==='discard'?' discard':''}`;pile.dataset.land=this.land;
    const messy=Math.min(1,Math.max(0,Number(this.getAttribute('deck-messiness')??0.3)));const seed=Number(this.getAttribute('deck-seed')??1)||1;
    const depth=Math.min(positions.length-1,fan.length?fan.length-1:9);const shown=positions.slice(positions.length-1-depth);
    const places=stackLayout(positions.length,{messiness:messy,seed,depth});
    shown.forEach((at,j)=>{
      const top=j===shown.length-1,c=this.data[at],place=places[j];
      const el=document.createElement('div');const flat=!isCard(c);el.className=`card${top?' top':''}${flat?' flat':''}`;el.dataset.i=String(at);
      if(place&&!top){el.style.setProperty('--x',String(place.x));el.style.setProperty('--y',String(place.y));el.style.setProperty('--r',String(place.rotate))}
      el.style.setProperty('--k',String(j));el.style.setProperty('--j',String(shown.length-1-j));
      const f=fan[shown.length-1-j];if(f){el.style.setProperty('--fx',String(f.x));el.style.setProperty('--fa',String(f.angle));el.style.setProperty('--i',String(shown.length-1-j))}
      const fly=document.createElement('div');fly.className='fly';const turn=document.createElement('div');turn.className='turn';
      const front=document.createElement('div');front.className='face front';const img=document.createElement('img');img.src=c.image;img.alt=top?c.name:'';img.loading='lazy';img.onerror=()=>{img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`))};front.append(img);
      turn.append(front);
      // An object has no back to show: only a card gets the picture of its back (or the package's own).
      if(!flat){const back=document.createElement('div');back.className='face back';
        if(c.backImage){const b=document.createElement('img');b.src=c.backImage;b.alt='';b.loading='lazy';back.append(b)}else{back.classList.add('generic-back');back.textContent='FUDA'}
        turn.append(back)}
      fly.append(turn);el.append(fly);
      el.onclick=()=>this.open(c);
      if(top){el.setAttribute('role','button');el.setAttribute('aria-label',`Inspect ${c.name}`);el.tabIndex=0;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.open(c)}}}
      pile.append(el)
    });
    return pile
  }
  /** Where the fan's cards lie for a pile of this many cards. A phone's fan lies closer across and leans on its angle. */
  private fanFor(count:number){const narrow=(this.clientWidth||innerWidth)<520;return fanLayout(count,Number(this.getAttribute('deck-seed')??1)||1,narrow?0.3:0.34)}
  /** Open the fan (or close it) on the pile that is on screen, without drawing it again, so every card glides: the open fan's reach is put in custom properties that move the piles apart and the Fit box. */
  private fanVars(v:HTMLElement,open:boolean){
    const b=open&&this.fanPlaces.length>1?fanBounds(this.fanPlaces):{left:0,right:0,top:0,bottom:0};
    v.classList.toggle('fan-open',open&&this.fanPlaces.length>1);
    for(const [k,x] of [['--fl',b.left],['--fr',b.right],['--ft',b.top],['--fb',b.bottom]] as const)v.style.setProperty(k,String(x))
  }
  /** `fan` changed: when a pile is on screen, move its cards to or from the fan in place (animated) and fit the view to it. Returns false when there is no pile to move. */
  private setFan():boolean{
    if(!this.zoom||!(this.piled||this.currentView==='fan'))return false;
    const v=this.q('.v');if(!v.classList.contains('deck')||!this.data.length)return false;
    const t=this.timeVars();
    this.zoom.animated(()=>{this.fanVars(v,this.fanOpen);this.zoom!.refresh()},t.on?t.ms:0);
    this.syncChoices();this.fanChoice!.set(this.fanOpen?'open':'closed');this.writeAddress();return true
  }
  private renderDeck(v:HTMLElement,fanOnly=false){
    const n=this.data.length,deckPositions:number[]=[],discardPositions:number[]=[];
    v.classList.add('deck');
    if(fanOnly){
      const size=Math.min(10,Math.max(2,Math.floor(Number(this.getAttribute('fan-size'))||10))),count=Math.min(size,n);
      // The fan window: `count` cards from the first one, wrapping round; the top card is the first and lies on the left when open.
      for(let p=count-1;p>=0;p--)deckPositions.push((this.index+p)%n);
      v.classList.add('fanonly');this.fanPlaces=this.fanFor(count);
      v.append(this.pile('deck',deckPositions,this.fanPlaces));
    }else{
      // The deck is the cards from the top card down (bottom first); the pile is the cards already flipped off, the last one on top.
      for(let p=0;p<n-this.index;p++)deckPositions.push(n-1-p);
      for(let p=0;p<this.index;p++)discardPositions.push(p);
      this.fanPlaces=this.fanFor(Math.min(10,deckPositions.length));
      const slot=()=>{const s=document.createElement('div');s.className='slot';return s};
      // The deck is on the left and the pile on its other side; an empty pile is a dashed slot, so Fit does not jump when the first card lands.
      v.append(deckPositions.length?this.pile('deck',deckPositions,this.fanPlaces):slot(),discardPositions.length?this.pile('discard',discardPositions):slot());
    }
    const extent=document.createElement('div');extent.className='extent';v.append(extent);
    this.fanVars(v,this.fanOpen)
  }
  /** The card that just moved flies between the two piles, turning over sideways on the way if it lands face down. The same element, so the card is never drawn twice. An open fan sends the card from where the fan holds it. */
  private playFlip(direction:'off'|'back',v:HTMLElement,ms:number){
    // Either pile may be an empty dashed slot (the last card put back leaves the pile empty): the card still flies the same distance, from where the pile was.
    const deck=v.querySelector<HTMLElement>('.deck-pile'),discard=v.querySelector<HTMLElement>('.discard-pile');
    const moved=direction==='off'?discard?.querySelector<HTMLElement>('.card.top'):deck?.querySelector<HTMLElement>('.card.top');
    if(!moved)return;
    const style=getComputedStyle(v),w=parseFloat(style.getPropertyValue('--w'))||200,gap=parseFloat(style.getPropertyValue('--gap'))||56,fr=parseFloat(v.style.getPropertyValue('--fr'))||0;
    const dx=(1+fr)*w+gap,dy=0;
    const fly=moved.querySelector<HTMLElement>('.fly')!,turn=moved.querySelector<HTMLElement>('.turn')!;
    const lead=this.fanOpen&&this.fanPlaces.length>1?this.fanPlaces[0]:null,shift=lead?fanShift(lead):{x:0,y:0};
    const away={x:shift.x*w,y:shift.y*w},spin=lead?lead.angle:0;
    // Taking a card off an open fan starts it where the fan holds it; bringing it back ends there.
    // The piles' cards lie 0.9 px apart in depth (ten at most), so the flying card starts just above the higher of them and ends at its own place.
    const z=9.6-(Number.parseFloat(moved.style.getPropertyValue('--k'))||0)*0.9;
    const from=direction==='off'?{x:-dx+away.x,y:-dy+away.y,z}:{x:dx-away.x,y:dy-away.y,z};
    flight(fly,turn,from,moved.classList.contains('flat')?'face-up':this.land,direction,ms,direction==='off'?spin:-spin)
  }
  private renderFan(v:HTMLElement){this.renderDeck(v,true)}
  /** Where every card is on screen now, by data index. */
  private snapshot(v:HTMLElement){const m=new Map<string,DOMRect>();v.querySelectorAll<HTMLElement>('[data-i]:not(.ghost)').forEach(el=>m.set(el.dataset.i!,el.getBoundingClientRect()));return m}
  /** Cards that arrive grow and fade in, a little to the side the reader is heading. Only an opening keyframe: they end on the card's own style. */
  private enter(els:Iterable<Element>,ms:number,dir=0,stagger=18){let k=0;for(const el of els)el.animate([{opacity:0,translate:`${dir*36}px 0`,scale:.94,offset:0}],{duration:ms,delay:Math.min(k++,12)*stagger,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'})}
  /** After a card or page change or a switch of display: glide what stays, let what goes leave, bring in what comes. Nothing runs afterwards: each is one animation that ends by itself. */
  private play(how:{kind:'move'|'view';dir:number},before:Map<string,DOMRect>,left:HTMLElement[],view:CollectionView,v:HTMLElement,ms:number){
    if(how.kind==='view'){this.enter(Array.from(v.querySelectorAll('.card,.slot')),ms*0.7);return}
    if(pages.includes(view)){this.enter(Array.from(v.querySelectorAll('.card')),ms*0.7,how.dir);return}
    if(scrolling.includes(view)){const el=v.querySelector(`[data-i="${this.index}"]`);if(el)this.zoom!.reveal(el,ms);return}
    if(!gliding.includes(view)||this.zoom!.turned())return;
    const scale=v.offsetWidth?v.getBoundingClientRect().width/v.offsetWidth:1;
    const kept=new Set<string>();
    for(const el of Array.from(v.querySelectorAll<HTMLElement>('.card[data-i]'))){
      const was=before.get(el.dataset.i!),now=el.getBoundingClientRect();
      if(!was||!now.width){this.enter([el],ms*0.7,how.dir);continue}
      kept.add(el.dataset.i!);
      const dx=(was.left+was.width/2-now.left-now.width/2)/scale,dy=(was.top+was.height/2-now.top-now.height/2)/scale;
      el.animate([{translate:`${dx}px ${dy}px`,scale:was.width/now.width,offset:0}],{duration:ms,easing:'cubic-bezier(.2,.8,.2,1)'})
    }
    const host=v.querySelector('.deck-pile')??v;
    for(const old of left){
      if(kept.has(old.dataset.i!))continue;
      old.classList.add('ghost');old.removeAttribute('role');old.tabIndex=-1;host.append(old);
      const done=()=>old.remove();
      old.animate([{opacity:1,translate:'0 0',offset:0},{opacity:0,translate:`${-how.dir*60}px 0`,offset:1}],{duration:ms*0.8,easing:'ease-in'}).finished.then(done,done)
    }
  }
  private syncBinder(view:CollectionView){
    const show=view==='binder',cur=(attr:string,dflt:string,ok:string[])=>{const v=this.getAttribute(attr);return v&&ok.includes(v)?v:dflt};
    const vals:Record<string,string>={binder:cur('binder','ring',['ring','zip']),cover:cur('cover','green',binderCovers.map(c=>c.id)),sheet:cur('sheet','clear',['clear','black']),pockets:cur('pockets','9',['4','9','12'])};
    for(const [k,h] of Object.entries(this.binderChoices)){h.hidden=!show;h.set(vals[k])}
  }
  private binderCount(){const per=this.binderLay().per,sides=sideCount(this.data.length,per),[l,r]=spreadSides(spreadOf(this.index,per),sides);const a=(l<0?r:l)+1,b=(r<0?l:r)+1;return a===b?`Page ${a} / ${sides}`:`Pages ${a}–${b} / ${sides}`}
  /** The binder: a ring or zip binder open on two facing sheets of pockets. A page turn swings the leaf about the spine, bending as it goes, and shows the pockets on its back. */
  private renderBinder(v:HTMLElement,t:{on:boolean;ms:number}){
    const layout=this.binderLay(),n=this.data.length,sides=sideCount(n,layout.per),spread=spreadOf(this.index,layout.per);
    const sheet=this.getAttribute('sheet')==='black'?'black':'clear',zip=this.getAttribute('binder')==='zip',cover=binderCovers.find(c=>c.id===this.getAttribute('cover'))??binderCovers[0];
    v.classList.add('binder');v.style.setProperty('--cover',cover.color);
    const pocket=(index:number,live:boolean)=>{const c=this.data[index],el=document.createElement('div');el.className='pocket';if(live)el.append(this.image(c,index));else{const img=document.createElement('img');img.src=c.image;img.alt='';img.style.cssText='width:86%;height:92%;object-fit:contain;border-radius:3%;box-shadow:0 2px 5px #0007';el.append(img)}return el};
    const [L,R]=spreadSides(spread,sides),turn=this.turn;this.turn=null;
    const flat=turn&&t.on&&Math.abs(turn.to-turn.from)===1?turn:null;
    const [oldL,oldR]=flat?spreadSides(flat.from,sides):[L,R],[newL,newR]=flat?spreadSides(flat.to,sides):[L,R];
    const forward=!!flat&&flat.to>flat.from;
    const book=document.createElement('div');book.className=`book ${zip?'b-zip':'b-ring'}`;
    const inside=document.createElement('div');inside.className='inside';
    const left=document.createElement('div'),right=document.createElement('div');left.className='half';right.className='half';
    const put=(half:HTMLElement,side:number,where:'l'|'r')=>{half.replaceChildren();if(side>=0)half.append(buildSide(side,where,sheet,layout,n,pocket))};
    // While a leaf swings the half it has not reached yet shows the page it is leaving; the other half already shows the page it uncovers.
    put(left,flat?(forward?oldL:newL):L,'l');put(right,flat?(forward?newR:oldR):R,'r');
    const spine=document.createElement('div');spine.className='spine';for(const y of [18,50,82]){const ring=document.createElement('i');ring.className='ring';ring.style.top=`${y}%`;spine.append(ring)}
    inside.append(left,right,spine);
    const tab=document.createElement('i');tab.className='tab';book.append(inside,tab);v.append(book);
    if(flat){
      const w=300,strip=34,{leaf,slices}=buildLeaf(forward?oldR:newR,forward?newL:oldL,sheet,layout,n,pocket,w,strip);
      inside.append(leaf);
      const ms=Math.round(t.ms*1.4),ease='cubic-bezier(.45,.05,.3,1)',a=forward?[0,-180]:[-180,0];
      leaf.style.transform=`rotateY(${a[1]}deg)`;
      const swing=leaf.animate([{transform:`rotateY(${a[0]}deg)`},{transform:`rotateY(${a[1]}deg)`}],{duration:ms,easing:ease,fill:'forwards'});
      // Each slice leans on the one before it, so the sheet bends as it swings (the free edge trails) and straightens at the end.
      const bend=forward?8:-8;
      slices.forEach((s,k)=>{if(k)s.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${bend}deg)`,offset:.5},{transform:'rotateY(0deg)'}],{duration:ms,easing:ease})});
      const finish=()=>{if(!leaf.isConnected)return;put(left,newL,'l');put(right,newR,'r');leaf.remove()};
      swing.finished.then(finish,finish)
    }
  }
  private render(reset=false,how?:{kind:'move'|'view';dir:number}){
    if(!this.isConnected)return;this.build();
    let view=this.currentView,stage=this.q('.stage'),v=this.q('.v');
    const t=this.timeVars(),playing=t.on&&how&&this.data.length>0;
    const before=playing?this.snapshot(v):new Map<string,DOMRect>(),left=playing&&how!.kind==='move'&&gliding.includes(view)?Array.from(v.querySelectorAll<HTMLElement>('.card:not(.ghost)')):[];
    this.syncBinder(view);this.tiles!.set(view);this.landing!.set(this.land);this.fanChoice!.set(this.fanOpen?'open':'closed');this.syncChoices();
    this.landing!.hidden=!this.piled||!this.hasCards;this.fanChoice!.hidden=!(this.piled||view==='fan');
    this.q('.count').textContent=this.data.length?(view==='binder'?this.binderCount():pages.includes(view)?`Page ${Math.floor(this.index/this.pageSize)+1} / ${Math.ceil(this.data.length/this.pageSize)}`:`${this.index+1} / ${this.data.length}`):'No cards';
    for(const selector of ['.prev','.next'])this.q<HTMLButtonElement>(selector).disabled=!this.data.length;
    const random=view==='random';this.q('.draw-filter').hidden=!random;this.q('.draw').hidden=!random;this.q<HTMLInputElement>('.draw-filter input').value=this.drawFilter;this.q<HTMLButtonElement>('.draw').disabled=!this.canDraw();
    stage.className=`stage ${view}`;v.className='v';v.replaceChildren();v.style.removeProperty('--columns');for(const k of ['--fl','--fr','--ft','--fb'])v.style.removeProperty(k);this.zoom!.minOpen=scrolling.includes(view)?.5:0;this.zoom!.setTurnable(this.turnable&&this.data.length>0,this.data.length>0&&!this.hasCards);
    this.zoom!.items=this.piled||view==='fan'?'.extent':view==='binder'?'.book':'.card,.slot';
    if(!this.data.length){v.innerHTML='<p class="empty">No cards in this collection.</p>'}
    else if(this.piled)this.renderDeck(v);
    else if(view==='fan')this.renderFan(v);
    else if(view==='binder')this.renderBinder(v,t);
    else if(pages.includes(view)){v.classList.add('grid',view);const columns=Math.min(10,Math.max(1,Math.floor(Number(this.getAttribute('columns'))||3)));v.style.setProperty('--columns',String(columns));let start=Math.floor(this.index/this.pageSize)*this.pageSize;this.data.slice(start,start+this.pageSize).forEach((c,k)=>v.append(this.image(c,start+k)))}
    else if(view==='wall'||view==='story'){v.classList.add(view);this.data.forEach((c,k)=>v.append(this.image(c,k)))}
    else if(view==='atlas'){v.classList.add('atlas');let plane=document.createElement('div');plane.className='plane';this.data.forEach((c,k)=>plane.append(this.image(c,k)));v.append(plane)}
    else{v.classList.add('stack',view);let count=Math.min(3,this.data.length);for(let d=count-1;d>=0;d--){const at=(this.index+d)%this.data.length;let c=this.data[at],el=this.image(c,at);let offset=view==='rolodex'?d*42:view==='spotlight'?d*70:d*14;let rotation=view==='rolodex'?d*12:d*5;el.style.transform=`translateX(calc(-50% + ${offset}px)) rotate(${rotation}deg) scale(${1-d*.08})`;el.style.opacity=String(1-d*.2);v.append(el)}}
    this.zoom!.refresh(reset);
    if(this.flip&&this.piled&&t.on&&this.data.length>1)this.playFlip(this.flip,v,Math.round(t.ms*1.15));
    this.flip=null;
    if(playing)this.play(how!,before,left,view,v,t.ms)
  }
}
if(!customElements.get('fuda-collection'))customElements.define('fuda-collection',FudaCollection);
