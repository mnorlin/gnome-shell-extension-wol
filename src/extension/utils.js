import Gio from 'gi://Gio';
import St from 'gi://St';
import {ME} from '../extension.js';

/**
 * @template {keyof Settings} T
 * @param {T} setting
 * @returns {Settings[T]}
 */
export function getSetting(setting) {
    const gSettings = ME.getSettings();
    return gSettings.get_value(setting).deepUnpack();
}

/** @param {IconName} iconName */
export function getIcon(iconName) {
    const metadata = ME.metadata;
    return Gio.icon_new_for_string(
        `${metadata.path}/extension/assets/icons/${iconName}.svg`
    );
}

export function getPath() {
    return ME.metadata.path;
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
 * | 'computer-symbolic'
 * } IconName
 */
