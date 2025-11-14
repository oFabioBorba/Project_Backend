CREATE TABLE Users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hash_password VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE User_Profile (
    id_profile SERIAL PRIMARY KEY,
    id_user INT NOT NULL UNIQUE, 
    neighbourhood VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    CEP VARCHAR(8) NOT NULL,
    UF varchar(2) NOT NULL,
    profile_photo BYTEA NOT NULL,
    About varchar (244),
    feedback decimal(2,1) default 0,
    feedback_count INT default 0,
    CONSTRAINT fk_user_profile
    FOREIGN KEY (id_user)
    REFERENCES Users (id_user)
);


CREATE TABLE categories (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
('🏠 Serviços Domésticos'),       -- faxina, diarista, encanador, eletricista
('📚 Aulas e Reforço'),           -- reforço escolar, idiomas, cursos
('💪 Saúde e Bem-estar'),         -- personal, fisioterapia, massagem
('💇‍♀️ Beleza e Cuidados Pessoais'),-- manicure, cabeleireiro, estética
('🚗 Serviços Automotivos'),      -- mecânico, lava-jato, funilaria
('💻 Tecnologia e Informática'),  -- manutenção de PCs, suporte técnico
('🎉 Eventos e Festas'),          -- DJ, fotógrafo, buffet, decoração
('🐶 Serviços para Pets'),        -- banho e tosa, adestrador, pet sitter
('🏗️ Construção e Reparos'),      -- pedreiro, marceneiro, pintor
('🚚 Entrega e Mudanças'),        -- motoboy, carreto, fretes
('⚖️ Consultoria e Jurídico');    -- contador, advogado, consultor

CREATE TABLE advertisement (
    id_advertisement SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_category INT NOT NULL,
    photo BYTEA,
    photo2 BYTEA,   
    photo3 BYTEA,
    photo4 BYTEA,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_advertisement_user FOREIGN KEY (id_user) REFERENCES Users (id_user),
    CONSTRAINT fk_aadvertisement_categoria FOREIGN KEY (id_category) REFERENCES categories (id_category)
);

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_one_id INT REFERENCES Users(id_user) ON DELETE CASCADE,
    user_two_id INT REFERENCES Users(id_user) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    rated_user1 boolean DEFAULT false,
    rated_user2 boolean DEFAULT false,
    finished TEXT DEFAULT FALSE,
    UNIQUE (user_one_id, user_two_id) 
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES Users(id_user) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

