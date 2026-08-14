/** 170 (cm do backend) → "1,70 m", como o app móvel exibe. */
export function alturaMetros(cm: number): string {
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`;
}

/** 70.5 (kg do backend) → "70,5 kg", padrão brasileiro. */
export function pesoKg(kg: number): string {
  return `${String(kg).replace('.', ',')} kg`;
}

/** Data ISO de nascimento → idade em anos completos. */
export function idadeDe(dataIso: string, hoje = new Date()): number {
  const nascimento = new Date(dataIso);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const aniversarioPendente =
    hoje.getMonth() < nascimento.getMonth()
    || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  return aniversarioPendente ? idade - 1 : idade;
}

const soDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Máscara de CPF conforme se digita: "000.000.000-00" (mesma regra do app). */
export function formatarCpf(valor: string): string {
  const digitos = soDigitos(valor).slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

/** Máscara de telefone conforme se digita: "(00) 00000-0000" (mesma regra do app). */
export function formatarTelefone(valor: string): string {
  const digitos = soDigitos(valor).slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** Telefone brasileiro em qualquer formato → formato internacional para tel:/wa.me. */
export function telefoneInternacional(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '');
  return digitos.startsWith('55') && digitos.length > 11 ? digitos : `55${digitos}`;
}
