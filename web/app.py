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

_papers = []
for json_file in glob("scrapaper/*.json"):
    j = json.load(open(json_file))
    for i in j:
        i['conf'] = json_file.split("/")[1].split(".json")[0]
    _papers += j
print "length of papers : %s" % len(_papers)

@app.route('/')
def list():
    return render_template('papers.html')

@app.route('/papers.json', methods=['GET', 'POST'])
def search():
    global _papers

    papers = _papers
    data = {'query': ''}
    if request.method == 'POST':
        if request.form.has_key('query'):
            query = request.form['query']
        else:
            query = None
        if request.form.has_key('year'):
            year = request.form['year']
        else:
            year = None
        if request.form.has_key('page'):
            page = int(request.form['page'])
        else:
            page = None
        if request.form.has_key('count'):
            count = request.form['count']
        else:
            count = 3000

        print page, count

        if query != None:
            papers = [item for item in papers if query in item['title'].lower()]
            data['query'] = query
        if year != None:
            year = int(year)
            papers = [item for item in papers if year == int(item['year'])]
            data['year'] = year 
        if page != None:
            if (page+1)*count >= len(papers):
                data['end'] = True
            else:
                data['end'] = False
            papers = papers[page*count: (page+1)*count]

    data['papers'] = papers

    return jsonify(**data)

if __name__ == '__main__':
    app.run()
