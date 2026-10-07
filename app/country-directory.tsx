'use client';
import {ArrowUpRight} from 'lucide-react';
import {countries,countryCodes,latinAmericaCountries,pilotCountries,isTransferred,isSale} from '@/lib/move-cases';
import {useSite} from './site-provider';
type Lead={destination_country:string;status:string;consent:string;sent_at:string|null};
export default function CountryDirectory({rows}:{rows:Lead[]}){
 const {t}=useSite();
 return <section className="country-directory">
  <div className="directory-toolbar"><span>{t('Verisure-landen')} · 18</span><a className="action secondary" href="/hub.html"><ArrowUpRight size={17}/>{t('Open jouw werkplek')}</a></div>
  {(['EUROPE','LATAM'] as const).map(region=><section key={region}><h2>{t(region==='EUROPE'?'Europa':'Latijns-Amerika')} <small>{region==='EUROPE'?13:5}</small></h2><div className="country-grid">
   {countryCodes.filter(code=>latinAmericaCountries.has(code)===(region==='LATAM')).map(code=>{
    const received=rows.filter(r=>r.destination_country===code&&isTransferred(r));
    const pilot=pilotCountries.has(code);
    const flag=Array.from(code).map(c=>String.fromCodePoint(127397+c.charCodeAt(0))).join('');
    return <a key={code} className="country-card" href={'/landen/'+code.toLowerCase()}>
     <div className="country-card-top"><span className="country-flag" aria-hidden="true">{flag}</span><span className={pilot?'country-scope pilot':'country-scope'}>{t(pilot?'Pilotland':'Outside Pilot')}</span></div>
     <h3>{t(countries[code])}</h3><div className="country-card-stats"><span><b>{received.filter(r=>!['SALE_REALIZED','NO_SALE'].includes(r.status)).length}</b>{t('Open leads')}</span><span><b>{received.filter(isSale).length}</b>{t('Sales')}</span></div>
     <span className="country-card-link">{t('Open landenpagina')}<ArrowUpRight size={16}/></span>
    </a>
   })}
  </div></section>)}
 </section>
}
