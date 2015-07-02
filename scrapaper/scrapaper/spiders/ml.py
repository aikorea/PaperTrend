# -*- coding: utf-8 -*-
import scrapy
import re

from scrapaper.items import ScrapaperItem
from urlparse import urljoin

class CvSpider(scrapy.Spider):
    name = "ml"
    allowed_domains = ["jmlr.org"]
    start_urls = (
        'http://jmlr.org/proceedings',
    ) 

    def parse(self, response):
	sels = response.xpath('//ul/li[contains(.,"available")]')
	for sel in sels:
	   href = sel.xpath('a/@href')
	   url = urljoin(response.url, href.extract()[0])
	   year = sel.extract().split('<a')[0][-5:-1]
	   yield scrapy.Request(url, callback=self.parse_items, meta={'year':year})

    def parse_items(self, response):
        # get all paper titles
        sels = response.css('.title').extract()
	auth_sels = response.css('.authors').extract()
        # get the year of the corresponding conference	
	str = response.xpath('//head/title/text()').extract()
        # get list of authors
#        authors = response.xpath('//dd')

        for idx, sel in enumerate(sels):
            item = ScrapaperItem()
	    p = re.compile(r'<.*?>')
            item['title'] = p.sub('', sel)
	    if item['title'] == 'Preface':
		continue
	    authors = p.sub('', auth_sels[idx])
	    authors = re.sub('\n', '', authors)
	    authors = re.sub('\t', '', authors)
	    item['authors'] = authors.split(',')
            item['year'] = response.meta['year']
#            item['authors'] = authors[idx*2].xpath('./form/a/text()').extract()
            yield item
