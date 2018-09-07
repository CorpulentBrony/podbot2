import { ObservableArray } from "./ObservableArray";
import * as Path from "path";
import { promisify } from "util";
import { readFile, writeFile } from "fs";

const IGNORE_LIST_FILE = ".ignore_list.json";

export class IgnoreList extends ObservableArray {
	onValueChange(index, newValue, oldValue) {

	}
	async readFile() {

	}
}