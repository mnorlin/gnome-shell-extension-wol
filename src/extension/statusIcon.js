import GObject from 'gi://GObject';
import St from 'gi://St';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {getIcon, getScaleFactor} from './utils.js';

class StatusIcon extends St.BoxLayout {
    constructor() {
        super();

        const iconSize = 16 * getScaleFactor();

        this._iconOnline = new St.Icon({
            gicon: getIcon('check-round-fill-symbolic'),
            styleClass: 'success',
            accessible_name: _('Status online'),
            iconSize: iconSize,
        });

        this._iconPower = new St.Icon({
            gicon: getIcon('turn-off-symbolic'),
            accessible_name: _('Status offline, can be turned on'),
            iconSize: iconSize,
        });

        this._iconOffline = new St.Icon({
            gicon: getIcon('cross-large-circle-filled-symbolic'),
            accessible_name: _('Status offline'),
            styleClass: 'error',
            iconSize: iconSize,
        });

        this._iconLoading = new St.Widget({width: iconSize, height: iconSize});
        this._iconLoading.set_content(new St.SpinnerContent());

        this.setStatus('loading');
        this.add_child(this._iconOnline);
        this.add_child(this._iconPower);
        this.add_child(this._iconOffline);
        this.add_child(this._iconLoading);
    }

    /**  @param {'online' | 'power' | 'offline' | 'loading'} status */
    setStatus(status) {
        this._iconOnline.hide();
        this._iconPower.hide();
        this._iconOffline.hide();
        this._iconLoading.hide();

        switch (status) {
            case 'online':
                this._iconOnline.show();
                break;
            case 'power':
                this._iconPower.show();
                break;
            case 'offline':
                this._iconOffline.show();
                break;
            default:
                this._iconLoading.show();
        }
    }
}
export default GObject.registerClass(StatusIcon);
