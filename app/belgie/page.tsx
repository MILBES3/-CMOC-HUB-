import {hasAccess} from '../access';
import Login from '../login';
import Hub from '../workbench';
export const dynamic='force-dynamic';
export default async function Belgium(){return await hasAccess()?<Hub countryPage="BE"/>:<Login/>}
