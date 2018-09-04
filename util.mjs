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

export function toString(value) {
	if (typeof value === "string" || value === undefined || value === null)
		return value;
	else if (typeof value === "object" && "toString" in value)
		return value.toString();
	return String(value);
}

const util = { formatTimestamp, toString };
export default util;