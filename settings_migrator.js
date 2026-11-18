const DefaultSettings = {
    "enchant": true,
    "upgrade": true,
    "soulbind": true,
    "merge": true,
    "dismantle": true,
    "cards": true,
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    // v2 adds cards while preserving all existing mode choices.
    if (from_ver === undefined || from_ver === null || from_ver === 1)
        return Object.assign({}, DefaultSettings, settings);
    throw new Error(`Unsupported settings migration: ${from_ver} -> ${to_ver}`);
}
