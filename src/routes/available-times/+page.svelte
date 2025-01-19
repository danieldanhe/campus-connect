<script lang="ts">
	import Button, { Icon, Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import TimeButton from './TimeButton.svelte';

	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	import { enhance } from '$app/forms';

	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

	let step = $state(0);

	let scheduledBlocks: {
		[index: string]: {
			[index: number]: boolean;
		};
	} = $state({
		A: {
			1: false,
			2: false,
			3: false,
			4: false
		},
		B: {
			1: false,
			2: false,
			3: false,
			4: false
		}
	});
	let daysOfWeek: {
		[index: string]: {
			[index: string]: boolean | null;
		};
	} = $state({
		monday: {
			flex: null,
			lunch: false,
			afterSchool: false
		},
		tuesday: {
			flex: null,
			lunch: null,
			afterSchool: false
		},
		wednesday: {
			flex: false,
			lunch: false,
			afterSchool: false
		},
		thursday: {
			flex: false,
			lunch: false,
			afterSchool: false
		},
		friday: {
			flex: null,
			lunch: null,
			afterSchool: false
		}
	});
	const daysLabel = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
	const timesLabel = ['Flex', 'Lunch', 'After school'];

	let availableTimes: { start: Date; end: Date }[] = [];
	let sortedTimes: {
		date: Date;
		times: { start: { hour: number; minute: number }; end: { hour: number; minute: number } }[];
	}[] = [];

	$effect(() => {
		availableTimes = [];
		for (const day in scheduledBlocks) {
			for (const block in scheduledBlocks[day]) {
				if (scheduledBlocks[day][block]) {
					availableTimes.push(...data.scheduledBlocksTimes[day][block]);
				}
			}
		}
		for (const dayOfWeek in daysOfWeek) {
			for (const value in daysOfWeek[dayOfWeek]) {
				if (daysOfWeek[dayOfWeek][value]) {
					availableTimes.push(...data.daysOfWeekTimes[dayOfWeek][value]);
				}
			}
		}
		availableTimes.sort((a, b) => a.start.getTime() - b.start.getTime());
		sortedTimes = [];
		const currentDate = new Date();
		const bounds = new Date();
		bounds.setDate(bounds.getDate() + 15);
		currentDate.setHours(0, 0, 0, 0);
		while (currentDate <= bounds) {
			sortedTimes.push({ date: new Date(currentDate), times: [] });
			currentDate.setDate(currentDate.getDate() + 1);
		}
		for (const time of availableTimes) {
			const containingDay = new Date(time.start);
			containingDay.setHours(0, 0, 0, 0);
			sortedTimes[
				sortedTimes.findIndex((element) => element.date.getTime() === containingDay.getTime())
			].times.push({
				start: { hour: time.start.getHours(), minute: time.start.getMinutes() },
				end: { hour: time.end.getHours(), minute: time.end.getMinutes() }
			});
		}
	});
</script>

<title>Available times</title>

{#if form?.success}
	<p class="success-message container">Your available times have been submitted successfully.</p>
{:else}
	<div class="container">
		{#if step === 0}
			<hgroup class="description">
				<h1 class="heading">Select availability</h1>
				<p class="supporting">
					Choose the general time frames during school hours when you’re available. Specify how long
					your availability lasts. After setting your general availability, you’ll be able to adjust
					individual time frames in the next step. For example, if you’re available Mondays after
					school but can’t make it this week, you can update that later.
				</p>
			</hgroup>
			<div class="grids">
				<DataTable table$aria-label="Scheduled blocks" style="max-width: 100%;">
					<Head>
						<Row>
							<Cell>Schedule day</Cell>
							<Cell>1st block</Cell>
							<Cell>2nd block</Cell>
							<Cell>3rd block</Cell>
							<Cell>4th block</Cell>
							<!-- Prevents row selection from affecting background colours -->
							<Cell style="display: none;"><Checkbox /></Cell>
						</Row>
					</Head>
					<Body>
						{#each Object.keys(scheduledBlocks) as day}
							<Row>
								<Cell>{day}</Cell>
								{#each Object.keys(scheduledBlocks[day]) as block}
									<Cell checkbox>
										<Checkbox
											input$aria-label={day + block}
											bind:checked={scheduledBlocks[day][block as unknown as number]}
										/>
									</Cell>
								{/each}
								<Cell style="display: none;"><Checkbox /></Cell>
							</Row>
						{/each}
					</Body>
				</DataTable>
				<DataTable table$aria-label="Days of week" style="max-width: 100%;">
					<Head>
						<Row>
							<Cell>Day of week</Cell>
							<Cell>Flex (0745–0825)</Cell>
							<Cell>Lunch</Cell>
							<Cell>After school (1515–1615)</Cell>
							<Cell style="display: none;"><Checkbox /></Cell>
						</Row>
					</Head>
					<Body>
						{#each Object.keys(daysOfWeek) as day, i}
							<Row>
								<Cell>{daysLabel[i]}</Cell>
								{#each Object.keys(daysOfWeek[day]) as block, j}
									<Cell checkbox>
										{#if daysOfWeek[day][block] !== null}
											<Checkbox
												input$aria-label={daysLabel[i] + ' ' + timesLabel[j]}
												bind:checked={daysOfWeek[day][block]}
											/>
										{/if}
									</Cell>
								{/each}
								<Cell style="display: none;"><Checkbox /></Cell>
							</Row>
						{/each}
					</Body>
				</DataTable>
			</div>
			<Button class="action" variant="outlined" onclick={() => (step = 1)}>
				<Icon class="material-symbols-outlined">arrow_forward</Icon>
				<Label>Next step</Label>
			</Button>
			<div class="action-grid"></div>
		{:else if step === 1}
			<hgroup class="description">
				<h1 class="heading">Refine specific dates</h1>
				<p class="supporting">
					Adjust individual time frames by adding or removing specific times outside of your general
					school schedule within the next two weeks, including for extended hours after school or
					over the weekends. Note that you may encounter less tutors who are available during these
					times. Click times to remove them. <strong>Not available yet</strong>
				</p>
			</hgroup>
			<ul class="times" role="list">
				<li class="add-time-item">
					<Button variant="outlined" class="add-time-button" disabled>
						<Icon class="material-symbols-outlined">add</Icon>
						<Label>Add time</Label>
					</Button>
				</li>
				{#each sortedTimes as dateElement}
					<li class="day">
						<h2 class="date-label">
							{format(dateElement.date, 'EEEE d MMMM yyyy', { locale: enGB })}
						</h2>
						{#if dateElement.times.length}
							{#each dateElement.times as time}
								<!--
								onDeselected={() => {
									const toRemove = getDate(dateElement, time);
									if (toRemove) removeTimes.push(toRemove);
								}}
								onSelected={() => {
									const toAdd = getDate(dateElement, time);
									if (toAdd) addTimes.push(toAdd);
								}}
							-->
								<TimeButton {time} onDeselected={() => {}} onSelected={() => {}} />
							{/each}
						{:else}<p class="none">No available times</p>{/if}
					</li>
				{/each}
			</ul>
			<form class="action-grid" method="post" use:enhance>
				<input type="hidden" name="scheduledBlocks" value={JSON.stringify(scheduledBlocks)} />
				<input type="hidden" name="daysOfWeek" value={JSON.stringify(daysOfWeek)} />
				<Button class="back" onclick={() => (step = 0)} type="button">
					<Icon class="material-symbols-outlined">arrow_back</Icon>
					<Label>Back</Label>
				</Button>
				<Button class="forward" variant="raised" type="submit">
					<Icon class="material-symbols-outlined">send</Icon>
					<Label>Submit</Label>
				</Button>
			</form>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '@material/theme' with (
		$background: rgb(247 249 255),
		$error: rgb(144 74 68),
		$primary: rgb(42 99 138),
		$secondary: rgb(140 79 40),
		$surface: rgb(247 249 255)
	);
	@use '@material/typography' with (
		$font-family: unquote(
				'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol'
			),
		$styles-subtitle2: (
			line-height: 1.25rem,
			letter-spacing: 0.0178571429em
		),
		$styles-button: (
			text-transform: none,
			letter-spacing: 0.0178571429em
		),
		$styles-overline: (
			text-transform: none,
			letter-spacing: 0.0178571429em
		)
	);
	@use '@material/shape' with (
		$medium-component-radius: 8px
	);

	.success-message {
		padding-top: 2em;
		padding-bottom: 2em;
		@include typography.typography(subtitle1);
	}
	.container {
		padding-top: 2em;
		.description {
			margin-bottom: 1em;
			.heading {
				@include typography.typography(headline3);
				margin: 0 0 0.25em;
			}
			.supporting {
				@include typography.typography(body1);
				margin: 0;
			}
		}
		.grids,
		.times {
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
			gap: 1em;
		}
		.times {
			margin: 0;
			padding: 0;
			list-style-type: none;
			align-items: stretch;
			.add-time-item {
				:global(.add-time-button) {
					width: 100%;
				}
			}
			.day {
				.date-label {
					@include typography.typography(headline6);
					margin: 0;
				}
				.none {
					@include typography.typography(subtitle1);
					@include theme.property(color, text-secondary-on-light);
					margin: 0;
				}
			}
		}
		:global(.action) {
			margin-top: 1em;
			width: 100%;
		}
		.action-grid {
			margin-top: 1em;
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: stretch;
			align-items: center;
			gap: 1em;
			:global(.back) {
				flex: 1 0;
			}
			:global(.forward) {
				flex: 5 0;
			}
		}
	}
</style>
