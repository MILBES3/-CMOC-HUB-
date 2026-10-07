import {hasAccess} from '../access';
import Login from '../login';
import Hub from '../workbench';

export const dynamic='force-dynamic';

export default async function OutsidePilot(){
  return await hasAccess()?<Hub outsidePilot/>:<Login/>;
}
