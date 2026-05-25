# Estrutura Paramétrica para Identidade Visual

## Atualização do Sistema Atual

---

# Contexto

Este documento descreve uma possível evolução estrutural para o sistema atual de identidade visual.

A proposta não consiste na criação de um editor vetorial do zero.

O sistema já existe, já possui funcionamento próprio e já trabalha com manipulação visual e estrutural de elementos gráficos.

O objetivo desta atualização é adicionar uma nova camada de interpretação estrutural sobre marcas já existentes.

---

# Ideia Central

A proposta consiste em transformar marcas vetoriais existentes em sistemas estruturais parametrizados.

Em vez de desenhar uma marca dentro da plataforma, o usuário envia uma marca previamente criada em outros softwares.

Exemplo:

- SVG do logotipo
- SVG do símbolo
- SVG completo da marca

A partir disso, a plataforma passa a interpretar geometricamente os elementos da identidade visual.

---

# Mudança de Paradigma

A plataforma deixa de funcionar apenas como:

```text
editor vetorial
```

E passa a atuar como:

```text
sistema de engenharia estrutural para identidades visuais
```

A marca continua sendo criada por designers externos.

O sistema atua sobre:

- análise estrutural
- modularidade
- documentação técnica
- grids construtivos
- parametrização
- alinhamentos
- relações geométricas
- áreas de proteção

---

# Fluxo Proposto

A atualização proposta introduz uma nova etapa inicial de estruturação da marca.

O objetivo dessa primeira experiência é fazer com que o sistema compreenda a composição estrutural da identidade antes da construção modular.

---

# Primeira Tela — Novo Projeto

Ao criar um novo projeto, o sistema abre inicialmente um modal de configuração estrutural.

Esse modal funciona como uma etapa de leitura semântica da marca.

O usuário informa quais elementos compõem a identidade visual.

---

# Objetivo do Modal Inicial

O modal não serve apenas para upload.

Ele define:

- estrutura da marca
- tipos de elementos
- composição visual
- origem dos módulos estruturais
- comportamento inicial do projeto

---

# Estruturas Possíveis

## Logotipo tipográfico

Marca composta apenas por tipografia.

---

## Símbolo isolado

Marca composta apenas por símbolo.

---

## Tipografia + símbolo

Estrutura clássica contendo:

- lettering
- símbolo
- composição combinada

---

# Coleta Inicial de Arquivos

Após definir a estrutura:

O sistema solicita os SVGs correspondentes.

Exemplo:

```text
Tipografia → upload SVG
Símbolo → upload SVG
```

---

# Inicialização do Projeto

Após o upload:

O projeto é aberto automaticamente em uma área estrutural delimitada.

Essa área já considera:

- composição da marca
- alinhamentos iniciais
- posicionamento dos elementos
- segmentação estrutural

---

# Primeira Ação Obrigatória

A primeira ação do usuário dentro do projeto é definir o módulo estrutural principal.

Inicialmente, esse módulo será tratado como:

```text
altura de X
```

Mesmo que tecnicamente possa representar outras proporções.

---

# Definição Visual da Altura de X

Os elementos enviados aparecem no canvas.

O usuário seleciona visualmente qual região representa a altura estrutural principal.

Essa seleção pode vir:

- da tipografia
- do símbolo
- de um detalhe específico
- de qualquer área relevante da composição

---

# Interface de Seleção

O usuário:

- clica
- arrasta
- cria uma seleção quadrada

A área marcada se torna:

```text
1x
```

---

# Processamento Automático

Após a marcação:

O sistema processa automaticamente:

- dimensão do módulo
- subdivisões
- grid estrutural
- overlays
- alinhamentos
- área modular

---

# Resultado Visual

Após o processamento:

A interface passa a exibir:

- grid baseado no módulo selecionado
- delimitações estruturais
- blocos proporcionais
- linhas de construção
- unidade principal destacada

---

# Representação Visual do Módulo

O sistema exibe visualmente qual elemento originou o módulo.

Exemplo:

- preview da letra selecionada
- destaque da área marcada
- miniatura estrutural
- identificação visual do “1x”

Isso ajuda o usuário a entender:

```text
qual elemento está controlando toda a estrutura modular
```

---

# Objetivo dessa Primeira Etapa

Essa primeira experiência possui três objetivos principais:

- estruturar semanticamente a marca
- definir a unidade modular principal
- transformar o SVG em uma estrutura interpretável

---

# Consequência Estrutural

Após essa etapa:

Toda a plataforma passa a operar baseada no módulo selecionado.

Isso inclui:

- grids
- espaçamentos
- áreas de proteção
- alinhamentos
- futuras documentações
