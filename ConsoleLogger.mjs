const SEQUENCES = {
	BLINK: "\x1b[5m",
	BRIGHT: "\x1b[1m",
	DIM: "\x1b[2m",
	HIDDEN: "\x1b[8m",
	RESET: "\x1b[0m",
	REVERSE: "\x1b[7m",
	UNDERLINE: "\x1b[4m",
	colors: {
		bg: { BLACK: "\x1b[40m", BLUE: "\x1b[44m", CYAN: "\x1b[46m", GREEN: "\x1b[42m", MAGENTA: "\x1b[45m", RED: "\x1b[41m", WHITE: "\x1b[47m", YELLOW: "\x1b[43m" },
		fg: { BLACK: "\x1b[30m", BLUE: "\x1b[34m", CYAN: "\x1b[36m", GREEN: "\x1b[32m", MAGENTA: "\x1b[35m", RED: "\x1b[31m", WHITE: "\x1b[37m", YELLOW: "\x1b[33m" }
	}
};
// const DEFAULT_LOG_FORMAT = `${SEQUENCES.colors.fg.BLUE}[%s]${SEQUENCES.colors.fg.MAGENTA}%s${SEQUENCES.RESET}`;

export class ConsoleLogger {
	// constructor(format = DEFAULT_LOG_FORMAT) {
		// this.format = (typeof format === "string") ? format : DEFAULT_LOG_FORMAT;
	// }
	log(message) {
		const now = new Date();
		console.log(`${SEQUENCES.colors.fg.CYAN}[${now.toISOString()}] ${SEQUENCES.colors.fg.MAGENTA}${message}${SEQUENCES.RESET}`);
	}
}
// ConsoleLogger.prototype.format = DEFAULT_LOG_FORMAT;
ConsoleLogger.sequences = SEQUENCES;