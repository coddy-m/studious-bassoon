import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  phone = phone.replace(/\s/g, '').replace(/^\+/, '');
  if (phone.startsWith('0')) phone = '254' + phone.slice(1);
  if (phone.startsWith('7') || phone.startsWith('1')) phone = '254' + phone;
  return phone;
}

export function generateShopId(businessName: string): string {
  const base = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${base}-${rand}`;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}