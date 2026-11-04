import assert from 'node:assert/strict';
import {compressPhotoCanvas,MAX_PHOTO_DATA_URL} from '../app/photo-processing.ts';
function fakeCanvas(alpha,encode){
 const calls=[],context={clearRect(){},drawImage(){},getImageData(){return {data:new Uint8ClampedArray([10,20,30,alpha?0:255])};}};
 const canvas={width:0,height:0,getContext:()=>context,toDataURL(mime,quality){calls.push({mime,quality,width:this.width,height:this.height});return encode(mime,quality,this.width,this.height);}};
 return {canvas,calls};
}
const data=(mime,size)=>'data:'+mime+';base64,'+'A'.repeat(size);
// Safari does not have to provide a WebP encoder. Opaque photos avoid it.
const safari=fakeCanvas(false,(mime,q)=>data(mime==='image/webp'?'image/png':mime,mime==='image/webp'?800000:Math.round(160000*q)));
const jpeg=compressPhotoCanvas(safari.canvas,{},2304,4096);
assert(jpeg.startsWith('data:image/jpeg;'));assert(jpeg.length<=MAX_PHOTO_DATA_URL);assert(safari.calls.every(c=>c.mime==='image/jpeg'));assert.equal(safari.canvas.height,1200);assert.equal(safari.canvas.width,675);
// A transparent PNG fallback ignores quality, so reduce its dimensions instead.
const transparent=fakeCanvas(true,(_mime,_q,w,h)=>data('image/png',Math.round(w*h*.8)));
const png=compressPhotoCanvas(transparent.canvas,{},2000,1000);
assert(png.startsWith('data:image/png;'));assert(png.length<=MAX_PHOTO_DATA_URL);assert(transparent.calls.length>1);assert(transparent.canvas.width<1200);assert(transparent.calls.every(c=>c.mime==='image/webp'));
// Detailed photos can need both lower quality and smaller dimensions.
const noisy=fakeCanvas(false,(mime,q,w,h)=>data(mime,Math.round(w*h*q)));
assert(compressPhotoCanvas(noisy.canvas,{},2000,2000).length<=MAX_PHOTO_DATA_URL);assert(noisy.calls.some(c=>c.width<1200));assert(noisy.calls.some(c=>c.quality===.44));
console.log('PASS: Safari-compatible opaque JPEG, transparent PNG fallback, and automatic quality/dimension fitting.');
