# -*- coding: utf-8 -*-
import scrapy
from scrapaper.items import ScrapaperItem

from urlparse import urljoin

class NIPSSpider(scrapy.Spider):
    name = "nips"
    allowed_domains = ["papers.nips.cc"]
    start_urls = (
        'http://papers.nips.cc/',
    )

    def parse(self, response):
        list_links = response.xpath("//div/ul/li/a/@href").extract()
        for link in list_links:
            url = response.url + link
            yield scrapy.Request(url, callback=self.parse_paper)

    def parse_paper(self, response):
        year = int(response.url.split("-")[-1])
        papers = response.xpath("//div/ul/li")
        for paper in papers:
            texts = paper.xpath("a/text()").extract()
            link = urljoin(response.url, paper.xpath("a/@href").extract()[0]) + ".pdf"
            title = texts[0]
            authors = texts[1:]
            yield ScrapaperItem(year=year, title=title, authors=authors, pdf=link)
