export type AnyObject = Record<string, unknown>;

export class Document {
	_collection = '';
	_dbFields = ['uid'];
	_id = '';
	uid = '';

	constructor(data: unknown = {}, collection?: string, ...dbFields: string[]) {
		this._load(data);
		if (collection) this._collection = collection;
		this._dbFields.push(...dbFields);
	}

	protected _load(data: unknown) {
		if (data) {
			for (const key in data) {
				const value = (data as Record<string, unknown>)[key];
				const is_an_object = typeof value === 'object' && value !== null && !Array.isArray(value);

				Object.defineProperty(this, key, {
					value: is_an_object
						? {
								// Avoids overwriting default values if not defined in the data
								...((this as Record<string, unknown>)[key] as object),
								...value
							}
						: value,
					configurable: true,
					enumerable: true
				});
			}
		}
	}
}

export class UserData extends Document {
	subjects: string[] = [];
	starred: string[] = [];
	options: {
		code: boolean;
		credits: boolean;
		requires: boolean;
		progress: boolean;
		movement: boolean;
		optatives: boolean;
		visited_account: boolean;
	} = {
		code: true,
		credits: true,
		requires: true,
		progress: true,
		movement: true,
		optatives: true,
		visited_account: false
	};

	constructor(data: unknown = {}) {
		super(data, 'user_data', 'subjects', 'starred', 'options');
		this._load(data);
	}
}
