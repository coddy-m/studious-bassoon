export function sanitizeProductInput(input: any) {
  return {
    name: input.name?.toString().trim().slice(0, 200) || '',
    price: Math.max(0, parseFloat(input.price) || 0),
    stock: Math.max(0, parseInt(input.stock) || 0),
    description: input.description?.toString().trim().slice(0, 2000) || '',
    category: ['fruits', 'vegetables', 'dairy', 'groceries', 'meat', 'beverages', 'other'].includes(input.category)
      ? input.category
      : 'other',
    images: Array.isArray(input.images)
      ? input.images.filter((url: string) => /^https?:\/\//.test(url)).slice(0, 5)
      : [],
  };
}

export function sanitizeUserInput(input: any) {
  return {
    email: input.email?.toString().toLowerCase().trim() || '',
    password: input.password?.toString().trim() || '',
    name: input.name?.toString().trim().slice(0, 100) || '',
    phone: input.phone?.toString().replace(/\D/g, '').slice(0, 15) || '',
    businessName: input.businessName?.toString().trim().slice(0, 150) || '',
    location: input.location?.toString().trim().slice(0, 150) || '',
  };
}