# 🖨️ PrintControl — Gestão Financeira Inteligente

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-white?style=for-the-badge&logo=next.js&logoColor=black)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean_Architecture-Success?style=for-the-badge)

**PrintControl** é um Micro-SaaS financeiro completo, desenvolvido com foco em alta performance, código limpo e experiência do usuário (UX/UI). Projetado especificamente para gerenciar o fluxo de caixa, despesas, faturamento e ROI de um negócio focado em impressões e personalização.

[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://printcontrol.vercel.app/)

[Visite o PrintControl](https://printcontrol.vercel.app/)

## ✨ Visão Geral do Projeto

Este projeto foi construído do zero adotando **Clean Architecture**, princípios **SOLID** e **Injeção de Dependências**, garantindo um código altamente testável, manutenível e escalável.

A interface (UI) foi cuidadosamente projetada do desktop ao mobile. Em dispositivos móveis, as tradicionais "tabelas" com rolagem horizontal são algoritmicamente substituídas por **Listas de Cards Responsivos**, oferecendo uma navegação natural e sem quebras de layout.

### 🌟 Funcionalidades Principais

- **📊 Dashboard Interativo e Analytics:** Resumo consolidado do período (Receitas, Despesas, Lucro e Margem/ROI) com gráficos de barras horizontais e de rosca (Recharts).
- **💸 Controle de Entradas e Saídas:** Fluxo de CRUD (Create, Read, Update, Delete) completo para _Receitas_, _Despesas_ e _Investimentos_.
- **🔎 Filtros de Período Inteligentes:** Botões de filtro rápido (7 dias, 30 dias, 90 dias, Mês Atual, Tudo) e sistema de "Custom Date Range", aplicados globalmente.
- **📱 UX Mobile-First:** Conversão inteligente de Data Tables para Mobile Cards. Botões expandidos (100% width) no celular para facilidade de toque (Fat finger design).
- **🔒 Autenticação Robusta:** Sistema de Login e Registro seguro, com senhas hasheadas e controle de sessão via JSON Web Tokens (JWT) armazenados em Cookies HTTP-Only.

---

## 🛠️ Arquitetura e Tecnologias

O repositório é fundamentado em **Clean Architecture** para separar as regras de negócio das ferramentas externas.

- **Frontend:** [Next.js 15 (App Router)](https://nextjs.org/) + React 19.
- **Estilização:** Sistema de Design CSS puro e semântico (CSS Variables, Flexbox, Grid), altamente refatorado, e ícones vetorizados do **Lucide React**.
- **Backend (API):** Next.js Route Handlers servindo como Controllers RESTful.
- **Banco de Dados:** **PostgreSQL** orquestrado através do ORM **Prisma**.
- **Validação:** Tratamento de erros e parsing rígido na borda usando **Zod**.
- **Injeção de Dependências:** Gerenciamento dos Use Cases estritamente injetados através da biblioteca `tsyringe`.
- **Testes Unitários:** Estrutura pronta para `Vitest` isolando totalmente os Domínios e Casos de Uso.

### A Estrutura de Pastas (Clean Architecture)

```text
src/
├── app/                  # (Next.js App Router) Rotas Web, Dashboard, API Endpoints
├── domain/               # O Coração: Entities, Enums, Exceptions, Repository Interfaces
├── application/          # Casos de Uso (Regras de Negócio) e Interfaces (ex: IHashService)
├── infrastructure/       # Implementação Prática: Repos para Prisma, JWT, Bcrypt
├── presentation/         # Controllers: Zod Validators, HTTP Middlewares, Error Handlers
├── lib/                  # Helpers, formatadores monetários e de datas globais
└── main/                 # Setup da Containerização tsyringe (Inversão de Controle)
```

---

## 🚀 Como Rodar Localmente

Certifique-se de ter o **Node.js** e gerador de pacotes (npm/yarn) instalado, além de uma instância do **PostgreSQL** limpa (pode ser via Docker ou provedor online).

### 1. Clone o repositório

```bash
git clone https://github.com/SeuUsuario/print-control.git
cd print-control
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Renomeie o arquivo `.env.example` para `.env` e ajuste suas chaves:

```env
# Exemplo
DATABASE_URL="postgresql://user:password@localhost:5432/print_control?schema=public"
JWT_SECRET="seu-segredo-super-seguro"
```

### 4. Setup do Banco de Dados

Gere os tipos do PrismaClient e suba as migrações para criar as tabelas do projeto:

```bash
npx prisma generate
npx prisma db push
```

### 5. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando. O servidor local fará compilação Fast Refresh automaticamente!

---

👔 **Desenvolvido com foco no estado-da-arte de engenharia web moderna.** Criado para ser um case sólido de arquitetura robusta e profundo zelo pelos detalhes da experiência do usuário (UX).
