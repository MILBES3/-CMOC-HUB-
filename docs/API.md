# API-overzicht

Alle paden werken op hetzelfde HTTPS-domein als de browserinterface.
Secrets worden niet via de API aan de browser teruggegeven.

| Methode | Pad | Toegang | Functie |
| --- | --- | --- | --- |
| POST | /api/access | Login | Team- of admincode valideren; bijpassende rolcookie uitgeven |
| POST | /api/admin/access | Login | Admincode valideren, admincookie uitgeven |
| POST | /api/logout | Browser | Team- en admincookies verwijderen |
| GET | /api/settings | Openbaar | Publieke vormgevings- en tekstinstellingen |
| PUT | /api/admin/settings | Admin | Instellingen opslaan met expectedSettings |
| GET | /api/cases | Team/admin | Cases laden |
| GET | /api/cases?receiving=1 | Team/admin | Alleen leads met toestemming en overdrachtsdatum |
| POST | /api/cases | Team/admin | Gevalideerde case aanmaken |
| PATCH | /api/cases/:id | Team/admin | Case bewerken of CANCEL/PROGRESS/SALE opslaan |
| DELETE | /api/cases/:id | Admin | Case verwijderen |
| GET | /api/historical | Team/admin | Historische bron plus correcties lezen |
| PATCH | /api/historical | Team/admin | Bestemmingsland van historische regel toewijzen |
| PUT | /api/admin/historical | Admin | Historische regel corrigeren |

Loginbody: `{ "code": "..." }`; echte codes staan uitsluitend als Worker secrets.
Voor casespecificaties is `source/lib/move-cases.ts` de gezaghebbende Zod-schema.
De frontend zet formuliergegevens via `payload` in `app/workbench.tsx` om.
PATCH-case vereist `expectedUpdatedAt` uit de laatst gelezen case. Een resultaat
kan als `{ "result": "SALE", "expectedUpdatedAt": "..." }` worden gestuurd.
Instellingen bewaren `expectedSettings` voor conflictdetectie.

Veelgebruikte foutstatussen: 400 invoerfout, 401 niet ingelogd, 403 geen rechten,
404 ontbrekende case, 409 wijzigingsconflict, 429 loginlimiet, 503 tijdelijk
onbeschikbare database/server. De volledige betekenis staat in de routebestanden.
Er zijn geen e-mail-, telefonie- of Power BI-connectors in deze code ingebouwd.

POST /api/access retourneert ook role (team of admin). Een beheerder krijgt
de admincookie, geen teamcookie van 7 dagen. De loginlimiet geldt voorafgaand
aan de credentialcontrole; succesvolle login wist de pogingenteller.
