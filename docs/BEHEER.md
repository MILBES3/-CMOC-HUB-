# Beheer

Gebruik `/admin` of `/admin.html` op de gekozen host.

Via de adminpagina zijn kleuren, logolink, bronlink, standaardtaal, teksten per
taal, zichtbare dashboardblokken, live cases en historische regels aanpasbaar.
Deze wijzigingen worden in D1 opgeslagen en ongeveer elke 20 seconden door
geopende dashboards opnieuw geladen. Niet-opgeslagen wijzigingen blijven lokaal
in het formulier. Bij een wijzigingsconflict moet de beheerder verversen.

Hosting, domein/DNS, toegangscodes, nieuwe programmeerfunctionaliteit,
databasestructuur en serverconfiguratie worden via het hostingaccount en de
interne repository beheerd. De adminpagina is geen serverbeheerconsole.

Teamcode wijzigen: secret ACCESS_CODE. Admincode wijzigen: genereer met scripts/hash-admin-code.mjs een nieuwe salted hash en sla deze op in ADMIN_ACCESS_CODE_HASH. Een plaintext-code in deze key werkt niet.
SESSION_SECRET wijzigen maakt bestaande ondertekende sessies ongeldig; een
codewijziging alleen trekt reeds uitgegeven sessies niet in. Configureer secrets
in de hosting, niet in .env.example of frontendsource.

Plan databasebackups onder het organisatieaccount. Een code-rollback verandert
geen reeds gewijzigde databasegegevens. Bewaar database-exportbestanden buiten
Git en buiten de openbare webroot. Back-up en herstel worden door IT ingericht;
de applicatie heeft hiervoor geen automatische planner.

Beheeracceptatie door IT: account, DNS/HTTPS, D1-binding DB, secrets, migraties,
gegevensoverdracht en rollen. Dit is een overdrachtsinstructie; deze punten zijn
niet namens IT uitgevoerd.

## Documentatie bij de vastgelegde stack

De meegeleverde versies zijn vastgezet; vervang ze niet automatisch door
nieuwere versies tijdens de eerste overdracht.

- Cloudflare Vite-plugin: https://developers.cloudflare.com/workers/vite-plugin/get-started/
- Wrangler-configuratie: https://developers.cloudflare.com/workers/wrangler/configuration/
- D1-migraties en export: https://developers.cloudflare.com/d1/wrangler-commands/
- D1 import/export: https://developers.cloudflare.com/d1/best-practices/import-export-data/
- Vinext: https://github.com/cloudflare/vinext

De runtimebeheerderscode werkt via beide loginpagina’s. De beheerdersrol blijft
zichtbaar op de adminpagina en is geen verborgen bevoegdheid. De credential
geeft toegang binnen deze applicatie, niet tot het hostingaccount, DNS of Git.
Een adminsessie verloopt na 8 uur; daarna moet opnieuw worden ingelogd.
