#!/bin/sh
cd scrapaper
scrapy crawl cv -o cvpapers.json
scrapy crawl ml -o mlpapers.json
mv cvpapers.json ../
mv mlpapers.json ../
cd ..
