import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Logger } from '../service/Logger';

@Injectable({providedIn: 'root'})
export class CustomMetaService {

    constructor(private titleService: Title, private logger:Logger) { }

    public setCustomMetadata(data: {cssLinks?: string[], favicon?: string, title?: string}): void {
        if (data.cssLinks)
            this.loadCss(data.cssLinks);
        if (data.favicon)
            this.overwriteFavicon(data.favicon);
        if (data.title)
            this.overwriteTitle(data.title);
    }

    private loadCss(cssLinks: string[]): void {
        this.logger.debug('loading custom CSS');
        const head = window.document.getElementsByTagName('HEAD')[0];
        cssLinks.map(css => {
            const link = window.document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = css;
            head.appendChild(link);
        });
    }

    private overwriteTitle(title: string): void {
        this.logger.debug('setting custom title');
        this.titleService.setTitle(title);
    }

    private overwriteFavicon(favicon: string): void {
        this.logger.debug('setting custom favicon');
        window.document.getElementById('appFavicon').setAttribute('href', favicon);
    }
}