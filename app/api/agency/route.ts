import { getAgencyForUser, getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || !user.id) {
      return Response.json(null, { status: 401 });
    }
    
    const agency = await getAgencyForUser(user.id);
    
    if (!agency) {
      return Response.json({ user, agency: null }, { status: 200 });
    }
    
    return Response.json({
      agency,
      user
    });
  } catch (error) {
    console.error('Error in /api/agency:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
