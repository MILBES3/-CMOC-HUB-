import {NextResponse} from 'next/server';
import {cookieSettings,adminCookieSettings} from '@/app/access';
import {sameOrigin} from '@/server/settings';
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Ongeldige aanvraag.'},{status:403});const response=NextResponse.json({ok:true});response.cookies.set({...cookieSettings,value:'',maxAge:0});response.cookies.set({...adminCookieSettings,value:'',maxAge:0});return response}
