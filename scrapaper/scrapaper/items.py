# -*- coding: utf-8 -*-

import scrapy

class ScrapaperItem(scrapy.Item):
    title = scrapy.Field()
    year = scrapy.Field()
    authors = scrapy.Field()
    pdf = scrapy.Field()
