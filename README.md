# TermoCalc

App demo em Angular, Ionic e Capacitor, com resultados de cálculo simulados. Permite explorar formulários, histórico local e relatórios PDF.

[Conheça o aplicativo na Google Play](https://play.google.com/store/apps/details?id=br.com.apdeveloper.thermocalc).

## O que pode ser explorado

- Componentes standalone, rotas lazy e formulários reativos.
- Interface responsiva em português e estados de validação.
- Histórico local, reabertura e exclusão de exemplos criados pelo usuário.
- Relatórios PDF identificados como demonstração.
- Abertura e compartilhamento nativos de PDFs no Android.
- Testes de serviços e fluxo de relatórios com Jasmine/Karma.

## Executar

Com Node.js 22 e npm:

```sh
npm ci
npm start
```

Acesse http://localhost:4200. Preencha os campos com valores fictícios, gere os resultados, salve um exemplo e exporte o PDF. No navegador, o PDF é baixado; a lista de arquivos e a abertura no visualizador do sistema são funcionalidades Android.

## Verificar

```sh
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

## Android

Com Android SDK e JDK configurados:

```sh
npm run build
npx cap sync android
npx cap open android
```

## Limites e privacidade

- O serviço `calculate-flow` retorna uma fixture sintética, sem fórmulas.
- A localização é simulada e não envia coordenadas a serviços externos.
- Não há integração de compra; o adaptador de acesso apenas libera a demonstração.
- Armazenamento local e pasta de PDFs separados da aplicação real.
- Nenhum banco, PDF de usuário, documento comercial, chave ou histórico privado foi incluído.
