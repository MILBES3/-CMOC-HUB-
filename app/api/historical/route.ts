import {NextResponse} from 'next/server';
import {hasAccess} from '@/app/access';
import {readHistory} from '@/server/history';
import {db,sameOrigin} from '@/server/settings';
import {countryCodes} from '@/lib/move-cases';
import {z} from 'zod';
export async function GET(){if(!await hasAccess())return NextResponse.json({error:'Geen toegang.'},{status:401});try{return NextResponse.json(await readHistory(),{headers:{'Cache-Control':'private, no-store'}})}catch{return NextResponse.json({error:'Historische cases laden is niet gelukt.'},{status:503})}}
const destinationSchema=z.object({id:z.number().int().min(0),destinationCountry:z.union([z.enum(countryCodes),z.literal('')])});
export async function PATCH(request:Request){if(!await hasAccess())return NextResponse.json({error:'Geen toegang.'},{status:401});if(!sameOrigin(request))return NextResponse.json({error:'Ongeldige aanvraag.'},{status:403});try{const input=destinationSchema.parse(await request.json());const rows=await readHistory();const current=rows.find(row=>row.id===input.id);if(!current)return NextResponse.json({error:'Historische case niet gevonden.'},{status:404});const updated={...current,destinationCountry:input.destinationCountry};await db().prepare('INSERT INTO historical_edits (id,value,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').bind(input.id,JSON.stringify(updated),new Date().toISOString()).run();return NextResponse.json(updated,{headers:{'Cache-Control':'private, no-store'}})}catch(e){return NextResponse.json({error:e instanceof z.ZodError?'Kies een geldig bestemmingsland.':'Bestemmingsland opslaan is niet gelukt.'},{status:e instanceof z.ZodError?400:503})}}
