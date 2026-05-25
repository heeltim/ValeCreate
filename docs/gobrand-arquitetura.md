# GoBrand — Arquitetura Detalhada

> **GOBLINS FAZ • Brand Studio** v2.0  
> Editor visual de identidade de marca baseado em web.

---

## 1. Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| HTML5 | — | Estrutura SPA com shell, modais, templates |
| CSS3 | — | Design system escuro, grid, animações, responsivo |
| Vanilla JS (ES6+) | — | Lógica principal sem framework |
| ES Modules | — | Módulos do core (`import`/`export`) |
| IIFE | — | Módulos legacy (storage, security, error-handler, debounce) |

### Dependências Externas (CDN)
| Biblioteca | CDN | Finalidade |
|---|---|---|
| Fabric.js 5.3.0 | `cdn.jsdelivr.net` | Editor de canvas no iframe |
| Lucide | `unpkg.com` | Ícones SVG |
| JSZip 3.10.1 | `cdn.jsdelivr.net` | Exportação em ZIP |
| Google Fonts | `fonts.googleapis.com` | Fontes tipográficas (Outfit, JetBrains Mono, Sora, DM Sans, Nunito, Poppins, Montserrat, etc.) |

---

## 2. Estrutura de Diretórios

```
GoBrand/
├── index.html          ← Entry point (shell, views, modais, template do iframe)
├── script.js           ← Lógica principal (state, CRUD, editor, export, integrações)
├── styles.css          ← Design system completo (~1453 linhas)
├── README.md           ← Documentação do projeto
│
├── core/               ← Motor do aplicativo
│   ├── storage.js          Persistência localStorage com backup
│   ├── security.js         Sanitização SVG + validação postMessage
│   ├── error-handler.js    Captura global de erros
│   ├── commands.js         Sistema de comandos (ES module)
│   ├── dispatcher.js       Dispatcher central de comandos
│   ├── history.js          Pilhas de undo/redo
│   ├── shortcuts.js        Mapeamento e binding de atalhos
│   └── frame/              Engine de canvas (ES modules)
│       ├── sceneGraph.js       Grafo de cena
│       ├── render.js           Renderização
│       ├── layout.js           Layout/posicionamento
│       ├── transform.js        Transformações geométricas
│       └── hitTest.js          Teste de hit (clique/toque)
│
├── utils/              ← Utilitários
│   └── debounce.js         Debounce function (IIFE)
│
└── docs/               ← Documentação técnica
    ├── gobrand-arquitetura.md            ← Este arquivo
    ├── fluxo-navegacao-gobrand.md        ← Mapa de navegação
    ├── auto-layout-figma-structure.md    ← Sistema de auto-layout
    ├── bezier-v2-references.md           ← Referências bezier
    ├── codex-editor-lab-plan.md          ← Plano do editor
    └── frame-engine-demo.html            ← Demonstração standalone
```

---

## 3. Views e Navegação

### 3.1 Mapa de Views

A função `nav(view)` gerencia 7 views:

| View | ID | Descrição |
|---|---|---|
| Home | `viewHome` | Grid de projetos |
| Editor | `viewEditor` | Editor de identidade (3 colunas) |
| Brand Board | `viewBoard` | Dashboard visual da identidade |
| Aplicações | `viewApps` | Lista de aplicações geradas |
| Brand Import | `viewBrandImport` | Upload avançado de logo |
| Export | `viewExport` | Gerenciamento de pastas e arquivos |
| App Editor | `viewAppEditor` | Editor fullscreen (iframe fabric.js) |

### 3.2 Fluxo de Navegação

```
                    ┌─────────────────────────────┐
                    │       HOME / PROJETOS        │
                    │  (grid de cards + "Novo")    │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │      openProject(id)         │
                    │  → App Editor (iframe)       │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
     ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
     │   EDITOR     │   │  BRAND BOARD │   │   APLICAÇÕES     │
     │ (identidade) │   │ (dashboard)  │   │ (materiais ger.) │
     └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘
            │                  │                    │
            ▼                  ▼                    ▼
     ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
     │ BRAND IMPORT │   │   EXPORTAR   │   │   APP EDITOR     │
     │ (upload logo)│   │ (pastas/zip) │   │ (iframe fabric)  │
     └──────────────┘   └──────────────┘   └──────────────────┘
```

---

## 4. State Management

### 4.1 Objeto Global `S`

```js
const S = {
  projects: [],      // Array de projetos (persistido)
  pid: null,         // ID do projeto ativo
  styleKey: null,    // Chave do estilo tipográfico ativo
  colorId: null,     // ID da cor ativa no modal
  hsv: {h, s, v},   // Estado HSV do seletor de cores
  dragging: null,    // Elemento sendo arrastado no picker
};
```

### 4.2 Estrutura de um Projeto

```js
{
  id: "p_xxxx",           // ID único
  name: "Nome do Projeto",
  about: "Descrição",
  fontPri: "Outfit",      // Fonte primária
  fontSec: "Sora",        // Fonte secundária
  typo: [                 // 9 estilos tipográficos
    {key:"Display", fam:"__PRI__", wt:300, sz:56, lh:1.1, ls:-1.0, al:"left", va:"top", up:false, it:false},
    {key:"H1", ...},
    // ... H2, H3, Body, Small, Caption, Button, Label
  ],
  colors: [               // Paleta de cores
    {id:"c_xxx", hex:"#7F5AF0", alpha:100, pct:55, name:"Primária"},
    {id:"c_xxx", hex:"#2CB67D", alpha:100, pct:30, name:"Secundária"},
    {id:"c_xxx", hex:"#F4A261", alpha:100, pct:15, name:"Acento"},
  ],
  logoSq: null,           // Asset do logo quadrado
  logoWd: null,           // Asset do logo horizontal
  brandImport: {          // Estado do brand import
    xHeight: 52,
    safeMargin: 12,
    enabled: false,
    lastStats: null,
    place: {sq: {x, y, scale}, wd: {x, y, scale}},
    extras: [{id, name, asset, place}]
  },
  exportLibrary: {        // Estrutura de exportação
    folders: [
      {id:"root-brand", name:"Marca", parent:"root-project"},
      {id:"root-apps", name:"Aplicações", parent:"root-project"},
      // ...
    ],
    files: [],
    activeFolderId: null,
    expanded: {}
  },
  applications: [],       // Aplicações geradas
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 5. Módulos Core

### 5.1 Storage (`core/storage.js`)

- **Chave**: `goblins_v3` no localStorage
- **Auto-save com debounce** (1s)
- **Backup**: até 5 backups com prefixo `goblins_v3_backup_` + timestamp
- **Restauração automática**: se o dado principal corromper, tenta backups em ordem reversa
- **ExportAll**: retorna dados atuais + todos os backups

### 5.2 Security (`core/security.js`)

```js
sanitizeSVG(input)
  → Remove <script>, atributos on*, javascript:
getParentOrigin()
  → Lida com ancestorOrigins para iframes
isTrustedMessageEvent(ev, opts)
  → Valida origin e source de postMessage
```

### 5.3 Error Handler (`core/error-handler.js`)

- Escuta `window.error` e `unhandledrejection`
- Loga no console com prefixo `[GoBrand Error]`
- Callback opcional `onError`

### 5.4 Command System

Arquitetura em camadas:

```
commands.js     → Define comandos (edit, selection, transform, boolean, etc.)
dispatcher.js   → Indexa + executa comandos por ID
history.js      → Pilhas de undo/redo
shortcuts.js    → Mapeia atalhos → comandos
```

**Comandos implementados:**
- Edit: copy, paste, duplicate, delete, undo, redo
- Selection: selectAll, deselectAll
- Transform: move, rotate, scale, flipHorizontal, flipVertical
- Boolean: union, subtract, intersect

**Comandos seedados (notImplemented):** cut, pasteInPlace, group, ungroup, lock, unlock, hide, show

### 5.5 Frame Engine (`core/frame/`)

Módulos ES6 para engine de canvas:
- **sceneGraph.js** — Árvore de objetos da cena
- **render.js** — Renderização
- **layout.js** — Sistema de layout
- **transform.js** — Transformações geométricas
- **hitTest.js** — Detecção de clique/toque

---

## 6. Editor de Identidade

### 6.1 Layout (3 colunas)

```
┌──────────────┬──────────────────┬──────────────┐
│  Coluna Esq. │   Coluna Meio    │   Preview    │
│  (300px)     │   (1fr)          │   (280px)    │
│              │                  │              │
│  Identidade  │  Tipografia      │  Live Preview│
│  Nome/Desc   │  Primária/Sec    │  (scroll)    │
│              │                  │              │
│  Logo        │  Hierarquia Est. │              │
│  Upload      │  Display...Label │              │
│              │                  │              │
│  Paleta      │  Editor de       │              │
│  (barra +    │  Estilos (abrir) │              │
│   chips)     │                  │              │
└──────────────┴──────────────────┴──────────────┘
```

### 6.2 Seletor de Cores (Modal)

- **Picker HSV**: canvas com gradiente + knob
- **Hue strip**: gradiente horizontal 360°
- **Alpha strip**: transparente → cor sólida
- **Inputs**: HEX, RGB, Opacidade (0-100), % Uso, Nome
- **Copy modes**: HEX, RGB, RGBA, HSL, CSS var()
- **History dots**: cores do projeto como swatches clicáveis

### 6.3 Tipografia

- 9 estilos pré-definidos (Display, H1, H2, H3, Body, Small, Caption, Button, Label)
- Restrição de fontes (toggle: só primária/secundária ou todas Google Fonts)
- Integração com Google Fonts catalog (fetch metadata)
- Editor de estilo com: família, peso, tamanho, line-height, letter-spacing, alinhamento, uppercase, itálico
- Base style: herdar propriedades de outro estilo

---

## 7. Brand Import

Fluxo de upload de logo em duas etapas:

1. **Upload inicial** (botão "Carregar sua marca" no editor)
2. **Workspace avançado** (view `brandImport`) com:
   - Slots: quadrado (símbolo) + horizontal (logotipo)
   - Slots extras adicionáveis
   - Altura X (20-90%)
   - Área de respiro (0-40%)
   - Posicionamento manual (X, Y, scale)
   - Preview combinado (composite preview)
   - Sanitização/normalização de SVG (viewBox, margem)

---

## 8. Brand Board

Dashboard visual com:
- Logo da marca (SVG ou imagem)
- Paleta de cores (chips com nome, hex, %)
- Tipografia (todos os estilos com preview)
- Aplicações (thumbnails)
- Botões de ação: Exportar Painel, Editar Identidade, Nova Aplicação, Gerar por Briefing

---

## 9. Exportação

### 9.1 Estrutura de Pastas (automática)

```
root-project/{nome-projeto}/
├── Marca/
│   ├── SVG/
│   ├── PNG/
│   ├── PDF/
│   └── Variações/
├── Aplicações/
└── Biblioteca/
    ├── Design Tokens/
    ├── CSS/
    ├── Tailwind/
    └── Tipografia/
```

### 9.2 Funcionalidades

- Navegação por árvore de pastas
- Arquivos (SVG, CSS, tokens, etc.)
- Breadcrumb de localização
- Drag & drop entre pastas
- Contagem de arquivos por pasta

---

## 10. Aplicações

- Cada aplicação tem: id, nome, tipo, unidade, largura, altura, dpi, bleed, safe, svg
- Preview em SVG
- Edição no App Editor (iframe com fabric.js)
- Ações: editar, duplicar, excluir
- Geração em lote via briefing (modal com parser de blocos `chave: valor`)

---

## 11. Sistema de Design (CSS Tokens)

```css
:root {
  --bg:         #0e0e11;   /* Fundo principal */
  --surface:    #16161a;   /* Superfície de cards */
  --surface2:   #1e1e24;   /* Superfície secundária */
  --surface3:   #26262e;   /* Superfície terciária */
  --border:     rgba(255,255,255,.07);
  --border2:    rgba(255,255,255,.12);
  --ink:        #f0eff4;   /* Texto principal */
  --ink2:       rgba(240,239,244,.55);
  --ink3:       rgba(240,239,244,.30);
  --accent:     #7f5af0;   /* Roxo - cor de ação */
  --accent2:    #2cb67d;   /* Verde - sucesso */
  --danger:     #e85d5d;   /* Vermelho - erro/exclusão */
  --warn:       #f4a261;   /* Laranja - aviso */
  --font:       'Outfit', ui-sans-serif, system-ui, sans-serif;
  --mono:       'JetBrains Mono', ui-monospace, monospace;
}
```

Tema escuro (`color-scheme: dark`) com sombras, cantos arredondados (8/14/20/28px) e transições suaves (140ms cubic-bezier).

---

## 12. Regras de Estilo e Design System

### 12.1 Sempre usar os tokens CSS do projeto

**Nunca** adicione cores, fontes, bordas, sombras ou valores avulsos no CSS ou inline.  
Use exclusivamente os tokens definidos em `styles.css:4-33`:

```css
/* ✅ Correto */
.block { background: var(--surface); border: 1px solid var(--border); }
.text { color: var(--ink2); font-family: var(--mono); }

/* ❌ Errado */
.block { background: #1a1a1f; border: 1px solid rgba(255,255,255,.1); }
.text { color: #999; font-family: 'Courier New'; }
```

### 12.2 Inline styles permitidos APENAS para valores dinâmicos

Inline styles são aceitáveis quando o valor **vem do estado do projeto** (cor da paleta, tamanho, posição). Para tudo que é estático (layout, padding, gap, cor de fundo de container), use classes CSS.

```html
<!-- ✅ Correto: cor dinâmica vinda do projeto -->
<div style="background: ${c.hex}; width: ${c.pct}%">

<!-- ❌ Errado: layout estático inline -->
<div style="display:flex; gap:12px; padding:16px; background: #16161a">
```

### 12.3 Não criar novas variáveis CSS fora de `styles.css`

Toda variável `--*` nova deve ser adicionada em `styles.css` no bloco `:root`.  
Se precisar de uma variação local (ex.: cor de um componente específico), use `rgba(var(--accent), 0.12)` ou `color-mix()`.

```css
/* ✅ Correto: derivar do token existente */
.card-highlight { background: rgba(127,90,240,.12); }

/* ❌ Errado: criar variável nova no meio do código */
.section { --section-bg: #9370f5; }
```

### 12.4 Preferir classes CSS reutilizáveis a utilitários inline

Componentes que se repetem (cards, chips, badges, botões) já têm classes em `styles.css`.  
Use-as em vez de recriar o mesmo estilo em cada template.

| Componente | Classe CSS | Arquivo |
|---|---|---|
| Card padrão | `.block` | `styles.css:394-399` |
| Botão primário | `.btn .btn-primary` | `styles.css:216-221` |
| Botão ghost | `.btn .btn-ghost` | `styles.css:210-214` |
| Input | `.inp` | `styles.css:247-252` |
| Select | `.sel` | `styles.css:247-261` |
| Textarea | `.tex` | `styles.css:247-263` |
| Label de campo | `.field-label` | `styles.css:242-246` |
| Badge | `.badge` | `styles.css:871-876` |
| Toast | `.toast` | `styles.css:687-710` |
| Modal backdrop | `.modal-backdrop` | `styles.css:715-722` |
| Empty state | `.empty-state` | `styles.css:878-883` |
| Grid de projetos | `.proj-grid` | `styles.css:298-302` |

### 12.5 Ícones: usar Lucide via atributo `data-lucide`

Sempre que possível, use o atributo `data-lucide` em vez de SVG inline.  
O Lucide converte automaticamente na inicialização.

```html
<!-- ✅ Correto -->
<i data-lucide="save" data-size="14"></i>

<!-- ✅ Aceitável para ícones muito específicos -->
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
</svg>

<!-- ❌ Errado: redefinir stroke-width diferente do padrão do projeto -->
<svg stroke-width="1.5">...</svg>
```

O projeto define `stroke-width: 1.9` global para Lucide em `styles.css:1374-1379`.

### 12.6 Animações: usar as existentes em `styles.css`

| Animação | Classe/Keyframe | Uso |
|---|---|---|
| Fade in + slide up | `.anim-in` / `@keyframes fadeIn` | Cards, listas |
| Toast slide up | `.toast` / `@keyframes slideUp` | Notificações |
| Toast slide down | `.toast.out` / `@keyframes slideDown` | Remoção de toast |
| Modal in | `.modal` / `@keyframes modalIn` | Modais |
| Context menu | `.ctx-menu.open` / `@keyframes ctxIn` | Menu de contexto |
| Shimmer loading | `.sk` / `@keyframes shimmer` | Skeleton loading |

```html
<!-- ✅ Correto -->
<div class="anim-in" style="animation-delay: ${i * 40}ms">

<!-- ❌ Errado: animação inline duplicada -->
<div style="animation: myFadeIn 200ms">
```

---

## 13. Dependências e Fluxo de Carregamento

```
index.html
  ├── styles.css (bloqueante)
  ├── Google Fonts preconnect + stylesheet
  ├── Lucide (ícones)
  ├── JSZip (exportação)
  └── script.js (IIFE — sem type="module")
        ├── core/error-handler.js (IIFE) → ✅ Roda no app
        ├── core/storage.js (IIFE)       → ✅ Roda no app
        ├── core/security.js (IIFE)      → ✅ Roda no app
        ├── utils/debounce.js (IIFE)     → ✅ Roda no app
        │
        ├── core/history.js (ES module)  → ❌ NÃO importado
        ├── core/commands.js (ES module) → ❌ NÃO importado
        ├── core/dispatcher.js (ES module)→ ❌ NÃO importado
        ├── core/shortcuts.js (ES module) → ❌ NÃO importado
        └── core/frame/*.js (ES module)  → ❌ NÃO importado
```

---

## 14. Pontos de Integração

| Integração | Localização | Descrição |
|---|---|---|
| `gePushBrandData(p)` | `script.js` | Push de dados do projeto para o iframe do editor |
| `ensureAppEditorReady(a, p)` | `script.js` | Inicialização do App Editor |
| `interpretBriefing()` | `script.js` | Parse de briefing → geração em lote |
| `generateApplicationsFromBriefing()` | `script.js` | Geração de aplicações a partir do briefing |
| `postMessage` | `core/security.js` | Validação de mensagens entre iframe e app |

---

## 15. Métricas de Código

| Arquivo | Linhas | Tipo | Integrado ao app? |
|---|---|---|---|---|
| `index.html` | ~615 | HTML + template embutido | ✅ |
| `styles.css` | ~1453 | CSS puro | ✅ |
| `script.js` | 3234 | Vanilla JS (IIFE) | ✅ (monolítico) |
| `core/storage.js` | 63 | IIFE | ✅ |
| `core/security.js` | 27 | IIFE | ✅ |
| `core/error-handler.js` | 20 | IIFE | ✅ |
| `core/commands.js` | 156 | ES module | ❌ Desconectado |
| `core/dispatcher.js` | 55 | ES module | ❌ Desconectado |
| `core/history.js` | 72 | ES module | ❌ Desconectado |
| `core/shortcuts.js` | 58 | ES module | ❌ Desconectado |
| `core/frame/sceneGraph.js` | 143 | ES module | ❌ Só na demo standalone |
| `core/frame/render.js` | 66 | ES module | ❌ Só na demo standalone |
| `core/frame/layout.js` | 127 | ES module | ❌ Só na demo standalone |
| `core/frame/transform.js` | 69 | ES module | ❌ Só na demo standalone |
| `core/frame/hitTest.js` | 36 | ES module | ❌ Só na demo standalone |
| `utils/debounce.js` | 11 | IIFE | ✅ |
| **Total executável** | **~5900** | | **~780 linhas não conectadas** |

> **Nota crítica:** `core/commands.js`, `dispatcher.js`, `history.js`, `shortcuts.js` e `core/frame/*.js` usam `export/import` (ES modules), mas `script.js` não tem `type="module"` e não importa nenhum deles. Todo o sistema de comandos e a engine de canvas estão **desconectados do aplicativo principal**.

---

## 16. Diagnóstico do Estado Atual

Análise detalhada do que está funcionando, o que está quebrado e o que nunca foi implementado, baseada na leitura completa de todos os arquivos do projeto (maio/2026).

---

### 16.1 Sistema de Comandos Desconectado

| Módulo | Linhas | Status | Impacto |
|---|---|---|---|
| `core/commands.js` | 156 | ❌ Desconectado | Copy, paste, duplicate, delete, undo, redo nunca executam |
| `core/dispatcher.js` | 55 | ❌ Desconectado | Comandos não chegam ao app |
| `core/history.js` | 72 | ❌ Desconectado | Sem undo/redo funcional |
| `core/shortcuts.js` | 58 | ❌ Desconectado | Ctrl+C/V/Z/D, Delete, Esc, Ctrl+A não funcionam via comando |
| **Total** | **~341** | **0% integrado** | |

**Causa raiz:**  
`script.js` é carregado como IIFE comum (`<script src="script.js">`). Os módulos em `core/` usam `export/import` (ES modules) e exigem `<script type="module">`. Como `script.js` não importa nada, esses módulos **nunca são executados** no contexto do app.

**Evidência** (`shortcuts.js:37-55`):
```js
// bindShortcuts() registra keydown → dispatcher → executeCommand
// Mas NUNCA é chamado em lugar nenhum do app real
export function bindShortcuts(target = window, context = {}) { ... }
```

**Os únicos atalhos que funcionam** são os registrados diretamente em `script.js:3102-3105`:
```js
document.addEventListener("keydown", e => {
  if((e.metaKey||e.ctrlKey)&&e.key==="s"){ e.preventDefault(); saveProject(); }
});
```

---

### 16.2 Bezier / Path Editing — Zero Implementação

| Aspecto | Estado |
|---|---|
| Nó `PATH` no scene graph | ❌ Não existe (só FRAME, RECT, TEXT, GROUP) |
| Nó `ELLIPSE`, `POLYGON`, `BEZIER_CURVE` | ❌ Não existe |
| Handles de curva (handle in/out) | ❌ Não existe |
| Algoritmo de Casteljau (split em t) | ❌ Não existe |
| `docs/bezier-v2-references.md` | Apenas notas de pesquisa conceitual |
| `docs/codex-editor-lab-plan.md` | Explicitamente fora de escopo da Fase 1 |

**Conclusão:** Não há uma única linha de implementação de curvas bezier no projeto. O documento de referência aponta Paper.js, React bezier spline editors e Bezier.js como candidatos, mas nada foi extraído ou adaptado.

---

### 16.3 Briefing — Título e Subtítulo Perdidos

**Arquivo:** `script.js:1827-1828`

```js
// Tentativa de replace em elementos que NÃO existem no SVG gerado
if(item.title) xml = xml.replace(
  /(<text id="title"[^>]*>)([^<]*)(<\/text>)/,
  `$1${esc(item.title)}$3`
);
```

O SVG gerado por `generateApplicationSVG()` (`script.js:1660-1672`) contém apenas:
- `<g id="guides">` — guias de sangria/segurança
- `<g id="content">` com `<rect id="bg">`
- `<g id="notes">` com informações de formato

**Não há** `<text id="title">` nem `<text id="subtitle">`.  
O replace regex simplesmente **não encontra match** e os valores são silenciosamente ignorados.

**Impacto:** Toda geração por briefing perde título e subtítulo definidos pelo usuário.

---

### 16.4 App Editor — Bugs e Race Conditions

#### 16.4.1 Listener infinito `appEditEsc`

`script.js:2426-2429`:
```js
function appEditEsc(e){
  if(e.key==="Escape") closeAppEditor();
  else document.addEventListener("keydown", appEditEsc, {once:true});
}
```

- ✅ Se Escape → fecha editor (correto)
- ❌ Se **qualquer outra tecla** → adiciona **novo** listener `{once:true}`
- Na próxima tecla não-Escape → adiciona **outro** listener, e assim por diante
- **Resultado:** vazamento de listeners a cada tecla pressionada
- **Agravante:** a função **nunca é chamada** em lugar nenhum — código morto + leak

#### 16.4.2 Race Condition no carregamento do iframe

`script.js:2366`:
```js
setTimeout(() => {
  gePost({type: "setDoc", w, h, fit: true});
  gePost({type: "setSVG", svg: normalizedSvg});
  gePushBrandData(p);
  // ...
}, 450);
```

O timeout fixo de 450ms não garante que:
1. O iframe terminou de carregar o srcdoc
2. O Fabric.js foi inicializado
3. Os listeners de `message` estão prontos

Se o iframe carregar mais devagar (conexão lenta, CPU ocupada), os dados nunca chegam.  
Não há callback `iframe.onload` combinado com handshake via `postMessage`.

#### 16.4.3 UI de seleção serializada no SVG

`script.js:2544-2598`: A função `ensureSelectionUI()` adiciona um `<g id="__ui">` contendo:
- `<rect id="__selRect">` — borda tracejada da seleção
- 8 `<circle class="__h">` — handles de resize

Quando `persistAppSvg()` serializa o SVG (linha 3062), o `__ui` inteiro é incluído.  
Ao reabrir a aplicação, os handles de resize aparecem como elementos visuais do SVG exportado.

---

### 16.5 Export Manager — Nome da Pasta Raiz Sobrescrito

`script.js:188-190`:
```js
if(id==='root-project'){
  if(folder.autoName!==false) folder.name = p.name || 'Projeto';
  folder.autoName = true;  // ← sempre setado na criação
}
```

- Na criação: `folder.autoName = true`
- Em `loadEditor()`: `folder.name = p.name` (se `autoName !== false`)
- Se o usuário renomeia a pasta → `autoName` **nunca é setado como `false`**  
- Na próxima vez que `loadEditor()` roda → nome volta ao original

**Impacto:** Não é possível ter um nome personalizado para a pasta raiz do projeto.

---

### 16.6 Brand Board Export — CSS Hardcoded

`script.js:1433-1474`: A função `buildBrandBoardExportCSS()` gera CSS para o HTML exportado com **valores fixos**:

```js
function buildBrandBoardExportCSS(){
  return `
  :root{--ink:#14161f;--ink2:#505a70;--line:#dbe1ea;--surface:#fff;--surface2:#f7f9fd}
  // ...
  `;
}
```

As cores do tema escuro do app (roxo `#7f5af0`, verde `#2cb67d`) até são passadas via `style="--bb-accent: ..."` no wrapper, mas o restante do CSS ignora o design system real do projeto. Se o projeto usa uma paleta diferente, o board exportado não reflete as cores da marca.

---

### 16.7 Storage — Sem Tratamento de Quota

`core/storage.js:13`:
```js
global.localStorage.setItem(KEY, serialized);
```

- ❌ Não captura `QuotaExceededError`
- ❌ Não há fallback para compressão ou limpeza de backups antigos
- ❌ Não há notificação ao usuário

Projetos com múltiplos SVGs grandes (logos + aplicações) podem facilmente exceder o limite de ~5-10MB do localStorage. A falha é silenciosa — o usuário acha que salvou mas o dado se perde.

---

### 16.8 Seletor HSV — Inputs Não Atualizam Durante Drag

`script.js:928-961`: A função `syncPicker()` atualiza `$("mHex")` e `$("mRgb")`, mas só é chamada nos eventos `mouseup`/`touchend`.

Durante o arrasto do knob no picker canvas ou hue strip, o `mousemove` chama `handlePickerMove()` que chama `syncPicker()` — **apenas** para atualizar o knob visual e o preview. Os inputs de HEX e RGB **não recebem os valores intermediários**.

---

### 16.9 Frame Engine — Isolada do App Principal

| Módulo | Linhas | Onde roda |
|---|---|---|
| `core/frame/sceneGraph.js` | 143 | ❌ `frame-engine-demo.html` (standalone) |
| `core/frame/render.js` | 66 | ❌ `frame-engine-demo.html` |
| `core/frame/layout.js` | 127 | ❌ `frame-engine-demo.html` |
| `core/frame/transform.js` | 69 | ❌ `frame-engine-demo.html` |
| `core/frame/hitTest.js` | 36 | ❌ `frame-engine-demo.html` |

A engine completa (~441 linhas) tem:
- ✅ Scene graph com árvore de nós (FRAME, RECT, TEXT, GROUP)
- ✅ Renderização em Canvas 2D
- ✅ Auto-layout (HORIZONTAL / VERTICAL com padding, gap, FILL, alinhamento)
- ✅ Constraints (LEFT, RIGHT, LEFT_RIGHT, CENTER, SCALE)
- ✅ Scroll com clipe de conteúdo
- ✅ Hit testing com scroll awareness
- ✅ Transformações com matrizes (world → local)

A demo `frame-engine-demo.html` funciona como prova de conceito, mas **nenhuma linha está integrada ao `script.js` ou ao `index.html`**. O app real continua usando Fabric.js via iframe.

---

### 16.10 Navegação — UX Questionável

`script.js:450-463`:
```js
function openProject(pid){
  // ...
  openAppEditor(proj.applications[0].id);  // ← vai direto pro iframe fullscreen
}
```

Ao abrir um projeto, o usuário **cai no App Editor** (iframe fullscreen com Fabric.js), não no Editor de Identidade (onde estão cores, tipografia, logo). Isso é reconhecido como problema no próprio `docs/fluxo-navegacao-gobrand.md`:

> "Se o objetivo é facilitar onboarding e reduzir confusão inicial, o ajuste de maior impacto é:  
> 1. Abrir projeto em **editor** (identidade) por padrão."

---

### 16.11 Google Fonts Catalog — Sujeito a CORS

`script.js:534-561`:
```js
async function loadGoogleFontsCatalog(){
  const res = await fetch("https://fonts.google.com/metadata/fonts");
  // ...
}
```

Este endpoint não possui cabeçalho `Access-Control-Allow-Origin` em todas as origens. O fallback existe (lista local de ~14 fontes), mas:
- O erro `CORS` aparece no console
- O usuário nunca vê as ~1000+ fontes disponíveis
- A tentativa de fetch é feita em toda inicialização

---

### 16.12 Aplicação Demo com SVG Vazio

`script.js:1359-1367`:
```js
const realApps = (p.applications||[]).slice(0,6);
const apps = realApps.length ? realApps : [{id:'demo', name:'Aplicação exemplo', w:1080, h:1080, unit:'px', svg:''}];
// ...
${a.svg ? `<img src="${svgToDataUri(a.svg)}" ...>` : `<div class="bb-app-empty">...</div>`}
```

Quando não há aplicações, cria um objeto `demo` com `svg:''`.  
`svgToDataUri('')` retorna `"data:image/svg+xml;charset=utf-8,"` — uma imagem SVG vazia.  
O operador ternário `a.svg ? ... : ...` não cobre o caso `a.svg === ''` (string vazia é falsy? Sim, mas se houver qualquer conteúdo mínimo, o preview aparece quebrado).

---

### 16.13 Template HTML Escapado — Frágil

`index.html:617-967` (aproximado):

O conteúdo do `<template id="geEditorTemplate">` é HTML-escapado manualmente:
- `&lt;` → `<`
- `&gt;` → `>`
- `&amp;` → `&`

Qualquer alteração no template exige re-escapar manualmente.

`script.js:3153-3164`:
```js
function geEnsureIframeLoaded(){
  const txt = tpl.innerHTML;
  const ta = document.createElement('textarea');
  ta.innerHTML = txt;
  frame.srcdoc = ta.value;  // ← decode via textarea
}
```

Funciona, mas:
- Difícil de debugar (erros de escaping não são óbvios)
- Não há syntax highlighting ou lint para o conteúdo escapado
- O template inline (~350 linhas de HTML + CSS) aumenta o HTML inicial

---

### 16.14 Monólito `script.js` — 3234 Linhas sem Separação

O arquivo `script.js` contém **toda** a lógica do aplicativo em um único escopo:

| Domínio | Linhas (aproximado) |
|---|---|
| Config/state/utils | 1-106 |
| Storage wrapper | 107-143 |
| Projetos CRUD | 144-464 |
| Editor identidade | 465-1276 |
| Brand Board | 1277-1498 |
| SVG utilities | 1499-1559 |
| Aplicações (CRUD) | 1560-1904 |
| Briefing | 1678-1839 |
| Export manager | 1906-2321 |
| App Editor SVG | 2322-3097 |
| Atalhos/boot | 3098-3234 |

Sem modularização, sem separação de concerns, sem testes.

---

### 16.15 Resumo de Bugs e Problemas

| ID | Problema | Arquivo:Linha | Severidade |
|---|---|---|---|
| B1 | Comandos (copy/paste/undo/redo) nunca executam | `core/*.js` | 🔴 Crítico |
| B2 | Briefing perde título/subtítulo | `script.js:1827-1828` | 🔴 Crítico |
| B3 | Listener infinito `appEditEsc` + código morto | `script.js:2426-2429` | 🔴 Crítico |
| B4 | Race condition no iframe (timeout 450ms) | `script.js:2366` | 🟡 Alto |
| B5 | UI de seleção serializada no SVG exportado | `script.js:2544-2598` | 🟡 Alto |
| B6 | Pasta raiz tem nome sobrescrito | `script.js:188-190` | 🟡 Alto |
| B7 | Brand Board export com CSS hardcoded | `script.js:1433-1474` | 🟡 Alto |
| B8 | Storage sem tratamento de quota | `core/storage.js:13` | 🟡 Alto |
| B9 | HSV inputs não atualizam durante drag | `script.js:928-961` | 🟠 Médio |
| B10 | Frame engine não integrada ao app | `core/frame/*.js` | 🟠 Médio |
| B11 | UX: abre App Editor em vez de Editor | `script.js:463` | 🟠 Médio |
| B12 | Google Fonts catalog sujeito a CORS | `script.js:538` | 🟠 Médio |
| B13 | Aplicação demo com SVG vazio | `script.js:1360` | 🔵 Baixo |
| B14 | Template HTML escapado (frágil) | `index.html:617-967` | 🔵 Baixo |
| B15 | Monólito de 3234 linhas sem módulos | `script.js` | 🔵 Baixo |

---

## 17. Plano de Melhorias Priorizado

Prioridades definidas por impacto no usuário vs. esforço de implementação.

---

### 🔴 P0 — Correções Críticas (Funcionalidade Quebrada)

#### 17.1 Conectar Sistema de Comandos ao App

**Problema:** B1 — `core/commands.js`, `dispatcher.js`, `history.js`, `shortcuts.js` nunca executam.

**Solução:**
```html
<!-- index.html: carregar módulos antes do script principal -->
<script type="module">
  import './core/history.js';
  import './core/commands.js';
  import './core/dispatcher.js';
  import { bindShortcuts } from './core/shortcuts.js';

  window.__commandsReady = true;
  bindShortcuts(window, { getSelection, insertElements, deleteSelection /* ... */ });
</script>
```

**Ou** (migração progressiva):
- Manter `script.js` como IIFE
- `core/*.js` expõe APIs via `globalThis` + `import()`
- `script.js` chama `import('./core/dispatcher.js')` no boot

**Critério de aceite:** Ctrl+C copia, Ctrl+V cola, Ctrl+Z desfaz, Delete remove seleção no App Editor.

---

#### 17.2 Corrigir Briefing — Título e Subtítulo

**Problema:** B2 — regex replace em elementos que não existem.

**Solução:** Adicionar placeholders no SVG gerado por `generateApplicationSVG()`:

```js
// Dentro do template SVG em generateApplicationSVG()
const contentLayer = `
  <g id="content" data-layer="content">
    <rect id="bg" .../>
    <text id="title" data-editable="1" data-name="Título"
      x="${bleedPx + margin}" y="${bleedPx + margin + 48}"
      font-family="${famPri}" font-size="48" font-weight="700"
      fill="#000000">Título</text>
    <text id="subtitle" data-editable="1" data-name="Subtítulo"
      x="${bleedPx + margin}" y="${bleedPx + margin + 100}"
      font-family="${famSec}" font-size="24" font-weight="400"
      fill="#666666">Subtítulo</text>
  </g>`;
```

**Critério de aceite:** Ao gerar por briefing com `titulo: COMIDAS`, o SVG resultante contém o texto "COMIDAS".

---

#### 17.3 Remover/Corrigir `appEditEsc`

**Problema:** B3 — vazamento de listeners + código morto.

**Solução:** Remover a função `appEditEsc()` e substituir pelo handler global existente:

```js
// Já existe em script.js:2991-3012
document.addEventListener("keydown", (e) => {
  if(!$("viewAppEditor")?.classList.contains("active")) return;
  if(e.key === "Escape") closeAppEditor();
  // ... arrow keys para nudge
});
```

**Critério de aceite:** Escape fecha App Editor sem vazar listeners.

---

#### 17.4 Substituir `setTimeout(450ms)` por Handshake

**Problema:** B4 — race condition no carregamento do iframe.

**Solução:**
```js
function ensureAppEditorReady(a, p) {
  const frame = $("geEditorFrame");
  frame.onload = () => {
    // Envia dados somente após iframe estar pronto
    gePost({type: "setDoc", ...});
    gePost({type: "setSVG", svg: normalizedSvg});
    gePushBrandData(p);
  };

  // Handshake: iframe envia "geReady" quando Fabric.js inicializa
  window.addEventListener("message", function onReady(ev) {
    if (ev.data?.type !== "geReady") return;
    window.removeEventListener("message", onReady);
    gePost({type: "setDoc", ...});
  });
}
```

**Critério de aceite:** Dados chegam ao iframe independentemente do tempo de carregamento.

---

### 🟡 P1 — Correções Funcionais

#### 17.5 Export — Não Sobrescrever Nome da Pasta Raiz

**Problema:** B6.

**Solução:** Setar `autoName = false` ao renomear:

```js
function renameExportFolder(folderId) {
  // ...
  fld.name = name.trim();
  fld.autoName = false;  // ← ADD
  // ...
}
```

E no `ensureDefaultExportFolders`, respeitar o flag:

```js
const folder = lib.folders.find(f => f.id === id);
if (!folder) {
  folder = { id, name, parent, autoName: false };
  lib.folders.push(folder);
}
if (id === 'root-project' && folder.autoName !== false) {
  folder.name = p.name || 'Projeto';
}
```

**Critério de aceite:** Renomear a pasta raiz mantém o nome após reload.

---

#### 17.6 Brand Board Export — CSS Dinâmico

**Problema:** B7.

**Solução:** Derivar CSS do projeto real:

```js
function buildBrandBoardExportCSS(p) {
  const accent = (p.colors?.[0]?.hex) || '#7f5af0';
  const accentAlt = (p.colors?.[1]?.hex) || '#2cb67d';
  return `
  :root {
    --bb-accent: ${accent};
    --bb-accent-alt: ${accentAlt};
    --bb-accent-soft: ${accent}22;
    --bb-accent-alt-soft: ${accentAlt}1e;
  }
  /* ... resto do CSS ... */
  `;
}
```

**Critério de aceite:** Board exportado usa as cores reais do projeto (não cores fixas).

---

#### 17.7 HSV — Atualizar Inputs Durante Drag

**Problema:** B9.

**Solução:** `syncPicker()` já atualiza inputs — o problema é que `handlePickerMove` para drag no picker canvas chama `syncPicker()` mas `mHex` e `mRgb` podem não ser atualizados se o evento for muito rápido. Garantir que `syncPicker()` sempre escreva nos inputs:

```js
function syncPicker() {
  // ... (já existe)
  $("mHex").value = hexFull;      // ← já existe
  $("mRgb").value = `${r2}, ${g2}, ${b2}`;  // ← já existe
}
```

**Problema real:** Os `mousemove` events já chamam `syncPicker()` via `handlePickerMove`. Verificar se o navegador está atualizando o DOM durante scroll intenso. Testar com `requestAnimationFrame` no handler.

**Critério de aceite:** HEX e RGB atualizam visualmente durante o arrasto do knob.

---

#### 17.8 App Editor — UI de Seleção Não Serializar

**Problema:** B5.

**Solução:** Marcar elementos da UI com `data-ui="1"` e filtrar na serialização:

```js
function persistAppSvg() {
  // ...
  const clone = svg.cloneNode(true);
  clone.querySelectorAll('[data-ui="1"]').forEach(el => el.remove());
  const xml = new XMLSerializer().serializeToString(clone);
  a.svg = xml;
}
```

No `ensureSelectionUI()`:
```js
ui.setAttribute("data-ui", "1");
```

**Critério de aceite:** SVG exportado não contém `__selRect` ou handles de resize.

---

### 🟠 P2 — Melhorias de Arquitetura

#### 17.9 Integrar Frame Engine ao App Principal

**Problema:** B10 — `core/frame/` só roda na demo.

**Solução progressiva:**

| Fase | O que | Como |
|---|---|---|
| 1 | Importar scene graph + render no App Editor | Substituir manipulação direta de SVG por modelo de dados |
| 2 | Substituir Fabric.js no iframe | Renderizar canvas diretamente com `renderScene()` |
| 3 | Auto-layout conectado ao editor | Usar `applyAutoLayout()` nos frames do scene graph |

**Primeiro passo concreto:** No `ensureAppEditorReady`, inicializar um scene graph e usar `addNode()`/`renderScene()` em vez de manipular SVG por string.

---

#### 17.10 Implementar Auto-Layout

**Problema:** Modelo e algoritmo já existem em `core/frame/layout.js` mas não estão conectados.

**Solução:** Seguir o plano em `docs/auto-layout-figma-structure.md`:

```
layoutAutoFrame(frameId):
  1. Ler frame + autoLayout
  2. Calcular content box (tamanho - paddings)
  3. Separar filhos em flow e absolute
  4. Medir intrínsecos
  5. Resolver fixed/hug no eixo principal
  6. Distribuir sobra entre filhos fill (flexGrow)
  7. Resolver tamanho do frame em modo hug
  8. Posicionar (packed/space-between)
  9. Posicionar transversal (start/center/end/stretch)
  10. Aplicar clipping
```

**Integração:** Conectar aos comandos da UI:
- `toggleAutoLayoutForSelection()`
- `setAutoLayoutDirection(selection, direction)`
- `setAutoLayoutSizing(selectionOrChild, widthMode, heightMode)`

---

#### 17.11 Adicionar Nó Path ao Scene Graph

**Pré-requisito:** Frame engine integrada (17.9).

**Implementação:**

```js
// core/frame/sceneGraph.js
export const NODE_TYPE = {
  FRAME: 'FRAME',
  RECT: 'RECT',
  TEXT: 'TEXT',
  GROUP: 'GROUP',
  PATH: 'PATH',        // ← NOVO
  ELLIPSE: 'ELLIPSE',  // ← NOVO
};

export function createPathNode(partial = {}) {
  const base = createNode({ ...partial, type: NODE_TYPE.PATH });
  return {
    ...base,
    pathData: partial.pathData || '',   // SVG path d="M...L...Z"
    fillRule: partial.fillRule || 'nonzero',
    // Para edição bezier (futuro):
    // segments: partial.segments || [],  // array de {x,y,handleIn,handleOut}
  };
}
```

**Renderização:**
```js
// core/frame/render.js
if (node.type === NODE_TYPE.PATH) {
  const path = new Path2D(node.pathData);
  ctx.fillStyle = node.style?.fill || 'transparent';
  ctx.fill(path);
  if (node.style?.stroke) {
    ctx.strokeStyle = node.style.stroke;
    ctx.lineWidth = node.style?.strokeWidth || 1;
    ctx.stroke(path);
  }
}
```

---

### 🔵 P3 — Resiliência e UX

#### 17.12 Storage com Quota Handling

```js
// core/storage.js
save(data) {
  try {
    const serialized = JSON.stringify(data);
    global.localStorage.setItem(KEY, serialized);
    this.createBackup(serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // 1. Tentar limpar backups mais antigos
      this.cleanOldBackups();
      try {
        global.localStorage.setItem(KEY, serialized);
        return true;
      } catch { /* falhou */ }
    }
    global.ErrorHandler?.capture?.(error, { scope: 'Storage.save' });
    return false;
  }
}
```

#### 17.13 Google Fonts Catalog — Fallback Robusto

```js
async function loadGoogleFontsCatalog() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://fonts.google.com/metadata/fonts", {
      signal: controller.signal
    });
    clearTimeout(timeout);
    // ... parser existente
  } catch (err) {
    console.warn("Catalog indisponível, usando lista local.", err.message);
  }
}
```

#### 17.14 Navegação — Abrir no Editor de Identidade

**Conforme sugestão do próprio `docs/fluxo-navegacao-gobrand.md`:**

```js
function openProject(pid) {
  S.pid = pid;
  // ...
  nav('editor'); // ← em vez de openAppEditor()
}
```

Adicionar CTA "Ir para Aplicações" no Brand Board e no header do editor.

---

### 🟢 P4 — Manutenibilidade

#### 17.15 Refatorar `renderExportTreeNodes`

**Problema:** Template string única de ~14 linhas com eventos inline.

**Solução:** Quebrar em funções nomeadas:

```js
function renderFolderIcon(f) { /* ... */ }
function renderFolderName(f) { /* ... */ }
function renderFolderActions(f) { /* ... */ }
function renderFolderChildren(f, children, activeId, depth) { /* ... */ }

function renderExportTreeNodes(...) {
  return folders.map(f => `
    <div class="tree-node-wrap">
      <div class="tree-item ...">
        ${renderFolderToggle(f, children)}
        ${renderFolderIcon(f)}
        ${renderFolderName(f)}
        ${renderFolderActions(f)}
      </div>
      ${renderFolderChildren(f, children, activeId, depth)}
    </div>
  `).join('');
}
```

#### 17.16 Substituir Template Escapado por Geração Dinâmica

**Solução:** Gerar o conteúdo do iframe via JavaScript em vez de HTML escapado:

```js
// script.js
function buildEditorTemplate() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>Studio</title>
  <script src="https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js"><\/script>
  <!-- ... -->
</head>
<body>...</body>
</html>`;
}
```

E remover o `<template id="geEditorTemplate">` do `index.html`.

---

### 17.17 Quebrar `script.js` em Módulos

| Módulo sugerido | Conteúdo | Linhas (atual) |
|---|---|---|
| `app/state.js` | Objeto `S`, helpers, estado global | ~50 |
| `app/storage.js` | Wrapper (já existe em core/) | — |
| `app/projects.js` | CRUD de projetos, home render | ~300 |
| `app/editor.js` | Editor de identidade (cores, fontes, preview) | ~800 |
| `app/brand-import.js` | Upload, composição, preview | ~250 |
| `app/brand-board.js` | Dashboard + export HTML | ~250 |
| `app/applications.js` | CRUD de aplicações | ~350 |
| `app/briefing.js` | Parser + geração por lote | ~160 |
| `app/export.js` | Manager + ZIP + tokens | ~420 |
| `app/app-editor.js` | Editor SVG inline | ~600 |
| `app/iframe-bridge.js` | PostMessage + handshake | ~100 |

---

## 18. Roadmap (Priorizado)

### Fase 1 — Estabilizar (P0 + P1)

| # | Tarefa | Esforço | Impacto |
|---|---|---|---|
| 1 | Conectar sistema de comandos ao app | 2-3 dias | 🔴 Copy/paste/undo/redo |
| 2 | Corrigir briefing (adicionar title/subtitle ao SVG) | 1 dia | 🔴 Geração de aplicações |
| 3 | Remover `appEditEsc` (código morto + leak) | 0.5 dia | 🔴 Estabilidade |
| 4 | Handshake no iframe em vez de setTimeout | 1 dia | 🟡 Confiabilidade |
| 5 | UI de seleção não serializar no SVG | 0.5 dia | 🟡 Qualidade do SVG |
| 6 | Export raiz: respeitar `autoName` | 0.5 dia | 🟡 UX |
| 7 | Brand Board export com CSS dinâmico | 1 dia | 🟡 Exportação |
| 8 | Quota handling no storage | 1 dia | 🟡 Resiliência |
| 9 | HSV inputs atualizarem durante drag | 0.5 dia | 🟠 UX |

### Fase 2 — Arquitetura (P2)

| # | Tarefa | Esforço | Impacto |
|---|---|---|---|
| 10 | Integrar scene graph ao App Editor | 3-5 dias | 🟠 Base para engine própria |
| 11 | Auto-layout conectado à UI | 3-4 dias | 🟠 Layout avançado |
| 12 | Nó PATH no scene graph | 2-3 dias | 🟠 Edição vetorial |

### Fase 3 — Resiliência + Manutenção (P3 + P4)

| # | Tarefa | Esforço | Impacto |
|---|---|---|---|
| 13 | Google Fonts com timeout + AbortController | 0.5 dia | 🔵 Estabilidade |
| 14 | Navegação: abrir no Editor por padrão | 0.5 dia | 🟠 UX |
| 15 | Refatorar `renderExportTreeNodes` | 1 dia | 🔵 Manutenibilidade |
| 16 | Gerar template do iframe por JS | 1-2 dias | 🔵 Manutenibilidade |
| 17 | Quebrar `script.js` em módulos | 3-5 dias | 🔵 Manutenibilidade |
| 18 | Adicionar testes unitários | 5-7 dias | 🔵 Qualidade |

### Fase 4 — Evolução

| # | Tarefa | Esforço |
|---|---|---|
| 19 | Exportação em lote com formatos configuráveis | 3-5 dias |
| 20 | Temas claro/escuro | 2-3 dias |
| 21 | CTA "Ir para Aplicações" no Brand Board | 0.5 dia |
| 22 | Analytics de navegação | 2-3 dias |
| 23 | Comandos seedados: cut, group, lock, hide | 2-3 dias |

---

## 19. Catálogo do App Editor (iframe)

O template em `index.html:616-7407` contém um editor completo baseado em Fabric.js 5.3.0. Abaixo, todo menu, toolbar e botão catalogado com status de implementação.

### 19.1 Menu Bar (11 menus, 108 itens)

#### Arquivo
| ID | Label | Key | Status |
|---|---|---|---|
| `file.new` | Novo documento | Ctrl+N | ✅ `loadSVGFromParent('')` |
| `file.open` | Abrir | Ctrl+O | ✅ `fileInput.click()` |
| `file.close` | Fechar | — | ✅ `loadSVGFromParent('')` |
| `file.save` | Salvar | Ctrl+S | ✅ `exportSVGToParent` |
| `file.saveAs` | Salvar como | Ctrl+Shift+S | ✅ `exportSVGToParent` |
| `file.exportPng` | Exportar PNG | — | ✅ `exportPNG` |
| `file.exportJpg` | Exportar JPG | — | ⚠️ `notifyTodo` |
| `file.exportSvg` | Exportar SVG | — | ✅ `exportSVGToParent` |
| `file.exportPdf` | Exportar PDF | — | ⚠️ `notifyTodo` |
| `file.import` | Importar | Ctrl+I | ✅ `fileInput.click()` |
| `file.document` | Config. documento | — | ✅ `openDocumentSettingsModal` |
| `file.preferences` | Preferências | — | ⚠️ `notifyTodo` |

#### Editar
| ID | Label | Key | Status |
|---|---|---|---|
| `edit.undo` | Desfazer | Ctrl+Z | ✅ `undo()` |
| `edit.redo` | Refazer | Ctrl+Shift+Z | ✅ `redo()` |
| `edit.copy` | Copiar | Ctrl+C | ✅ `execCommand('copy')` |
| `edit.paste` | Colar | Ctrl+V | ✅ `pasteAppClipboard` |
| `edit.pasteInPlace` | Colar no lugar | Ctrl+Shift+V | ✅ `pasteAppClipboard` |
| `edit.cut` | Recortar | Ctrl+X | ✅ copy + `del()` |
| `edit.duplicate` | Duplicar | Ctrl+D | ✅ `duplicate()` |
| `edit.delete` | Apagar | Del | ✅ `del()` |
| `edit.group` | Agrupar | Ctrl+G | ✅ `groupSelection()` |
| `edit.ungroup` | Desagrupar | Ctrl+Shift+G | ✅ `ungroupSelection()` |
| `edit.lock` | Bloquear | — | ⚠️ `notifyTodo` |
| `edit.unlock` | Desbloquear | — | ⚠️ `notifyTodo` |
| `edit.hide` | Ocultar | — | ⚠️ `notifyTodo` |
| `edit.show` | Mostrar | — | ⚠️ `notifyTodo` |

#### Seleção
| ID | Label | Key | Status |
|---|---|---|---|
| `selection.normal` | Seleção normal | — | ✅ `setActiveTool('select')` |
| `selection.direct` | Seleção direta | — | ✅ `setActiveTool('direct-select')` |
| `selection.selectAll` | Selecionar tudo | Ctrl+A | ✅ `selectAllObjects()` |
| `selection.deselectAll` | Desselecionar | Esc | ✅ `discardActiveObject` |
| `selection.byColor` | Selecionar por cor | — | ⚠️ `notifyTodo` |
| `selection.byLayer` | Selecionar por camada | — | ⚠️ `notifyTodo` |
| `selection.similar` | Selecionar semelhantes | — | ⚠️ `notifyTodo` |
| `selection.isolate` | Isolar grupo | — | ⚠️ `notifyTodo` |
| `selection.lasso` | Seleção por laço | — | ⚠️ `notifyTodo` |

#### Criar
| ID | Label | Key | Status |
|---|---|---|---|
| `create.rect` | Quadrado | — | ✅ `addRect()` |
| `create.ellipse` | Elipse | — | ✅ `addCircle()` |
| `create.polygon` | Polígono | — | ⚠️ `notifyTodo` |
| `create.star` | Estrela | — | ⚠️ `notifyTodo` |
| `create.line` | Linha | — | ✅ `addLine()` |
| `create.pen` | Caneta | — | ✅ `addBezier()` |
| `create.pencil` | Lápis | — | ⚠️ `notifyTodo` |
| `create.brush` | Pincel vetorial | — | ⚠️ `notifyTodo` |
| `create.artText` | Texto artístico | — | ✅ `setActiveTool('text')` |
| `create.textBox` | Texto em área | — | ✅ `setActiveTool('text')` |
| `create.textOnPath` | Texto em caminho | — | ⚠️ `notifyTodo` |
| `create.eyedropper` | Conta-gotas | — | ⚠️ `notifyTodo` |
| `create.artboard` | Frame (arrasto) | — | ✅ `btnRect.click()` |

#### Transformar
| ID | Label | Key | Status |
|---|---|---|---|
| `transform.move` | Mover | — | ✅ `setActiveTool('move')` |
| `transform.rotate` | Rotacionar | — | ⚠️ `notifyTodo` |
| `transform.scale` | Escalar | — | ⚠️ `notifyTodo` |
| `transform.distort` | Distorcer | — | ⚠️ `notifyTodo` |
| `transform.skew` | Inclinar | — | ⚠️ `notifyTodo` |
| `transform.flipH` | Espelhar H | — | ✅ `flipSelection('x')` |
| `transform.flipV` | Espelhar V | — | ✅ `flipSelection('y')` |
| `transform.free` | Transf. livre | — | ⚠️ `notifyTodo` |
| `transform.align` | Alinhar | — | ⚠️ `notifyTodo` |
| `transform.distribute` | Distribuir | — | ⚠️ `notifyTodo` |
| `transform.snapGrid` | Ajustar grade | — | ⚠️ `notifyTodo` |
| `transform.snapObjects` | Snap objetos | — | ⚠️ `notifyTodo` |

#### Aparência (todos ⚠️ exceto `appearance.clipMask` ✅)

| ID | Label | Status |
|---|---|---|
| `appearance.clipMask` | Máscara de recorte | ✅ `applyClipMask()` |
| `appearance.fill` | Cor preenchimento | ⚠️ |
| `appearance.stroke` | Cor contorno | ⚠️ |
| `appearance.strokeWidth` | Espessura traço | ⚠️ |
| `appearance.strokeType` | Tipo de traço | ⚠️ |
| `appearance.opacity` | Opacidade | ⚠️ |
| `appearance.blend` | Modos mesclagem | ⚠️ |
| `appearance.gradient` | Gradiente | ⚠️ |
| `appearance.mask` | Máscara | ⚠️ |
| `appearance.effects` | Efeitos | ⚠️ |

#### Organizar
| ID | Label | Status |
|---|---|---|
| `organize.front` | Trazer frente | ✅ `bringForwardSelection()` |
| `organize.back` | Enviar trás | ✅ `sendBackwardSelection()` |
| `organize.byLayer` | Organizar camada | ⚠️ |
| `organize.newLayer` | Criar camada | ✅ `addLayer()` |
| `organize.groupLayer` | Agrupar camada | ✅ `createLayerFolder()` |
| `organize.rename` | Nomear objeto | ⚠️ |

#### Boolean — todos ⚠️ (union, subtract, intersect, exclude, divide, trim)

#### Texto — todos ⚠️ (font, size, lineHeight, kerning, tracking, toCurves, align, case)

#### Exibir
| ID | Label | Key | Status |
|---|---|---|---|
| `view.zoomIn` | Zoom in | Ctrl++ | ✅ |
| `view.zoomOut` | Zoom out | Ctrl+- | ✅ |
| `view.zoom100` | Zoom 100% | Ctrl+1 | ✅ |
| `view.zoom200` | Zoom 200% | Ctrl+2 | ✅ |
| `view.fit` | Ajustar tela | Ctrl+0 | ✅ |
| `view.fitSelection` | Ajustar seleção | — | ⚠️ |
| `view.grid` | Grade | — | ⚠️ |
| `view.guides` | Guias | — | ⚠️ |
| `view.nodes` | Mostrar nós | — | ⚠️ |
| `view.outline` | Outline | — | ⚠️ |
| `view.preview` | Preview | — | ⚠️ |
| `view.rulers` | Régua | — | ✅ `toggleRulers()` |
| `view.rulerUnit` | Unid. régua | — | ✅ `cycleRulerUnit()` |

#### Avançado
| ID | Label | Status |
|---|---|---|
| `advanced.autoLayout` | Auto Layout | ✅ `toggleAutoLayout()` |
| `advanced.components` | Componentes | ⚠️ |
| `advanced.constraints` | Constraints | ⚠️ |
| `advanced.vectorize` | Vetorização | ⚠️ |
| `advanced.expandStroke` | Expandir traço | ⚠️ |
| `advanced.pathfinder` | Pathfinder | ⚠️ |
| `advanced.mesh` | Mesh tool | ⚠️ |
| `advanced.warp` | Warp | ⚠️ |

### 19.2 Floating Toolbar

#### Top Tools
| Botão | ID | Handler | Status |
|---|---|---|---|
| Vetor | `btnToolVector` | startBezier ou select | ✅ |
| Mover | `btnToolMove` | `setActiveTool('move')` | ✅ |
| Laço | `btnToolLasso` | placeholder | ⚠️ |
| Pintar | `btnToolPaint` | placeholder | ⚠️ |
| Curvar | `btnToolCurve` | `setActiveTool('direct-select')` | ✅ |
| Cortar | `btnToolCut` | `applyClipMask()` | ✅ |
| Auto Layout | `btnToolAutoLayout` | `toggleAutoLayout()` | ✅ |
| Mais ▾ | `btnToolMore` | placeholder | ⚠️ |
| Régua | `btnRulerToggle` | `toggleRulers()` | ✅ |

#### Fixed Tools
| Botão | ID | Handler | Status |
|---|---|---|---|
| Selecionar ↖ | `btnSelect` | toggle submenu / select | ✅ |
| └ Seleção | `btnSelectNormal` | `setActiveTool('select')` | ✅ |
| └ Seleção direta | `btnSelectDirect` | `setActiveTool('direct-select')` | ✅ |
| Frame ▣ | `btnRect` | `setArtboardDrawMode` | ✅ |
| Formas ◻ | `btnShape` | toggle submenu | ✅ |
| └ Quadrado | `btnShapeRect` | `addRect()` | ✅ |
| └ Círculo | `btnShapeCircle` | `addCircle()` | ✅ |
| Linha ／ | `btnLine` | `addBezierV2()` | ✅ |
| Bezier ∿ | `btnBezier` | `addBezier()` | ✅ |
| Texto T | `btnTextTool` | `setActiveTool('text')` | ✅ |
| Upload | `btnUpload` | `fileInput.click()` | ✅ |
| Ajuda ? | `btnHelp` | modal de atalhos | ✅ |

### 19.3 Context Menu (9 itens)
Todos ✅: Copiar, Colar, Colar no lugar, Agrupar, Desagrupar, Trazer frente, Enviar trás, Duplicar, Excluir.

### 19.4 Engine Bezier (V1 + V2)

`ENABLE_BEZIER_V2 = true` (linha 1628). Editor vetorial completo com:

| Funcionalidade | Status | Detalhe |
|---|---|---|
| Criação de pontos | ✅ | Clique = canto, arraste = alças |
| Arrasto de alças | ✅ | Shift trava 15°, Alt quebra acoplamento |
| Tipos de nó | ✅ | corner / smooth / mirrored |
| Acoplamento de alças | ✅ | smooth preserva comprimento, mirrored espelha |
| Inserir segmento | ✅ | Subdivisão de Casteljau no midpoint |
| Remover ponto | ✅ | Mínimo 3 (fechado) / 2 (aberto) |
| Controles visuais | ✅ | Círculos + linhas de ligação |
| Frame de seleção | ✅ | Rect tracejado em paths fechados |
| Painel de nós | ✅ | Canto / Suave / Espelhado + Quebrar alças |
| Shape → Path | ✅ | Rect/Circle viram Path editável |
| Modelo V2 | ✅ | Anti-duplo-clique, debounce mais agressivo |
| Inverter direção | ✅ | `reverseBezierDirection()` |
| Converter em retas | ✅ | `convertBezierToLine()` |
| Finalização | ✅ | Enter finaliza, Esc cancela, Ctrl+Z desfaz ponto |

**Gaps vs Figma/Paper.js:** edição multi-segmento contínua, curve fitting de raster, operações booleanas em path, normalização de SVG path import, simplificação (Ramer-Douglas-Peucker), widget de canto arredondado, offscreen culling.

### 19.5 Sumário de Implementação

| Categoria | Total | ✅ | ⚠️ | % |
|---|---|---|---|---|
| Menu Arquivo | 12 | 9 | 3 | 75% |
| Menu Editar | 14 | 10 | 4 | 71% |
| Menu Seleção | 9 | 4 | 5 | 44% |
| Menu Criar | 13 | 7 | 6 | 54% |
| Menu Transformar | 12 | 4 | 8 | 33% |
| Menu Aparência | 10 | 1 | 9 | 10% |
| Menu Organizar | 6 | 4 | 2 | 67% |
| Menu Boolean | 6 | 0 | 6 | 0% |
| Menu Texto | 8 | 0 | 8 | 0% |
| Menu Exibir | 13 | 7 | 6 | 54% |
| Menu Avançado | 8 | 1 | 7 | 13% |
| Toolbar Top | 9 | 6 | 3 | 67% |
| Toolbar Fixed | 12 | 12 | 0 | 100% |
| Context Menu | 9 | 9 | 0 | 100% |
| **Total** | **141** | **74** | **67** | **52%** |
