import { expect, test } from 'vitest';
import {
  ageFrom,
  formatCpf,
  formatPhone,
  heightMeters,
  internationalPhone,
  weightKg,
} from './format';

test('altura em cm vira metros com vírgula, como no app', () => {
  expect(heightMeters(170)).toBe('1,70 m');
  expect(heightMeters(165)).toBe('1,65 m');
});

test('peso usa vírgula decimal', () => {
  expect(weightKg(70.5)).toBe('70,5 kg');
  expect(weightKg(70)).toBe('70 kg');
});

test('idade considera aniversário já feito ou não', () => {
  expect(ageFrom('2002-05-22', new Date('2026-08-13'))).toBe(24);
  expect(ageFrom('2002-12-25', new Date('2026-08-13'))).toBe(23);
});

test('telefone ganha 55 uma única vez', () => {
  expect(internationalPhone('(16) 99971-9918')).toBe('5516999719918');
  expect(internationalPhone('5516999719918')).toBe('5516999719918');
});

test('cpf é mascarado conforme se digita e ignora o excedente', () => {
  expect(formatCpf('529')).toBe('529');
  expect(formatCpf('52998')).toBe('529.98');
  expect(formatCpf('529982247')).toBe('529.982.247');
  expect(formatCpf('52998224725')).toBe('529.982.247-25');
  expect(formatCpf('529982247259999')).toBe('529.982.247-25');
  expect(formatCpf('529.982.247-25')).toBe('529.982.247-25');
});

test('telefone é mascarado para fixo e celular', () => {
  expect(formatPhone('')).toBe('');
  expect(formatPhone('16')).toBe('(16');
  expect(formatPhone('169997')).toBe('(16) 9997');
  expect(formatPhone('1633334444')).toBe('(16) 3333-4444');
  expect(formatPhone('16999719918')).toBe('(16) 99971-9918');
});
