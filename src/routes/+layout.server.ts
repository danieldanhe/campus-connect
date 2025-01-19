import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import db from '$lib';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

const user = 'he47611';

export const load: PageServerLoad = async ({ params }) => {
	if (!(await getDoc(doc(db, 'users', user))).exists()) error(403, 'Forbidden');

	const student: string[] = [];
	const tutor: string[] = [];
	const administrator: string[] = [];

	const groupsSnapshot = await getDocs(collection(db, 'groups'));
	for (const thisGroup of groupsSnapshot.docs) {
		for (let i = 0; i < thisGroup.data().courses.length; i++) {
			const thisCourse: { name: string; students: string[] } = thisGroup.data().courses[i];
			if ((thisCourse as unknown as { name: string; students: string[] }).students.includes(user))
				student.push(thisCourse.name);
		}
		if (
			thisGroup
				.data()
				.tutors.some((tutor: { canTutor: string[]; name: string }) => tutor.name === user)
		)
			tutor.push(thisGroup.id);
		if (thisGroup.data().administrators.includes(user)) administrator.push(thisGroup.id);
	}

	return { student, tutor, administrator };
};
