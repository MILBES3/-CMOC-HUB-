# Architectuur en codekaart

React 19.2.6; Next.js API-oppervlak 16.3.4 via Vinext 1.0.0-beta.5;
Vite 8.0.13; TypeScript 5.9.3; Cloudflare Vite-plugin 1.37.1;
Wrangler 4.92.0; Zod 3.25.76; Drizzle 0.45.2. Exacte versies staan in het
packagebestand en de lockfile. Vinext is in deze versie een beta-afhankelijkheid.

De browser praat via relatieve `/api/...`-paden met de Worker. De Worker valideert
sessies en invoer en leest/schrijft via de D1-binding `DB`. Het portaal heeft geen
externe SaaS-API-key nodig om eigen cases te registreren.

| Onderdeel | Code |
| --- | --- |
| Team- en adminlogin, sessiecontrole | app/access.ts, app/login.tsx, app/api/access/, app/api/admin/access/ |
| Dashboard en caseformulier | app/workbench.tsx |
| Adminportaal | app/admin/panel.tsx |
| Taal/merk/configuratie | app/site-provider.tsx, app/site-settings.ts, app/translations.ts |
| Alle 18 landen | app/country-directory.tsx, app/landen/[country]/, lib/move-cases.ts |
| Historische bron en correcties | app/historical-register.tsx, server/history.ts, server/historical-data.json |
| Casebewerkingen | app/api/cases/route.ts, app/api/cases/[id]/route.ts |
| Database | db/schema.ts, drizzle/*.sql |

Pilot: BE, DE en NL. De overige 15 bestemmingen vallen onder Outside Pilot.
Een ontvangende landpagina toont overgedragen leads met toestemming; de
registratie van nieuwe cases gebeurt centraal via Nieuwe case.

De gewenste contactdatum bepaalt de deadline tot het einde van die dag in
Europe/Amsterdam. Zonder datum is dat 24 uur vanaf aanmaken. SALE en CANCEL
stoppen de timer. De timer wordt in de browser weergegeven; er is geen
servertaak voor automatische telefoontjes of notificaties.

Sessies zijn HMAC-ondertekende HttpOnly/Secure-cookies: team 7 dagen, admin 8 uur.
Loginpogingen worden in D1 begrensd. Schrijfaanvragen hebben servervalidatie en
originecontrole. Case- en instellingenbewerkingen bewaken gelijktijdige wijzigingen.

| Tabel | Functie |
| --- | --- |
| cases | Nieuwe cases, route, klantcontact, datums en resultaat |
| hub_settings | Dashboardkleuren, logo, teksten, taal en zichtbaarheid |
| historical_edits | Correcties bovenop de gebundelde historische import |
| login_attempts | Tijdelijke limieten op mislukte loginpogingen |

Eigenaarvelden blijven voor compatibiliteit in het schema maar worden niet meer
in het standaardformulier getoond. De code biedt gedeelde toegangscodes, geen
persoonlijke accounts, SSO, individuele landrechten of individueel auditlog.
Binnen de teamlogin kan men alle landen bekijken. Bewaartermijnen zijn
registratievelden; er is geen automatisch verwijderproces geïmplementeerd.

Logo en bronbestand gebruiken instelbare HTTPS-links. Het bronbestand wordt niet
live uit Power BI/Excel gesynchroniseerd; de historische data is een eerdere
import plus databasecorrecties. IT kan externe brandinglinks vervangen door
intern beheerde HTTPS-assets via het adminportaal.

De admincode wordt via Web Crypto PBKDF2-SHA256 gecontroleerd met een random
16-byte salt, 100000 iteraties en een 32-byte hash. De hash staat alleen als
runtime-secret. Teamlogin accepteert deze beheercredential en geeft dan een
admincookie uit. Bij teamlogin met een teamcode wordt een eventuele oude
admincookie verwijderd. De beheerrechten zijn expliciet en blijven revocable.
