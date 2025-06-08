import Gio from 'gi://Gio';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @template {keyof Settings} T
 * @param {T} setting
 * @returns {Settings[T]}
 */
export function getSetting(setting) {
    const gSettings = Extension.lookupByURL(import.meta.url).getSettings();
    return gSettings.get_value(setting).deepUnpack();
}

/** @param {IconName} iconName */
export function getIcon(iconName) {
    const metadata = Extension.lookupByURL(import.meta.url).metadata;
    return Gio.icon_new_for_string(
        `${metadata.path}/extension/assets/icons/${iconName}.svg`
    );
}

export function getPath() {
    return Extension.lookupByURL(import.meta.url).metadata.path;
}

export function getScaleFactor() {
    return St.ThemeContext.get_for_stage(global.stage).scale_factor;
}

/**
 * @typedef {{
 * 'wake-timeout': number,
 * 'broadcast-ip': string,
 * 'servers': string
 * }} Settings
 *
 *
 * @typedef { 'lan-symbolic'
 * | 'turn-off-symbolic'
 * | 'cross-large-circle-filled-symbolic'
 * | 'check-round-fill-symbolic'
 * } IconName
 */
