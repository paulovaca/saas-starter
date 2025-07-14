import { getAgencyForUser, getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || !user.id) {
      return Response.json(null, { status: 401 });
    }
    
    const agency = await getAgencyForUser(user.id);
    return Response.json(agency);
  } catch (error) {
    console.error('Error in /api/team:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
