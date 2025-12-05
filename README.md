📘 Projeto – Instruções de Execução

Este projeto utiliza React no frontend, Node.js no backend, pg-promise para conexão com o banco e PostgreSQL como banco de dados.
Todos os comandos principais podem ser executados a partir da raiz do projeto.

🛠️ Requisitos

Node.js
npm
PostgreSQL instalado e rodando

🚀 1. Instalação das dependências

Na raiz do projeto:
npm install

Depois instale as dependências específicas:

📂 Frontend
cd frontend
npm install

📂 Backend
cd ../backend
npm install

Após instalar tudo, volte para a raiz:
cd ..

🗄️ 2. Configuração do Banco de Dados

A estrutura completa do banco está no arquivo:
database.sql
(na raiz do projeto)

Execute esse arquivo no PostgreSQL para criar as tabelas e dados iniciais.


O arquivo responsável pela conexão com o banco é:
backend/db.js

As credenciais do banco (host, porta, usuário, senha e nome do banco) já estão escritas diretamente neste arquivo — não existe .env.
Se necessário, edite os valores diretamente dentro dele.

▶️ 3. Executando o Projeto

Depois da instalação das dependências e do banco configurado, execute na raiz do projeto:
npm start

Esse comando inicia tanto o frontend (React) quanto o backend (Node.js) de acordo com os scripts definidos no package.json.

⚙️ Tecnologias Utilizadas

React — frontend
Node.js — backend
pg-promise — conexão com PostgreSQL
PostgreSQL — banco de dados
