import {PHOTOS,PLATE_PHOTOS} from './photo-data.js?v=20261007-4';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge=p=>p.kind==='generated'?'生成参考':p.mosaic?'実写・モザイク':'実写';

export function photoFigure(id,label){
  const p=PHOTOS[id];
  if(!p)return '';
  const caption=label||p.label;
  return `<figure class="field-photo ${p.plate?'plate-photo':''}" data-photo-id="${escape(id)}"><button type="button" class="photo-open" data-photo="${escape(id)}" data-caption="${escape(caption)}" aria-label="${escape(caption)}を拡大"><img src="./${escape(p.src)}" alt="${escape(caption)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"><span class="photo-zoom" aria-hidden="true">⤢</span></button><figcaption><span>${escape(caption)}</span><span class="photo-kind ${p.kind==='generated'?'is-generated':''}">${badge(p)}</span></figcaption></figure>`;
}

export function renderPhotoSet(items,extraClass=''){
  if(!items?.length)return '';
  return `<div class="photo-set ${escape(extraClass)}">${items.map(item=>Array.isArray(item)?photoFigure(...item):photoFigure(item)).join('')}</div>`;
}

export function renderPlatePhotos(country){
  return renderPhotoSet(PLATE_PHOTOS[country],`plate-set ${country==='it'?'italian-pair':''}`);
}

function credits(p){
  if(p.kind==='generated')return '<span>AI生成・特徴の参考画像</span><a href="./PHOTO_CREDITS.md" target="_blank" rel="noopener noreferrer">生成プロンプト ↗</a>';
  return `<span>${escape(p.author)}</span><a href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">写真の出典 ↗</a><a href="${escape(p.licenseUrl||p.source)}" target="_blank" rel="noopener noreferrer">${escape(p.license)}</a>${p.mosaic?'<span>ナンバーをモザイク加工（生成AI）</span>':''}`;
}

export function bindPhotoViewer(){
  if(document.querySelector('#photo-dialog'))return;
  const dialog=document.createElement('dialog');
  dialog.id='photo-dialog';
  dialog.className='photo-dialog';
  dialog.setAttribute('aria-labelledby','photo-title');
  document.body.append(dialog);
  let trigger;
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-photo]');
    if(!button)return;
    const p=PHOTOS[button.dataset.photo];
    if(!p)return;
    trigger=button;
    const caption=button.dataset.caption||p.label;
    dialog.innerHTML=`<div class="photo-dialog-bar"><h2 id="photo-title">${escape(caption)}</h2><button type="button" class="photo-close" aria-label="写真を閉じる">×</button></div><img class="photo-full" src="./${escape(p.src)}" alt="${escape(caption)}" width="${p.width}" height="${p.height}"><div class="photo-dialog-bottom"><span class="photo-kind ${p.kind==='generated'?'is-generated':''}">${badge(p)}</span><details class="photo-credits"><summary>出典・ライセンス</summary><div>${credits(p)}</div></details></div>`;
    dialog.querySelector('.photo-close').addEventListener('click',()=>dialog.close());
    dialog.showModal();
  });
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>trigger?.isConnected&&trigger.focus({preventScroll:true}));
  document.addEventListener('error',event=>{
    if(event.target.tagName!=='IMG')return;
    const figure=event.target.closest('.field-photo');
    if(figure){figure.classList.add('photo-unavailable');figure.querySelector('.photo-open').disabled=true;}
  },true);
}
