#!/bin/sh
mv *.json old/
scrapy crawl cv -o CVPR.json
scrapy crawl ml -o JMLR.json
scrapy crawl nips -o NIPS.json
