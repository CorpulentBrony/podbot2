// this class is no longer currently being used
class ObservableArray extends Array {
	onValueChange(index, newValue, oldValue) { console.log({index, newValue, oldValue }); }
}

const ObservableArrayConstructor = new Proxy(ObservableArray, {
	construct(target, args, newTarget) {
		return new Proxy(Reflect.construct(target, args, newTarget), {
			deleteProperty(target, property) {
				const propertyInt = Number.parseInt(property);

				if (typeof property === "number" || propertyInt.toString() === property) {
					const oldValue = target[propertyInt];
					const result = Reflect.deleteProperty(target, property);
					target.onValueChange(property, undefined, oldValue);
					return result;
				}
				return Reflect.deleteProperty(target, property);;
			},
			set(target, property, value, receiver) {
				const propertyInt = Number.parseInt(property);
				const propertyIsInt = typeof property === "number" || propertyInt.toString() === property;
				const valueHasChanged = propertyIsInt && (!(propertyInt in target) || target[propertyInt] !== value);

				if (valueHasChanged) {
					const oldValue = target[propertyInt];
					const result = Reflect.set(target, property, value, receiver);
					target.onValueChange(property, value, oldValue);
					return result;
				}
				return Reflect.set(target, property, value, receiver);
			}
		});
	}
});

export { ObservableArrayConstructor as ObservableArray };