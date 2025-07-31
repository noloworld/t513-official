// Função utilitária para concatenar classes CSS (igual ao shadcn/ui)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
} 