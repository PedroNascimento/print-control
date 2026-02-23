# 🏗 1️⃣ ARQUITETURA CLEAN ARCHITECTURE – PRINTCONTROL

## 🎯 Princípios adotados

* Clean Architecture (Robert C. Martin)
* SOLID
* Domain-Driven Design (DDD Lite)
* Repository Pattern
* Use Case Pattern
* Dependency Inversion
* Independência de Framework
* Independência de Banco
* Independência de UI

---

## 📐 Estrutura Conceitual

```
┌──────────────────────────────────────────────┐
│               Presentation                   │
│ (Next.js, Controllers, HTTP, UI, Middleware)│
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│              Application Layer               │
│            (Use Cases / DTOs)                │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│                 Domain Layer                 │
│   (Entities, Value Objects, Interfaces)      │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│             Infrastructure Layer             │
│ (Prisma, PostgreSQL, JWT, External Services) │
└──────────────────────────────────────────────┘
```

Regra fundamental:

➡ Camadas internas NÃO conhecem camadas externas
➡ Domínio não depende de framework
➡ Infraestrutura depende do domínio
➡ Inversão de dependência obrigatória

---

# 📁 Estrutura de Pastas Definitiva

```
/src
  /domain
    /entities
      User.ts
      Revenue.ts
      Expense.ts
      Investment.ts
    /value-objects
      Money.ts
      DateRange.ts
    /repositories
      IUserRepository.ts
      IRevenueRepository.ts
      IExpenseRepository.ts
      IInvestmentRepository.ts

  /application
    /use-cases
      /auth
        LoginUseCase.ts
      /revenue
        CreateRevenueUseCase.ts
        ListRevenuesByPeriodUseCase.ts
      /expense
        CreateExpenseUseCase.ts
      /investment
        CreateInvestmentUseCase.ts
      /dashboard
        GenerateDashboardUseCase.ts
      /cashflow
        GenerateCashFlowUseCase.ts
    /dtos
    /interfaces

  /infrastructure
    /database
      prisma.schema
      PrismaClient.ts
    /repositories
      PrismaUserRepository.ts
      PrismaRevenueRepository.ts
      PrismaExpenseRepository.ts
      PrismaInvestmentRepository.ts
    /auth
      JwtService.ts
    /config

  /presentation
    /controllers
      AuthController.ts
      RevenueController.ts
      ExpenseController.ts
      DashboardController.ts
    /middlewares
      AuthMiddleware.ts
    /routes
    /http

  /main
    server.ts
    container.ts (injeção de dependência)
```

---

# 🧠 Regras Arquiteturais Obrigatórias

### ✔ Domain

* Não pode importar Prisma
* Não pode importar Next
* Não pode importar JWT
* Apenas regras puras

### ✔ Application

* Orquestra casos de uso
* Depende apenas de interfaces do domínio

### ✔ Infrastructure

* Implementa interfaces
* Contém Prisma, JWT, banco

### ✔ Presentation

* Apenas entrada e saída de dados
* Converte HTTP ↔ DTO

---

# 💰 MODELAGEM DO DOMÍNIO

## Entidades

### User

* id
* name
* email
* passwordHash

### Revenue

* id
* description
* value (Money)
* date
* type (OWN | OUTSOURCED)
* expenseReferenceId (opcional)

### Expense

* id
* description
* value (Money)
* date
* category
* type (OPERATIONAL | OUTSOURCED)

### Investment

* id
* description
* value (Money)
* date
* type

---

## Value Objects

### Money

* amount
* currency
* métodos:

  * add()
  * subtract()
  * multiply()
  * isNegative()

Nunca usar number diretamente no domínio.