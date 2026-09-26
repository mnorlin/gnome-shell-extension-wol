import St from 'gi://St';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

/**
 * A menu that opens the extension preferences instead of popping up,
 * used when there are no servers to list.
 */
export default class PreferencesMenu extends PopupMenu.PopupMenu {
    /**
     * @param {St.Widget} sourceActor
     * @param {() => void} openPreferences
     */
    constructor(sourceActor, openPreferences) {
        super(sourceActor, 0.5, St.Side.TOP);

        this._openPreferences = openPreferences;
    }

    toggle() {
        this._openPreferences();
    }
}
