import {fetchSet} from './tcgdex-data.js';
const grid = document.querySelector('#cards');
const status = document.querySelector('#status');
const search = document.querySelector('#search');
const dialog = document.querySelector('dialog');
const dialogImage = dialog.querySelector('img');
const dialogTitle = dialog.querySelector('h2');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const pageSize = 9;
let cards = [], page = 0, active = null;
const filtered = () => { const q = search.value.trim().toLowerCase(); return cards.filter(c => `${c.name} ${c.number}`.toLowerCase().includes(q)); };
function render() {
 const list = filtered(); const pages = Math.max(1, Math.ceil(list.length / pageSize)); page = Math.min(page, pages-1);
 grid.replaceChildren();
 for (const c of list.slice(page*pageSize,(page+1)*pageSize)) {
   const button = document.createElement('button'); button.className='card'; button.setAttribute('aria-label', `View ${c.name}, number ${c.number}`);
   if(c.image) {const img=document.createElement('img');img.src=c.image;img.alt=`${c.name} card`;img.loading='lazy';img.addEventListener('error',()=>{img.replaceWith(document.createTextNode('Image unavailable'));});button.append(img);}
   else {const placeholder=document.createElement('span');placeholder.textContent=`${c.name} — image unavailable`;button.append(placeholder);}
   button.addEventListener('click',()=>{active=button;dialogTitle.textContent=`${c.name} · #${c.number}`;dialogImage.hidden=!c.largeImage;dialogImage.removeAttribute('src');if(c.largeImage)dialogImage.src=c.largeImage;dialogImage.alt=`${c.name} card`;document.querySelector('#image-error').hidden=!!c.largeImage;dialog.showModal();});grid.append(button);
 }
 document.querySelector('#page').textContent=`Page ${page+1} of ${pages} · ${list.length} cards`;
 previous.disabled=page===0; next.disabled=page>=pages-1;
}
dialogImage.addEventListener('error',()=>{dialogImage.hidden=true;document.querySelector('#image-error').hidden=false;});
dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>active?.focus());
search.addEventListener('input',()=>{page=0;render();});previous.addEventListener('click',()=>{page--;render();});next.addEventListener('click',()=>{page++;render();});
async function load(){status.textContent='Loading cards from TCGdex…';document.querySelector('#retry').hidden=true;try{cards=await fetchSet();page=0;render();status.textContent=cards.length?'Cards from the Pokémon Base Set, supplied by TCGdex.':'No cards were returned.';}catch(e){status.textContent=`Could not load cards. ${e instanceof Error?e.message:''} Check your connection and try again.`;document.querySelector('#retry').hidden=false;}}
document.querySelector('#retry').addEventListener('click',load);load();
