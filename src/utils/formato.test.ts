import { expect, test } from 'vitest';
import { alturaMetros, idadeDe, pesoKg, telefoneInternacional } from './formato';

test('altura em cm vira metros com vírgula, como no app', () => {
  expect(alturaMetros(170)).toBe('1,70 m');
  expect(alturaMetros(165)).toBe('1,65 m');
});

test('peso usa vírgula decimal', () => {
  expect(pesoKg(70.5)).toBe('70,5 kg');
  expect(pesoKg(70)).toBe('70 kg');
});

test('idade considera aniversário já feito ou não', () => {
  expect(idadeDe('2002-05-22', new Date('2026-08-13'))).toBe(24);
  expect(idadeDe('2002-12-25', new Date('2026-08-13'))).toBe(23);
});

test('telefone ganha 55 uma única vez', () => {
  expect(telefoneInternacional('(16) 99971-9918')).toBe('5516999719918');
  expect(telefoneInternacional('5516999719918')).toBe('5516999719918');
});
