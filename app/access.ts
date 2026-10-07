import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';
const COOKIE='ims_access';
const DAYS=7;
const encoder=new TextEncoder();
function secret(){const value=(env as unknown as Record<string,string>).SESSION_SECRET;if(!value||value.length<32)throw new Error('Access unavailable');return value}
function b64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function fromB64(value:string){return Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))}
async function sign(value:string){const key=await crypto.subtle.importKey('raw',encoder.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))))}
function same(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
export async function checkCode(input:string){const configured=(env as unknown as Record<string,string>).ACCESS_CODE;if(!configured)return false;const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(input)),crypto.subtle.digest('SHA-256',encoder.encode(configured))]);return same(b64(new Uint8Array(a)),b64(new Uint8Array(b)))}
export async function createSession(){const expiry=Date.now()+DAYS*86400000;const payload=b64(encoder.encode(`v1:${expiry}`));return `${payload}.${await sign(payload)}`}
export async function hasAccess(){if(await hasAdminAccess())return true;try{const value=(await cookies()).get(COOKIE)?.value;if(!value)return false;const [payload,sig]=value.split('.');if(!payload||!sig||!same(sig,await sign(payload)))return false;const text=new TextDecoder().decode(fromB64(payload));const [version,expiry]=text.split(':');return version==='v1'&&Number(expiry)>Date.now()}catch{return false}}
export const cookieSettings={name:COOKIE,httpOnly:true,secure:true,sameSite:'lax' as const,path:'/',maxAge:DAYS*86400};
export const adminCookieSettings={...cookieSettings,name:'ims_admin',maxAge:8*3600};
export async function checkAdminCode(input:string){
 const runtime=env as unknown as Record<string,string>;
 if(runtime.ADMIN_ACCESS_CODE_HASH){
  const match=/^pbkdf2-sha256\$100000\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(runtime.ADMIN_ACCESS_CODE_HASH);
  if(!match)throw new Error('Admin credential configuration unavailable');
  const salt=Uint8Array.from(match[1].match(/../g)!,v=>parseInt(v,16));
  const key=await crypto.subtle.importKey('raw',encoder.encode(input),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:100000},key,256);
  const actual=Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');
  return same(actual,match[2]);
 }
 // Compatibility for deployments that have not migrated their existing secret.
 const configured=runtime.ADMIN_ACCESS_CODE;if(!configured)return false;
 const hash=async(v:string)=>b64(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(v))));
 return same(await hash(input),await hash(configured));
}
export async function createAdminSession(){const payload=b64(encoder.encode('admin:'+String(Date.now()+8*3600000)));return payload+'.'+await sign(payload)}
export async function hasAdminAccess(){try{const value=(await cookies()).get(adminCookieSettings.name)?.value;if(!value)return false;const [payload,sig]=value.split('.');if(!payload||!sig||!same(sig,await sign(payload)))return false;const [role,expiry]=new TextDecoder().decode(fromB64(payload)).split(':');return role==='admin'&&Number(expiry)>Date.now()}catch{return false}}
