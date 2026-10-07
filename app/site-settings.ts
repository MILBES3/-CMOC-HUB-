export const languages={nl:'Nederlands',en:'English',de:'Deutsch',es:'Español'} as const;
export type Language=keyof typeof languages;
export const locales={nl:'nl-NL',en:'en-GB',de:'de-DE',es:'es-ES'};
export const defaultSettings={
 logoUrl:'https://cdn.prod.website-files.com/66deaea8f6a15972eac7c4a8/684ad01f0186ea4f0d488502_verisure_logo_red_rgb.webp',
 primaryColor:'#d51b2b',sidebarColor:'#77080e',defaultLanguage:'nl' as Language,
 sourceUrl:'https://verisure-my.sharepoint.com/:x:/r/personal/eunho_kim_verisure_nl/_layouts/15/Doc.aspx?sourcedoc=%7B0160DC81-4B75-4F72-AF3E-2B809E906FA9%7D&file=CMOC_CANCREQ_2026.xlsx&action=default',
 sections:{summary:true,metrics:true,attention:true,funnel:true,history:true,recent:true,source:true},
 texts:{} as Record<string,Partial<Record<Language,string>>>
};
export type SiteSettings=typeof defaultSettings;
export function normalizeSettings(stored:Partial<SiteSettings>={}):SiteSettings{
 return {
  ...defaultSettings,
  ...stored,
  sidebarColor:stored.sidebarColor??defaultSettings.sidebarColor,
  sections:{...defaultSettings.sections,...stored.sections},
  texts:stored.texts??defaultSettings.texts
 };
}
