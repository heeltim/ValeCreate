# Plano Codex — Editor Lab (mini-Figma focado em branding)

Este documento define como incorporar um **editor Figma-like de pesquisa** ao GoBrand sem quebrar o produto atual.

## Objetivo

Construir um `editor-lab` interno para estudar arquitetura de editor visual e, em seguida, integrar apenas os módulos úteis ao fluxo de branding do GoBrand.

## Princípios

- Não clonar o Figma completo.
- Implementar por fases curtas e testáveis.
- Isolar a engine de editor da experiência de produto.
- Integrar ao GoBrand somente via contrato de dados.

## Estrutura recomendada

```txt
experiments/
  figma-lab/

src/
  editor-core/
    document/
    canvas/
    selection/
    transforms/
    layers/
    history/
    styles/
    components/
    layout/

  gobrand-integration/
    brand-board-adapter/
    application-editor/
    export-adapter/
```

## Fases de implementação

### Fase 1 — Base de editor

Entrega mínima:

- viewport
- zoom/pan
- canvas
- seleção simples
- criação de retângulo
- drag and drop
- layers básicas
- undo/redo

### Fase 2 — Edição essencial

- seleção múltipla (shift + click e box selection)
- resize/rotate com handles
- z-index e reordenação de camadas
- alinhamento e distribuição básicos
- snapping simplificado

### Fase 3 — Organização de layout

- frames/artboards
- constraints básicas
- auto-layout simplificado
- estilos reutilizáveis (cor e tipografia)
- componentes simples (master/instance)

### Fase 4 — Integração com GoBrand

- injetar paleta do projeto como style tokens
- injetar tipografia do projeto como text styles
- carregar logos/variantes como assets
- editar aplicações no canvas
- salvar no formato interno do projeto

## Fora de escopo inicial

- colaboração em tempo real
- prototipagem avançada
- edição vetorial Bézier completa
- plugin system
- comments/review mode
- dev mode

## Contrato de integração sugerido

```ts
type EditorDocument = {
  id: string
  pages: EditorPage[]
  styles: StyleToken[]
  assets: Asset[]
}

type BrandProjectBinding = {
  projectId: string
  primaryColors: string[]
  typography: TypographyToken[]
  logoVariants: LogoVariant[]
}
```

## Prompt pronto para colar no Codex

```txt
Quero incorporar um editor Figma-like ao projeto existente sem quebrar a arquitetura atual.

Objetivo:
- criar um módulo isolado de editor visual que funcione primeiro como laboratório interno;
- depois integrar esse módulo ao GoBrand como motor de edição visual.

Requisitos:
1. criar pasta /experiments/figma-lab
2. criar engine separada em /src/editor-core
3. criar integração em /src/gobrand-integration
4. não alterar o fluxo atual do GoBrand ainda
5. implementar primeiro:
   - viewport
   - zoom
   - pan
   - canvas
   - seleção simples
   - criação de rectangle
   - layers básicas
   - drag and drop
   - undo/redo
6. expor API da engine para integração futura
7. documentar a estrutura
8. preparar o código para receber:
   - paleta do projeto
   - tipografia do projeto
   - ativos da marca
   - templates de aplicações

Critérios de aceite:
- app atual continua funcionando sem regressões;
- editor-lab inicia localmente;
- fluxo mínimo de edição (criar, selecionar, mover, desfazer/refazer) funciona;
- código modular para evolução por fases.
```

## Segundo prompt (integração)

```txt
Agora conecte o editor-core ao sistema de marca do GoBrand.

Use os dados já existentes do projeto para:
- carregar paleta como estilos;
- carregar tipografia como estilos nomeados;
- carregar logo e variantes como assets;
- permitir editar uma aplicação no canvas;
- salvar a saída no formato interno do projeto.

Critérios de aceite:
- integração sem quebrar telas existentes;
- aplicação de tokens de marca no editor;
- persistência dos documentos de aplicação.
```
