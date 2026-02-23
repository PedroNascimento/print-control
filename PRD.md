# 📘 PRD – Sistema de Controle Financeiro para Gráfica Caseira

## 🧩 1. Visão Geral do Produto

### 📌 Nome provisório:

**PrintControl**

### 🎯 Objetivo

Desenvolver um sistema web simples e objetivo para controle financeiro de uma gráfica caseira, permitindo:

* Controle de faturamento
* Controle de despesas fixas e variáveis
* Registro de investimentos iniciais
* Controle de terceirizações
* Visualização de fluxo de caixa
* Relatórios financeiros (diário, semanal, mensal e anual)
* Dashboard com indicadores financeiros principais

O sistema deve ser simples, rápido e focado exclusivamente na gestão financeira.

---

## 👤 2. Usuário do Sistema

* Proprietário da gráfica (uso individual)
* Acesso via login e senha
* Sem necessidade de múltiplos usuários (MVP)

---

# 💰 3. Requisitos Funcionais

## 3.1 Autenticação

* Login com e-mail e senha
* Logout
* Recuperação de senha (opcional para MVP)

---

## 3.2 Cadastro de Investimento Inicial

Permitir registrar investimentos realizados desde o início da gráfica.

### Campos:

* Tipo (Equipamento, Estrutura, Outro)
* Descrição
* Valor
* Data
* Observação (opcional)

### Regra:

* O sistema deve somar automaticamente o total investido.
* Deve ser possível visualizar o total acumulado investido desde o início.

---

## 3.3 Cadastro de Despesas

### Tipos de despesas:

* Insumos (papel, tinta, etc.)
* Manutenção
* Energia
* Terceirização
* Outros

### Campos:

* Data
* Categoria
* Descrição
* Valor
* Forma de pagamento (opcional)
* Observação (opcional)

---

## 3.4 Registro de Serviços (Faturamento)

Sempre que um serviço gráfico for realizado:

### Campos:

* Data
* Cliente (opcional no MVP)
* Descrição do serviço
* Valor cobrado
* Custo associado (opcional)
* Tipo:

  * Produção própria
  * Serviço terceirizado

### Regra:

* Caso seja terceirizado, deve permitir vincular a despesa correspondente.
* O sistema deve calcular automaticamente:

  * Receita total
  * Lucro bruto
  * Lucro líquido

---

## 3.5 Fluxo de Caixa

O sistema deve gerar automaticamente o fluxo de caixa diário:

### Cálculos:

* Total de entradas (faturamento)
* Total de saídas (despesas)
* Saldo do dia
* Saldo acumulado

---

# 📊 4. Dashboard

O dashboard deve apresentar:

### Indicadores principais:

* 💰 Faturamento do mês
* 📉 Despesas do mês
* 📈 Lucro líquido do mês
* 🧾 Total investido desde o início
* 📆 Faturamento do dia
* 💸 Despesas do dia
* 📊 Saldo atual

### Gráficos:

* Receita vs Despesa (mensal)
* Evolução do faturamento
* Distribuição por categoria de despesa

---

# 📑 5. Relatórios

O sistema deve permitir gerar relatórios:

* Diário
* Semanal
* Mensal
* Anual
* Personalizado por período

Cada relatório deve exibir:

* Receita total
* Despesas totais
* Lucro líquido
* Lista detalhada das movimentações

Exportação (MVP opcional):

* PDF
* Excel

---

# 🧮 6. Regras de Negócio

1. Lucro líquido = Receita - Despesas
2. Investimentos não entram como despesa operacional
3. Despesas de terceirização reduzem o lucro do serviço
4. O saldo acumulado deve considerar:

   * Receita total
   * Despesas operacionais
   * Não descontar investimento inicial do fluxo operacional

---

# 🏗 7. Estrutura de Dados (Modelagem Inicial)

## Usuário

* id
* nome
* email
* senha_hash

## Investimento

* id
* tipo
* descricao
* valor
* data
* user_id

## Despesa

* id
* data
* categoria
* descricao
* valor
* tipo (operacional | terceirizacao)
* user_id

## Receita (Serviço)

* id
* data
* descricao
* valor
* tipo (proprio | terceirizado)
* despesa_terceirizacao_id (opcional)
* user_id

---

# 🧠 8. Requisitos Não Funcionais

* Interface simples e limpa
* Responsivo (funcionar no celular)
* Sistema leve
* Baixo custo de hospedagem
* Backup automático do banco

---

# 🚀 9. Tecnologias Recomendadas

Como você já trabalha com desenvolvimento de sistemas, vou sugerir uma stack moderna, simples e econômica:

---

## 🔹 Opção Recomendada (Simples e Escalável)

### Backend:

* **Node.js**
* **NestJS** ou **Express**
* ORM: **Prisma**

### Frontend:

* **Next.js**
* **Tailwind CSS**
* Biblioteca de gráficos: **Recharts**

### Banco de Dados:

* **PostgreSQL**

### Autenticação:

* JWT
* Bcrypt para hash de senha

### Deploy:

* Frontend: Vercel
* Backend: Railway / Render
* Banco: Supabase ou Neon

---

## 🔹 Opção Ultra Simples (Mais Rápida de Construir)

### Stack:

* Next.js Fullstack
* Prisma
* PostgreSQL
* Deploy na Vercel

---

# 📦 10. Roadmap de Desenvolvimento

### Fase 1 – MVP

* Login
* Cadastro de receita
* Cadastro de despesa
* Cadastro de investimento
* Dashboard básico
* Relatório mensal

### Fase 2

* Filtros avançados
* Exportação PDF
* Gráficos avançados
* Controle de clientes

### Fase 3

* Controle de estoque de insumos
* Cálculo automático de custo por serviço
* Margem de lucro por produto

---

# 🎯 11. Métricas de Sucesso

* Visão clara do lucro mensal
* Controle total do investimento inicial
* Tomada de decisão baseada em dados
* Identificação de serviços mais lucrativos

---

# 🏁 Conclusão

O sistema será um **ERP financeiro simplificado para gráfica caseira**, com foco em:

✔ Controle
✔ Clareza
✔ Simplicidade
✔ Tomada de decisão
