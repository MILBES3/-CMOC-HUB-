'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Languages} from 'lucide-react';
import {defaultSettings,languages,locales,normalizeSettings,type Language,type SiteSettings} from './site-settings';
import {translations} from './translations';
const Context=createContext<{language:Language;setLanguage:(l:Language)=>void;settings:SiteSettings;setSettings:(s:SiteSettings)=>void;t:(key:string,values?:Record<string,string|number>)=>string;locale:string;settingsError:string;settingsLoaded:boolean}>({language:'nl',setLanguage:()=>{},settings:defaultSettings,setSettings:()=>{},t:k=>k,locale:'nl-NL',settingsError:'',settingsLoaded:false});
export function SiteProvider({children}:{children:ReactNode}){
 const [language,setLang]=useState<Language>('nl');const [settings,setSettingsState]=useState(defaultSettings);const [settingsError,setError]=useState('');const [settingsLoaded,setSettingsLoaded]=useState(false);
 useEffect(()=>{let active=true;let initial=true;let saved:string|null=null;try{saved=localStorage.getItem('ims-language')}catch{}if(saved&&saved in languages)setLang(saved as Language);
 const refresh=()=>fetch('/api/settings',{cache:'no-store',credentials:'same-origin'}).then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<SiteSettings>}).then((raw:SiteSettings)=>{if(active){const s=normalizeSettings(raw);setSettingsState(s);if(initial&&!saved){try{if(!localStorage.getItem('ims-language'))setLang(s.defaultLanguage)}catch{setLang(s.defaultLanguage)}}initial=false;setError('');setSettingsLoaded(true)}}).catch(()=>{if(active)setError('Instellingen laden is niet gelukt. Vernieuw de pagina.');});void refresh();const tick=()=>{if(!document.hidden)void refresh()};const id=setInterval(tick,20000);window.addEventListener('focus',tick);return()=>{active=false;clearInterval(id);window.removeEventListener('focus',tick)}},[]);
 useEffect(()=>{document.documentElement.lang=language;document.documentElement.style.setProperty('--primary',settings.primaryColor);document.documentElement.style.setProperty('--sidebar',settings.sidebarColor)},[language,settings]);
 const setLanguage=(l:Language)=>{setLang(l);try{localStorage.setItem('ims-language',l)}catch{}};
 const setSettings=(next:SiteSettings)=>setSettingsState(normalizeSettings(next));
 const t=(key:string,values?:Record<string,string|number>)=>{let out=settings.texts[key]?.[language]??translations[key]?.[language]??key;for(const [k,v] of Object.entries(values||{}))out=out.replaceAll('{'+k+'}',String(v));return out};
 return <Context.Provider value={{language,setLanguage,settings,setSettings,t,locale:locales[language],settingsError,settingsLoaded}}>{children}</Context.Provider>
}
export const useSite=()=>useContext(Context);
export function LanguagePicker(){const {language,setLanguage,t}=useSite();return <div className="language-picker"><Languages size={17} aria-hidden="true"/><Select value={language} onValueChange={v=>setLanguage(v as Language)}><SelectTrigger aria-label={t('Taal kiezen')}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(languages).map(([code,label])=><SelectItem key={code} value={code}>{label}</SelectItem>)}</SelectContent></Select></div>}
