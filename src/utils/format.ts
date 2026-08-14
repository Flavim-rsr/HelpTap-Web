/** 170 (cm do backend) → "1,70 m", como o app móvel exibe. */
export function heightMeters(cm: number): string {
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`;
}

/** 70.5 (kg do backend) → "70,5 kg", padrão brasileiro. */
export function weightKg(kg: number): string {
  return `${String(kg).replace('.', ',')} kg`;
}

/** Data ISO de nascimento → idade em anos completos. */
export function ageFrom(isoDate: string, today = new Date()): number {
  const birth = new Date(isoDate);
  const age = today.getFullYear() - birth.getFullYear();
  const birthdayPending =
    today.getMonth() < birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  return birthdayPending ? age - 1 : age;
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Máscara de CPF conforme se digita: "000.000.000-00" (mesma regra do app). */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Máscara de telefone conforme se digita: "(00) 00000-0000" (mesma regra do app). */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Telefone brasileiro em qualquer formato → formato internacional para tel:/wa.me. */
export function internationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') && digits.length > 11 ? digits : `55${digits}`;
}
