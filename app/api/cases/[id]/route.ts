import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { hasAccess,hasAdminAccess } from '@/app/access';
import {caseSchema,normalizeCase,deadlineFor,resultStatus} from '@/lib/move-cases';
import {sameOrigin} from '@/server/settings';
import { z } from 'zod';
function db(){if(!env.DB)throw new Error('Database unavailable');return env.DB}
type Params={params:Promise<{id:string}>};
export async function PATCH(request:Request,{params}:Params){const authorized=await hasAccess();if(!authorized)return NextResponse.json({error:'Log in om een case aan te passen.'},{status:401});if(!sameOrigin(request))return NextResponse.json({error:'Ongeldige aanvraag.'},{status:403});
const {id}=await params;
try{
 const existing=await db().prepare('SELECT * FROM cases WHERE id=?').bind(id).first<{created_at:string;sent_at:string|null;consent_at:string|null;first_contact_at:string|null;status:string;consent:string;updated_at:string}>();
 if(!existing)return NextResponse.json({error:'Case niet gevonden.'},{status:404});
 const body=await request.json() as Record<string,unknown>;
 if(typeof body.expectedUpdatedAt!=='string'||body.expectedUpdatedAt!==existing.updated_at)return NextResponse.json({error:'Deze lead is intussen gewijzigd. Sluit het formulier en open de bijgewerkte lead opnieuw.'},{status:409});
 const now=new Date().toISOString();
 if('result' in body){
  const result=z.enum(['CANCEL','PROGRESS','SALE']).parse(body.result);
  if(existing.consent!=='Yes'||!existing.sent_at)return NextResponse.json({error:'Deze lead is nog niet overgedragen met toestemming.'},{status:400});
  const changed=await db().prepare('UPDATE cases SET status=?,installed=?,reached=CASE WHEN ?=\'SALE\' THEN \'Yes\' ELSE reached END,interested=CASE WHEN ?=\'SALE\' THEN \'Yes\' ELSE interested END,updated_at=? WHERE id=? AND updated_at=?').bind(resultStatus[result],result==='SALE'?'Yes':'No',result,result,now,id,existing.updated_at).run();
  return NextResponse.json(changed.meta.changes?{id}:{error:'Deze lead is intussen gewijzigd. Open de lead opnieuw.'},{status:changed.meta.changes?200:409});
 }
 const data=normalizeCase(caseSchema.parse(body),existing,now);
 const deadline=deadlineFor(existing.created_at,data.preferredContactAt);
 const result=await db().prepare(`UPDATE cases SET origin_country=?,destination_country=?,customer_name=?,phone=?,email=?,nl_owner=?,receiving_owner=?,status=?,consent=?,consent_at=?,consent_version=?,move_date=?,preferred_contact_at=?,sent_at=?,sla_deadline=?,first_contact_at=?,contact_outcome=?,reached=?,interested=?,appointment_at=?,installed=?,installed_at=?,estimated_revenue=?,no_sale_reason=?,description=?,retention_until=?,updated_at=? WHERE id=? AND updated_at=?`).bind(data.originCountry,data.destinationCountry,data.customerName,data.phone,data.email,data.nlOwner,data.receivingOwner,data.status,data.consent,data.consentAt||null,data.consentVersion||null,data.moveDate||null,data.preferredContactAt||null,data.sentAt||null,deadline,data.firstContactAt||null,data.contactOutcome||null,data.reached,data.interested,data.appointmentAt||null,data.installed,data.installedAt||null,data.estimatedRevenue??null,data.noSaleReason||null,data.description||null,data.retentionUntil||null,now,id,existing.updated_at).run();return result.meta.changes?NextResponse.json({id}):NextResponse.json({error:'Deze lead is intussen gewijzigd. Open de lead opnieuw.'},{status:409})}catch(e){return NextResponse.json({error:e instanceof z.ZodError?e.issues[0]?.message:'Wijzigen is niet gelukt.'},{status:e instanceof z.ZodError?400:503})}}
export async function DELETE(_request:Request,{params}:Params){const authorized=await hasAdminAccess();if(!authorized)return NextResponse.json({error:'Alleen een beheerder kan cases verwijderen.'},{status:403});if(!sameOrigin(_request))return NextResponse.json({error:'Ongeldige aanvraag.'},{status:403});const {id}=await params;try{const result=await db().prepare('DELETE FROM cases WHERE id=?').bind(id).run();return result.meta.changes?NextResponse.json({ok:true}):NextResponse.json({error:'Case niet gevonden.'},{status:404})}catch{return NextResponse.json({error:'Verwijderen is niet gelukt.'},{status:503})}}
