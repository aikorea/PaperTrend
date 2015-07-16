#!/usr/bin/python
#-*- coding: utf-8 -*-
from flask import Flask, request, session, g, redirect, url_for, abort, \
             render_template, flash, jsonify
from glob import glob
import json

app = Flask(__name__)
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='aikorea',
    HOST='0.0.0.0',
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

papers = []
for json_file in glob("scrapaper/*papers.json"):
    papers += json.load(open(json_file))

@app.route('/')
def list():
    return render_template('papers.html')

@app.route('/papers.json', methods=['GET', 'POST'])
def search():
    global papers

    data = {'query': ''}
    if request.method == 'POST':
        query = request.form['query']
        year = request.form['year']

        if query:
            papers = [item for item in papers if query in item['title'].lower()]
            data['query'] = query
        if year:
            year = int(year)
            papers = [item for item in papers if year == int(item['year'])]
            data['year'] = year 

    data['papers'] = papers

    return jsonify(**data)

if __name__ == '__main__':
    app.run()
