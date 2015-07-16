#!/bin/sh
cd scrapaper
scrapy crawl cv -o cvpapers.json
scrapy crawl ml -o mlpapers.json
scrapy crawl nips -o nipspapers.json
mv cvpapers.json ../
mv mlpapers.json ../
mv nipspapers.json ../
cd ..
