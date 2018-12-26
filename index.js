const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function InstantEverything(mod) {
    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy)
        mod.warn('You are trying to use InstantEverything on an unsupported version of tera-proxy. It may not work as expected, and even if it does now it may break at any point in the future!');


    const PURPOSES = ['enchant', 'upgrade', 'soulbind', 'merge', 'dismantle'];

    let hooks = {};
    function hook(purpose, ...args) {
        if (!hooks[purpose])
            hooks[purpose] = [];

        hooks[purpose].push(mod.hook(...args));
    }

    let enchanting = null;
    let upgrading = null;
    function enable(purpose) {
        switch (purpose) {
            case 'enchant': {
                hook('enchant', 'C_REGISTER_ENCHANT_ITEM', 1, event => { enchanting = event });

                hook('enchant', 'C_START_ENCHANT', 1, event => {
                    if (enchanting && event.contract === enchanting.contract) {
                        mod.send('C_REQUEST_ENCHANT', 1, enchanting);
                        return false;
                    }
                });

                hook('enchant', 'C_REQUEST_ENCHANT', 'raw', _ => false);
                break;
            }

            case 'upgrade': {
                const upgrading_method = mod.majorPatchVersion >= 79 ? 'EVOLUTION' : 'UPGRADE';
                hook('upgrade', 'C_REGISTER_' + upgrading_method + '_ITEM', 1, event => { upgrading = event });

                hook('upgrade', 'C_START_' + upgrading_method, 1, event => {
                    if (upgrading && event.contract === upgrading.contract) {
                        mod.send('C_REQUEST_' + upgrading_method, 1, upgrading);
                        return false;
                    }
                });

                hook('upgrade', 'C_REQUEST_' + upgrading_method, 'raw', _ => false);
                break;
            }

            case 'soulbind': {
                hook('soulbind', 'C_BIND_ITEM_BEGIN_PROGRESS', 1, event => {
                    mod.send('C_BIND_ITEM_EXECUTE', 1, {
                        contractId: event.contractId,
                    });

                    process.nextTick(() => {
                        mod.send('S_CANCEL_CONTRACT', 1, {
                            type: 32,
                            id: event.contractId,
                        });
                    });
                });

                hook('soulbind', 'C_BIND_ITEM_EXECUTE', 'raw', _ => false);
                break;
            }

            case 'merge': {
                hook('merge', 'S_REQUEST_CONTRACT', 1, event => {
                    if (!mod.game.me.is(event.senderId) || event.type != 33)
                        return;

                    mod.send('C_MERGE_ITEM_EXECUTE', 1, {
                        contractId: event.id,
                    });

                    process.nextTick(() => {
                        mod.send('S_CANCEL_CONTRACT', 1, {
                            type: 33,
                            id: event.id,
                        });
                    });
                });

                hook('merge', 'C_MERGE_ITEM_EXECUTE', 'raw', _ => false);
                break;
            }

            case 'dismantle': {
                hook('dismantle', 'C_RQ_START_SOCIAL_ON_PROGRESS_DECOMPOSITION', 1, event => {
                    mod.send('C_RQ_COMMIT_DECOMPOSITION_CONTRACT', 1, {
                        contract: event.contract,
                    });
                    return false;
                });

                hook('dismantle', 'C_RQ_COMMIT_DECOMPOSITION_CONTRACT', 'raw', _ => false);
                break;
            }
        }
    }

    function disable(purpose) {
        if (hooks[purpose]) {
            hooks[purpose].forEach(h => mod.unhook(h));
            hooks[purpose] = [];
        }
    }

    // Main
    PURPOSES.forEach(purpose => {
        if (mod.settings[purpose])
            enable(purpose);
    });

    mod.command.add('instant', {
        $default(purpose) {
            if (PURPOSES.indexOf(purpose) < 0) {
                if (ui) {
                    ui.show();
                } else {
                    mod.command.message(purpose ? `Invalid mode: ${purpose}!` : 'Must specify mode!');
                    mod.command.message(`Valid modes: ${PURPOSES.join(', ')}`);
                }

                return;
            }

            if (mod.settings[purpose]) {
                disable(purpose);
                mod.command.message(`Instant ${purpose} disabled!`);
            } else {
                enable(purpose);
                mod.command.message(`Instant ${purpose} enabled!`);
            }

            mod.settings[purpose] = !mod.settings[purpose];
        }
    });

    // Settings UI
    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 232 });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};
