#!/usr/bin/python
#-*- coding: utf-8 -*-
from flask import Flask, request, session, g, redirect, url_for, abort, \
             render_template, flash

app = Flask(__name__)
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='aikorea',
    HOST='0.0.0.0',
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

data = [
    {'title' : 'aikorea', 'year' : 2014}, 
    {'title' : 'google', 'year' : 2013}, 
    {'title' : 'deep learning', 'year' : 2012}, 
]

@app.route('/')
def list():
    return render_template('list.html', papers=data)

@app.route('/search', methods=['GET', 'POST'])
def search():
    query = request.form['query']
    year = request.form['year']

    if query:
        data = [item for item in data if query in item['title']]
    if year:
        data = [item for item in data if year == item['year']]

    return jsonify(**data)

if __name__ == '__main__':
    app.run()
