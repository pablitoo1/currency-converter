import { Result } from './result';
import { Either, left, right } from 'fp-ts/Either';

export const sanitizeAmount = (input: string): string => {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned.includes('.')) return cleaned;
  const [intPart, decPart] = cleaned.split('.');
  return intPart + '.' + decPart.slice(0, 2);
};

export const filterCurrencies = (
  currencies: string[],
  search: string
): string[] =>
  currencies.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

export const formatConversion = (
  amount: number,
  from: string,
  to: string,
  rate: number,
  date: string
): Result =>
  ({
    converted: `${amount} ${from} = ${(rate * amount).toFixed(2)} ${to}`,
    date: `exchange rate is from ${date}`,
  } as Result);

export const validateDifferentCurrencies = (
  from: string,
  to: string
): Either<string, void> =>
  from === to
    ? left(`Amount unchanged: same currency ${from}`)
    : right(undefined);

export const parseAmount = (input: string): Either<string, number> => {
  const num = Number(input);
  return isNaN(num) || num <= 0 ? left('Incorrect amount') : right(num);
};
