export const Reacts = { DEL: "🗑", FIRST: "%E2%8F%AE" /* ⏮ */, LAST: "%E2%8F%AD" /* ⏭ */, NEXT: "⏩", PREV: "⏪", STOP: "⏹" };
export const ReactsDecoded = Object.entries(Reacts).reduce((ReactsDecoded, [reactName, reactEncoded]) => Object.assign(ReactsDecoded, { [reactName]: decodeURI(reactEncoded) }), {});
export const Emotes = Object.assign({ BAR_CHART: "📊", COMMENT: "💬", DOWN: "⬇", ERROR: "⚠", IMAGE: "🖼", NO_ENTRY: "⛔", PING: "🏓", STAR: "⭐", UP: "⬆" }, ReactsDecoded);