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
    About varchar (244),
    CONSTRAINT fk_user_profile
    FOREIGN KEY (id_user)
    REFERENCES Users (id_user)
);






