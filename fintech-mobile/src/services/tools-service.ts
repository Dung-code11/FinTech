import type { CurrencyRate } from '@/types/finance';

export const currencyRates: CurrencyRate[] = [];

export const financePrompts = [
  'Gom chi tiêu định kỳ vào cùng một ví để đọc dòng tiền nhanh hơn.',
  'Ví tín dụng nên được theo dõi theo dư nợ, không chỉ theo hạn mức.',
  'Nếu tỷ lệ tiết kiệm dưới 20%, hãy kiểm tra lại nhóm chi tiêu linh hoạt.',
];

export function convertCurrency(amount: number, fromCode: string, toCode: string) {
  const fromRate = currencyRates.find((item) => item.code === fromCode)?.usdRate;
  const toRate = currencyRates.find((item) => item.code === toCode)?.usdRate;

  if (!fromRate || !toRate) {
    return 0;
  }

  return (amount / fromRate) * toRate;
}
