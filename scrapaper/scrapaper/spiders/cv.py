# -*- coding: utf-8 -*-
import scrapy
from scrapaper.items import ScrapaperItem

from urlparse import urljoin

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
        # get list of authors
        authors_and_pdfs = response.xpath('//dd')

        for idx, sel in enumerate(sels):
            item = ScrapaperItem()
            item['title'] = sel.extract()
            item['year'] = year
            item['authors'] = authors_and_pdfs[idx*2].xpath('./form/a/text()').extract()
            item['pdf'] = urljoin(response.url, authors_and_pdfs[idx*2+1].xpath('./a/@href').extract()[0])

            yield item
