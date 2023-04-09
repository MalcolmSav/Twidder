import sqlite3
from flask import g

DATABASE_URI = "database.db"

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def disconnect():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def create_user(email, password, firstname, familyname, gender, city, country):
    try:
        get_db().execute("insert into users values(?, ?, ?, ?, ?, ?, ?);", [email, password, firstname, familyname, gender, city, country])
        get_db().commit()
        return True
    except:
        return False
    
def get_user(email):
    try:
        cursor = get_db().execute("select * from users where email=?;", [email])
        user = cursor.fetchone()
        cursor.close()    
        return user
    except: 
        return None

def get_login(email, password):
    cursor = get_db().execute("select * from users where email=? and password=?;", [email, password])
    user = cursor.fetchone()
    cursor.close()    
    if user is not None:
        return True
    else:
        return False
    
def create_loggedInUser(email, token):  
    try:
        db = get_db()
        db.execute("insert into loggedInUsers values(?, ?);", [email, token])
        db.commit()
        return True
    except:
        return False

def update_loggedInUser(email, token):
    try:
        db = get_db()
        db.execute("update loggedInUsers set token=? where email=?", [token, email ])
        db.commit()
        return True
    except:
        return False


def delete_loggedInUser(token):
    try:
        db = get_db()
        db.execute("delete from loggedInUsers where token=?;", [token])
        db.commit()
        db.close()
        return True
    except:
        return False

def is_logged_in(token):
    email = email_by_token(token)
    if email:
        return True
    else:
        return False

def is_logged_in_email(email):
    try:
        cursor = get_db().execute("select * from loggedInUsers where email=?;", [email])
        result = cursor.fetchall()
        cursor.close() 
        return result
    except:
        return None

def update_password(email, newPassword):
    db = get_db()
    try:
        db.execute("update users set password=? where email=?;", [newPassword, email])
        db.commit()
        return True
    except:
        return False
    
def get_user_data_by_token(token):
    email = email_by_token(token)
    try:
        cursor = get_db().execute("select * from users where email=?;", [email])
        result = cursor.fetchall()
        cursor.close() 
        return result[0]
    except Exception as e:
        print(repr(e))
        return None
    
def get_user_data_by_email(email): 
    try:
        cursor = get_db().execute("select * from users where email=?;", [email])
        result = cursor.fetchone()
        cursor.close() 
        return result
    except:
        return None
    
def get_user_messages_by_token(token):
    email = email_by_token(token)
    try:
        cursor = get_db().execute("select * from messages where user=?;", [email])
        messsages = cursor.fetchall()
        cursor.close() 
        return messsages
    except:
        return None

def get_user_messages_by_email(email):
    try:
        cursor = get_db().execute("select * from messages where user=?;", [email])
        messages = cursor.fetchall()
        cursor.close() 
        return messages
    except:
        return None

def email_by_token(token):
    try:
        cursor = get_db().execute("select email from loggedInUsers where token=?;", [token])
        email = cursor.fetchall()
        cursor.close()
        email = email[0][0]
        return email
    except Exception as e:
        print(repr(e))
        return None
    
def create_message(token, message, email):
    db = get_db()
    user_email = email_by_token(token)
    try:
        db.execute("insert into messages values(?,?,?);", [message, user_email, email])
        db.commit()
        return True
    except:
        return False


def get_tables():
    email = "email"
    cursor = get_db().execute("select * from loggedInUsers;")
    result = cursor.fetchall()
    cursor.close()
    return result


