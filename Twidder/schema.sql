CREATE TABLE IF NOT EXISTS users
(
    email varchar(120),
    password varchar(120),
    firstname varchar(50),
    familyname varchar(50),
    gender varchar(10),
    city varchar(50),
    country varchar(70),
    PRIMARY KEY(email)
);

CREATE TABLE IF NOT EXISTS messages
(
    message varchar(255),
    sender varchar(120),
    user varchar(120),
    FOREIGN KEY (user) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS loggedInUsers
(
    email varchar(120),
    token varchar(50),
    PRIMARY KEY (email),
    FOREIGN KEY (email) REFERENCES users(email)
);