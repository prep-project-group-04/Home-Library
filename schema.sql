
CREATE TABLE  Users (
  id SERIAL NOT NULL ,
    PRIMARY KEY (id),
    fullName  VARCHAR(255),
    Email VARCHAR(255),
    password VARCHAR(255)
);
CREATE TABLE Comment (
    user_id int(255),
    Home_id int(255),
    PRIMARY KEY (user_id, Home_id),
    comment VARCHAR(255)
)

