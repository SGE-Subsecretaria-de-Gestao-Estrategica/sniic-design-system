/** The 27 federative units: sigla, name and IBGE code. */
export const UFS = [
  { code: "AC", name: "Acre", ibge: 12 },
  { code: "AL", name: "Alagoas", ibge: 27 },
  { code: "AP", name: "Amapá", ibge: 16 },
  { code: "AM", name: "Amazonas", ibge: 13 },
  { code: "BA", name: "Bahia", ibge: 29 },
  { code: "CE", name: "Ceará", ibge: 23 },
  { code: "DF", name: "Distrito Federal", ibge: 53 },
  { code: "ES", name: "Espírito Santo", ibge: 32 },
  { code: "GO", name: "Goiás", ibge: 52 },
  { code: "MA", name: "Maranhão", ibge: 21 },
  { code: "MT", name: "Mato Grosso", ibge: 51 },
  { code: "MS", name: "Mato Grosso do Sul", ibge: 50 },
  { code: "MG", name: "Minas Gerais", ibge: 31 },
  { code: "PA", name: "Pará", ibge: 15 },
  { code: "PB", name: "Paraíba", ibge: 25 },
  { code: "PR", name: "Paraná", ibge: 41 },
  { code: "PE", name: "Pernambuco", ibge: 26 },
  { code: "PI", name: "Piauí", ibge: 22 },
  { code: "RJ", name: "Rio de Janeiro", ibge: 33 },
  { code: "RN", name: "Rio Grande do Norte", ibge: 24 },
  { code: "RS", name: "Rio Grande do Sul", ibge: 43 },
  { code: "RO", name: "Rondônia", ibge: 11 },
  { code: "RR", name: "Roraima", ibge: 14 },
  { code: "SC", name: "Santa Catarina", ibge: 42 },
  { code: "SP", name: "São Paulo", ibge: 35 },
  { code: "SE", name: "Sergipe", ibge: 28 },
  { code: "TO", name: "Tocantins", ibge: 17 },
] as const;

export type UfCode = (typeof UFS)[number]["code"];

/** Lower case, no accents, single spaces: "  São  Paulo " → "sao paulo". */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const BY_NAME = new Map<string, UfCode>(
  UFS.flatMap((uf) => [
    [fold(uf.code), uf.code],
    [fold(uf.name), uf.code],
  ]),
);
const BY_IBGE = new Map<string, UfCode>(
  UFS.map((uf) => [String(uf.ibge), uf.code]),
);

/** A sigla or a state name, in any case and with or without accents. */
export function parseUfName(raw: string | null | undefined): UfCode | null {
  return BY_NAME.get(fold(raw ?? "")) ?? null;
}

/** A sigla, a state name or a two-digit IBGE code. */
export function parseUf(raw: string | null | undefined): UfCode | null {
  return parseUfName(raw) ?? BY_IBGE.get((raw ?? "").trim()) ?? null;
}
