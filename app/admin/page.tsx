import {hasAdminAccess} from '../access';
import Login from '../login';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function AdminPage(){return await hasAdminAccess()?<Admin/>:<Login admin/>}
