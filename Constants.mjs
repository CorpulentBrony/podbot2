export const BOT_ADMINS = ["81203047132307456" /* Corpulent Brony#1337 */];
export const Reacts = { DEL: "🗑", FIRST: "%E2%8F%AE" /* ⏮ */, LAST: "%E2%8F%AD" /* ⏭ */, NEXT: "⏩", PREV: "⏪", STOP: "⏹" };
export const ReactsDecoded = Object.entries(Reacts).reduce((ReactsDecoded, [reactName, reactEncoded]) => Object.assign(ReactsDecoded, { [reactName]: decodeURI(reactEncoded) }), {});
export const Emotes = Object.assign({ BAR_CHART: "📊", COMMENT: "💬", DOWN: "⬇", ERROR: "⚠", IMAGE: "🖼", NO_ENTRY: "⛔", PING: "🏓", STAR: "⭐", UP: "⬆" }, ReactsDecoded);