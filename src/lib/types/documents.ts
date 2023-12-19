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
			Object.assign(this, data);
		}
	}
}

export class UserData extends Document {
	subjects: string[] = [];
	options: {
		credits: boolean;
		requires: boolean;
	} = {
		credits: true,
		requires: true
	};

	constructor(data: unknown = {}) {
		super(data, 'user_data', 'subjects', 'options');
		this._load(data);
	}
}
