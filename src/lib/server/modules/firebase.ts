import { getApp, initializeApp, cert, type App } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

import { FIREBASE_SERVER_CONFIG } from '$env/static/private';

import type { Document } from '$lib/types/documents';
import type { BaseAuth } from 'firebase-admin/auth';

function initializeFirebase() {
	try {
		getApp();
	} catch (error) {
		const serviceAccount = JSON.parse(atob(FIREBASE_SERVER_CONFIG));

		initializeApp({
			credential: cert(serviceAccount),
			databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
		});
	}
}

export async function decodeToken(
	token: string
): Promise<ReturnType<BaseAuth['verifyIdToken']> | null> {
	if (!token || token === 'null' || token === 'undefined') return null;
	try {
		initializeFirebase();
		return await getAuth().verifyIdToken(token);
	} catch (err) {
		console.error(err);
		return null;
	}
}

export async function getDocuments<T extends Document>(
	collectionPath: string,
	uid: string,
	mapper: new (data: unknown) => T
): Promise<Array<T>> {
	if (!uid) return [];
	initializeFirebase();
	const db = getFirestore();
	const querySnapshot = await db.collection(collectionPath).where('uid', '==', uid).get();
	const list: Array<T> = [];
	querySnapshot.forEach((doc) => {
		const document = doc.data(); // Just need the data on the server
		document._id = doc.id;
		list.push(new mapper(document));
	});
	return list;
}

export async function createDocument<T extends Document>(
	collectionPath: string,
	uid: string,
	mapper: new (data: unknown) => T
): Promise<T> {
	initializeFirebase();
	const db = getFirestore();
	const doc = await db.collection(collectionPath).add({ uid });

	return new mapper({ uid, _id: doc.id });
}
