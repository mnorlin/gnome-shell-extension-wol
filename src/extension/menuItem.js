import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import Server from './server.js';
import StatusIcon from './statusIcon.js';

class MenuItem extends PopupMenu.PopupBaseMenuItem {
    /** @param {Server} server */
    constructor(server) {
        super({activate: false});

        this._server = server;
        this._statusIcon = new StatusIcon();

        const label = new St.Label({
            text: server.name,
            style_class: 'label--server-name',
        });
        const box = new St.BoxLayout();

        box.add_child(this._statusIcon);
        box.add_child(label);
        this.add_child(box);

        this._connectSignal = this.connect('button-press-event', () => {
            this._handleClick();
            return Clutter.EVENT_STOP; // Prevent menu from closing
        });
    }

    destroy() {
        this._server.destroy();
        this.disconnect(this._connectSignal);
        this._connectSignal = null;
        super.destroy();
    }

    get isLoading() {
        return this._server.isLoading;
    }

    /** @param {boolean | null} isOn  */
    set status(isOn) {
        const hasMac = this._server.mac;
        if (hasMac) {
            this._statusIcon.setStatus(isOn ? 'online' : 'power');
        } else {
            this._statusIcon.setStatus(isOn ? 'online' : 'offline');
        }
    }

    async updateStatus() {
        this._statusIcon.setStatus('loading');
        this.status = await this._server.isAwake();
    }

    async _handleClick() {
        this._statusIcon.setStatus('loading');
        const hasMac = this._server.mac;

        this.status = await (hasMac
            ? this._server.wake()
            : this._server.isAwake());
    }
}

export default GObject.registerClass(MenuItem);
