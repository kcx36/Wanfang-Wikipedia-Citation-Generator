// ==UserScript==
// @name         Wanfang Wikipedia Citation Generator
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Generate Wikipedia citation for Wanfang articles.
// @author       Kcx36, ChatGPT
// @match        https://d.wanfangdata.com.cn/periodical/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wanfangdata.com.cn
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';
    setTimeout(function () {
        // 获取所有作者
        var authorElements = document.querySelectorAll('.author.detailTitle .test-detail-author span.author-margin');
        var authors = [];
        authorElements.forEach(function(element) {
            authors.push(element.textContent.trim());
        });

        // 处理author参数
        var authorParam = '';
        if (authors.length === 1) {
            authorParam = '|author=' + authors[0];
        } else {
            authors.forEach(function(author, index) {
                authorParam += '|author' + (index + 1) + '=' + author + ' ';
            });
        }

        // 获取标题、URL、期刊名称、ISSN
        var title = document.querySelector('wf-favourite').getAttribute('title');
        var url = document.querySelector('wf-favourite').getAttribute('url').split('https://d.wanfangdata.com.cn/')[1];
        var journal = document.querySelector('.periodicalName').textContent.trim();
        var ISSN = document.querySelector('.periodicalDataItem.M10').textContent.replace('ISSN：', '');

        // 获取年、卷、期
        var publishData = document.querySelector('.publishData.MCD a').textContent.trim().split(/[,()]/);
        var year = publishData[0].trim();
        var volume = publishData.length > 2 ? publishData[1].trim() : '';
        var issue = publishData[publishData.length - 1].trim();

        // 获取页码
        var pages = document.querySelector('.pages.list .canReadOnline').textContent.trim().replace(/\s+/g, ' ').replace(/\(|\)| /g, '');

        // 获取DOI
        var doiElement = document.querySelector('.doiStyle a');
        var doi = doiElement ? doiElement.textContent.trim() : '';

        // 生成引用代码
        var citation = '<ref>{{cite journal ' + authorParam +
            '|title=' + title +
            ' |journal=' + journal +
            ' |year=' + year +
            (volume ? ' |volume=' + volume : '') +
            ' |issue=' + issue +
            ' |pages=' + pages +
            (doi ? ' |doi=' + doi : '') +
            ' |id={{WFD|' + url + '}}' +
            ' |ISSN=' + ISSN +
            ' }}</ref>';

        // 创建复制按钮
        var copyCitationButton = document.createElement('button');
        copyCitationButton.id = 'copyCitationButton';
        copyCitationButton.textContent = '复制引用';

        var copyWFDButton = document.createElement('button');
        copyWFDButton.id = 'copyWFDButton';
        copyWFDButton.textContent = '复制{{WFD}}';

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
