#!/bin/sh
cd scrapaper
scrapy crawl cv -o papers.json
mv papers.json ../
cd ..
