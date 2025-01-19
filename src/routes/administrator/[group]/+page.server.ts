import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import db from '$lib';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { getAdministratorSessions } from '$lib/getSessions';

const user = 'he47611';

let group: {
	name: string | null;
	posts: {
		author: {
			name: string;
			image: string;
		};
		content: string;
		time: string;
		timeValue: number;
	}[];
} = {
	name: null,
	posts: []
};

export const load: PageServerLoad = async ({ params }) => {
	group = { name: params.group as string, posts: [] };

	const groupDoc = await getDoc(doc(db, 'groups', group.name as string));
	if (!groupDoc.exists()) error(404, 'Not Found');

	const postsSnapshot = await getDocs(collection(db, 'groups', group.name as string, 'posts'));
	for (const thisPost of postsSnapshot.docs) {
		const postData = thisPost.data();
		const authorDoc = await getDoc(doc(db, 'users', postData.author));
		group.posts.push({
			author: {
				name: authorDoc.data()?.name,
				image: authorDoc.data()?.image
			},
			content: postData.content,
			time: format(postData.time.toDate(), 'EEE d MMM yyyy, HH:mm', { locale: enGB }),
			timeValue: postData.time.toDate().getTime()
		});
	}
	group.posts.sort((a, b) => b.timeValue - a.timeValue);

	const sessions = await getAdministratorSessions(group.name as string);

	const selfDoc = await getDoc(doc(db, 'users', user));
	const selfInfo = { name: selfDoc.data()?.name, image: selfDoc.data()?.image };

	const courses = groupDoc
		.data()
		.courses.map((course: { name: string; students: string[] }) => course.name);

	return { group, sessions, selfInfo, courses };
};

export const actions = {
	default: async ({ request }) => {
		try {
			const data = await request.formData();
			const content = data.get("content") as string;
			const inCourses = data.getAll("courses") as string[];

			await addDoc(collection(db, 'groups', group.name as string, 'posts'), {
				author: user,
				content: content,
				inCourses: inCourses,
				time: new Date()
			});

			return { success: true };
		} catch {
			error(400, 'Bad Request');
		}
	}
} satisfies Actions;
