export type CepAddressResponse = {
  bairro?: string;
  erro?: boolean;
  logradouro?: string;
};

export async function getCepAddress(cep: string, signal: AbortSignal) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal,
  });
  if (!response.ok) throw new Error("CEP lookup failed");
  return (await response.json()) as CepAddressResponse;
}
