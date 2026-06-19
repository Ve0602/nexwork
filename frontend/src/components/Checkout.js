import { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Load Razorpay checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Checkout component — renders a "Pay Now" button that opens Razorpay checkout.
 * Usage: <Checkout orderId={order._id} amount={order.amount} token={token} onSuccess={() => ...} />
 */
export default function Checkout({ orderId, amount, token, user, onSuccess, onError, label = 'Pay Now' }) {
  const [loading, setLoading] = useState(false);
  const gold = '#d4a853';

  const pay = async () => {
    setLoading(true);
    try {
      // 1. Create Razorpay order on backend
      const { data } = await axios.post(`${API}/api/payments/create-order`, { orderId }, { headers: { Authorization: `Bearer ${token}` } });

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) { onError?.('Failed to load payment gateway. Check your internet connection.'); setLoading(false); return; }

      // 3. Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'NexWork',
        description: 'Service Payment',
        order_id: data.razorpayOrderId,
        prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: gold },
        handler: async function (response) {
          try {
            await axios.post(`${API}/api/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            }, { headers: { Authorization: `Bearer ${token}` } });
            onSuccess?.();
          } catch (e) {
            onError?.(e.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () { setLoading(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      onError?.(e.response?.data?.message || 'Payment setup failed. Gateway may not be configured yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={pay} disabled={loading} style={{
      background: `linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9,
      padding:'12px 28px', fontWeight:800, fontSize:14, cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily:'DM Sans,sans-serif', opacity: loading ? 0.7 : 1, width:'100%'
    }}>
      {loading ? '⏳ Processing...' : `💳 ${label} — ₹${amount?.toLocaleString()}`}
    </button>
  );
}
