
import React, { useState, useMemo, useEffect } from 'react';
import { PlanType } from '../../types';

interface PaymentGateProps {
  onBack: () => void;
  onSubscribe: (plan: PlanType) => void;
}

// Global interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentGate: React.FC<PaymentGateProps> = ({ onBack, onSubscribe }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'pricing' | 'checkout'>('pricing');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Core features for all plans (Removed Script Writers AI)
  const coreFeatures = [
    "Leads Management CRM",
    "AI Objection Handling Prospects",
    "Follow-ups Schedule",
    "WhatsApp Template Maker & Copy Paste"
  ];

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const plans = [
    {
      id: 'Starter' as PlanType,
      name: 'Starter Plan',
      price: 199,
      period: '/month',
      description: 'Ideal for testing the system.',
      color: 'bg-white text-slate-800 border-slate-200 shadow-sm',
      extraFeatures: []
    },
    {
      id: 'Advance' as PlanType,
      name: 'Advance Growth',
      price: 999,
      originalPrice: 1399,
      period: '/7 months',
      badge: '₹400 SAVINGS',
      description: 'The sweet spot for consistency. Get 7 months of full access.',
      recommended: true,
      color: 'bg-indigo-600 text-white border-indigo-500 shadow-2xl scale-105 z-10',
      extraFeatures: []
    },
    {
      id: 'Business' as PlanType,
      name: 'Business Elite',
      price: 1499,
      originalPrice: 2399,
      period: '/year',
      description: 'The ultimate professional toolkit for networking leaders.',
      color: 'bg-slate-900 text-white border-slate-800 shadow-xl ring-2 ring-yellow-400/50',
      extraFeatures: [
        "One-Click Excel Data Export 📊",
        "Lifetime Data Backup",
        "Priority VIP Support (Human)"
      ]
    }
  ];

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'NISHA@300') {
      setPromoApplied(true);
    } else {
      setPromoError('Invalid code. Use NISHA@300');
    }
  };

  const currentFinalPrice = useMemo(() => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return 0;
    if (plan.id === 'Business' && promoApplied) {
      return 1199;
    }
    return plan.price;
  }, [selectedPlanId, promoApplied]);

  const handleRazorpayPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setIsProcessing(true);

    if (!window.Razorpay) {
      alert("Razorpay is not loading. Check connection.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: 'rzp_live_RZE7zHE3aNBe68', // LIVE KEY
      amount: currentFinalPrice * 100, // amount in paise
      currency: 'INR',
      name: 'Netmarketer One Hub',
      description: `Upgrade to ${selectedPlanId} Plan`,
      image: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
      handler: function (response: any) {
        setIsProcessing(false);
        if (response.razorpay_payment_id) {
          onSubscribe(selectedPlanId);
        }
      },
      theme: {
        color: '#4f46e5'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      setIsProcessing(false);
      alert('Payment Failed: ' + response.error.description);
    });
    rzp.open();
  };

  if (step === 'checkout' && selectedPlanId) {
    const plan = plans.find(p => p.id === selectedPlanId)!;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-[40px] w-full max-w-lg p-0 shadow-2xl border border-indigo-50 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h2 className="font-black text-xl leading-none">Netmarketer</h2>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Premium Activation</p>
              </div>
            </div>
            <button onClick={() => setStep('pricing')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleRazorpayPayment} className="p-10 space-y-8">
            <div className="flex justify-between items-end pb-8 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership Plan</p>
                <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium italic">Duration: {plan.period.replace('/', '')}</p>
              </div>
              <div className="text-right">
                {promoApplied && plan.id === 'Business' && (
                  <p className="text-xs text-red-500 font-bold line-through">₹1,499</p>
                )}
                <p className="text-4xl font-black text-indigo-600">₹{currentFinalPrice.toLocaleString()}</p>
              </div>
            </div>

            {plan.id === 'Business' && (
              <div className="space-y-3 bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100/50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Discount Coupon</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter NISHA@300"
                    disabled={promoApplied}
                    className="flex-1 p-4 bg-white border border-indigo-100 rounded-2xl outline-none focus:border-indigo-600 font-black transition-all text-sm uppercase tracking-wider"
                  />
                  {!promoApplied ? (
                    <button 
                      type="button" 
                      onClick={handleApplyPromo}
                      className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  ) : (
                    <div className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Applied
                    </div>
                  )}
                </div>
                {promoError && <p className="text-[10px] text-red-500 font-bold px-1">{promoError}</p>}
                {promoApplied && <p className="text-[10px] text-emerald-600 font-bold px-1 animate-pulse">⚡ ₹300 Discount Applied!</p>}
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Complete Payment (₹{currentFinalPrice})</>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-8">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Secure SSL Encrypted Transaction</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[140px] opacity-40 -mr-96 -mt-96"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-sky-50 rounded-full blur-[140px] opacity-40 -ml-96 -mb-96"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center mb-16">
           <button onClick={onBack} className="text-slate-400 font-black hover:text-indigo-600 flex items-center gap-3 text-sm uppercase tracking-widest transition-all">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Logout / Back
           </button>
           <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl shadow-xl">
                 <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">Activation Hub</span>
           </div>
        </div>

        <div className="text-center mb-24 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-[0.95] tracking-tighter">
            Choose Your <br/><span className="text-indigo-600 underline decoration-indigo-100 decoration-[10px] underline-offset-8">Growth Plan.</span>
          </h1>
          <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
            "Professional tools for serious networking leaders."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`flex flex-col rounded-[70px] p-12 border transition-all hover:scale-[1.05] duration-700 relative ${plan.color} ${plan.recommended ? 'ring-[12px] ring-indigo-50/50 shadow-2xl' : 'shadow-lg border-slate-100'}`}
            >
              {plan.recommended && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-10 py-3.5 rounded-full text-[12px] font-black uppercase tracking-[0.25em] shadow-2xl">
                   Professional Standard
                </div>
              )}
              
              <div className="mb-12 text-center">
                <h3 className="text-2xl font-black mb-4 uppercase tracking-widest">{plan.name}</h3>
                {plan.badge && (
                  <span className="inline-block px-5 py-2 bg-red-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-red-100">
                    🔥 {plan.badge}
                  </span>
                )}
                
                <div className="flex flex-col items-center">
                  {plan.originalPrice && (
                     <span className={`text-xl font-bold line-through decoration-red-500 decoration-4 ${plan.id === 'Advance' ? 'text-indigo-200' : 'text-slate-500'}`}>
                       ₹{plan.originalPrice}
                     </span>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-7xl md:text-8xl font-black tracking-tighter">₹{plan.price}</span>
                    <span className="opacity-60 font-black text-xl">{plan.period}</span>
                  </div>
                </div>

                <p className="mt-6 text-sm font-medium opacity-60 leading-relaxed px-2">{plan.description}</p>
              </div>

              <div className="space-y-6 mb-16 flex-1">
                 {coreFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                       <div className={`mt-1.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${plan.id === 'Advance' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                       </div>
                       <span className="text-base font-bold opacity-80 leading-snug">{f}</span>
                    </div>
                 ))}
                 
                 {plan.extraFeatures && plan.extraFeatures.map((f, i) => (
                    <div key={`extra-${i}`} className="flex items-start gap-4 group">
                       <div className="mt-1.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-200 animate-pulse">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                       </div>
                       <span className="text-base font-black text-yellow-300 leading-snug">{f}</span>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setStep('checkout');
                }}
                className={`w-full py-7 rounded-[36px] font-black text-sm uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl ${
                  plan.id === 'Starter' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 
                  plan.id === 'Business' ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10' : 'bg-white text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Activate {plan.id}
              </button>
            </div>
          ))}
        </div>

        <div className="p-16 bg-slate-50/80 backdrop-blur-md rounded-[100px] border-4 border-dashed border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12 group transition-all hover:border-indigo-300">
           <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-4xl font-black text-slate-800 mb-5 tracking-tight group-hover:text-indigo-600 transition-colors">Special Yearly Promo! 🎁</h3>
              <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                Enter code <span className="text-indigo-600 font-black underline underline-offset-4 decoration-indigo-200">NISHA@300</span> on our Business Elite yearly plan to save an extra ₹300. That's a full year of growth for only ₹1199!
              </p>
           </div>
           <div className="bg-white px-14 py-10 rounded-[50px] border-4 border-slate-900 font-black text-slate-900 text-3xl tracking-[0.4em] shadow-2xl transform transition group-hover:scale-110 group-hover:rotate-1">
             NISHA@300
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGate;
