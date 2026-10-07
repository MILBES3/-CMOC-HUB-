import {notFound} from 'next/navigation';
import {hasAccess} from '@/app/access';
import Login from '@/app/login';
import Hub from '@/app/workbench';
import {countryCodes,type CountryCode} from '@/lib/move-cases';
export const dynamic='force-dynamic';
export default async function CountryPage({params}:{params:Promise<{country:string}>}){
 const code=(await params).country.toUpperCase();
 if(!countryCodes.includes(code as CountryCode))notFound();
 return await hasAccess()?<Hub countryPage={code as CountryCode}/>:<Login/>;
}
