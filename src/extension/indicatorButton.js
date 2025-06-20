import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import Server from './server.js';
import MenuItem from './menuItem.js';
import {getSetting, getIcon, getScaleFactor} from './utils.js';

class IndicatorButton extends PanelMenu.Button {
    /** @param {() => void} openPreferences  */
    constructor(openPreferences) {
        super(0, _('Wake-on-LAN'));

        /** @type {[any, number][]} */
        this._signalIds = [];

        const icon = new St.Icon({
            gicon: getIcon('computer-symbolic'),
            icon_size: 16 * getScaleFactor(),
        });
        this.add_child(icon);

        /** @type {InstanceType<typeof Server>[]} s  */
        const servers = JSON.parse(getSetting('servers')).map(
            /** @param {ServerSettings} s  */
            s => new Server(s)
        );

        if (servers.length == 0) {
            const pressId = this.connect(
                'button-press-event',
                openPreferences.bind(this)
            );

            this._signalIds.push([this, pressId]);
        }

        /** @type {InstanceType<typeof MenuItem>[]} */
        this._menuItems = [];
        // @ts-expect-error: missing inherited types in @girs
        const openId = this.menu.connect('open-state-changed', (_, open) => {
            this._menuItems.forEach(item => {
                if (open && !item.isLoading) {
                    item.updateStatus();
                }
            });
            return Clutter.EVENT_PROPAGATE;
        });
        this._signalIds.push([this.menu, openId]);

        servers.forEach(server => {
            const item = new MenuItem(server);
            this._menuItems.push(item);

            // @ts-expect-error: missing inherited types in @girs
            this.menu.addMenuItem(item);
        });
    }

    destroy() {
        for (let [obj, id] of this._signalIds) {
            obj.disconnect(id);
        }
        this._signalIds = [];

        super.destroy();
    }
}

export default GObject.registerClass(IndicatorButton);

/** @typedef {import('./server.js').ServerSetting} ServerSettings */
