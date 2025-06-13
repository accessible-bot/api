# AutBot — Chatbot Inclusivo

AutBot é uma ferramenta web com um chatbot acessível e empático, desenvolvido para apoiar pais, cuidadores, professores e profissionais da educação que interagem com pessoas com Transtorno do Espectro Autista (TEA).

---
## 🧠 Sobre o Projeto
- 🔍 Fornece respostas automatizadas com base em **documentos oficiais** (leis, guias, boas práticas).
- ♿ Foco em **acessibilidade cognitiva**: contraste, leitura por voz, navegação por teclado.
- 🛡️ Conformidade com a **LGPD** — tratamento seguro e responsável dos dados pessoais.
---
## 🎯 Objetivos
- Oferecer suporte informativo sobre rotinas, direitos e inclusão de pessoas com TEA.
- Reduzir barreiras digitais com uma interface clara e inclusiva.
- Armazenar histórico de interações por sessão ou conta de usuário.
---
## 🧩 Funcionalidades Principais
- Login e cadastro com autenticação segura
- Recuperação de senha
- Chatbot integrado com base de conhecimento sobre TEA
- Histórico de conversas por usuário
- Interface adaptada para acessibilidade
- Mensagens de erro claras e responsivas
---
## 🛠️ Tecnologias Utilizadas
| Camada | Tecnologia |
|----------------|-------------------------------|
| Frontend | React.js |
| Backend | Node.js + Express |
| IA/Chatbot | LLM (Meta AI — LLAMA) |
| Banco de Dados | PostgreSQL |
| Infraestrutura | Docker |
| Design | Figma |
| Gestão | Jira |
| Versionamento | GitHub |
---
## 📐 Arquitetura do Sistema (resumo)
- Interface web acessível (React)
- API backend com autenticação JWT
- Integração com LLM (via API)
- Base de conhecimento estruturada
- Armazenamento em banco relacional (PostgreSQL)
- Containerização com Docker
---
## 👤 Personas e User Stories
- 👩‍🏫 **Professores**: querem orientações sobre inclusão escolar.
- 👨‍👩‍👧‍👦 **Pais e cuidadores**: desejam entender direitos e criar rotinas.
- 💻 **Usuários em geral**: acessam o sistema em busca de informação segura.
Todas as histórias de usuário estão documentadas com critérios de aceitação e tarefas relacionadas às sprints.
---
## 🖼️ Protótipos e Design
🔗 Protótipos no Figma:
[Ver protótipos do AutBot](https://www.figma.com/design/0nlZssKjrIkx4VJd3RAaeh/Engenharia-de-Sof.-Aces.?node-id=194-1950&t=jeKstmCmjlX3O1Sb-0)
---
## 🔒 LGPD e Consentimento
- Todos os dados são usados exclusivamente para personalização e segurança.
- As interações são armazenadas de forma **segura**.
- O usuário pode interromper o uso a qualquer momento.
---
## 🔑 Variáveis de Ambiente (.env)
Antes de executar o projeto, é necessário preencher as variáveis de ambiente em um arquivo `.env`, que pode ser criado com base no `.env.example` disponível no repositório.
As principais variáveis incluem:
- Chave de API do **OpenRouter**
- Token de acesso do **Hugging Face**
- Configurações do banco de dados PostgreSQL (usuário, senha, host, porta, nome do banco)
> 🔐 As chaves do OpenRouter e do Hugging Face devem ser geradas nas respectivas plataformas:
>
> - [https://openrouter.ai/](https://openrouter.ai/)
> - [https://huggingface.co/](https://huggingface.co/)
---
## 🧪 Como Executar o Projeto (localmente)
### 📦 1. Clonar o repositório
```bash
git clone https://github.com/accessible-bot/accessible-bot.git
cd accessible-bot
```
### 📦 2. Instalar as dependências
```bash
npm install
```
### ⚙️ 3. Configurar variáveis de ambiente
Crie um arquivo `.env` com base no `.env.example` e preencha com suas chaves e credenciais.
### 🗄️ 4. Configurar o Banco de Dados
Você pode rodar o banco de dados PostgreSQL de duas formas:
#### A) Com PostgreSQL local instalado
Configure seu `.env` apontando para seu banco local.
#### B) Utilizando Docker (recomendado)
Execute o comando:
```bash
docker-compose up -d
```
Isso subirá um container com o PostgreSQL pronto para uso conforme as configurações definidas no `docker-compose.yml`.
### 🚀 5. Iniciar o projeto
```bash
npm start
```
A aplicação estará disponível em `http://localhost:3000`.
---

