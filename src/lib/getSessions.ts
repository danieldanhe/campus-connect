import db from '$lib';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

import { scheduledBlocksTimes, daysOfWeekTimes } from '$lib/getTimes';

export const getStudentSessions = async (
	studentName: string,
	groupName: string,
	courseName: string
) => {
	const pastSessions = [];
	const futureSessions = [];

	const matchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', groupName, 'matchedSessions')
	);
	const unmatchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', groupName, 'unmatchedSessions')
	);

	for (const thisSession of [...matchedSessionsSnapshot.docs, ...unmatchedSessionsSnapshot.docs]) {
		if (thisSession.data().student === studentName && thisSession.data().course === courseName) {
			let tutorDoc;
			if (thisSession.data().tutor)
				tutorDoc = await getDoc(doc(db, 'users', thisSession.data().tutor));
			if (
				thisSession.data().start &&
				thisSession.data().end.toDate().getTime() < new Date().getTime()
			)
				pastSessions.unshift({
					tutor: tutorDoc?.data()?.name,
					start: thisSession.data().start.toDate(),
					end: thisSession.data().end.toDate(),
					goalDescription: thisSession.data().goalDescription
				});
			else
				futureSessions.unshift(
					thisSession.data().start
						? {
								tutor: tutorDoc?.data()?.name,
								start: thisSession.data().start.toDate(),
								end: thisSession.data().end.toDate(),
								goalDescription: thisSession.data().goalDescription
							}
						: {
								estimatedTime: thisSession.data().estimatedTime * 60,
								goalDescription: thisSession.data().goalDescription
							}
				);
		}
	}

	return [pastSessions, futureSessions];
};

export const getTutorSessions = async (tutorName: String, groupName: string) => {
	const pastSessions = [];
	const futureSessions = [];
	const unmatchedSessions = [];

	const matchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', groupName, 'matchedSessions')
	);
	const unmatchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', groupName, 'unmatchedSessions')
	);

	for (const thisSession of matchedSessionsSnapshot.docs) {
		if (thisSession.data().tutor === tutorName) {
			let studentDoc;
			if (thisSession.data().student)
				studentDoc = await getDoc(doc(db, 'users', thisSession.data().student));
			if (
				thisSession.data().start &&
				thisSession.data().end.toDate().getTime() < new Date().getTime()
			)
				pastSessions.unshift({
					student: studentDoc?.data()?.name,
					start: thisSession.data().start.toDate(),
					end: thisSession.data().end.toDate(),
					course: thisSession.data().course,
					goalDescription: thisSession.data().goalDescription
				});
			else
				futureSessions.unshift({
					student: studentDoc?.data()?.name,
					start: thisSession.data().start.toDate(),
					end: thisSession.data().end.toDate(),
					course: thisSession.data().course,
					goalDescription: thisSession.data().goalDescription
				});
		}
	}

	for (const thisSession of unmatchedSessionsSnapshot.docs) {
		let studentDoc;
		if (thisSession.data().student)
			studentDoc = await getDoc(doc(db, 'users', thisSession.data().student));
		const scheduledBlocks: {
			[index: string]: {
				[index: number]: boolean;
			};
		} = { A: studentDoc?.data()?.free.A, B: studentDoc?.data()?.free.B };
		const daysOfWeek: {
			[index: string]: {
				[index: string]: boolean;
			};
		} = Object(studentDoc?.data()?.free);
		delete daysOfWeek.A;
		delete daysOfWeek.B;
		const availableTimes: { start: Date; end: Date }[] = [];
		for (const day in scheduledBlocks) {
			for (const block in scheduledBlocks[day]) {
				if (scheduledBlocks[day][block]) {
					availableTimes.push(...scheduledBlocksTimes[day][block]);
				}
			}
		}
		for (const dayOfWeek in daysOfWeek) {
			for (const value in daysOfWeek[dayOfWeek]) {
				if (daysOfWeek[dayOfWeek][value]) {
					availableTimes.push(...daysOfWeekTimes[dayOfWeek][value]);
				}
			}
		}
		availableTimes.sort((a, b) => a.start.getTime() - b.start.getTime());
		unmatchedSessions.push({
			sessionId: thisSession.id,
			estimatedTime: thisSession.data().estimatedTime * 60,
			course: thisSession.data().course,
			goalDescription: thisSession.data().goalDescription,
			availableTimes: availableTimes
		});
	}

	return [pastSessions, futureSessions, unmatchedSessions];
};

export const getAdministratorSessions = async (groupName: string) => {
	const sessions = [];

	const matchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', groupName, 'matchedSessions')
	);
	const unmatchedSessionsSnapshot = await getDocs(
		collection(db, 'groups', groupName, 'unmatchedSessions')
	);

	for (const thisSession of [...matchedSessionsSnapshot.docs, ...unmatchedSessionsSnapshot.docs]) {
		let studentDoc;
		if (thisSession.data().student)
			studentDoc = await getDoc(doc(db, 'users', thisSession.data().student));
		let tutorDoc;
		if (thisSession.data().tutor)
			tutorDoc = await getDoc(doc(db, 'users', thisSession.data().tutor));
		thisSession.data().start
			? sessions.unshift({
					student: studentDoc?.data()?.name,
					tutor: tutorDoc?.data()?.name,
					start: thisSession.data().start.toDate(),
					end: thisSession.data().end.toDate(),
					course: thisSession.data().course,
					goalDescription: thisSession.data().goalDescription
				})
			: sessions.unshift({
					student: studentDoc?.data()?.name,
					estimatedTime: thisSession.data().estimatedTime * 60,
					course: thisSession.data().course,
					goalDescription: thisSession.data().goalDescription
				});
	}

	return sessions;
};
