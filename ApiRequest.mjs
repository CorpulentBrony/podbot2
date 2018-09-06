import { HttpRequest } from "./HttpRequest";

// could this be flattened into HttpRequest?
export class ApiRequest extends HttpRequest {
	getBidirectionalIterator(current) {
		const request = this;
		const first = function() {
			this.index = 0;
			return this.current();
		};
		const last = function() {
			this.index = request.results.length - 1;
			return this.current();
		};
		const next = function() {
			this.index = ++this.index % request.results.length;
			return this.current();
		};
		const prev = function() {
			if (--this.index < 0)
				this.index += request.results.length;
			return this.current();
		};
		const result = { first, index: 0, last, next, prev };
		result.current = current.bind(result);
		return result;
	}
}
ApiRequest.prototype.length = 0;
ApiRequest.prototype.results = [];