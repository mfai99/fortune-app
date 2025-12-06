import { STRIPE_PRICES } from "../constants";

// Enable Direct Link Mode for MVP
const USE_DIRECT_LINKS = true; 

export async function initiateCheckout(priceId: string) {
  console.log("Initiating Checkout for:", priceId);

  if (!priceId) {
      alert("Error: Payment Link ID is missing. Please contact support.");
      return;
  }

  if (USE_DIRECT_LINKS) {
      // Check if priceId is a valid URL (starts with http)
      if (priceId.startsWith('http')) {
          // DIRECT REDIRECTION TO STRIPE (New Tab)
          window.open(priceId, '_blank');
          return;
      }
      
      // Fallback if ID is missing or invalid
      console.error("Invalid Payment Link Format:", priceId);
      alert("Payment link not configured correctly. Please contact support.");
  } else {
      // Backend Mode (Future use)
      try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                priceId,
                cancelUrl: window.location.href 
            }),
        });
        
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Payment Error: " + data.error);
        }
    } catch (e) {
        console.error(e);
        alert("Network Error connecting to payment server.");
    }
  }
}