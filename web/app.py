#!/usr/bin/python
#-*- coding: utf-8 -*-
from flask import Flask, request, session, g, redirect, url_for, abort, \
             render_template, flash, jsonify
import json

app = Flask(__name__)
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='aikorea',
    HOST='0.0.0.0',
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/')
def list():
    return render_template('papers.html')

@app.route('/papers.json', methods=['GET', 'POST'])
def search():
    with open("scrapaper/papers.json") as json_file:
    	papers = json.load(json_file)

    if request.method == 'POST':
        query = request.form['query']
        year = request.form['year']

        if query:
            papers = [item for item in papers if query in item['title'].lower()]
        if year:
            year = int(year)
            papers = [item for item in papers if year == int(item['year'])]

    data = {'papers': papers}

    return jsonify(**data)

if __name__ == '__main__':
    app.run()
