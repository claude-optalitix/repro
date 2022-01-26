import { Injectable } from '@angular/core';
import { Toast, ToastType, ToasterService, BodyOutputType } from 'angular2-toaster';

@Injectable()
export class NotifyService {

  constructor(private _toastyService: ToasterService) { }

  public wait(title: string, message?: string): void {
    const toastOptions = this.getOptions('wait', title, message);
    this._toastyService.pop(toastOptions);
  }

  public info(title: string, message?: string): void {
    const toastOptions = this.getOptions('info', title, message);
    this._toastyService.pop(toastOptions);
  }

  public success(title: string, message?: string): void {
    const toastOptions = this.getOptions('success', title, message);
    this._toastyService.pop(toastOptions);
  }

  public warning(title: string, message?: string): void {
    const toastOptions = this.getOptions('warning', title, message);
    this._toastyService.pop(toastOptions);
  }

  public error(title: string, message?: string): void {
    const toastOptions = this.getOptions('error', title, message);
    this._toastyService.pop(toastOptions);
  }

  public show(type: ToastType, title: string, message: string, timeout: number): void {
    const toastOptions = {
      type: type,
      title: title,
      body: message,
      showCloseButton: true,
      timeout: timeout,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this._toastyService.pop(toastOptions);
  }

  private getOptions(type: ToastType, title: string, message?: string): Toast {

    return {
      type: type,
      title: title,
      body: message,
      showCloseButton: true,
      timeout: 5000,
    };
  }
}