import * as Path from "path";
import { promisify } from "util";
import * as Fs from "fs";

const fsReadFile = promisify(Fs.readFile);
const fsWriteFile = promisify(Fs.writeFile);

export function arrayShuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.random() * (i + 1) >>> 0;
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function formatTimestamp(number) {
	const timestamp = new Date(number);
	const duration = [timestamp.getUTCDate() - 1, timestamp.getUTCHours(), timestamp.getUTCMinutes(), timestamp.getUTCSeconds() + timestamp.getUTCMilliseconds() / 1000];
	const labels = ["day", "hour", "minute", "second"];
	return duration.map((value, index) => pluralize(value, labels[index])).filter((value) => value !== "").join(", ");
}

function pluralize(number, noun, extraPluralLetters = "") {
	if (number === 0)
		return "";
	const ending = (number === 1) ? "" : `${extraPluralLetters}s`;
	return `${number.toString()} ${noun}${ending}`;
}

export async function readFile(file) { return fsReadFile(Path.join(process.cwd(), file), { encoding: "utf8" }); }

export function toString(value) {
	if (typeof value === "string" || value === undefined || value === null)
		return value;
	else if (typeof value === "object" && "toString" in value)
		return value.toString();
	return String(value);
}

export async function writeFile(file, data) { return fsWriteFile(Path.join(process.cwd(), file), data); }

const util = { arrayShuffle, formatTimestamp, readFile, toString, writeFile };
export default util;