DROP TABLE IF EXISTS Users;
CREATE TABLE IF NOT EXISTS Users (
  id SERIAL NOT NULL PRIMARY KEY,
    fullName VARCHAR(255),
    Email VARCHAR(255),
    password VARCHAR(255)
);
DROP TABLE IF EXISTS Comment;
CREATE TABLE IF NOT EXISTS Comment (
    user_id int,
    Home_id int,
    PRIMARY KEY (user_id, Home_id)
);

DROP TABLE IF EXISTS News;
CREATE TABLE IF NOT EXISTS News (
  id SERIAL NOT NULL ,
    PRIMARY KEY (id),
    Email VARCHAR(255)
);
DROP TABLE IF EXISTS Crypto;
CREATE TABLE IF NOT EXISTS Crypto (
    id SERIAL NOT NULL ,
    PRIMARY KEY (id),
    code VARCHAR(255)
);