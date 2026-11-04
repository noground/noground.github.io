import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'菲菲和屯屯 · 两人一起，慢慢生活',description:'菲菲饮品店、屯屯小厨房与家庭观影角：喝点喜欢的，吃点热乎的，再一起看一集。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
