import { useChatStore } from './store';
import { auth } from './firebase';

// Update API URL based on environment
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.com'  // Replace with your production backend URL
  : 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(content: string) {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-opus-20240229',
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function createCheckoutSession(priceId: string) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create checkout session');
  }

  return response.json();
}