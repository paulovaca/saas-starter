import { getAgencyForUser } from '@/lib/db/queries';

export async function GET() {
  const agency = await getAgencyForUser();
  return Response.json(agency);
}
