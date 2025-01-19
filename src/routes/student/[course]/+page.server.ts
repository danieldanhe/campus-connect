import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import db from '$lib';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { getStudentSessions } from '$lib/getSessions';

const user = 'he47611';

let course: {
	name: string | null;
	group: string | null;
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
	group: null,
	posts: []
};

export const load: PageServerLoad = async ({ params }) => {
	course = { name: params.course, group: null, posts: [] };
	const groupsSnapshot = await getDocs(collection(db, 'groups'));
	for (const thisGroup of groupsSnapshot.docs) {
		const groupData = thisGroup.data();
		for (const thisCourse of groupData.courses) {
			if (thisCourse.name === course.name && thisCourse.students.includes(user)) {
				course.group = thisGroup.id;
				break;
			}
		}
		if (course.group) break;
	}

	if (!course.group) error(404, 'Not Found');

	const matchedSessionsCollection = collection(db, 'groups', course.group, 'matchedSessions');
	const unmatchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', course.group, 'unmatchedSessions')
	);
	for (const thisSession of unmatchedSessionsSnapshot.docs) {
		if (
			new Date().getTime() - thisSession.data().posted.toDate().getTime() >= 24 * 60 * 60 * 1000 &&
			thisSession.data().responded.length
		) {
			const responded =
				thisSession.data().responded[
					Math.floor(Math.random() * thisSession.data().responded.length)
				];
			await addDoc(matchedSessionsCollection, {
				course: thisSession.data().course,
				goalDescription: thisSession.data().goalDescription,
				student: thisSession.data().student,
				tutor: responded.tutor,
				start: responded.time.start.toDate(),
				end: responded.time.end.toDate()
			});
			await deleteDoc(thisSession.ref);
		}
	}

	const postsSnapshot = await getDocs(collection(db, 'groups', course.group, 'posts'));
	for (const thisPost of postsSnapshot.docs) {
		const postData = thisPost.data();
		if (postData.inCourses.includes(course.name)) {
			const authorDoc = await getDoc(doc(db, 'users', postData.author));
			course.posts.unshift({
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
	course.posts.sort((a, b) => b.timeValue - a.timeValue);

	const [pastSessions, futureSessions] = await getStudentSessions(
		user,
		course.group,
		course.name as string
	);

	return { course, pastSessions, futureSessions };
};

export const actions = {
	default: async ({ request }) => {
		try {
			const data = await request.formData();
			const goalDescription = data.get('goalDescription') as string;
			const estimatedTime = data.get('estimatedTime') as unknown as number;

			await addDoc(collection(db, 'groups', course.group, 'unmatchedSessions'), {
				goalDescription: goalDescription,
				estimatedTime: estimatedTime / 60,
				posted: new Date(),
				student: user,
				responded: [],
				course: course.name
			});

			return { success: true };
		} catch {
			error(400, 'Bad Request');
		}
	}
} satisfies Actions;
