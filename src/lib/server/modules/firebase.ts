import admin from 'firebase-admin';
import { FIREBASE_SERVER_CONFIG } from '$env/static/private';

import type { Document } from '$lib/types/documents';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

function base64ToBytes(base64: string) {
	const binString = atob(base64);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Copy pasted from https://developer.mozilla.org/en-US/docs/Glossary/Base64
	return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function initializeFirebase() {
	if (!admin.apps.length) {
		const serviceAccount = JSON.parse(
			new TextDecoder().decode(base64ToBytes(FIREBASE_SERVER_CONFIG))
		);

		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
		});
	}
}

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
	if (!token || token === 'null' || token === 'undefined') return null;
	try {
		initializeFirebase();
		return await admin.auth().verifyIdToken(token);
	} catch (err) {
		console.error(err);
		return null;
	}
}

export async function getDocuments(collectionPath: string, uid: string): Promise<Array<Document>> {
	if (!uid) return [];
	initializeFirebase();
	const db = admin.firestore();
	const querySnapshot = await db.collection(collectionPath).where('uid', '==', uid).get();
	const list: Array<Document> = [];
	querySnapshot.forEach((doc) => {
		const document: Document = <Document>doc.data(); // Just need the data on the server
		document._id = doc.id;
		list.push(document);
	});
	return list;
}

export async function createDocument(collectionPath: string, uid: string): Promise<Document> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	const document = <Document>doc.data(); // Just need the data on the server
	document._id = doc.id;
	return document;
}
