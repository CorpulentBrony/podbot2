import util from "./util";

const IGNORE_LIST_FILE = ".ignore_list.json";

class IgnoreList extends Map {
	constructor() {
		super();
		this.add = this.add.bind(this);
		this.delete = this.delete.bind(this);
	}
	add(id) {
		if (!super.has(id))
			super.set(id, undefined).onValueChange();
		return this;
	}
	delete(id) {
		if (super.has(id)) {
			super.delete(id);
			this.onValueChange();
			return true;
		}
		return false;
	}
	async get(id) {
		if (!super.has(id))
			return undefined;
		return super.get(id) ? super.get(id) : super.set(id, await this.client.fetchUser(id)).get(id);
	}
	async load() {
		if (!this.isLoaded)
			for (const id of JSON.parse(await util.readFile(IGNORE_LIST_FILE)))
				super.set(id, undefined);
		this.isLoaded = true;
		return this;
	}
	onValueChange() { util.writeFile(IGNORE_LIST_FILE, JSON.stringify(this)).catch(console.error); }
	set() { throw new Error("set method not implemented for IgnoreList"); }
	toJSON() { return Array.from(super.keys()); }
	async toString() {
		if (this.size === 0)
			return "Not currently ignoring anypony.";
		const result = [];

		for (const id of super.keys())
			result.push(await this.get(id));
		return result.map((user) => user.tag).join(", ");
	}
}
IgnoreList.prototype.client = undefined;
IgnoreList.prototype.isLoaded = false;

const ignoreList = new IgnoreList();
ignoreList.load().catch(console.error);
export { ignoreList as IgnoreList };