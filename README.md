# GoBrand 🎨

Editor visual de identidade de marca baseado em web.

## 🚀 Funcionalidades

- ✏️ Editor de logos e elementos SVG
- 🎨 Gestão de paleta de cores e tipografia
- 💾 Auto-save com backup em localStorage
- 🛡️ Segurança para postMessage e sanitização de SVG

## 📁 Estrutura

```text
GoBrand/
├── core/           # Motor (security, storage, errors)
├── utils/          # Funções utilitárias
├── docs/           # Documentação técnica
├── index.html      # Entry point
├── script.js       # Lógica principal
└── styles.css      # Estilos
```

## 🗺️ Fluxo de navegação

- Veja o mapeamento atualizado em `docs/fluxo-navegacao-gobrand.md`.

## 🔒 Segurança

- Validação de origem/source para mensagens entre iframe e app
- Sanitização básica de SVG (remoção de script/handlers)
- Tratamento global de erros com logging centralizado

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`feat/minha-feature`)
3. Commit suas mudanças
4. Push para o repositório remoto
5. Abra um Pull Request
