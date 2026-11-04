export const MAX_PHOTO_DATA_URL=230000;
// Safari may return PNG for an unsupported WebP encoder; PNG ignores quality.
// Opaque photos use JPEG. Transparent images keep alpha and shrink if needed.
export function compressPhotoCanvas(canvas:HTMLCanvasElement,source:CanvasImageSource,width:number,height:number):string{
 const context=canvas.getContext('2d');if(!context)throw new Error('浏览器暂时无法处理图片，请重新选择照片');
 let edge=Math.min(1200,Math.max(width,height)),alpha=false;
 const draw=()=>{const scale=edge/Math.max(width,height);canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0,canvas.width,canvas.height);};
 draw();const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
 for(let i=3;i<pixels.length;i+=4){if(pixels[i]!==255){alpha=true;break;}}
 for(;;){
  for(const quality of [.86,.72,.58,.44]){const data=canvas.toDataURL(alpha?'image/webp':'image/jpeg',quality);if(data.length<=MAX_PHOTO_DATA_URL)return data;if(data.startsWith('data:image/png;'))break;}
  if(edge<=128)throw new Error('这张图片暂时无法处理，请另存为 JPG 或 PNG 后重试');
  edge=Math.max(128,Math.floor(edge*.8));draw();
 }
}
