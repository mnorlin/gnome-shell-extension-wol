import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import ServerRow from './prefs/serverRow.js';

export default class WolPreferences extends ExtensionPreferences {
    /** @type {InstanceType<ServerRow>[] | null} */
    _serverRows = null;

    /** @param {Adw.PreferencesWindow} window  */
    fillPreferencesWindow(window) {
        this._serverRows = [];
        this._settings = this.getSettings();
        this._serverSettings = this._buildServers();

        const page = new Adw.PreferencesPage({
            title: _('Wake-on-LAN extension'),
        });

        page.add(this._buildCommon());
        page.add(this._serverSettings);

        window.add(page);
        window.connect('close-request', () => {
            this._serverRows = null;
            this._settings = null;
            this._serverSettings = null;
        });

        this.serverRows = JSON.parse(this._settings.get_string('servers')).map(
            /** @param {ServerSetting} server */
            server => new ServerRow(server, this._settings)
        );

        return Promise.resolve();
    }

    get serverRows() {
        return this._serverRows;
    }

    /** @param {InstanceType<ServerRow>[]} updatedRows */
    set serverRows(updatedRows) {
        this._serverRows?.forEach(row => {
            this._serverSettings.remove(row);
        });

        this._serverRows = updatedRows;
        const bottomIndex = this._serverRows.length - 1;
        this._serverRows?.forEach((row, index) => {
            this._serverSettings.add(row);
            row.setCallback(this._handleServerAction.bind(this));

            row.upButton.set_sensitive(index == 0 ? false : true);
            row.downButton.set_sensitive(index == bottomIndex ? false : true);
        });

        const newServers = this._serverRows.map(r => r.server);
        this._settings.set_string('servers', JSON.stringify(newServers));
    }

    _buildServers() {
        const buttonContent = new Adw.ButtonContent({
            icon_name: 'list-add-symbolic',
            label: _('Add Server'),
        });

        const addButton = new Gtk.Button({
            child: buttonContent,
            cssClasses: ['flat'],
        });
        addButton.connect('clicked', () => {
            const newServer = {
                id: GLib.uuid_string_random(),
                name: _('New Server (%d)').format(
                    this.serverRows.length.toString()
                ),
                mac: '',
                ip: '',
            };

            this.serverRows = [
                ...this.serverRows,
                new ServerRow(newServer, this._settings),
            ];
        });

        const serverGroup = new Adw.PreferencesGroup({
            title: _('Servers'),
            headerSuffix: addButton,
        });

        return serverGroup;
    }

    _buildCommon() {
        const commonGroup = new Adw.PreferencesGroup({
            title: _('General'),
        });

        const timeoutEntry = new Adw.SpinRow({
            title: _('Wake Timeout (seconds)'),
            subtitle: _(
                'How long after wake attempt before marking server as offline'
            ),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 300, // 5min
                stepIncrement: 1,
            }),
        });
        this._settings.bind(
            'wake-timeout',
            timeoutEntry,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        commonGroup.add(timeoutEntry);

        const IPV4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
        const broadcastEntry = new Adw.EntryRow({
            title: _('Network Broadcast IP'),
        });
        broadcastEntry.set_text(this._settings.get_string('broadcast-ip'));
        broadcastEntry.connect('notify::text', () => {
            const value = broadcastEntry.text;
            if (value && !IPV4_REGEX.test(value)) {
                broadcastEntry.add_css_class('error');
            } else {
                broadcastEntry.remove_css_class('error');
                this._settings.set_string('broadcast-ip', value);
            }
        });
        commonGroup.add(broadcastEntry);

        return commonGroup;
    }

    /**
     * @param {ServerAction} action
     * @param {InstanceType<ServerRow>} row
     */
    _handleServerAction(action, row) {
        if (action == 'delete') {
            this.serverRows = this.serverRows.filter(
                s => s.server.id != row.server.id
            );
        } else {
            const index = this.serverRows.findIndex(
                s => s.server.id == row.server.id
            );
            if (action == 'up' && index <= 0) return;
            if (action == 'down' && index >= this.serverRows.length - 1) return;

            const rowsCopy = [...this.serverRows];

            const swapIndex = action === 'up' ? index - 1 : index + 1;
            const [movedItem] = rowsCopy.splice(index, 1);
            rowsCopy.splice(swapIndex, 0, movedItem);

            this.serverRows = rowsCopy;
        }
    }
}

/**
 * @typedef {import('./extension/server.js').ServerSetting} ServerSetting
 *
 *
 * @typedef {import('./prefs/serverRow.js').ServerAction} ServerAction
 */
