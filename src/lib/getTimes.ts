import { CALENDAR_URL } from '$env/static/private';

import ICAL from 'ical.js';

const response = await fetch(CALENDAR_URL);
const icalFile = await response.text();

const events = new ICAL.Component(ICAL.parse(icalFile)).getAllSubcomponents('vevent');
const getFullDayEventsOnDate = (date: Date) => {
	const targetDate = ICAL.Time.fromJSDate(date);
	return events.filter((event) => {
		const eventStart = event.getFirstPropertyValue('dtstart') as ICAL.Time | null;
		const eventEnd = event.getFirstPropertyValue('dtend') as ICAL.Time | null;
		if (!eventStart?.isDate || !eventEnd?.isDate) return false;
		return targetDate.compare(eventStart) >= 0 && targetDate.compare(eventEnd) < 0;
	});
};

const scheduledBlocksTimes: {
	[index: string]: {
		[index: number]: { start: Date; end: Date }[];
	};
} = {
	A: {
		1: [],
		2: [],
		3: [],
		4: []
	},
	B: {
		1: [],
		2: [],
		3: [],
		4: []
	}
};
const daysOfWeekTimes: {
	[index: string]: {
		[index: string]: { start: Date; end: Date }[];
	};
} = {
	monday: {
		lunch: [],
		afterSchool: []
	},
	tuesday: {
		afterSchool: []
	},
	wednesday: {
		flex: [],
		lunch: [],
		afterSchool: []
	},
	thursday: {
		flex: [],
		lunch: [],
		afterSchool: []
	},
	friday: {
		afterSchool: []
	}
};

const classesSchedule = (
	dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | '8-block'
) => {
	const schedule: {
		[index: string | number]: {
			start: { hour: number; minute: number };
			end: { hour: number; minute: number };
		} | null;
	} = {
		flex: null,
		1: null,
		2: null,
		lunch: null,
		3: null,
		4: null,
		afterSchool: {
			start: { hour: 15, minute: 15 },
			end: { hour: 16, minute: 15 }
		}
	};
	if (['monday'].includes(dayOfWeek)) {
		schedule.lunch = {
			start: { hour: 10, minute: 55 },
			end: { hour: 12, minute: 0 }
		};
	}
	if (['monday', 'tuesday', 'friday'].includes(dayOfWeek)) {
		schedule[1] = {
			start: { hour: 8, minute: 0 },
			end: { hour: 9, minute: 20 }
		};
		schedule[2] = {
			start: { hour: 9, minute: 30 },
			end: { hour: 10, minute: 50 }
		};
	}
	if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayOfWeek)) {
		schedule[3] = {
			start: { hour: 12, minute: 10 },
			end: { hour: 13, minute: 30 }
		};
		schedule[4] = {
			start: { hour: 13, minute: 40 },
			end: { hour: 15, minute: 0 }
		};
	}
	if (['wednesday', 'thursday'].includes(dayOfWeek)) {
		schedule.flex = {
			start: { hour: 7, minute: 45 },
			end: { hour: 8, minute: 25 }
		};
		schedule[1] = {
			start: { hour: 8, minute: 30 },
			end: { hour: 9, minute: 50 }
		};
		schedule[2] = {
			start: { hour: 10, minute: 0 },
			end: { hour: 11, minute: 20 }
		};
		schedule.lunch = {
			start: { hour: 11, minute: 25 },
			end: { hour: 12, minute: 0 }
		};
	}
	return schedule;
};
const objectToDate = (
	object: {
		hour: number;
		minute: number;
	},
	date: Date
) => {
	date.setHours(object.hour, object.minute, 0, 0);
	return new Date(date);
};
const getBlock = (day: string, block: number) => {
	if (['A Day (high school)', 'B Day (high school)'].includes(day)) return { day: day[0], block };
	else if (['C Day (high school)', 'D Day (high school)'].includes(day))
		return { day: String.fromCharCode(day.charCodeAt(0) - 2), block: ((block + 1) % 4) + 1 };
};

const currentDate = new Date();
const bounds = new Date();
bounds.setDate(bounds.getDate() + 15);
while (currentDate <= bounds) {
	const events = getFullDayEventsOnDate(currentDate).map((component) =>
		component.getFirstPropertyValue('summary')
	) as string[];
	if (
		events.some((eventName) =>
			[
				'A Day (high school)',
				'B Day (high school)',
				'C Day (high school)',
				'D Day (high school)',
				'8 block rotation (high school)'
			].includes(eventName as string)
		)
	) {
		const lowerCaseDay = [
			'sunday',
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday'
		][currentDate.getDay()];
		const dayOfWeek = events.includes('8 block rotation (high school)')
			? '8-block'
			: (lowerCaseDay as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday');
		const dayEvent = [
			'A Day (high school)',
			'B Day (high school)',
			'C Day (high school)',
			'D Day (high school)'
		].find((item) => events.includes(item));
		if (dayEvent) {
			for (let i = 1; i <= 4; i++) {
				const blockName = getBlock(dayEvent, i) as {
					day: string;
					block: number;
				};
				scheduledBlocksTimes[blockName.day][blockName.block].push({
					start: objectToDate(classesSchedule(dayOfWeek)[i]!.start, currentDate),
					end: objectToDate(classesSchedule(dayOfWeek)[i]!.end, currentDate)
				});
			}
		}
		for (const value of ['flex', 'lunch', 'afterSchool']) {
			if (classesSchedule(dayOfWeek)[value] !== null)
				daysOfWeekTimes[dayOfWeek][value].push({
					start: objectToDate(classesSchedule(dayOfWeek)[value]!.start, currentDate),
					end: objectToDate(classesSchedule(dayOfWeek)[value]!.end, currentDate)
				});
		}
	}
	currentDate.setDate(currentDate.getDate() + 1);
}

export { scheduledBlocksTimes, daysOfWeekTimes };
