-- --------------------------------------------------------
-- SCRIPT DE CRIAÇÃO DO BANCO 'escola_divertida'
-- --------------------------------------------------------

-- 1. CRIAÇÃO DO BANCO
-- (DROP DATABASE IF EXISTS... é opcional, mas útil para testes)
DROP DATABASE IF EXISTS escola_divertida;
CREATE DATABASE IF NOT EXISTS escola_divertida;
USE escola_divertida;

-- 2. CRIAÇÃO DO USUÁRIO E PERMISSÕES
-- (O '@'localhost' restringe o acesso à máquina local por segurança)
CREATE USER IF NOT EXISTS 'aluno_web'@'localhost' IDENTIFIED BY 'SenhaAluno@2025';
GRANT ALL PRIVILEGES ON escola_divertida.* TO 'aluno_web'@'localhost';
FLUSH PRIVILEGES;

-- --------------------------------------------------------
-- CRIAÇÃO DAS TABELAS
-- --------------------------------------------------------

-- Tabela 'alunos' (Usuários principais do tipo aluno)
CREATE TABLE alunos (
  id_aluno INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  idade INT NOT NULL,
  turma VARCHAR(10) NOT NULL,
  descricao TEXT NULL,
  avatar VARCHAR(255) NULL,
  -- Colunas de autenticação
  usuario VARCHAR(50) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL
);

-- Tabela 'professores' (Usuários administrativos)
CREATE TABLE professores (
  id_professor INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  -- Colunas de autenticação
  usuario VARCHAR(50) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  -- Coluna de permissão de Admin
  is_admin BOOLEAN DEFAULT FALSE
);

-- Tabela 'jogos' (Catálogo de jogos)
CREATE TABLE jogos (
  id_jogo INT AUTO_INCREMENT PRIMARY KEY,
  nome_jogo VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE
);

-- Tabela 'perguntas' (Conteúdo dos jogos)
CREATE TABLE perguntas (
  id_pergunta INT AUTO_INCREMENT PRIMARY KEY,
  id_jogo INT NOT NULL,
  enunciado TEXT NOT NULL,
  alternativa_a VARCHAR(255) NULL,
  alternativa_b VARCHAR(255) NULL,
  alternativa_c VARCHAR(255) NULL,
  alternativa_d VARCHAR(255) NULL,
  resposta_correta CHAR(1) NOT NULL,
  FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo) 
    ON DELETE CASCADE -- Se um jogo for deletado, suas perguntas também são.
);

-- Tabela 'pontuacoes' (Relaciona alunos e jogos, registra o progresso)
CREATE TABLE pontuacoes (
  id_pontuacao INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno INT NOT NULL,
  id_jogo INT NOT NULL,
  pontos INT DEFAULT 0,
  data_partida DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) 
    ON DELETE CASCADE, -- Se um aluno for deletado, suas pontuações também são.
  FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo) 
    ON DELETE CASCADE
);