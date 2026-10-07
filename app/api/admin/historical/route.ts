import {NextResponse} from 'next/server';
import {z} from 'zod';
import {hasAdminAccess} from '@/app/access';
import {db,sameOrigin} from '@/server/settings';
import records from '@/server/historical-data.json';
import {countryCodes} from '@/lib/move-cases';
const schema=z.object({id:z.number().int().min(0).max(records.length-1),installationNumber:z.string().min(1).max(80),requestDate:z.string().date(),closedDate:z.string().date(),source:z.string().max(120),customerType:z.string().max(120),result:z.string().max(120),cancelStatus:z.string().max(120),daysToClose:z.number().int().min(0).max(10000),destinationCountry:z.union([z.enum(countryCodes),z.literal('')]).default('')}).refine(v=>v.closedDate>=v.requestDate,{message:'De sluitdatum mag niet vóór de aanvraagdatum liggen.'});
export async function PUT(request:Request){if(!await hasAdminAccess()||!sameOrigin(request))return NextResponse.json({error:'Alleen voor beheerders.'},{status:403});try{const data=schema.parse(await request.json());data.daysToClose=Math.round((Date.parse(data.closedDate)-Date.parse(data.requestDate))/86400000);await db().prepare('INSERT INTO historical_edits (id,value,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').bind(data.id,JSON.stringify(data),new Date().toISOString()).run();return NextResponse.json(data)}catch(e){return NextResponse.json({error:e instanceof z.ZodError?e.issues[0]?.message:'Opslaan is niet gelukt.'},{status:e instanceof z.ZodError?400:503})}}
