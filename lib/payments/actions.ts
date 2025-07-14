'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withAgency } from '@/lib/auth/middleware';

export const checkoutAction = withAgency(async (formData, agency) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ agency: agency, priceId });
});

export const customerPortalAction = withAgency(async (_, agency) => {
  const portalSession = await createCustomerPortalSession(agency);
  redirect(portalSession.url);
});
