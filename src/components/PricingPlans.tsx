import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { createCheckoutSession } from '../lib/api';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Basic book research',
      'Simple title suggestions',
      'Basic outline creation',
      '1 chapter writing per day'
    ],
    priceId: null,
    buttonText: 'Current Plan'
  },
  {
    name: 'Lite',
    price: '$6.99',
    period: 'per month',
    features: [
      'Advanced market research',
      'Multiple title variations',
      'Detailed chapter outlines',
      '5 chapters writing per day',
      'Export to PDF'
    ],
    priceId: 'price_1QGLVSAY8XikskDfzt3hsL4y',
    buttonText: 'Upgrade to Lite'
  },
  {
    name: 'Pro',
    price: '$19.99',
    period: 'per month',
    features: [
      'Comprehensive market analysis',
      'SEO-optimized titles',
      'Advanced story structure',
      'Unlimited chapter writing',
      'Multiple export formats',
      'Priority support'
    ],
    priceId: 'price_1QGLZDAY8XikskDfBe8cDk4C',
    buttonText: 'Upgrade to Pro'
  }
];

export default function PricingPlans() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return;
    if (!user) {
      setError('Please sign in to subscribe');
      return;
    }

    try {
      setIsLoading(priceId);
      setError(null);
      const { sessionUrl } = await createCheckoutSession(priceId);
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      setError('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="py-12 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Writing Journey
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the plan that best fits your writing needs
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded-md inline-block">
              {error}
            </p>
          )}
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/{plan.period}</span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={!user || !plan.priceId || isLoading === plan.priceId}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium 
                    ${plan.priceId
                      ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300'
                      : 'bg-gray-100 text-gray-600'
                    } transition-colors duration-200`}
                >
                  {isLoading === plan.priceId
                    ? 'Processing...'
                    : !user
                    ? 'Sign in to subscribe'
                    : plan.buttonText}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}