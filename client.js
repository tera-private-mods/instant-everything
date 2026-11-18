'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const RESOURCE = 'client/S1UI_CardComposeWindow.gpk';
const EXPECTED_HASH = '812ce57e62351d84159bab36c44376bc3b78714f37f0dff8d03dfe2df5f21839';

module.exports = class InstantCardsClient {
    constructor(mod) { this.mod = mod; }

    install(installer) {
        const mod = this.mod;
        if (mod.settings.cards === false) return;
        const info = mod.clientInterface.info;
        if (info.arch !== 'x64' || Number(info.majorPatchVersion) !== 100 || Number(info.minorPatchVersion) !== 2) {
            mod.warn('Instant cards requires the TERA 100.02 x64 client; card animation override was not loaded.');
            return;
        }

        const source = path.join(__dirname, RESOURCE);
        const hash = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
        if (hash !== EXPECTED_HASH) throw Error('Instant cards GPK checksum mismatch. Reinstall the module.');
        const destination = mod.clientInterface.GPKManager.getFullPath(path.resolve(mod.clientFolder, '..'), path.basename(RESOURCE));
        const symlink = fs.symlinkSync;
        // Preserve Toolbox tracking/cleanup on Windows without symlink privileges.
        fs.symlinkSync = function (from, to, type) {
            try { return symlink(from, to, type); }
            catch (error) {
                if (!['EPERM', 'EACCES'].includes(error.code) || path.resolve(from) !== path.resolve(source) || path.resolve(to) !== path.resolve(destination)) throw error;
                fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
            }
        };
        try { installer.gpk(RESOURCE); }
        finally { fs.symlinkSync = symlink; }
    }
};
