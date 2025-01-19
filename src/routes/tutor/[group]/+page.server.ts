import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import db from '$lib';
import { arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { getTutorSessions } from '$lib/getSessions';

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
		if (
			postData.inCourses.filter((item: String) =>
				groupDoc
					.data()
					.tutors.find((tutor: { name: string; canTutor: string[] }) => tutor.name === user)
					.canTutor.includes(item)
			).length > 0
		) {
			const authorDoc = await getDoc(doc(db, 'users', postData.author));
			group.posts.unshift({
				author: {
					name: authorDoc.data()?.name,
					image: authorDoc.data()?.image
				},
				content: postData.content,
				time: format(postData.time.toDate(), 'EEE d MMM yyyy, HH:mm', { locale: enGB }),
				timeValue: postData.time.toDate().getTime()
			});
		}
	}
	group.posts.sort((a, b) => b.timeValue - a.timeValue);

	const [pastSessions, futureSessions, unmatchedSessions] = await getTutorSessions(
		user,
		group.name as string
	);

	return { group, pastSessions, futureSessions, unmatchedSessions };
};

export const actions = {
	default: async ({ request }) => {
		try {
			const data = await request.formData();
			const sessionId = data.get('sessionId');
			const startingTime = new Date(data.get('startingTime') as string) as Date;

			const session = doc(
				db,
				'groups',
				group.name as string,
				'unmatchedSessions',
				sessionId as string
			);
			if (!(await getDoc(session)).exists) throw new Error('Session does not exist');

			const estimatedTime = (await getDoc(session)).data()?.estimatedTime;
			const endingTime = new Date(startingTime.getTime() + estimatedTime * 60 * 60 * 1000);

			await updateDoc(session, {
				responded: arrayUnion({
					tutor: user,
					time: {
						start: startingTime,
						end: endingTime
					}
				})
			});

			return { success: true };
		} catch {
			error(400, 'Bad Request');
		}
	}
} satisfies Actions;
