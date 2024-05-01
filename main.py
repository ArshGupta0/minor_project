from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo

import os
import openai

import pathlib
from flask import Flask, abort, redirect, request, session
import os
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport.requests import Request as google_request
os.environ["OAUTHLIB_INSECURE_TRANSPORT"]= "1"

# Google OAuth client ID
GOOGLE_CLIENT_ID = "960111500840-nikrpnmdk642aj0trodl7l99u0p3rosj.apps.googleusercontent.com"

openai.api_key = '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'

from openai import OpenAI
client = OpenAI()

app = Flask(__name__)
app.secret_key = "CodeSpecialist.com"
# OAuth2 client secrets file path
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret.json")

# Configure the OAuth flow
flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://127.0.0.1:5000/callback"
)

# Decorator to ensure login is required
def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)
        else:
            return function()
    return wrapper

app.config["MONGO_URI"] = "mongodb+srv://arshguptaarsh1101:VRkEEgcJWbpDhrGq@cluster0.2nurcjx.mongodb.net/legal"
mongo = PyMongo(app)

@app.route("/login")
def login():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

# Callback route
@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)
    if not session["state"] == request.args["state"]:
        abort(500)
    
    credentials = flow.credentials

    # Verify the ID token
    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=google_request(),
        audience=GOOGLE_CLIENT_ID
    )
    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    print(id_info.get("name"))
    session["profile_image"] = id_info.get("picture")  # Profile image URL
    return redirect("/protected_area")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/")
def index():
    return render_template("loginpage.html")

@app.route('/protected_area')
@login_is_required
def home():
    chats = mongo.db.chats.find({})
    myChats =[chat for chat in chats]
    print(myChats)
    return render_template("index.html",myChats=myChats)



@app.route('/api', methods=["GET","POST"])
def qa():
    if request.method == "POST":
        print(request.json)
        name= request.json.get("name")
        question= request.json.get("question")
        chat = mongo.db.chats.find_one({"question": question})
        print(chat)
        if chat:
            data= {"result": f"{chat['answer']}"}
            return jsonify(data)
        else:
            
            response = client.completions.create(
            model="gpt-3.5-turbo-instruct",
            prompt=question,
            temperature=1,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
            )
            result = response.choices[0].text if response.choices else ""
            data = {"question": question, "result": result}
            mongo.db.chats.insert_one({"question": question, "answer": result, "name": name})
            return jsonify(data)
    data = {"result":"Hello! How can I assist you today?"}
    return jsonify(data)

@app.route('/api-1', methods=["GET","POST"])
def qa1():
    if request.method == "POST":
        print(request.json)
        question= request.json.get("question")
        chat = mongo.db.chats.find_one({"question": question})
        print(chat)
        if chat:
            data= {"result": f"{chat['answer']}"}
            return jsonify(data)
        else:
            
            response = client.completions.create(
            model="gpt-3.5-turbo-instruct",
            prompt=question,
            temperature=1,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
            )
            result = response.choices[0].text if response.choices else ""
            data = {"question": question, "result": result}
            mongo.db.chats.insert_one({"question": question, "answer": result})
            return jsonify(data)
    data = {"result":"Hello! How can I assist you today?"}
    return jsonify(data)
app.run(debug=True)