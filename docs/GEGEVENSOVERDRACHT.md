# Gegevensoverdracht

De ZIP bevat code, migraties en de gebundelde historische bronimport. Hij bevat
geen export van de huidige productie-D1. Nieuwe cases en aanpassingen worden
daarom niet vanzelf meegenomen wanneer IT een nieuwe database aanmaakt.

De originele Sites-configuratie bevat een project-ID en de binding DB, maar geen
bruikbare externe D1-database-ID of Cloudflare-accountcredentials. Vul voor eigen
hosting de database van het IT-account in. Een bestaande hostingdatabase kan
niet worden overgenomen door uitsluitend deze project-ID te kopiëren.

## Migratie naar een nieuwe beheeromgeving

1. Laat de huidige hostingbeheerder een volledige SQL-export beschikbaar maken
   van cases, hub_settings en historical_edits. Login_attempts bevat tijdelijke
   loginlimieten en hoeft niet naar een nieuw account. Vraag ook vast te leggen
   welke migraties al zijn toegepast.
2. D1 onder een toegankelijk eigen Cloudflare-account kan worden geëxporteerd
   met `wrangler d1 export <database> --remote --output <privaat-exportpad.sql>`.
   Deze opdracht geeft geen toegang tot een Sites-database waarvoor IT geen
   accountrechten heeft; de huidige platformbeheerder moet die export verzorgen.
3. Spreek een moment af waarop medewerkers tijdelijk niet meer schrijven en
   maak dan de definitieve export. Zo gaan de laatste wijzigingen niet verloren.
4. Kies één importstrategie: een volledige schema+data-export naar een lege
   database, OF de meegeleverde migraties plus een data-only import. Pas niet
   beide schema’s na elkaar toe; tabellen kunnen dan conflicteren.
5. Bewaar de oorspronkelijke case-ID’s, updated_at, created_at, bestemmingscodes
   en historische rij-ID’s. De historische import gebruikt rijvolgorde voor ID’s;
   herordenen van server/historical-data.json maakt oude correcties onbetrouwbaar.
6. Koppel dezelfde DB-binding, configureer de secrets en publiceer op het
   organisatieaccount. Nieuwe secrets vragen opnieuw inloggen van gebruikers.
7. Verplaats pas daarna het gebruik naar de nieuwe URL. De oorspronkelijke
   omgeving kan als terugval worden behouden tot IT de overdracht accepteert.

De CSV-export uit de Hub is bruikbaar voor rapportage maar is geen volledige
back-up: hij bevat geen dashboardinstellingen of historische correcties en de
applicatie heeft geen CSV-import voor herstel. Een betrouwbare overdracht vraagt
SQL/data-export op databaseniveau.

Bij een leeg begin zonder livegegevens: pas de drie meegeleverde migraties toe
in bestandsvolgorde. De historische bron blijft direct uit het meegeleverde JSON
beschikbaar; nieuwe cases zijn dan nog leeg en instellingen gebruiken defaults.
