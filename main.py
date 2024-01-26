from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo

import os
import openai

openai.api_key ='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'

from openai import OpenAI
client = OpenAI()

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb+srv://arshguptaarsh1101:VRkEEgcJWbpDhrGq@cluster0.2nurcjx.mongodb.net/legal"
mongo = PyMongo(app)
@app.route('/')
def home():
    chats = mongo.db.chats.find({})
    myChats =[chat for chat in chats]
    print(myChats)
    return render_template("index.html",myChats=myChats)

@app.route('/api', methods=["GET","POST"])
def qa():
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