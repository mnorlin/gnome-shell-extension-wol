import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import IndicatorButton from './extension/indicatorButton.js';

/** @type {Extension} */
export let ME = null;

export default class WolExtension extends Extension {
    /** @param {*} metatada  */
    constructor(metatada) {
        super(metatada);
    }

    enable() {
        ME = this;
        this.indicator = new IndicatorButton(this.openPreferences.bind(this));
        this.gsettings = this.getSettings();
        Main.panel.addToStatusArea(this.uuid, this.indicator);

        this._connectHandler = this.gsettings.connect('changed', () => {
            this.indicator.destroy();
            this.indicator = new IndicatorButton(
                this.openPreferences.bind(this)
            );
            Main.panel.addToStatusArea(this.uuid, this.indicator);
        });
    }

    disable() {
        this.indicator.destroy();
        this.indicator = null;

        this.gsettings.disconnect(this._connectHandler);
        this._connectHandler = null;
        this.gsettings = null;
    }
}
