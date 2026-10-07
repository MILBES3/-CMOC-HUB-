import {NextResponse} from 'next/server';
import {checkAdminCode,createAdminSession,adminCookieSettings} from '@/app/access';
import {db,sameOrigin} from '@/server/settings';
export async function POST(request:Request){
 if(!sameOrigin(request)||!request.headers.get('content-type')?.includes('application/json'))return NextResponse.json({error:'Ongeldig verzoek.'},{status:403});
 try{
 const {code}=await request.json() as {code:unknown};
 if(typeof code!=='string'||code.length>128)return NextResponse.json({error:'Ongeldige toegangscode.'},{status:400});
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(request.headers.get('cf-connecting-ip')||'unknown'));
 const key='admin:'+Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
 const now=Date.now();
 const attempt=await db().prepare('INSERT INTO login_attempts (key,window_start,attempts) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN ?-window_start>=900000 THEN 1 ELSE attempts+1 END,window_start=CASE WHEN ?-window_start>=900000 THEN excluded.window_start ELSE window_start END RETURNING attempts').bind(key,now,now,now).first<{attempts:number}>();
 if(!attempt||attempt.attempts>5)return NextResponse.json({error:'Te veel pogingen. Probeer het over 15 minuten opnieuw.'},{status:429});
 if(!await checkAdminCode(code))return NextResponse.json({error:'Toegangscode niet herkend.'},{status:401});
 await db().prepare('DELETE FROM login_attempts WHERE key=?').bind(key).run();
 const response=NextResponse.json({ok:true});response.cookies.set({...adminCookieSettings,value:await createAdminSession()});return response;
 }catch{return NextResponse.json({error:'Inloggen is tijdelijk niet beschikbaar.'},{status:503})}
}
