'use client';
import {createContext,useContext,type ReactNode} from 'react';
import {defaultContent,type SiteContent} from './content';
const ContentContext=createContext<SiteContent>(defaultContent);
export function ContentProvider({value,children}:{value:SiteContent;children:ReactNode}){return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>}
export const useSiteContent=()=>useContext(ContentContext);
