import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {getPath, getSetting} from './utils.js';

Gio._promisify(Gio.Subprocess.prototype, 'wait_async');

export default class Server {
    /** @param {ServerSetting} settings  */
    constructor(settings) {
        this.name = settings.name;
        this.mac = settings.mac;
        this.ip = settings.ip;
        this.wolPort = 9;
        this._pingAwait = null;
        this._pingProcess = null;
        this._asyncCancel = null;
    }

    /**
     * @param silentPing sends a wol packet without waiting for response
     * @returns {Promise<boolean | null>}
     */
    async wake(silentPing = false) {
        if (!this.mac) {
            return null;
        }

        let magicPacket = [];
        for (let i = 0; i < 6; i++) magicPacket.push(0xff);
        for (let i = 0; i < 16; i++)
            magicPacket.push(
                ...this.mac.split(':').map(hex => parseInt(hex, 16))
            );

        let sock = Gio.Socket.new(
            Gio.SocketFamily.IPV4,
            Gio.SocketType.DATAGRAM,
            Gio.SocketProtocol.UDP
        );

        const networkBroadcastIp = getSetting('broadcast-ip');
        let addr = Gio.InetAddress.new_from_string(networkBroadcastIp);
        let sockaddr = Gio.InetSocketAddress.new(addr, this.wolPort);

        sock.set_broadcast(true);
        sock.send_to(sockaddr, new Uint8Array(magicPacket), null);
        sock.close();

        if (silentPing) {
            return null;
        }

        const wakeTimeout = getSetting('wake-timeout');
        const isOn = await this.isAwake(wakeTimeout);

        if (isOn) {
            Main.notify(
                _('Wake-on-LAN'),
                _('Server "%s" is online').format(this.name)
            );
        } else if (!isOn) {
            Main.notify(
                _('Wake-on-LAN'),
                _('Server "%s" did not wake up').format(this.name)
            );
        }

        return isOn;
    }

    /** @returns {Promise<boolean | null>} */
    async isAwake(timeout = 1) {
        if (this.isLoading) {
            this.wake(true);
            await this._pingAwait;
            return this._pingProcess.get_successful();
        }

        if (!this.ip) {
            return null;
        }

        try {
            const path = getPath();
            const scriptPath = `${path}/extension/assets/ping_wait.sh`;

            this._pingProcess = Gio.Subprocess.new(
                ['bash', scriptPath, this.ip, timeout.toString()],
                Gio.SubprocessFlags.NONE
            );

            this._asyncCancel = new Gio.Cancellable();
            this._pingAwait = this._pingProcess.wait_async(this._asyncCancel);
            await this._pingAwait;
            this._asyncCancel = null;

            return this._pingProcess.get_successful();
        } catch (e) {
            console.debug('Ping command aborted:', e);
            return null;
        }
    }

    get isLoading() {
        return this._asyncCancel != null;
    }

    _cancelCheck() {
        this._asyncCancel?.cancel();
        this._asyncCancel = null;
        this._pingProcess?.force_exit();
        this._pingProcess = null;
        this._pingAwait = null;
    }

    destroy() {
        this._cancelCheck();
    }
}

/**
 * @typedef {{
 * id: string,
 * name: string,
 * mac: string,
 * ip: string,
 * }} ServerSetting
 */
