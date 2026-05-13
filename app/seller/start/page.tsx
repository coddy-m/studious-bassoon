'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SellerStart() {
  const [step, setStep] = useState<'phone' | 'profile' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState({ name: '', businessName: '', location: '', county: 'Nairobi', category: 'mitumba' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      phone,
      action: 'request_otp',
      redirect: false,
      ...profile,
    });
    setLoading(false);
    if (res?.ok) setStep('otp');
    else if (res?.error) setStep('profile');
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { phone, otp, action: 'verify_otp', redirect: false });
    setLoading(false);
    if (res?.ok) router.push('/dashboard');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Start Selling</h1>
      
      {step === 'phone' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('profile'); }} className="card space-y-4">
          <label className="block text-sm font-medium">Phone Number</label>
          <input type="tel" placeholder="07XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2" required />
          <button type="submit" className="w-full btn-primary">Continue</button>
        </form>
      )}

      {step === 'profile' && (
        <form onSubmit={requestOTP} className="card space-y-4">
          <input placeholder="Your Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
          <input placeholder="Business Name" value={profile.businessName} onChange={e => setProfile({...profile, businessName: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
          <input placeholder="Location (e.g., Githurai)" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
          <select value={profile.category} onChange={e => setProfile({...profile, category: e.target.value})} className="w-full border rounded-lg px-3 py-2">
            <option value="mitumba">Mitumba / Fashion</option>
            <option value="food">Food & Drinks</option>
            <option value="electronics">Electronics</option>
            <option value="beauty">Beauty & Cosmetics</option>
            <option value="home">Home & Living</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>
          <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Sending...' : 'Get OTP'}</button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verifyOTP} className="card space-y-4">
          <label className="block text-sm font-medium">Enter OTP sent to {phone}</label>
          <input type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-widest" maxLength={6} required />
          <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Verifying...' : 'Start My Shop'}</button>
        </form>
      )}
    </div>
  );
}