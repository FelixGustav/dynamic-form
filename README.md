# Dynamic Form

Projeto de formulário dinâmico feito com Next.js e React.

## Funcionalidades

- Criação de formulários personalizados
- Adição e edição de perguntas dinâmicas
- Validação de campos obrigatórios
- Interface moderna e responsiva

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio/dynamic-forms
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

   ou

   ```bash
   yarn
   ```

## Rodando o projeto

```bash
npm run dev
```

ou

```bash
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura principal

- `app/create/page.tsx`: Página para criar novo formulário
- `components/form-builder.tsx`: Componente principal do construtor de formulários
- `components/question-editor.tsx`: Editor de perguntas
- `lib/database.ts`: Simulação de banco de dados local
- `lib/validations.ts`: Validações com Zod

## Como usar

1. Clique em "Novo formulário" na página inicial.
2. Preencha o título e a descrição.
3. Adicione perguntas e opções conforme necessário.
4. Clique em "Salvar" para registrar o formulário.

## Requisitos

- Node.js >= 18
- npm ou yarn

## Observações

Este projeto é apenas para fins de estudo e demonstração. Não utiliza banco de dados real.

---

Se tiver dúvidas, abra uma issue ou