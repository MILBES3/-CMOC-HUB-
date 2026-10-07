import {hasAccess} from '../access';
import Login from '../login';
import Hub from '../workbench';

export const dynamic='force-dynamic';

export default async function Netherlands(){
  return await hasAccess()?<Hub countryPage="NL"/>:<Login/>;
}
