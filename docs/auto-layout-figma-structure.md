# Auto Layout (referência Figma) — Estrutura v1 para Codex

Este documento define uma base sólida para implementar **Auto Layout linear (horizontal/vertical)** no editor, com nomenclatura e comportamento próximos ao Figma.

## Objetivo (v1)

- Organizar filhos por fluxo (`horizontal` ou `vertical`).
- Aplicar `padding`, `gap`, alinhamentos e `space-between`.
- Suportar tamanho por eixo: `fixed`, `hug`, `fill`.
- Suportar `clipContent` (recorte de conteúdo).
- Recalcular automaticamente em alterações de estrutura/conteúdo.

## Modelo de dados

```ts
type AutoLayoutDirection = 'horizontal' | 'vertical'
type AutoLayoutSpacingMode = 'packed' | 'space-between'
type AutoLayoutAlign = 'start' | 'center' | 'end' | 'stretch'
type SizingMode = 'fixed' | 'hug' | 'fill'

interface AutoLayoutProps {
  enabled: boolean
  direction: AutoLayoutDirection
  gap: number
  padding: { top: number; right: number; bottom: number; left: number }

  mainAlign: 'start' | 'center' | 'end' | 'space-between'
  crossAlign: AutoLayoutAlign
  spacingMode: AutoLayoutSpacingMode

  widthMode: SizingMode
  heightMode: SizingMode

  clipContent: boolean
}

interface AutoLayoutChildProps {
  widthMode?: SizingMode
  heightMode?: SizingMode
  flexGrow?: number
  absolute?: boolean
  minW?: number; maxW?: number
  minH?: number; maxH?: number
}
```

### Regras

- `absolute=true` **não participa do fluxo** (não entra em cálculo de gap e distribuição).
- `fill` distribui sobra proporcionalmente ao `flexGrow`.
- `hug` usa tamanho intrínseco (texto/conteúdo).

## API de funções (Codex-friendly)

```ts
function clamp(v: number, min?: number, max?: number): number
function getNodeIntrinsicSize(nodeId: string): { w: number; h: number }

function resolveSize(
  nodeId: string,
  axis: 'x'|'y',
  available: number,
  mode: SizingMode,
  intrinsic: number,
  fixedValue: number,
  min?: number,
  max?: number
): number
```

### Regras de `resolveSize`

- `fixed`: retorna `fixedValue`.
- `hug`: retorna `intrinsic`.
- `fill`: retorna valor calculado na etapa de distribuição.
- Sempre aplicar `clamp(min/max)`.

## Algoritmo principal

```ts
function layoutAutoFrame(frameId: string): void
```

### Pipeline

1. Ler frame + `autoLayout`.
2. Calcular `content box` interno (área útil = tamanho - paddings).
3. Separar filhos em `flow` e `absolute`.
4. Medir intrínsecos.
5. Resolver tamanhos `fixed/hug` no eixo principal.
6. Distribuir sobra entre filhos `fill` (`flexGrow`).
7. Resolver tamanho do frame em modo `hug`.
8. Posicionar no eixo principal (`packed`/`space-between`).
9. Posicionar no eixo transversal (`start/center/end/stretch`).
10. Aplicar clipping quando `clipContent=true`.

## Posicionamento

### Eixo principal

- `packed`:
  - base em `innerStart` (top/left).
  - com `mainAlign=center/end`, desloca bloco inteiro.
- `space-between`:
  - gap dinâmico = `(innerMain - sum(childrenMain)) / (n-1)` para `n > 1`.

### Eixo transversal

- `stretch`: força filho ao tamanho transversal do container (respeitando min/max).
- `start|center|end`: posicionamento convencional no cross axis.

## Hug do próprio frame

Se o frame estiver em `hug` em algum eixo:

- `width(hug)` (direção horizontal):
  - `paddingL + paddingR + sum(widths) + gap*(n-1)`
- `height(hug)` (direção vertical):
  - `paddingT + paddingB + sum(heights) + gap*(n-1)`

## Triggers de relayout

```ts
function requestLayout(nodeId: string, reason: string): void
```

Chamar em:

- resize/move do frame
- add/remove/reorder de filhos
- mudança de `padding`, `gap`, `align`, `spacingMode`
- mudança de conteúdo (texto/imagem) que altera intrínseco

## Ordem de cálculo (árvore)

Para auto layout aninhado:

- usar **pós-ordem** (children primeiro, parent depois)
- garante intrínseco final correto antes do parent calcular `hug`

## Hook sugerido para o editor

No comando do menu `advanced.autoLayout` (hoje TODO), iniciar com:

- `toggleAutoLayoutForSelection()`
- `setAutoLayoutDirection(selection, direction)`
- `setAutoLayoutSizing(selectionOrChild, widthMode, heightMode)`
- `setAutoLayoutSpacing(selection, gap, padding, spacingMode)`
- `setAutoLayoutAlignment(selection, mainAlign, crossAlign)`
- `setAutoLayoutClip(selection, clipContent)`
- `requestLayout(selection.id, 'manual_change')`

## Fase 2 (opcional): Grid Auto Layout

Após estabilizar v1 linear:

- tracks (`rows`/`cols`)
- `gapX/gapY`
- auto-placement
- controle de contagem de colunas/linhas

> Recomendação: manter v1 linear como milestone principal (cobre a maioria dos casos: botões, chips, listas, cards, stacks).
