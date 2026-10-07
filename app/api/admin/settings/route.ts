import {NextResponse} from 'next/server';
import {z} from 'zod';
import {hasAdminAccess} from '@/app/access';
import {normalizeSettings} from '@/app/site-settings';
import {db,readSettings,sameOrigin} from '@/server/settings';
const url=z.string().max(2000).url().refine(v=>v.startsWith('https://'),'Gebruik een HTTPS-link.');
const schema=z.object({logoUrl:url,sourceUrl:url,primaryColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),sidebarColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),defaultLanguage:z.enum(['nl','en','de','es']),sections:z.object({summary:z.boolean(),metrics:z.boolean(),attention:z.boolean(),funnel:z.boolean(),history:z.boolean(),recent:z.boolean(),source:z.boolean()}),texts:z.record(z.string().max(2000),z.object({nl:z.string().max(4000).optional(),en:z.string().max(4000).optional(),de:z.string().max(4000).optional(),es:z.string().max(4000).optional()})).refine(v=>Object.keys(v).length<1000)});
export async function PUT(request:Request){if(!await hasAdminAccess())return NextResponse.json({error:'Alleen voor beheerders.'},{status:403});if(!sameOrigin(request))return NextResponse.json({error:'Ongeldig verzoek.'},{status:403});try{const raw=await request.text();if(raw.length>500000)return NextResponse.json({error:'Invoer te groot.'},{status:413});const body=JSON.parse(raw);const data=schema.parse(body);
const current=await db().prepare('SELECT value FROM hub_settings WHERE key=?').bind('dashboard').first<{value:string}>();
const expected=schema.safeParse(body.expectedSettings);
if(!expected.success||JSON.stringify(normalizeSettings(expected.data))!==JSON.stringify(normalizeSettings(current?JSON.parse(current.value):{})))return NextResponse.json({error:'Instellingen zijn intussen gewijzigd. Vernieuw de pagina voordat je opnieuw bewerkt.'},{status:409});
const changed=await db().prepare('INSERT INTO hub_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at WHERE hub_settings.value=?').bind('dashboard',JSON.stringify(data),new Date().toISOString(),current?.value??'').run();
if(!changed.meta.changes)return NextResponse.json({error:'Instellingen zijn intussen gewijzigd. Vernieuw de pagina.'},{status:409});return NextResponse.json(await readSettings(),{headers:{'Cache-Control':'no-store'}})}catch(e){return NextResponse.json({error:e instanceof z.ZodError?'Controleer de kleuren, links en teksten.':'Instellingen opslaan is niet gelukt.'},{status:e instanceof z.ZodError?400:503})}}
