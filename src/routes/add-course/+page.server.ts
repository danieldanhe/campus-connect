import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import db from '$lib';
import { arrayUnion, collection, getDocs, updateDoc } from 'firebase/firestore';

const user = 'he47611';

export const load: PageServerLoad = async ({ params }) => {
	const coursesList: { group: string; courses: string[] }[] = [];

	const groupsSnapshot = await getDocs(collection(db, 'groups'));
	for (const thisGroup of groupsSnapshot.docs) {
		const coursesInGroup: string[] = [];
		for (const thisCourse of thisGroup.data().courses) coursesInGroup.push(thisCourse.name);
		coursesList.push({ group: thisGroup.id, courses: coursesInGroup });
	}

	return { coursesList };
};

export const actions = {
	default: async ({ request }) => {
		//try {
			const data = await request.formData();
			const courseName = data.get('courseName') as string;

			const groupsSnapshot = await getDocs(collection(db, 'groups'));
			for (const thisGroup of groupsSnapshot.docs) {
				for (let i = 0; i < thisGroup.data().courses.length; i++) {
					const thisCourse = thisGroup.data().courses[i];
					if (thisCourse.name === courseName)
						await updateDoc(thisGroup.ref, {
							['courses.' + i + '.students']: arrayUnion(user)
						});
				}
			}

			return { success: true };
		//} catch(e) {
		//	error(400, 'Bad Request');
		//}
	}
} satisfies Actions;
