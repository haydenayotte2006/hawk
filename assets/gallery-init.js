/* Runs immediately after the gallery markup, before image requests or its first paint. */
(() => {
 const grid=document.getElementById('thumbnail-gallery');if(!grid)return;
 const cards=Array.from(grid.children);
 for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 const fragment=document.createDocumentFragment();
 cards.forEach((card,index)=>{card.dataset.revealDelay=String(index%4*40);const image=card.querySelector('img');if(image){image.loading=index<4?'eager':'lazy';image.srcset=image.dataset.srcset;image.src=image.dataset.src;delete image.dataset.src;delete image.dataset.srcset;}fragment.appendChild(card);});
 grid.appendChild(fragment);
})();
