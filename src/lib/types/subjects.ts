export interface Subject {
	code: string;
	parent: string[];
	name: string;
	formal: string;
	semester: number;
	credits: number;
	requires: number;
	parentc?: string[];
	codec?: string;
}

export interface FilledSubject extends Subject {
	parentc: string[];
	codec: string;
}
