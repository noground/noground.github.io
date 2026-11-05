const defaultSeries=[
 {id:'poi',name:'POI',english:'PERSON OF INTEREST',motif:'黄色取景框 · 城市暗号',line:'城市再喧闹，这里始终为你留一盏灯。',color:'#e8c369'},
 {id:'stranger',name:'怪奇物语',english:'STRANGER THINGS',motif:'字母彩灯 · 神秘红光',line:'外面的世界有点奇怪，毯子里倒是很安心。',color:'#f18a82'},
 {id:'sense8',name:'超感猎杀',english:'SENSE8',motif:'八束光 · 彼此相连',line:'隔着世界，也能找到同一份心跳。',color:'#81c8cb'},
 {id:'thisisus',name:'我们这一天',english:'THIS IS US',motif:'家庭相框 · 日常暖光',line:'最想重温的，是一起度过的普通一天。',color:'#e8b382'},
 {id:'girls',name:'破产姐妹',english:'2 BROKE GIRLS',motif:'小餐馆 · 纸杯蛋糕',line:'今天的烦恼先放一边，笑着分一个小蛋糕。',color:'#efd280'},
 {id:'money',name:'纸钞屋',english:'MONEY HEIST',motif:'达利面具 · 红色连体服',line:'把冒险留给故事，把安心留在你身边。',color:'#e19c8d'},
 {id:'snow',name:'雪国列车',english:'SNOWPIERCER',motif:'雪夜列车 · 窗内炉火',line:'窗外冰天雪地，沙发这一边一直暖着。',color:'#a8c9e2'},
];
const defaultRoomImages={feifei:'/images/cozy-coffee-v6.webp',tuntun:'/images/cozy-kitchen-v6.webp',cinema:'/images/cozy-living-v6.webp'};
const keepsakes:Record<string,{title:string;note:string;objects:string[];place:string;pin:[number,number]}>={
 poi:{title:'城市里藏着的黄色取景框',note:'黑白城市照片、黄色取景框和一台老相机，把 POI 的冷静与神秘收进这面墙。',objects:['黑白城市收藏画','黄色取景框','复古相机'],place:'沙发左上方的城市照片墙',pin:[35,12]},
 stranger:{title:'彩灯亮起，奇妙的夜晚开始',note:'字母墙和一串暖暖的彩灯，把那一点神秘带回家。今晚的毯子已经备好了。',objects:['字母收藏画','一串圣诞彩灯','旧唱片'],place:'沙发上方的字母灯墙',pin:[52,13]},
 sense8:{title:'八束光，围成一个小小的世界',note:'八个光点连成收藏画里的相遇。世界很大，能靠在一起看剧的此刻也很好。',objects:['八点连线灯画','旅行小物','柔软的靠枕'],place:'字母墙右侧的连线灯画',pin:[62,12]},
 thisisus:{title:'把普通的一天，也装进相框',note:'几张暖色的家庭照片、熟悉的木相框，留出一块属于日常的温柔角落。',objects:['家庭照片墙','木质相框','暖色台灯'],place:'沙发右上方的小相框',pin:[73,15]},
 girls:{title:'今晚的快乐，配一份小蛋糕',note:'餐馆风格的双杯和纸杯蛋糕摆上小架子，笑点和甜点都想分你一半。',objects:['红蓝条纹双杯','纸杯蛋糕','小餐馆收藏角'],place:'沙发后方的杯子与蛋糕架',pin:[71,30]},
 snow:{title:'窗外是雪，窗里是我们的家',note:'一列小火车停在落雪的收藏架上。外面再冷，这里都有炉火和热饮。',objects:['雪景列车模型','雪夜窗景','壁炉暖光'],place:'右侧书架的雪景列车',pin:[91,11]},
 money:{title:'红色、面具，还有一点冒险',note:'把红色连体服、达利面具和折纸摆进收藏架，让纸钞屋的鲜明元素也住进来。',objects:['达利面具','红色连体服','折纸小摆件'],place:'列车下方的红色收藏格',pin:[91,25]},
};

export type RoomKey='feifei'|'tuntun'|'cinema';
export type RoomContent={name:string;english:string;kicker:string;tagline:string;description:string;image:string;coverImage:string;openText:string;signature:string;alt:string};
export type SeriesContent={id:string;name:string;english:string;motif:string;line:string;color:string;title:string;note:string;objects:string[];place:string;pin:[number,number];showPin:boolean;image:string;crop:[number,number]};
export type SiteContent={
 copyVersion?:number;
 brand:{name:string;tagline:string;cinemaTagline:string;footer:string};
 home:{eyebrow:string;title:string;intro:string;sectionTitle:string;sectionSubtitle:string;featureTitle:string;noteTitle:string;noteBody:string};
 rooms:Record<RoomKey,RoomContent>;
 cinema:{heading:string;subtitle:string;doorText:string;doorButton:string;stageLabel:string;collectionTitle:string;collectionIntro:string;sofaText:string};
 decor:{backgroundImage:string;opacity:number};
 delivery:{image:string;heading:string;previewHeading:string;lines:string[]};
 series:SeriesContent[];
};
export const defaultContent:SiteContent={
 copyVersion:1,
 brand:{name:'菲菲和屯屯',tagline:'两人一起，好好吃饭',cinemaTagline:'两人一起，慢慢看剧',footer:'认真吃饭，慢慢生活'},
 home:{eyebrow:'OUR LITTLE EVERYDAY',title:'今天，想怎么过？',intro:'喝点喜欢的，吃点热乎的，再窝着看一集。\n我们的家，今天也刚刚好。',sectionTitle:'回家啦，想先去哪儿？',sectionSubtitle:'三处小天地，都是我们的日常',featureTitle:'今天的心动推荐',noteTitle:'喜欢什么口味，记得告诉我们',noteBody:'少糖、少辣、不要葱花…每一份都可以有你的偏爱。'},
 rooms:{
  feifei:{name:'菲菲饮品店',english:'FEIFEI DRINKS',kicker:'A COFFEE AT HOME',tagline:'popo特制，开启好心情',description:'把日子泡慢一点，\n把喜欢的那一杯留给你。',image:defaultRoomImages.feifei,coverImage:'',openText:'窗边的位置，为你留着',signature:'☕ 一间小店，也是一角家',alt:'戴绿色小花领巾的小猫坐在木质咖啡吧台旁，阳光照着咖啡机和三杯饮品'},
  tuntun:{name:'屯屯小厨房',english:'TUNTUN KITCHEN',kicker:'FROM OUR LITTLE KITCHEN',tagline:'小厨房出品，我吃吃吃',description:'烟火气不必很远，\n热饭和你，都在身边。',image:defaultRoomImages.tuntun,coverImage:'',openText:'灶火开着，等你回家',signature:'♨ 两人一桌，三餐四季',alt:'戴陶红色小花领巾的卡皮巴拉在温馨厨房里，守着一盘热乎的番茄炒蛋'},
  cinema:{name:'家庭观影角',english:'OUR SOFA, OUR STORIES',kicker:"FEIFEI & TUNTUN'S WATCH ROOM",tagline:'我们的美剧角',description:'故事很远，\n你在身边。',image:defaultRoomImages.cinema,coverImage:'',openText:'壁炉亮着，两只已经靠在一起',signature:'一直为我们保留',alt:'小猫与卡皮巴拉靠在沙发上盖着毯子，壁炉、彩灯和七部剧的收藏小物环绕着它们'},
 },
 cinema:{heading:'故事很远，\n你在身边。',subtitle:'我们的美剧角',doorText:'灯暗一点，靠近一点。\n把喜欢的故事，再看一遍。',doorButton:'去沙发上坐坐',stageLabel:'OUR LITTLE CINEMA',collectionTitle:'一起看过的那些世界',collectionIntro:'点一部，看看我们为它留的收藏角',sofaText:'popo靠着屯屯，今晚哪儿也不去。'},
 decor:{backgroundImage:'/images/home-doodles-v6.svg',opacity:.55},
 delivery:{image:'/images/cozy-delivery-v6.webp',heading:'订单收好啦，开饭小剧场开始',previewHeading:'小猫和卡皮巴拉的送餐小剧场',lines:['小猫端起热饮，卡皮巴拉带上餐盘','一杯喜欢的，一份热乎的，都带上','穿过暖暖的小走廊，往观影角走','到观影角啦，靠在一起等开饭']},
 series:defaultSeries.map(s=>({...s,...keepsakes[s.id],showPin:true,image:'',crop:({poi:[34,0],stranger:[52,0],sense8:[65,0],thisisus:[76,0],girls:[74,20],snow:[100,0],money:[100,23]} as Record<string,[number,number]>)[s.id]})),
};
export function validContentImage(v:string,empty=false){return (empty&&v==='')||v.length<=3000&&(/^(\/images\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp|svg)|\/api\/photo\/content-photo-[a-z0-9-]+|\/api\/photo\/shop-(?:feifei|tuntun))$/.test(v)||/^https:\/\/[^\s]+$/.test(v));}
export function normalizeContent(input:any):SiteContent{
 const text=(v:any,f:string,max=300)=>{if(v===undefined)return f;if(typeof v!=='string'||v.length>max||v.includes('\u0000'))throw new Error('文字长度或格式不正确');return v.trim();};
 const fields=<T extends Record<string,string>>(v:any,f:T)=>Object.fromEntries(Object.entries(f).map(([k,d])=>[k,text(v?.[k],d,k==='image'||k==='coverImage'?3000:300)])) as T;
 const image=(v:any,f:string,empty=false)=>{const x=v===undefined?f:v;if(typeof x!=='string'||!validContentImage(x,empty))throw new Error('请上传图片或填写有效的 HTTPS 图片地址');return x;};
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('页面内容格式不正确');
 const out=structuredClone(defaultContent);
 out.brand=fields(input.brand,out.brand);out.home=fields(input.home,out.home);out.cinema=fields(input.cinema,out.cinema);
 if(out.brand.name.length>30||out.home.title.length>60)throw new Error('名称最多 30 字，首页标题最多 60 字');
 if(!out.brand.name||!out.home.title)throw new Error('网站名称和首页标题不能为空');
 for(const key of ['feifei','tuntun','cinema'] as RoomKey[]){const r=input.rooms?.[key];out.rooms[key]=fields(r,out.rooms[key]);out.rooms[key].image=image(r?.image,defaultContent.rooms[key].image);out.rooms[key].coverImage=image(r?.coverImage,'',true);if(out.rooms[key].name.length>30)throw new Error('空间名称最多 30 字');if(!out.rooms[key].name)throw new Error('空间名称不能为空');}
 // Upgrade the previous default copy without changing saved pictures or custom wording.
 if(input.copyVersion!==1){
  if(out.rooms.feifei.tagline==='三杯美式，三种好心情')out.rooms.feifei.tagline=defaultContent.rooms.feifei.tagline;
  if(out.rooms.tuntun.tagline==='热乎的饭，踏实的幸福')out.rooms.tuntun.tagline=defaultContent.rooms.tuntun.tagline;
  if(out.cinema.sofaText==='小猫靠着卡皮巴拉，今晚哪儿也不去。')out.cinema.sofaText=defaultContent.cinema.sofaText;
 }
 out.decor.backgroundImage=image(input.decor?.backgroundImage,out.decor.backgroundImage,true);const opacity=input.decor?.opacity??out.decor.opacity;if(!Number.isFinite(opacity)||opacity<0||opacity>1)throw new Error('背景浓度需在 0–100% 之间');out.decor.opacity=opacity;
 out.delivery.image=image(input.delivery?.image,out.delivery.image);out.delivery.heading=text(input.delivery?.heading,out.delivery.heading);out.delivery.previewHeading=text(input.delivery?.previewHeading,out.delivery.previewHeading);
 if(input.delivery?.lines!==undefined){if(!Array.isArray(input.delivery.lines)||input.delivery.lines.length!==4)throw new Error('动画需填写四句旁白');out.delivery.lines=input.delivery.lines.map((v:any)=>text(v,'',100));}
 const list=input.series??defaultContent.series;if(!Array.isArray(list)||!list.length||list.length>30)throw new Error('请保留 1–30 部剧集');const ids=new Set<string>();
 out.series=list.map((s:any)=>{if(!s||typeof s.id!=='string'||!/^[-a-z0-9]{1,60}$/.test(s.id)||ids.has(s.id))throw new Error('剧集编号无效或重复');ids.add(s.id);const base=defaultContent.series.find(d=>d.id===s.id)??{...defaultContent.series[0],id:s.id,name:'新剧集',image:'',showPin:false};
  const clean={...base,...fields(s,{id:base.id,name:base.name,english:base.english,motif:base.motif,line:base.line,color:base.color,title:base.title,note:base.note,place:base.place})};if(!clean.name||!/^#[a-fA-F0-9]{6}$/.test(clean.color))throw new Error('请填写剧名和有效的主题色');
  const pair=(v:any,f:[number,number]):[number,number]=>{if(v===undefined)return f;if(!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isFinite(n)||n<0||n>100))throw new Error('图片位置需在 0–100 之间');return [v[0],v[1]];};
  if(s.objects!==undefined&&(!Array.isArray(s.objects)||s.objects.length>8))throw new Error('每部剧最多填写 8 个收藏元素');
  return {...clean,image:image(s.image,base.image,true),objects:(s.objects??base.objects).map((v:any)=>text(v,'',40)).filter(Boolean),pin:pair(s.pin,base.pin),crop:pair(s.crop,base.crop),showPin:s.showPin===undefined?base.showPin:s.showPin===true};
 });return out;
}
export function contentImageSlots(content:SiteContent){return [
 ...(['feifei','tuntun','cinema'] as RoomKey[]).flatMap(k=>[{key:'room-'+k+'-image',get:()=>content.rooms[k].image,set:(v:string)=>{content.rooms[k].image=v;}},{key:'room-'+k+'-cover',get:()=>content.rooms[k].coverImage,set:(v:string)=>{content.rooms[k].coverImage=v;}}]),
 {key:'decor-background',get:()=>content.decor.backgroundImage,set:(v:string)=>{content.decor.backgroundImage=v;}},
 {key:'delivery-image',get:()=>content.delivery.image,set:(v:string)=>{content.delivery.image=v;}},
 ...content.series.map(s=>({key:'series-'+s.id,get:()=>s.image,set:(v:string)=>{s.image=v;}})),
 ];}
