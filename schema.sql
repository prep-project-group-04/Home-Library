
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
    comment VARCHAR(255)
);

CREATE TABLE  News (
  id SERIAL NOT NULL ,
    PRIMARY KEY (id),
    Email VARCHAR(255)
);