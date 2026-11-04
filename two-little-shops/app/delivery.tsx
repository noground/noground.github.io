'use client';
import {useSiteContent} from './site-content';
import {useEffect,useRef,useState} from 'react';
import {Coffee,UtensilsCrossed,Film,ArrowRight,PawPrint} from 'lucide-react';

export function DeliveryJourney({onArrive,preview=false}:{onArrive:()=>void;preview?:boolean}){
 const content=useSiteContent();
 const [phase,setPhase]=useState(0),[reduced,setReduced]=useState(false);
 const arrive=useRef(onArrive);
 useEffect(()=>{arrive.current=onArrive;},[onArrive]);
 useEffect(()=>{
  const quiet=window.matchMedia('(prefers-reduced-motion: reduce)').matches;setReduced(quiet);
  const timers=quiet?[setTimeout(()=>arrive.current(),1100)]:[
   setTimeout(()=>setPhase(1),1500),setTimeout(()=>setPhase(2),3300),
   setTimeout(()=>setPhase(3),4900),setTimeout(()=>arrive.current(),6400),
  ];return()=>timers.forEach(clearTimeout);
 },[]);
 const lines=content.delivery.lines;
 return <div className={'delivery-journey '+(reduced?'quiet-journey':'')}>
  <p className="room-kicker"><PawPrint size={14}/> A LITTLE DINNER PARADE</p>
  <h2>{preview?content.delivery.previewHeading:content.delivery.heading}</h2>
  <div className="delivery-route" aria-label="从饮品吧台和小厨房前往家庭观影角"><span><Coffee size={16}/>{content.rooms.feifei.name}</span><i/><span><UtensilsCrossed size={16}/>{content.rooms.tuntun.name}</span><i/><span><Film size={16}/>{content.rooms.cinema.name}</span></div>
  <div className="delivery-stage" aria-hidden="true">
   <div className="hall-frame"><span>♡</span></div><div className="hall-lamp"/>
   <div className="delivery-door"><img src={content.rooms.cinema.image} alt=""/><span/></div>
   <div className="delivery-floor"/>
   <div className="delivery-travellers"><img src={content.delivery.image} alt=""/></div>
   <span className="delivery-paw paw-one">✧</span><span className="delivery-paw paw-two">✧</span>
  </div>
  <p className="delivery-line" role="status">{reduced?'订单已收好，一起去观影角等开饭。':lines[phase]}</p>
  <div className="delivery-progress" aria-hidden="true"><span/></div>
  <small className="delivery-hint">{preview?'这是动画预览，不会创建订单。':'订单已经保存；实际制作进度请看「我的订单」。'}</small>
  <button className="delivery-skip" onClick={onArrive}>先去观影角坐好 <ArrowRight size={15}/></button>
 </div>
}
