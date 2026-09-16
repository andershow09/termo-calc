# TermoCalc — Portfólio

Demonstração de uma aplicação mobile com Angular 20, Ionic 8, Capacitor 7 e TypeScript.

**Os resultados são fictícios e fixos. Esta edição não contém o motor de cálculo real e não deve ser usada para decisões técnicas.** Alterar as entradas permite explorar o formulário, mas não altera os indicadores demonstrativos.

## O que pode ser explorado

- Componentes standalone, rotas lazy e formulários reativos.
- Interface responsiva em português e estados de validação.
- Histórico local, reabertura e exclusão de exemplos criados pelo usuário.
- Relatórios PDF identificados como demonstração.
- Abertura e compartilhamento nativos de PDFs no Android.
- Testes de serviços e fluxo de relatórios com Jasmine/Karma.

## Executar

Use Node.js 22 e npm. Na raiz:

```sh
npm ci
npm start
```

Acesse http://localhost:4200. Preencha os campos com valores fictícios, gere os resultados, salve um exemplo e exporte o PDF. No navegador, o PDF é baixado; a lista de arquivos e a abertura no visualizador do sistema são funcionalidades Android.

## Verificar

```sh
npm run portfolio:check
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

## Android demonstrativo

Com Android SDK e JDK compatíveis com o projeto:

```sh
npm run build
npx cap sync android
npx cap open android
```

O identificador é `com.example.termocalc.portfolio`. Não use credenciais ou assinatura do aplicativo publicado. O projeto não contém configuração de publicação em lojas.

## Limites e privacidade

- O serviço `calculate-flow` retorna uma fixture sintética, sem fórmulas.
- A localização é simulada e não envia coordenadas a serviços externos.
- Não há integração de compra; o adaptador de acesso apenas libera a demonstração.
- Armazenamento local e pasta de PDFs separados da aplicação real.
- Nenhum banco, PDF de usuário, documento comercial, chave ou histórico privado foi incluído.

Esta cópia deve ser publicada como repositório independente. Não mescle o histórico do aplicativo real: isso tornaria seu conteúdo anterior acessível.

