import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

class ServerRow extends Adw.ExpanderRow {
    /** @type {Callback} */
    _callback;

    /**
     * @param {ServerSetting} server
     * @param {GSettings} gSettings
     */
    constructor(server, gSettings) {
        super({
            title: server.name,
            subtitle: server.ip || '-',
        });
        this._gSettings = gSettings;
        this._server = server;

        const nameEntry = this._buildNameInput();
        this.add_row(nameEntry);

        const macEntry = this._buildMacInput();
        this.add_row(macEntry);

        const ipEntry = this._buildIpInput();
        this.add_row(ipEntry);

        const deleteButton = new Gtk.Button({
            label: _('Delete Server'),
            iconName: 'user-trash-symbolic',
            cssClasses: ['destructive-action'],
            marginStart: 8,
            marginEnd: 8,
            marginTop: 8,
            marginBottom: 8,
        });

        deleteButton.connect('clicked', () => {
            this._callback('delete', this);
        });

        const orderBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            cssClasses: ['linked'],
        });

        this.upButton = new Gtk.Button({
            icon_name: 'pan-up-symbolic',
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });

        this.upButton.connect('clicked', () => {
            this._callback('up', this);
        });

        this.downButton = new Gtk.Button({
            icon_name: 'pan-down-symbolic',
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });

        this.downButton.connect('clicked', () => {
            this._callback('down', this);
        });

        orderBox.append(this.upButton);
        orderBox.append(this.downButton);
        this.add_row(deleteButton);
        this.add_prefix(orderBox);
    }

    get server() {
        return this._server;
    }

    /** @param {ServerSetting} updatedServer */
    set server(updatedServer) {
        /** @type {ServerSetting[]} */
        const servers = JSON.parse(this._gSettings.get_string('servers'));

        let index = servers.findIndex(s => s.id === updatedServer.id);
        servers[index] = updatedServer;
        this._server = updatedServer;

        this._gSettings.set_string('servers', JSON.stringify(servers));
    }

    /** @param {Callback} callback */
    setCallback(callback) {
        this._callback = callback;
    }

    _buildNameInput() {
        const nameEntry = new Adw.EntryRow({
            title: _('Name'),
        });
        nameEntry.set_text(this.server.name);
        nameEntry.connect('notify::text', () => {
            this.title = nameEntry.text;
            this.server = {...this.server, name: nameEntry.text};
        });

        return nameEntry;
    }

    _buildMacInput() {
        const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

        const macEntry = new Adw.EntryRow({
            title: _('MAC Address'),
        });
        macEntry.set_text(this.server.mac);
        macEntry.connect('notify::text', () => {
            if (macEntry.text && !MAC_REGEX.test(macEntry.text)) {
                macEntry.add_css_class('error');
            } else {
                macEntry.remove_css_class('error');
                this.subtitle = this.server.ip || macEntry.text;
                this.server = {...this.server, mac: macEntry.text};
            }
        });
        return macEntry;
    }

    _buildIpInput() {
        const DOMAIN_REGEX =
            /^((?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}|(?:\d{1,3}\.){3}\d{1,3}|localhost)$/;
        const ipEntry = new Adw.EntryRow({
            title: _('IP Address or Domain'),
        });
        ipEntry.set_text(this.server.ip);
        ipEntry.connect('notify::text', () => {
            const value = ipEntry.text;
            if (value && !DOMAIN_REGEX.test(value)) {
                ipEntry.add_css_class('error');
            } else {
                ipEntry.remove_css_class('error');
                this.server = {...this.server, ip: value};
                this.subtitle = value || this.server.mac;
            }
        });

        return ipEntry;
    }
}

export default GObject.registerClass(ServerRow);

/**
 * @typedef {import('../extension/server.js').ServerSetting} ServerSetting
 *
 *
 * @typedef {'delete' | 'up' | 'down'} ServerAction
 *
 *
 * @typedef {(action: ServerAction, server: InstanceType<typeof ServerRow>) => void} Callback
 *
 *
 * @typedef {import('gi://Gio').default.Settings} GSettings;
 */
