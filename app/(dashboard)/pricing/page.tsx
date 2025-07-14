import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import styles from './page.module.css';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className={styles.container}>
      <div className={styles.grid}>
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support',
          ]}
          priceId={basePrice?.id}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
          priceId={plusPrice?.id}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{name}</h2>
      <p className={styles.trial}>
        with {trialDays} day free trial
      </p>
      <p className={styles.price}>
        ${price / 100}{' '}
        <span className={styles.priceUnit}>
          per user / {interval}
        </span>
      </p>
      <ul className={styles.featuresList}>
        {features.map((feature, index) => (
          <li key={index} className={styles.featureItem}>
            <Check className={styles.featureIcon} />
            <span className={styles.featureText}>{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction} className={styles.form}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
