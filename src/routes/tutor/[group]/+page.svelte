<script lang="ts">
	import Avatar from 'svelte-avatar';
	import Banner from '@smui/banner';
	import Button, { Icon, Label } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Dialog, { Header, Title, Content, Actions } from '@smui/dialog';
	import Tab from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import Textfield from '@smui/textfield';

	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	import { enhance } from '$app/forms';

	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

	let tabs = [
		{
			icon: 'description',
			label: 'Updates'
		},
		{
			icon: 'school',
			label: 'Tutoring sessions'
		}
	];
	let active = $state(tabs[0]);

	let proposeOpen = $state(Array(data.unmatchedSessions.length).fill(false));
	let dates: string[] = $state(Array(data.unmatchedSessions.length).fill(''));
</script>

{#if form?.success}
	<Banner open fixed mobileStacked content$style="max-width: max-content;">
		{#snippet label()}
			<Label>Your tutoring time proposal has been submitted successfully.</Label>
		{/snippet}
		{#snippet actions()}
			<Button>OK</Button>
		{/snippet}
	</Banner>
{/if}

<title>{data.group.name}</title>
<hgroup class="container hgroup">
	<h1 class="title">{data.group.name}</h1>
</hgroup>

<div class="container">
	<TabBar {tabs} key={(tab) => tab.label} bind:active class="tab-bar">
		{#snippet tab(tab)}
			<Tab {tab}>
				<Icon class="material-symbols-outlined">{tab.icon}</Icon>
				<Label>{tab.label}</Label>
			</Tab>
		{/snippet}
	</TabBar>
	{#if active.label === 'Updates'}
		<ul class="posts" role="list">
			{#each data.group.posts as post}
				<li class="post mdc-card mdc-card--outlined">
					<div class="author">
						<Avatar src={post.author.image} name={post.author.name} size="40px" />
						<hgroup class="textual">
							<h2 class="name">
								<span class="sr-only">
									Post by{' '}
								</span>
								{post.author.name}
							</h2>
							<p class="date">{post.time}</p>
						</hgroup>
					</div>
					<div class="content"><p>{post.content}</p></div>
				</li>
			{/each}
		</ul>
	{:else if active.label === 'Tutoring sessions'}
		<h2 class="tutoring-header">Unmatched sessions</h2>
		<DataTable class="tutoring-list">
			<Head>
				<Row>
					<Cell>Estimated time</Cell>
					<Cell>Course</Cell>
					<Cell>Goal description</Cell>
					<Cell><span class="sr-only">Propose time</span></Cell>
				</Row>
			</Head>
			<Body>
				{#each data.unmatchedSessions as unmatchedSession, index}
					<Row>
						<Cell>{unmatchedSession.estimatedTime} minutes</Cell>
						<Cell>{unmatchedSession.course}</Cell>
						<Cell>{unmatchedSession.goalDescription}</Cell>
						<Cell>
							<Button onclick={() => (proposeOpen[index] = true)}>
								<Label>Propose time</Label>
							</Button>
						</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
		{#each data.unmatchedSessions as unmatchedSession, index}
			<Dialog
				bind:open={proposeOpen[index]}
				aria-labelledby={'propose-' + index + '-title'}
				aria-describedby={'propose-' + index + '-content'}
			>
				<Header>
					<Title id={'propose-' + index + '-title'}>Propose time</Title>
				</Header>
				<Content id={'propose-' + index + '-content'}>
					<p class="goal-description">{unmatchedSession.goalDescription}</p>
					<form class="propose" id="propose-form" method="POST" use:enhance>
						<input type="hidden" name="sessionId" value={unmatchedSession.sessionId} />
						<Textfield
							variant="outlined"
							bind:value={dates[index]}
							label="Starting date and time"
							type="datetime-local"
							class="starting-time"
							input$name="startingTime"
						/>
					</form>
					<div class="available-times">
						Available times: {unmatchedSession.availableTimes
							.map(
								(time: { start: Date; end: Date }) =>
									format(time.start, 'EEE d MMM yyyy hhmm', { locale: enGB }) +
									'–' +
									format(time.end, 'hhmm', { locale: enGB })
							)
							.join(', ')}
					</div>
				</Content>
				<Actions>
					<Button action="reject">
						<Label>Cancel</Label>
					</Button>
					<Button action="submit" defaultAction form="propose-form" variant="unelevated">
						<Icon class="material-symbols-outlined">send</Icon>
						<Label>Submit</Label>
					</Button>
				</Actions>
			</Dialog>
		{/each}
		<h2 class="tutoring-header">In-progress and upcoming matched sessions</h2>
		<DataTable class="tutoring-list">
			<Head>
				<Row>
					<Cell>Student</Cell>
					<Cell>Start time</Cell>
					<Cell>End time</Cell>
					<Cell>Course</Cell>
					<Cell>Goal description</Cell>
				</Row>
			</Head>
			<Body>
				{#each data.futureSessions as futureSession}
					<Row>
						<Cell>{futureSession.student}</Cell>
						<Cell>{format(futureSession.start, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						<Cell>{format(futureSession.end, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						<Cell>{futureSession.course}</Cell>
						<Cell>{futureSession.goalDescription}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
		<h2 class="tutoring-header">Completed sessions</h2>
		<DataTable class="tutoring-list">
			<Head>
				<Row>
					<Cell>Student</Cell>
					<Cell>Start time</Cell>
					<Cell>End time</Cell>
					<Cell>Course</Cell>
					<Cell>Goal description</Cell>
				</Row>
			</Head>
			<Body>
				{#each data.pastSessions as pastSession}
					<Row>
						<Cell>{pastSession.student}</Cell>
						<Cell>{format(pastSession.start, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						<Cell>{format(pastSession.end, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						<Cell>{pastSession.course}</Cell>
						<Cell>{pastSession.goalDescription}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	{/if}
</div>

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
	@use '@material/card';

	.hgroup {
		width: 100%;
		padding: 2em 1.5em 0;
		.title {
			@include typography.typography(headline4);
			@media (min-width: 900px) {
				@include typography.typography(headline3);
			}
			margin: 0;
		}
	}
	.posts {
		margin: 0;
		padding: 0;
		list-style-type: none;
		.post {
			margin: 1em 0 0;
			padding: 0.5em 0;
			list-style-type: none;
			.author {
				padding: 0 24px;
				height: 56px;
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: center;
			}
			.textual {
				margin-left: 1em;
				flex-grow: 1;
				.name {
					margin: 0;
					@include typography.typography(subtitle2);
					line-height: 1.25rem;
				}
				.date {
					@include typography.typography(caption);
					margin: 0;
					line-height: 1rem;
					@include theme.property(color, text-secondary-on-light);
				}
			}
			.content {
				@include typography.typography(body2);
				p,
				ul,
				ol {
					margin: 0 0 0.5em;
				}
				padding: 0 1.5em;
				white-space: pre-wrap;
			}
		}
	}
	.tutoring-header {
		@include typography.typography(headline5);
		margin: 1em 0 0.25em;
	}
	:global(.tutoring-list) {
		max-width: 100%;
		:global(.mdc-data-table__cell) {
			max-width: 256px;
		}
	}
	.goal-description {
		white-space: pre-wrap;
	}
	.propose {
		margin-top: 1em;
	}
	:global(.starting-time) {
		width: 100%;
	}
	.available-times {
		margin-top: 1em;
		@include typography.typography(body2);
	}
</style>
