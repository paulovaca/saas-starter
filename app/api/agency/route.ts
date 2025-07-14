import { getAgencyForUser, getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  const agency = await getAgencyForUser();
  
  if (!user || !agency) {
    return Response.json(null, { status: 401 });
  }
  
  return Response.json({
    agency,
    user
  });
}
