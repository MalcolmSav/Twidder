import sqlite3
with open('schema.sql') as fp:
    connection = sqlite3.connect("database.db")
    cur = connection.cursor()
    cur.executescript(fp.read())