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

/** Telefone brasileiro em qualquer formato → formato internacional para tel:/wa.me. */
export function telefoneInternacional(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '');
  return digitos.startsWith('55') && digitos.length > 11 ? digitos : `55${digitos}`;
}
