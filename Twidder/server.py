
from flask import Flask, request, jsonify
import database_helper, json, secrets
from flask_socketio import SocketIO
import time, re

app = Flask(__name__)

socket = SocketIO(app)
current_sockets = dict()

@socket.on("saveSocket")
def validate_socket(data):
    email = database_helper.email_by_token(data['token'])
    if email is not None:
        current_sockets[email] = request.sid
    print("Socket added")

@socket.on('disconnect')
def test_disconnect():
    print('disconnected') 

@socket.on("connect")
def connect():
    print("connected")


@app.route('/')
def root():
    return app.send_static_file("client.html"), 200

@app.route("/sign_in", methods = ['POST'])
def login():    
    data = request.get_json()
    email = data['email']
    if database_helper.get_login(email, data['password']):
        token = secrets.token_hex(16)
        success = False
        if email in current_sockets:
            socket.emit("logout", to=current_sockets[email])
            success = database_helper.update_loggedInUser(email, token)
        else:
            success = database_helper.create_loggedInUser(email, token)
        if success:
            return jsonify({"data" :   token}), 201
        else:
            return jsonify({"message" : "Something went wrong when trying to sign in"}), 500
    
    return jsonify({"message" : "Wrong email or password"}), 401
    
@app.route('/sign_up', methods = ['POST'])
def sign_up():
    data = request.get_json()
    if validate_inputs(data):
        if validate_password(data):
            if re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
                resp = database_helper.create_user(data['email'], data['password'], data['firstname'], data['familyname'], data['gender'], data['city'], data['country'])
                if resp:
                    return jsonify({"message" : "Successfully signed up"}), 201
                else:
                    return jsonify({"message" : "user"}), 500
            else:
                return jsonify({"message" : "email"}), 401
        else:
            return jsonify({"message" : "password"}), 401
    else:
        return jsonify({"message" : "fields"}), 401
   
        

@app.route('/sign_out', methods = ['POST'])
def sign_out():
    token = request.headers["Authorization"]
    email = database_helper.email_by_token(token)
    success = database_helper.delete_loggedInUser(token)
    if (success):
        print("disconnecting...")
        if email in current_sockets:
            del current_sockets[email]
        print("Client ", email, " disconnected")
        return jsonify({"message" : "SIGNED OUT"}), 201
    else:
        return jsonify({"message" : "Something went wrong when trying to sign out"}), 400


@app.route('/change_password', methods = ['PUT'])
def update_password():
    data = request.get_json()
    token = request.headers["Authorization"]
    email = database_helper.email_by_token(token)
    if(database_helper.get_login(email, data["oldPassword"])):
        success = database_helper.update_password(email, data["newPassword"])
        if(success):
            return jsonify({"message" :"changed"}), 201
        else:   
            return jsonify({"message" :"couldnt change"}), 500
    else:
        return jsonify({"message" :"wrong"}), 401

@app.route('/get_user_data_by_token', methods = ['GET'])
def get_user_data_by_token():
    token = request.headers["Authorization"]
    user_data = database_helper.get_user_data_by_token(token)
    if user_data is not None:
        result = {
                "email" : user_data[0],
                "firstname" : user_data[2],
                "familyname" : user_data[3],
                "gender" : user_data[4],
                "city" : user_data[5],
                "country" : user_data[6]
                }
        return jsonify({"data" :result}), 200
    else:
        email = database_helper.email_by_token(token)
        if email in current_sockets:
            socket.emit("logout", to=current_sockets[email])
        return jsonify({"message" : "No data by token found"}), 404
    
@app.route('/get_user_data_by_email/<email>', methods = ['GET'])
def get_user_data_by_email(email):
    token = request.headers["Authorization"]
    
    if database_helper.is_logged_in(token):
        if database_helper.get_user(email) is not None:
            user_data = database_helper.get_user_data_by_email(email)
            if user_data is not None:
                result = {
                "email" : user_data[0],
                "firstname" : user_data[2],
                "familyname" : user_data[3],
                "gender" : user_data[4],
                "city" : user_data[5],
                "country" : user_data[6]
                }
                return jsonify({"data" :result}), 200
            else:   
                return jsonify({"message" :"database"}), 500
        else:
            return jsonify({"message" :"user"}), 404
    else:
        return jsonify({"message" :"Not logged in"}), 401
    
@app.route('/get_user_messages_by_token', methods = ['GET'])
def get_user_messages_by_token():
    token = request.headers["Authorization"]
    messages = database_helper.get_user_messages_by_token(token)
    if messages is not None:
        result = []
        for message in messages:
            result.append ({
                "message" : message[0],
                "sender" : message[1],
                "reciever" : message[2]
            })
        return jsonify({"messages" :result[::-1]}), 200
    else:
        return jsonify({"message" :"NO messages found"}), 404
    
@app.route('/get_user_messages_by_email/<email>', methods = ['GET'])
def get_user_messages_by_email(email):
    token = request.headers["Authorization"]
    if database_helper.is_logged_in(token):
        if database_helper.get_user(email):
            messages = database_helper.get_user_messages_by_email(email)
            if messages is not None:
                result = []
                for message in messages:
                    result.append ({
                        "message" : message[0],
                        "sender" : message[1],
                        "reciever" : message[2]
                    })
                return jsonify({"messages" : result[::-1]}), 200
            else:
                return jsonify({"message" :"Something went wrong"}), 500
        else:
            return jsonify({"message" :"No user found"}), 404
    else:
        return jsonify({"message" :"Not logged in"}), 401

    
@app.route('/post_message', methods = ['POST'])
def post_message():
    data = request.get_json()
    token = request.headers["Authorization"]
    success = database_helper.create_message(token, data['message'], data['email'])
    if success:
        return jsonify({"message" :"Message posted"}), 201
    else:
        return jsonify({"message" :"Message did not post correctly"}), 500

@app.route("/tables", methods = ['GET'])
def get_tables():
    data = database_helper.get_tables()
    return data, 201

def validate_inputs(data):
    if(len(data) == 7):
        for input in data:
            if len(data[input]) == 0:
                return False
        return True
    return False

def validate_password(data):
    if(len(data['password']) > 5):
        return True
    return False

if __name__ == '__main__':
    socket.run(app)
