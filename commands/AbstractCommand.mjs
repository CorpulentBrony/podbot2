const ALIASES = [];

export class AbstractCommand {
	static attach(obj) {
		if (this.name.startsWith("Abstract"))
			return;
		const exec = this.bindWithSelf ? this.exec.bind(this) : this.exec;
		obj[this.name] = exec;
		this.ALIASES.forEach((alias) => obj[alias] = exec);
	}
	static async exec(message, args) { throw new Error("Attempted to attach a command without a defined exec method."); }
}
AbstractCommand.ALIASES = ALIASES;
AbstractCommand.bindWithSelf = true;