import type { Metadata } from 'next';
import './globals.css';
import './workbench.css';
import './upgrade.css';
import {SiteProvider} from './site-provider';
export const metadata: Metadata={title:'International Move Hub | Verisure',description:'Intern overzicht voor internationale verhuiscases en opvolging.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl"><body><SiteProvider>{children}</SiteProvider></body></html>}
