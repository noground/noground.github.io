export type Shop = {id:string;name:string;english:string;tagline:string;description:string;image:string;categories:string[]};
export type Dish = {id:string;shop:string;name:string;category:string;description:string;ingredients:string[];price:number;image:string;tag:string;options:Record<string,string[]>;available:boolean};
export type CartItem = {key:string;id:string;name:string;shop:string;image:string;price:number;quantity:number;options:Record<string,string>};
export type User = {id:string;nickname:string;role:string};
export type Order = {id:string;nickname:string;user_id:string;items:CartItem[];total:number;note:string;status:string;created_at:string;rating:number|null;review:string;request_id:string};
export const shops:Shop[]=[
 {id:'feifei',name:'菲菲饮品店',english:'FEIFEI DRINKS',tagline:'三杯美式，三种好心情',description:'橙香、椰香、可可香，挑一杯今天的心情。',image:'/images/orange-americano.svg',categories:['风味美式']},
 {id:'tuntun',name:'屯屯小厨房',english:'TUNTUN KITCHEN',tagline:'热乎的饭，踏实的幸福',description:'把喜欢的家常味道，认真做给你吃。',image:'/images/kitchen.jpg',categories:['炒菜','主食','汤羹']}
];
export const dishes:Dish[]=[
 {id:'orange-americano',shop:'feifei',name:'橙C美式',category:'风味美式',description:'清亮橙香遇上醇厚浓缩，果汁的酸甜让咖啡多了一点轻快。配料为示例，可按实际配方调整。',ingredients:['浓缩咖啡','橙汁','鲜橙片','饮用水','冰块'],price:18,image:'/images/orange-americano.svg',tag:'橙意满满',options:{温度:['冰','常温'],甜度:['不额外加糖','微糖']},available:true},
 {id:'coconut-americano',shop:'feifei',name:'生椰美式',category:'风味美式',description:'用清爽椰子水托住咖啡香，淡淡椰甜，轻盈好入口。配料为示例，可按实际配方调整。',ingredients:['浓缩咖啡','椰子水','饮用水','冰块'],price:18,image:'/images/coconut-americano.svg',tag:'椰风轻轻',options:{温度:['冰','常温'],甜度:['不额外加糖','微糖']},available:true},
 {id:'cocoa-americano',shop:'feifei',name:'可可美式',category:'风味美式',description:'微苦可可与浓缩咖啡相遇，香气浓郁，留一口柔和的回味。配料为示例，可按实际配方调整。',ingredients:['浓缩咖啡','可可粉','饮用水'],price:18,image:'/images/cocoa-americano.svg',tag:'可可抱抱',options:{温度:['冰','热'],甜度:['不额外加糖','微糖']},available:true},
 {id:'tomato-egg',shop:'tuntun',name:'番茄炒蛋',category:'炒菜',description:'酸甜的番茄裹着蓬松鸡蛋，汤汁拌饭，是熟悉又安心的家的味道。',ingredients:['番茄','鸡蛋','小葱','食用油','盐','糖'],price:16,image:'/images/kitchen.jpg',tag:'下饭担当',options:{口味:['家常口味','少盐'],葱花:['要葱花','不要葱花']},available:true},
 {id:'chicken',shop:'tuntun',name:'宫保鸡丁',category:'炒菜',description:'嫩鸡丁、脆花生和爽口配菜大火快炒，微辣带甜，越吃越开胃。',ingredients:['鸡腿肉','花生','黄瓜','胡萝卜','干辣椒','生抽'],price:26,image:'/images/chicken.jpg',tag:'人气家常菜',options:{辣度:['微辣','中辣','不辣']},available:true},
 {id:'greens',shop:'tuntun',name:'蒜蓉时蔬',category:'炒菜',description:'当季青菜与蒜香相伴，清清爽爽，让这一餐多一份鲜绿。',ingredients:['当季青菜','大蒜','食用油','盐'],price:12,image:'/images/greens.jpg',tag:'来点绿色',options:{口味:['正常','少油少盐']},available:true},
 {id:'fried-rice',shop:'tuntun',name:'黄金蛋炒饭',category:'主食',description:'粒粒分明的米饭，裹上金黄蛋香，再加一点蔬菜的清甜。',ingredients:['米饭','鸡蛋','胡萝卜','豌豆','小葱','盐'],price:18,image:'/images/rice.jpg',tag:'一碗满足',options:{分量:['标准份','少饭'],葱花:['要葱花','不要葱花']},available:true},
 {id:'rice',shop:'tuntun',name:'香软米饭',category:'主食',description:'热气腾腾，松软香甜。一碗白米饭，接住每一道菜的好滋味。',ingredients:['大米','饮用水'],price:3,image:'/images/white-rice.jpg',tag:'配菜好搭档',options:{},available:true},
 {id:'soup',shop:'tuntun',name:'紫菜蛋花汤',category:'汤羹',description:'紫菜鲜香、蛋花轻柔，饭前饭后来一碗，胃里心里都暖暖的。',ingredients:['紫菜','鸡蛋','虾皮','小葱','香油','盐'],price:10,image:'/images/soup.jpg',tag:'暖胃小汤',options:{葱花:['要葱花','不要葱花']},available:true}
];
// Retire the first sample drinks even when an older menu edit is stored in D1.
export const retiredDishIds=new Set(['americano','latte','coconut','matcha','jasmine','lemon']);
export const statusLabels:Record<string,string>={pending:'已下单',cooking:'制作中',ready:'可以开饭啦',completed:'已完成'};
export function buildCartLine(dish:Dish,quantity:number,options:Record<string,string>):CartItem {
 if(!dish.available || !Number.isInteger(quantity)||quantity<1||quantity>99) throw new Error('份数需在 1–99 之间');
 const cleaned:Record<string,string>={};
 for(const [group,choices] of Object.entries(dish.options)){const choice=options[group];if(!choices.includes(choice))throw new Error('请选择有效的口味');cleaned[group]=choice;}
 return {key:dish.id+JSON.stringify(cleaned),id:dish.id,name:dish.name,shop:dish.shop,image:dish.image,price:dish.price,quantity,options:cleaned};
}
