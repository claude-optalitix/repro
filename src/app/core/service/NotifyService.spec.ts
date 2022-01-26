import { NotifyService } from './NotifyService'
import { ToastType, Toast, ToasterService } from 'angular2-toaster';

describe('NotifyService', () => {

    function checkNotificationFor(type: ToastType) {
        let toast: Toast = null;
        const toaster: ToasterService = <ToasterService>{
            pop(item: Toast) {
                toast = item;
            }
        };
        const noty = new NotifyService(toaster);
        noty[(type as string)]('title', 'message');

        expect(toast).not.toBeNull();
        expect(toast.title).toEqual('title');
        expect(toast.body).toEqual('message');
        expect(toast.type).toEqual(type);
    }

    it('test calls', () => {
        checkNotificationFor('wait');
        checkNotificationFor('info');
        checkNotificationFor('success');
        checkNotificationFor('warning');
        checkNotificationFor('error');
    });
});