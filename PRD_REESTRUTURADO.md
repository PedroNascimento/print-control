# 📘 2️⃣ PRD REESTRUTURADO PARA CLEAN ARCHITECTURE

---

# PRD – PRINTCONTROL (VERSÃO ARQUITETURAL)

---

## 1. Visão Estratégica

Sistema financeiro para gráfica caseira com arquitetura orientada a domínio, preparada para:

* Evolução para SaaS
* Multi-tenant futuro
* Escalabilidade horizontal
* Testabilidade completa
* Independência de framework

---

## 2. Requisitos Funcionais (Mapeados para Use Cases)

Cada requisito deve virar um Use Case isolado.

---

### 🔐 Autenticação

Use Cases:

* LoginUseCase
* ValidateTokenUseCase

---

### 💰 Investimentos

Use Cases:

* CreateInvestmentUseCase
* GetTotalInvestmentUseCase
* ListInvestmentsByPeriodUseCase

---

### 💸 Despesas

Use Cases:

* CreateExpenseUseCase
* ListExpensesByPeriodUseCase
* GetTotalExpenseUseCase

---

### 🧾 Receitas

Use Cases:

* CreateRevenueUseCase
* LinkRevenueToExpenseUseCase
* CalculateRevenueProfitUseCase
* ListRevenuesByPeriodUseCase

---

### 📊 Dashboard

Use Case:

* GenerateDashboardUseCase

Responsável por:

* Total Revenue
* Total Expense
* Net Profit
* Total Investment
* Daily Balance
* Monthly Aggregation

---

### 📈 Fluxo de Caixa

Use Case:

* GenerateCashFlowUseCase

---

### 📑 Relatórios

Use Case:

* GenerateFinancialReportUseCase

---

## 3. Requisitos Não Funcionais

* Código 100% testável
* Domínio isolado
* Cobertura mínima 70% no domínio
* Banco substituível
* JWT substituível
* Pronto para containerização Docker

---

## 4. Decisões Técnicas

* TypeScript
* Node.js
* PostgreSQL
* Prisma (apenas infraestrutura)
* Next.js apenas na camada de apresentação
* Injeção de dependência manual ou via container (ex: tsyringe)