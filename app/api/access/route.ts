import {NextResponse} from 'next/server';
import {env} from 'cloudflare:workers';
import {checkCode,checkAdminCode,createSession,createAdminSession,cookieSettings,adminCookieSettings} from '@/app/access';
import {sameOrigin} from '@/server/settings';

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Ongeldig verzoek.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return NextResponse.json({error:'Ongeldig verzoek.'},{status:415});
 let input:unknown;
 try{input=(await request.json() as {code?:unknown}).code}catch{return NextResponse.json({error:'Vul de toegangscode in.'},{status:400})}
 if(typeof input!=='string'||input.length>128)return NextResponse.json({error:'Ongeldige toegangscode.'},{status:400});
 try{
  const db=env.DB;if(!db)throw Error('Database unavailable');
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(request.headers.get('cf-connecting-ip')||'unknown'));
  const fingerprint=Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
  const now=Date.now();
  const attempt=await db.prepare('INSERT INTO login_attempts (key,window_start,attempts) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN ?-window_start>=900000 THEN 1 ELSE attempts+1 END,window_start=CASE WHEN ?-window_start>=900000 THEN excluded.window_start ELSE window_start END RETURNING attempts').bind(fingerprint,now,now,now).first<{attempts:number}>();
  if(!attempt||attempt.attempts>5)return NextResponse.json({error:'Te veel pogingen. Probeer het over 15 minuten opnieuw.'},{status:429});
  const admin=await checkAdminCode(input);
  if(!admin&&!await checkCode(input))return NextResponse.json({error:'Toegangscode niet herkend.'},{status:401});
  await db.prepare('DELETE FROM login_attempts WHERE key=?').bind(fingerprint).run();
  const response=NextResponse.json({ok:true,role:admin?'admin':'team'});
  if(admin){
   response.cookies.set({...adminCookieSettings,value:await createAdminSession()});
   response.cookies.set({...cookieSettings,value:'',maxAge:0});
  }else{
   response.cookies.set({...cookieSettings,value:await createSession()});
   response.cookies.set({...adminCookieSettings,value:'',maxAge:0});
  }
  return response;
 }catch{return NextResponse.json({error:'Inloggen is tijdelijk niet beschikbaar.'},{status:503})}
}
