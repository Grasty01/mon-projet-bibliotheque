/* Création de la base de données nommée : library_db */
CREATE DATABASE library_db
WITH
    OWNER = postgres ENCODING = 'UTF8' LOCALE_PROVIDER = 'libc' CONNECTION
LIMIT = -1 IS_TEMPLATE = False;

/* Création de la table authors */
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    author_name VARCHAR(55) NOT NULL,
    author_nationality VARCHAR(100)
);

/* Création de la table Books */
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    book_title VARCHAR(100) NOT NULL,
    author_id INTEGER NOT NULL REFERENCES authors (author_id) ON DELETE CASCADE,
    book_year_of_publication SMALLINT NOT NULL,
    book_availability_status BOOLEAN NOT NULL
);

/* Création de la table members */
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    member_firstname VARCHAR(100) NOT NULL,
    member_lastname VARCHAR(100) NOT NULL,
    member_email VARCHAR(100) NOT NULL,
    member_address VARCHAR(100),
    member_contact INTEGER NOT NULL
);

/* Création de la table loans (emprunts) */
CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members (member_id),
    book_id INTEGER NOT NULL REFERENCES books (book_id),
    loan_estimated_return_date DATE NOT NULL,
    is_returned BOOLEAN NOT NULL
);