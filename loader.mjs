import * as Path from "path";

// sets the root dir for imports to be process.cwd()
export function resolve(specifier, parentModuleUrl, defaultResolve) {
	if (typeof parentModuleUrl === "string" && specifier.startsWith("/")) {
		const path = Path.parse(`${process.cwd()}${specifier}`);

		if (path.ext === "")
			path.base = `${path.base}.mjs`;
		return { format: "esm", url: `file://${Path.format(path)}` };
	}
	return defaultResolve(specifier, parentModuleUrl);
}