'use client';
import {useSiteContent} from './site-content';
import {useEffect,useState,type CSSProperties} from 'react';
import {ArrowRight,ArrowLeft,Coffee,UtensilsCrossed,Flame,Film,LampDesk,Check,ShoppingBag,Heart,PawPrint} from 'lucide-react';

export function RoomScene({kind,show='poi',onSelect,cover=false}:{kind:'feifei'|'tuntun'|'cinema';show?:string;onSelect?:(id:string)=>void;cover?:boolean}){const content=useSiteContent(),room=content.rooms[kind],series=content.series;return <div className={'room-scene photo-scene scene-'+kind}>
 <img src={cover?(room.coverImage||room.image):room.image} alt={room.alt} loading={kind==='cinema'?'eager':'lazy'}/>
 <div className="room-light-wash" aria-hidden="true"/>
 {kind==='cinema'&&onSelect&&<div className="collection-pins" aria-label="房间里的美剧收藏">{series.filter(s=>s.showPin).map(s=><button key={s.id} className={'prop-pin '+(show===s.id?'selected':'')} style={{left:s.pin[0]+'%',top:s.pin[1]+'%','--pin-color':s.color} as CSSProperties} aria-label={'看看'+s.name+'的收藏'} aria-pressed={show===s.id} onClick={()=>onSelect(s.id)}><span/><small>{s.name}</small></button>)}</div>}
 </div>}
function PropPhoto({id}:{id:string}){const content=useSiteContent(),s=content.series.find(s=>s.id===id)!;return <div className="prop-photo" role="img" aria-label={s.objects.join('、')||s.name} style={{backgroundImage:`url(${JSON.stringify(s.image||content.rooms.cinema.image)})`,backgroundSize:s.image?'cover':'400% auto',backgroundPosition:s.image?'center':`${s.crop[0]}% ${s.crop[1]}%`}}/>}

export function CinemaDoor({onEnter}:{onEnter:()=>void}){const content=useSiteContent(),room=content.rooms.cinema;return <button className="cinema-door" onClick={onEnter}><div className="cinema-door-copy"><span className="room-kicker"><Film size={14}/> {room.english}</span><h2>{room.name} <span>↗</span></h2><p>{content.cinema.doorText}</p><div className="door-titles">{content.series.map(s=>s.name).join(' · ')}</div><span className="door-enter">{content.cinema.doorButton} <ArrowRight size={16}/></span></div><div className="cinema-door-scene"><RoomScene kind="cinema" cover/></div></button>}

export function CinemaCorner({onHome,onShop,onBag,onPreviewDelivery,count}:{onHome:()=>void;onShop:(id:string)=>void;onBag:()=>void;onPreviewDelivery:()=>void;count:number}){
 const content=useSiteContent(),series=content.series;
 const [selected,setSelected]=useState('poi'),[dim,setDim]=useState(false);
 useEffect(()=>{try{const saved=localStorage.getItem('ft-cinema');if(saved&&series.some(s=>s.id===saved))setSelected(saved);}catch{}},[]);
 const current=series.find(s=>s.id===selected)??series[0],collection=current;
 function choose(id:string){setSelected(id);try{localStorage.setItem('ft-cinema',id);}catch{}}
 return <div className={'cinema-corner '+(dim?'lights-low':'')} style={{'--show-color':current.color} as CSSProperties}>
 <button className="back-button" onClick={onHome}><ArrowLeft size={16}/> 回到家里</button>
 <section className="cinema-heading"><div><p className="room-kicker"><Film size={14}/> {content.rooms.cinema.kicker}</p><h1>{content.cinema.heading}</h1><p>{content.rooms.cinema.name} <span> / </span> {content.cinema.subtitle}</p></div><button className="lamp-toggle" aria-pressed={dim} onClick={()=>setDim(!dim)}><LampDesk size={18}/>{dim?'把阅读灯打开':'把灯调暗一点'}</button></section>
 <section className="cinema-stage" aria-label="今晚的观影氛围"><div className="stage-top"><span><span className="live-dot"/> {content.rooms.cinema.openText}</span><span>{content.cinema.stageLabel}</span></div><RoomScene kind="cinema" show={current.id} onSelect={choose}/><div className="stage-caption" aria-live="polite"><div><span>今晚的收藏</span><h2>{current.name}</h2><p>{current.line}</p></div><span className="stage-ticket"><Film size={19}/>双人沙发席<br/><small>{content.rooms.cinema.signature}</small></span></div></section>
 <section className="keepsake-display" aria-live="polite"><div className="keepsake-photo"><PropPhoto id={current.id}/><span><PawPrint size={14}/> 在房间里找彩蛋</span></div><div className="keepsake-copy"><span className="room-kicker">{current.english} / OUR COLLECTION</span><h3>{collection.title}</h3><p>{collection.note}</p><div className="keepsake-objects">{collection.objects.map(o=><span key={o}>{o}</span>)}</div><small>收藏的位置：{collection.place}</small></div></section>
 <section className="series-section"><div className="cinema-section-title"><div><span className="room-kicker">THE STORIES WE KEEP</span><h2>{content.cinema.collectionTitle}</h2></div><p>{content.cinema.collectionIntro}</p></div><div className="series-grid">{series.map(s=><button key={s.id} className={'series-card '+(selected===s.id?'selected':'')} aria-pressed={selected===s.id} onClick={()=>choose(s.id)} style={{'--card-color':s.color} as CSSProperties}><div className="series-picture"><PropPhoto id={s.id}/><span className="series-badge">{selected===s.id?<><Check size={12}/> 正在翻看</>:'一起看过'}</span></div><div className="series-copy"><small>{s.english}</small><h3>{s.name}<ArrowRight size={16}/></h3><p>{s.motif}</p></div></button>)}</div></section>
 <div className="sofa-companions"><span><Heart size={15}/> {content.cinema.sofaText}</span><button onClick={onPreviewDelivery}><PawPrint size={15}/> 看一遍送餐小剧场 <ArrowRight size={14}/></button></div>
 <section className="sofa-snacks"><div><Flame size={21}/><div><h3>故事慢慢看，肚子也要暖暖的</h3><p>去隔壁点一杯咖啡，带一份热乎饭回来。</p></div></div><div><button onClick={()=>onShop('feifei')}><Coffee size={16}/> {content.rooms.feifei.name}</button><button onClick={()=>onShop('tuntun')}><UtensilsCrossed size={16}/> {content.rooms.tuntun.name}</button><button onClick={onBag}><ShoppingBag size={16}/> 购物袋{count>0?` · ${count}`:''}</button></div></section>
 </div>
}
