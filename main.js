// ==UserScript==
// @name         Wanfang Wikipedia Citation Generator
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Generate Wikipedia citation for Wanfang articles with multiple authors, volume, and DOI support, using parent element of class="author-margin" for author extraction.
// @author       You
// @match        https://d.wanfangdata.com.cn/periodical/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wanfangdata.com.cn
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';
    setTimeout(function () {
        // 获取所有author-margin父元素的内容
        var authorElements = document.querySelectorAll('div.author-margin');
        var authors = [];
        authorElements.forEach(function(element) {
            var authorName = element.parentElement.childNodes[1].textContent.trim();
            authors.push(authorName);
        });

        // 处理author参数
        var authorParam = '';
        if (authors.length === 1) {
            authorParam = ' |author=' + authors[0];
        } else {
            authors.forEach(function(author, index) {
                authorParam += ' |author' + (index + 1) + '=' + author;
            });
        }

        // 获取标题、URL、期刊名称、ISSN
        var title = document.querySelector('wf-favourite').getAttribute('title').replace(/\r/g,"");
        var url = document.querySelector('wf-favourite').getAttribute('url').split('https://d.wanfangdata.com.cn/')[1];
        var journal = document.querySelector('.periodicalName').textContent.trim();
        var ISSNElement = document.querySelector('.periodicalDataItem.M10');
        var ISSN = ISSNElement ? ISSNElement.textContent.replace('ISSN：', '') : '';

        // 获取年、卷、期
        var publishDataElement = document.querySelector('.publishData.MCD a');
        var year = publishDataElement.querySelector('span:nth-child(1)').textContent.trim();
        var issue = "";
        var volume = "";
        if (publishDataElement.querySelectorAll('span').length > 2) {
            volume = publishDataElement.querySelector('span:nth-child(2)').textContent.replace(",", "").trim();
            issue = publishDataElement.querySelector('span:nth-child(3)').textContent.trim().replace(/\(|\)| /g, '');
        } else {
            issue = publishDataElement.querySelector('span:nth-child(2)').textContent.trim().replace(/\(|\)| /g, '');
        }

        // 获取页码
        var pages = document.querySelector('.pages.list .canReadOnline').textContent.trim().replace(/\s+/g, ' ').replace(/\(|\)| /g, '');

        // 获取DOI
        var doiElement = document.querySelector('.doiStyle a');
        doiElement = doiElement ? doiElement : document.querySelector('.doiStyle span');
        var doi = doiElement ? doiElement.textContent.trim() : '';

        // 生成引用代码
        var citation = '<ref>{{cite journal' + authorParam +
            ' |title=' + title +
            ' |journal=' + journal +
            ' |year=' + year +
            (volume ? ' |volume=' + volume : '') +
            ' |issue=' + issue +
            ' |pages=' + pages +
            (doi ? ' |doi=' + doi : '') +
            ' |id={{WFD|' + url + '}}' +
            (ISSN ? ' |ISSN=' + ISSN : '') +
            ' }}</ref>';

        // 创建复制按钮
        var copyCitationButton = document.createElement('button');
        copyCitationButton.id = 'copyCitationButton';
        copyCitationButton.textContent = '复制引用';

        var copyWFDButton = document.createElement('button');
        copyWFDButton.id = 'copyWFDButton';
        copyWFDButton.textContent = '复制WFD';

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        buttonsDiv.appendChild(copyCitationButton);
        buttonsDiv.appendChild(copyWFDButton);
        document.querySelector('.detailIcon').appendChild(buttonsDiv);

        // 复制引用内容到剪贴板
        document.getElementById('copyCitationButton').addEventListener('click', function () {
            GM_setClipboard(citation);
        });

        // 复制WFD内容到剪贴板
        document.getElementById('copyWFDButton').addEventListener('click', function () {
            GM_setClipboard('{{WFD|' + url + '}}');
        });
    }, 500);
})();
