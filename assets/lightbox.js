(() => {
 'use strict';
 const grid=document.getElementById('thumbnail-gallery');if(!grid)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let active;
 const notify=open=>document.dispatchEvent(new CustomEvent('hawk:lightbox',{detail:open}));
 grid.addEventListener('click',event=>{
  const card=event.target.closest('button[data-full]');if(!card||active)return;
  const original=card.querySelector('img'),dialog=document.createElement('dialog');
  dialog.className='thumbnail-lightbox';dialog.setAttribute('aria-label','Enlarged portfolio thumbnail');dialog.setAttribute('data-lenis-prevent','');
  const stage=document.createElement('div');stage.className='lightbox-stage';
  const image=document.createElement('img');image.className='lightbox-image';image.alt=original.alt;image.width=1920;image.height=1080;image.draggable=false;image.src=original.currentSrc||original.src;
  const close=document.createElement('button');close.type='button';close.className='lightbox-close';close.setAttribute('aria-label','Close enlarged thumbnail');close.textContent='×';
  const status=document.createElement('p');status.className='sr-only';status.setAttribute('role','status');
  stage.append(image,close,status);dialog.append(stage);document.body.append(dialog);
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';notify(true);dialog.showModal();close.focus({preventScroll:true});
  let closing=false,closed=false;active=dialog;
  const sourceRect=original.getBoundingClientRect(),targetRect=stage.getBoundingClientRect();
  const from=`translate(${sourceRect.left+sourceRect.width/2-targetRect.left-targetRect.width/2}px,${sourceRect.top+sourceRect.height/2-targetRect.top-targetRect.height/2}px) scale(${sourceRect.width/targetRect.width},${sourceRect.height/targetRect.height})`;
  const duration=reduced.matches?0:260;const options={duration,easing:'cubic-bezier(.2,.75,.25,1)'};
  stage.animate([{transform:from,opacity:.55},{transform:'none',opacity:1}],options);
  // The full-size asset is requested only after opening. Keep the gallery preview visible while it loads.
  let full=new Image();full.decoding='async';full.onload=()=>{if(!closing&&active===dialog)image.src=full.src;full.onload=null;full.onerror=null;full=null;};
  full.onerror=()=>{if(!closing)status.textContent='The larger image could not load. Showing the gallery preview.';full.onload=null;full.onerror=null;full=null;};full.src=card.dataset.full;
  function finish(){if(closed)return;closed=true;removeEventListener('pagehide',finish);if(full){full.onload=null;full.onerror=null;full.removeAttribute('src');full=null;}image.removeAttribute('src');dialog.close();dialog.remove();active=null;document.body.style.overflow=overflow;notify(false);if(card.isConnected)card.focus({preventScroll:true});}
  function dismiss(){if(closing)return;closing=true;dialog.classList.add('is-closing');const animation=stage.animate([{transform:'none',opacity:1},{transform:'scale(.965)',opacity:0}],{duration:reduced.matches?0:180,easing:'cubic-bezier(.4,0,1,1)'});animation.finished.then(finish,finish);}
  close.addEventListener('click',dismiss);dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dismiss();});
  addEventListener('pagehide',finish,{once:true});
 });
})();
