import { Directive, ElementRef, OnInit, Inject} from '@angular/core';
import { Logger } from '../service/Logger';
import { DEPLOY_URL } from './deploy-url';

@Directive({
    selector: '[appBase]'
})
export class AppBaseDirective implements OnInit {

    constructor(@Inject(DEPLOY_URL) private deployUrl: string, private logger: Logger, private host: ElementRef) { }

    ngOnInit() {
        if (this.host.nativeElement.tagName.toLowerCase() == 'img') {
            let path = this.host.nativeElement.getAttribute('src');
            path = this.src(path);
            this.host.nativeElement.setAttribute('src', path);
        } else {
            this.logger.warn('element not handled by appBase directive', this.host.nativeElement);
        }
    }

    private src(path: string): string {
        if (path.startsWith('/')) {
            path = path.substr(1);
        }

        return `${this.deployUrl}${path}`;
    }
}