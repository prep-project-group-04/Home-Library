
CREATE TABLE  Users (
  id SERIAL NOT NULL PRIMARY KEY,
    fullName VARCHAR(255),
    Email VARCHAR(255),
    password VARCHAR(255)
);
CREATE TABLE Comment (
    user_id int,
    Home_id int,
    PRIMARY KEY (user_id, Home_id),
    address VARCHAR(255),
    status VARCHAR(255),
    price VARCHAR(255),
    beds VARCHAR(255),
    baths VARCHAR(255),
    photo VARCHAR(500),
    comment VARCHAR(255)
);


CREATE TABLE  News (
  id SERIAL NOT NULL ,
    PRIMARY KEY (id),
    Email VARCHAR(255)
);