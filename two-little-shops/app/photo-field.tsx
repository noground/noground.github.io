'use client';
import {useState} from 'react';
import {Upload,ImagePlus} from 'lucide-react';
import {compressPhotoCanvas} from './photo-processing';
async function readPhoto(file:File):Promise<string>{
 const type=file.type.toLowerCase();
 if(!['image/jpeg','image/jpg','image/png','image/webp'].includes(type)&&!(type===''&&/\.(jpe?g|png|webp)$/i.test(file.name)))throw new Error('请选择 JPG、PNG 或 WebP 图片');
 if(file.size>15*1024*1024)throw new Error('请选择小于 15MB 的图片');
 let source:ImageBitmap|HTMLImageElement,release:()=>void;
 try{const bitmap=await createImageBitmap(file);source=bitmap;release=()=>bitmap.close();}
 catch{const url=URL.createObjectURL(file),img=new Image();try{await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('图片暂时无法读取，请另存为 JPG 或 PNG 后重试'));img.src=url;});}catch(error){URL.revokeObjectURL(url);throw error;}source=img;release=()=>URL.revokeObjectURL(url);}
 try{return compressPhotoCanvas(document.createElement('canvas'),source,source.width,source.height);}finally{release();}
}
export function PhotoField({value,onChange,onError,label='图片网址',onBusyChange}:{value:string;onChange:(v:string)=>void;onError:(e:string)=>void;label?:string;onBusyChange?:(busy:boolean)=>void}){
 const [busy,setBusy]=useState(false);
 return <div className="photo-field">{value?<img src={value} alt="照片预览"/>:<div className="image-fallback"><ImagePlus size={27}/><span>未单独设置配图</span></div>}<div><label className="upload-button"><Upload size={16}/>{busy?'正在处理…':'上传照片'}<input disabled={busy} type="file" accept="image/*" onChange={async e=>{const input=e.currentTarget,f=input.files?.[0];if(f){setBusy(true);onBusyChange?.(true);onError('');try{onChange(await readPhoto(f));}catch(err:any){onError(err.message);}finally{setBusy(false);onBusyChange?.(false);input.value='';}}}}/></label><small>JPG / PNG / WebP · 原图不超过 15MB · 自动压缩</small><input aria-label={label} placeholder="或粘贴 HTTPS 图片地址" value={value.startsWith('data:')?'':value} onChange={e=>onChange(e.target.value)}/></div></div>
}
