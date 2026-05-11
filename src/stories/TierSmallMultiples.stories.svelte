<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TierSmallMultiples from '../lib/components/TierSmallMultiples.svelte';

  // ── Helper: generate tier data for all 27 states ──────────────────────────

  const ALL_STATES = [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará',
    'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão',
    'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará',
    'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro',
    'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima',
    'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins',
  ];

  // Seeded pseudo-random for stable story values
  function seeded(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  }

  function makeTierData(execBase, valBase, seed) {
    const rng = seeded(seed);
    const data = {};
    for (const state of ALL_STATES) {
      const jitter = (rng() - 0.5) * 12;
      const valJitter = 0.4 + rng() * 1.6;
      data[state] = {
        execucaoFinanceira: Math.max(0, Math.min(100, execBase + jitter)),
        valorRecebido: valBase * valJitter,
      };
    }
    return data;
  }

  const tiersData = {
    'Capitais':         makeTierData(94, 80000000, 1),
    'Grande Porte':     makeTierData(89, 40000000, 2),
    'Médio Porte':      makeTierData(85, 18000000, 3),
    'Pequeno Porte II': makeTierData(80, 8000000, 4),
    'Pequeno Porte I':  makeTierData(74, 3000000, 5),
  };

  // ── City markers: capitals + grande porte ─────────────────────────────────

  const cities = [
    // Capitals
    { name: 'Rio Branco',    uf: 'AC', lat: -9.9754,  lng: -67.8249, tier: 'Capitais' },
    { name: 'Maceió',        uf: 'AL', lat: -9.6658,  lng: -35.7353, tier: 'Capitais' },
    { name: 'Macapá',        uf: 'AP', lat: 0.0349,   lng: -51.0694, tier: 'Capitais' },
    { name: 'Manaus',        uf: 'AM', lat: -3.1190,  lng: -60.0217, tier: 'Capitais' },
    { name: 'Salvador',      uf: 'BA', lat: -12.9714, lng: -38.5124, tier: 'Capitais' },
    { name: 'Fortaleza',     uf: 'CE', lat: -3.7172,  lng: -38.5433, tier: 'Capitais' },
    { name: 'Brasília',      uf: 'DF', lat: -15.7939, lng: -47.8828, tier: 'Capitais' },
    { name: 'Vitória',       uf: 'ES', lat: -20.3155, lng: -40.3128, tier: 'Capitais' },
    { name: 'Goiânia',       uf: 'GO', lat: -16.6869, lng: -49.2648, tier: 'Capitais' },
    { name: 'São Luís',      uf: 'MA', lat: -2.5297,  lng: -44.2825, tier: 'Capitais' },
    { name: 'Cuiabá',        uf: 'MT', lat: -15.6014, lng: -56.0979, tier: 'Capitais' },
    { name: 'Campo Grande',  uf: 'MS', lat: -20.4697, lng: -54.6201, tier: 'Capitais' },
    { name: 'Belo Horizonte',uf: 'MG', lat: -19.9167, lng: -43.9345, tier: 'Capitais' },
    { name: 'Belém',         uf: 'PA', lat: -1.4558,  lng: -48.5024, tier: 'Capitais' },
    { name: 'João Pessoa',   uf: 'PB', lat: -7.1195,  lng: -34.8450, tier: 'Capitais' },
    { name: 'Curitiba',      uf: 'PR', lat: -25.4284, lng: -49.2733, tier: 'Capitais' },
    { name: 'Recife',        uf: 'PE', lat: -8.0476,  lng: -34.8770, tier: 'Capitais' },
    { name: 'Teresina',      uf: 'PI', lat: -5.0892,  lng: -42.8019, tier: 'Capitais' },
    { name: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lng: -43.1729, tier: 'Capitais' },
    { name: 'Natal',         uf: 'RN', lat: -5.7945,  lng: -35.2110, tier: 'Capitais' },
    { name: 'Porto Alegre',  uf: 'RS', lat: -30.0346, lng: -51.2177, tier: 'Capitais' },
    { name: 'Porto Velho',   uf: 'RO', lat: -8.7612,  lng: -63.9004, tier: 'Capitais' },
    { name: 'Boa Vista',     uf: 'RR', lat: 2.8195,   lng: -60.6714, tier: 'Capitais' },
    { name: 'Florianópolis', uf: 'SC', lat: -27.5954, lng: -48.5480, tier: 'Capitais' },
    { name: 'São Paulo',     uf: 'SP', lat: -23.5505, lng: -46.6333, tier: 'Capitais' },
    { name: 'Aracaju',       uf: 'SE', lat: -10.9091, lng: -37.0677, tier: 'Capitais' },
    { name: 'Palmas',        uf: 'TO', lat: -10.1689, lng: -48.3317, tier: 'Capitais' },

    // Grande Porte (>100k hab.) — major non-capital cities
    { name: 'Campinas',      uf: 'SP', lat: -22.9099, lng: -47.0626, tier: 'Grande Porte' },
    { name: 'Guarulhos',     uf: 'SP', lat: -23.4538, lng: -46.5333, tier: 'Grande Porte' },
    { name: 'Ribeirão Preto',uf: 'SP', lat: -21.1704, lng: -47.8103, tier: 'Grande Porte' },
    { name: 'Sorocaba',      uf: 'SP', lat: -23.5015, lng: -47.4526, tier: 'Grande Porte' },
    { name: 'Santos',        uf: 'SP', lat: -23.9608, lng: -46.3336, tier: 'Grande Porte' },
    { name: 'São José dos Campos', uf: 'SP', lat: -23.1896, lng: -45.8841, tier: 'Grande Porte' },
    { name: 'Uberlândia',    uf: 'MG', lat: -18.9186, lng: -48.2772, tier: 'Grande Porte' },
    { name: 'Contagem',      uf: 'MG', lat: -19.9320, lng: -44.0539, tier: 'Grande Porte' },
    { name: 'Juiz de Fora',  uf: 'MG', lat: -21.7642, lng: -43.3503, tier: 'Grande Porte' },
    { name: 'Niterói',       uf: 'RJ', lat: -22.8833, lng: -43.1036, tier: 'Grande Porte' },
    { name: 'São Gonçalo',   uf: 'RJ', lat: -22.8269, lng: -43.0634, tier: 'Grande Porte' },
    { name: 'Duque de Caxias', uf: 'RJ', lat: -22.7856, lng: -43.3117, tier: 'Grande Porte' },
    { name: 'Londrina',      uf: 'PR', lat: -23.3045, lng: -51.1696, tier: 'Grande Porte' },
    { name: 'Maringá',       uf: 'PR', lat: -23.4205, lng: -51.9333, tier: 'Grande Porte' },
    { name: 'Joinville',     uf: 'SC', lat: -26.3045, lng: -48.8487, tier: 'Grande Porte' },
    { name: 'Feira de Santana', uf: 'BA', lat: -12.2669, lng: -38.9666, tier: 'Grande Porte' },
    { name: 'Aparecida de Goiânia', uf: 'GO', lat: -16.8198, lng: -49.2469, tier: 'Grande Porte' },
    { name: 'Ananindeua',    uf: 'PA', lat: -1.3659,  lng: -48.3886, tier: 'Grande Porte' },
    { name: 'Serra',         uf: 'ES', lat: -20.1209, lng: -40.3075, tier: 'Grande Porte' },
    { name: 'Caxias do Sul', uf: 'RS', lat: -29.1681, lng: -51.1794, tier: 'Grande Porte' },
    { name: 'Jaboatão dos Guararapes', uf: 'PE', lat: -8.1130, lng: -35.0158, tier: 'Grande Porte' },
    { name: 'Caucaia',       uf: 'CE', lat: -3.7366,  lng: -38.6531, tier: 'Grande Porte' },
    { name: 'São José do Rio Preto', uf: 'SP', lat: -20.8113, lng: -49.3758, tier: 'Grande Porte' },
  ];

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1,
  });

  const { Story } = defineMeta({
    title: 'Charts/TierSmallMultiples',
    component: TierSmallMultiples,
    tags: ['autodocs'],
    argTypes: {
      metric: {
        control: 'select',
        options: ['execucaoFinanceira', 'valorRecebido'],
      },
    },
  });
</script>

<Story
  name="Execução Financeira"
  args={{
    tiers: tiersData,
    metric: 'execucaoFinanceira',
    format: (v) => `${v.toFixed(1)}%`,
    cities,
  }}
/>

<Story
  name="Valor Recebido"
  args={{
    tiers: tiersData,
    metric: 'valorRecebido',
    format: (v) => BRL.format(v),
    cities,
  }}
/>
