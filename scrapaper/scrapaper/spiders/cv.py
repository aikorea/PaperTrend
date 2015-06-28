# -*- coding: utf-8 -*-
import scrapy

from scrapaper.items import ScrapaperItem

class CvSpider(scrapy.Spider):
    name = "cv"
    allowed_domains = ["cv-foundation.org"]
    start_urls = (
        'http://www.cv-foundation.org/openaccess/CVPR2015.py',
        'http://www.cv-foundation.org/openaccess/CVPR2014.py',
        'http://www.cv-foundation.org/openaccess/ICCV2013.py',
        'http://www.cv-foundation.org/openaccess/CVPR2013.py',
    )

    def parse(self, response):
	# get all paper titles
	sels = response.css('.ptitle').xpath('a/text()')
	# get the year of the corresponding conference	
	year = response.xpath('//div[@id="header_title"]/a/text()').extract()[0][-4:] 
	for sel in sels:
		item = ScrapaperItem()
		item['title'] = sel.extract()
		item['year'] = year
		yield item
