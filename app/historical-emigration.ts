// Geaggregeerd uit CMOC_CANCREQ_2026: alleen emigratie-opzeggingen.
// Geen installatienummers, contractnummers of medewerkeridentificaties opgeslagen.
export const historicalEmigration={
  source:'CMOC_CANCREQ_2026',
  period:'december 2025 – juli 2026',
  total:236,
  notRetained:236,
  cancelledStatus:217,
  missingStatus:19,
  residential:217,
  business:19,
  averageDaysToClose:11.3,
  medianDaysToClose:10,
  missingOfferRegistration:236,
  months:[
    {label:'dec 2025',count:3},{label:'jan 2026',count:21},{label:'feb 2026',count:25},{label:'mrt 2026',count:28},
    {label:'apr 2026',count:44},{label:'mei 2026',count:46},{label:'jun 2026',count:62},{label:'jul 2026',count:7},
  ],
} as const;
