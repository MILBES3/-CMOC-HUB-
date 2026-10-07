import {NextResponse} from 'next/server';
import {readSettings} from '@/server/settings';
export async function GET(){try{return NextResponse.json(await readSettings(),{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Instellingen laden is niet gelukt.'},{status:503})}}
