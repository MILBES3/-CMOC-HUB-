import {hasAccess} from '../access';
import Login from '../login';
import Hub from '../workbench';
export const dynamic='force-dynamic';
export default async function Germany(){return await hasAccess()?<Hub countryPage="DE"/>:<Login/>}
