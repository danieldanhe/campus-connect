import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import db from '$lib';
import { doc, updateDoc } from 'firebase/firestore';
import { scheduledBlocksTimes, daysOfWeekTimes } from '$lib/getTimes';

const user = 'he47611';

export const load: PageServerLoad = async ({ params }) => {
	return { scheduledBlocksTimes, daysOfWeekTimes };
};

export const actions = {
	default: async ({ request }) => {
		try {
			const data = await request.formData();
			const scheduledBlocks = JSON.parse(data.get('scheduledBlocks') as string);
			const daysOfWeek = JSON.parse(data.get('daysOfWeek') as string);
			
			const combined = { ...scheduledBlocks, ...daysOfWeek };
			for (const day in combined) {
				if (combined.hasOwnProperty(day)) {
					combined[day] = Object.fromEntries(
						Object.entries(combined[day]).filter(([key, value]) => value !== null)
					);
				}
			}

			const userDoc = doc(db, 'users', user);
			updateDoc(userDoc, { free: combined });

			return { success: true };
		} catch {
			error(400, 'Bad Request');
		}
	}
} satisfies Actions;
