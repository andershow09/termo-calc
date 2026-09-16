/**
 * Central catalog of user-facing text (pt-BR).
 *
 * Keeping literals here removes duplication and is the first step toward
 * internationalization: to add another language, replicate this shape and swap
 * the active catalog (or migrate to @angular/localize for template text).
 */

export interface FieldHint {
  title: string;
  description: string;
  unit: string;
  guidance: string;
  example: string;
}

export const APP = {
  name: 'TermoCalc Demo',
  tagline: 'PORTFÓLIO — dados fictícios, sem validade técnica',
};

export const COMMON = {
  cancel: 'Cancelar',
  save: 'Salvar',
  delete: 'Excluir',
  generate: 'Gerar',
  notNow: 'Agora não',
  tryAgain: 'Tente novamente.',
};

export const PREMIUM = {
  productTitle: 'Demonstração', productDescription: 'Recursos de portfólio', productPrice: 'Sem cobrança',
  paywallHeader: 'Demonstração', paywallCta: 'Ver configurações', activeBadge: 'DEMO',
  subscribe: 'Demonstrar', restore: 'Reiniciar demonstração', benefits: 'Recursos demonstrativos disponíveis.',
  storeNote: 'Sem integração com lojas.', subscribeSuccess: 'Demonstração disponível.',
  subscribeIncomplete: 'Ação demonstrativa.', subscribeError: 'Não foi possível concluir a demonstração.',
  restoreSuccess: 'Demonstração disponível.', restoreEmpty: 'Sem compras nesta edição.',
  restoreError: 'Não foi possível concluir a demonstração.',
};

export const MENU = {
  savedResults: 'Resultados salvos',
  reports: 'Relatórios',
  settings: 'Configurações',
  about: 'Sobre',
};

export const LOCATION = {
  loading: 'Obtendo altitude pela localização...',
  success: 'Altitude fictícia preenchida para demonstração.',
  denied:
    'Permissão de localização negada. Informe a altitude manualmente ou toque no ícone para tentar de novo.',
  unavailable:
    'Não foi possível obter a altitude. Verifique a conexão/GPS e tente novamente, ou informe manualmente.',
};

export const RESULTS = {
  defaultTitle: 'Cálculo TermoCalc',
  saveLimit: (limit: number): string => { void limit; return 'Edição demonstrativa.'; },
  reportsPremium: 'Relatórios demonstrativos.',
  saveDataUnavailable:
    'Não foi possível salvar: os dados do cálculo não estão disponíveis.',
  saveError: 'Não foi possível salvar o resultado. Tente novamente.',
  reportDataUnavailable:
    'Não foi possível gerar o relatório: os dados do cálculo não estão disponíveis.',
  reportShared: 'Relatório gerado e pronto para compartilhar.',
  reportGenerated: 'Relatório PDF gerado com sucesso.',
  reportError: 'Não foi possível gerar o relatório. Tente novamente.',
};

export const REPORTS = {
  paywallMessage: 'Compartilhamento demonstrativo.',
  shareUnavailable: 'Compartilhamento indisponível neste dispositivo.',
  shareError: 'Não foi possível compartilhar o relatório.',
  deleted: 'Relatório excluído.',
  deleteError: 'Não foi possível excluir o relatório.',
};

export const REPORT_PDF = {
  documentTitle: (title: string): string => `Relatório TermoCalc - ${title}`,
  shareTitle: 'Relatório TermoCalc',
  shareText: (title: string): string => `Relatório do cálculo "${title}"`,
};

export const HOME_HINTS: Record<string, FieldHint> = {
  temperaturaInf: { title: 'Temperatura de infiltração', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  umidadeInf: { title: 'Umidade de infiltração', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  temperaturaRef: { title: 'Temperatura refrigerada', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  umidadeRef: { title: 'Umidade refrigerada', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  larguraAbert: { title: 'Largura da abertura', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  alturaAbert: { title: 'Altura da abertura', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  tempoAbert: { title: 'Tempo de abertura', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  cop: { title: 'COP da sala de máquinas', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  custoKw: { title: 'Custo de energia', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  eficienciaCort: { title: 'Eficiência das cortinas', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  acelaracaoGravitacional: { title: 'Aceleração gravitacional', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
  altitude: { title: 'Altitude', description: 'Campo ilustrativo da interface.', unit: '', guidance: 'Nesta demonstração, alterar entradas não altera os resultados fictícios.', example: 'Use valores fictícios.' },
};
