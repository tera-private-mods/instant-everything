# instant-everything
Removes the annoying animation and skips the progress bar for enchanting, upgrading, soulbinding, dismantling, and merging items.

Each mode can be toggled by using the in-game command `instant [mode]`, with `[mode]` being `enchant`, `upgrade`, `soulbind`, `merge`, `dismantle`, or `cards`.

## Card fusion / Слияние фрагментов карт

`cards` skips the starting animation and every result animation: normal result,
rank upgrade, jackpot, and selective fusion failure. The game still receives and
records each real server result before continuing the requested number of fusions.
Results remain in the normal result list. Cancel stops the pending frame callback.

Built for TERA 100.02 x64. Start Toolbox before TERA. Toolbox loads the bundled
`client/S1UI_CardComposeWindow.gpk` through its native ClientMod installer and
removes the temporary override when the client closes. No game mapper or original
archive is replaced. `cards` is enabled by default. After changing `instant cards`
or its settings checkbox, restart TERA. After installing, fully exit TERA to the
desktop, restart Toolbox, then launch TERA. Reconnecting Toolbox to an already
running game does not install client packages.

Пропускаются начальная анимация и все исходы: обычное слияние, повышение ранга,
джекпот и неудача выборочного слияния. Результаты остаются в штатном списке.
Количество слияний и переход к следующему определяет исходный контроллер игры.
Режим включён по умолчанию; команда `instant cards` переключает его со следующего
запуска TERA. После установки полностью закройте TERA до рабочего стола,
перезапустите Toolbox, затем заново запустите TERA.

Version 1.2.0 preserves all 20 package exports, all 7 embedded component movies,
all 8 texture payloads, and their original allocation and reference tables.
Only the result panel's ActionScript changes. All referenced component movies
and textures resolve inside the bundle. No startup status message is printed.

В версии 1.2.0 исправлена упаковка: сохранены все 20 объектов, встроенные
компоненты, текстуры и служебные ссылки исходного окна. В первой сборке часть
объектов была удалена при сохранённой таблице размещения текстур. Проверка
сборки теперь выявляет эту ошибку и отклоняет прежний повреждённый пакет.

Upstream auto-update is disabled for this local version so it does not overwrite
the added card support. Existing item modes and settings are retained.
