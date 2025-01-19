<script lang="ts">
	import Avatar from 'svelte-avatar';
	import Banner from '@smui/banner';
	import Button, { Icon, Label } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Dialog, { Header, Title, Content, Actions } from '@smui/dialog';
	import Slider from '@smui/slider';
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
			label: 'Tutoring'
		}
	];
	let active = $state(tabs[0]);

	let goalDescription = $state('');
	let requestOpen = $state(false);
</script>

{#if form?.success}
	<Banner open fixed mobileStacked content$style="max-width: max-content;">
		{#snippet label()}
			<Label>Your tutoring request has been submitted successfully.</Label>
		{/snippet}
		{#snippet actions()}
			<Button>OK</Button>
		{/snippet}
	</Banner>
{/if}

<title>{data.course.name}</title>
<hgroup class="container hgroup">
	<h1 class="title">{data.course.name}</h1>
	<p class="group-label">Tutoring from {data.course.group}</p>
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
			{#each data.course.posts as post}
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
	{:else if active.label === 'Tutoring'}
		<Button variant="raised" class="request-open" onclick={() => (requestOpen = true)}>
			<Icon class="material-symbols-outlined">help</Icon>
			<Label>Request tutoring</Label>
		</Button>
		<Dialog
			bind:open={requestOpen}
			aria-labelledby="request-title"
			aria-describedby="request-content"
		>
			<Header>
				<Title id="request-title">Request tutoring</Title>
			</Header>
			<Content id="request-content">
				<form class="request" id="request-form" method="POST" use:enhance>
					<div role="group" class="mdc-card mdc-card--outlined form-card">
						<hgroup class="description">
							<h2 class="heading">Goal description</h2>
							<p class="supporting">
								Please describe what specifically you need help with. Include links to any
								preparational material or rubrics.
							</p>
						</hgroup>
						<Textfield
							bind:value={goalDescription}
							textarea
							label="Description"
							input$name="goalDescription"
						/>
					</div>
					<div role="group" class="mdc-card mdc-card--outlined form-card">
						<hgroup class="description">
							<h2 class="heading">Estimated time</h2>
							<p class="supporting">
								Estimate how long this tutoring session will take in 15-minute increments. It is
								better to overestimate than to underestimate.
							</p>
						</hgroup>
						<Slider
							min={15}
							max={120}
							step={15}
							value={60}
							discrete
							tickMarks
							input$aria-label="Estimated time"
							input$name="estimatedTime"
						/>
					</div>
				</form>
			</Content>
			<Actions>
				<Button action="reject">
					<Label>Cancel</Label>
				</Button>
				<Button action="submit" defaultAction form="request-form" variant="unelevated">
					<Icon class="material-symbols-outlined">send</Icon>
					<Label>Submit</Label>
				</Button>
			</Actions>
		</Dialog>
		<h2 class="tutoring-header">In-progress and upcoming sessions</h2>
		<DataTable class="tutoring-list">
			<Head>
				<Row>
					<Cell>Tutor</Cell>
					<Cell>Start time</Cell>
					<Cell>End time</Cell>
					<Cell>Goal description</Cell>
				</Row>
			</Head>
			<Body>
				{#each data.futureSessions as futureSession}
					<Row>
						{#if futureSession.start}
							<Cell>{futureSession.tutor}</Cell>
							<Cell>{format(futureSession.start, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
							<Cell>{format(futureSession.end, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						{:else}
							<Cell colspan={3}>Unmatched, estimated {futureSession.estimatedTime} min</Cell>
						{/if}
						<Cell>{futureSession.goalDescription}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
		<h2 class="tutoring-header">Completed sessions</h2>
		<DataTable class="tutoring-list">
			<Head>
				<Row>
					<Cell>Tutor</Cell>
					<Cell>Start time</Cell>
					<Cell>End time</Cell>
					<Cell>Goal description</Cell>
				</Row>
			</Head>
			<Body>
				{#each data.pastSessions as pastSession}
					<Row>
						<Cell>{pastSession.tutor}</Cell>
						<Cell>{format(pastSession.start, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						<Cell>{format(pastSession.end, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
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
		.group-label {
			@include typography.typography(headline6);
			@media (min-width: 900px) {
				@include typography.typography(headline5);
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
	:global(.request-open) {
		margin-top: 1em;
		width: 100%;
	}
	.request {
		@include theme.property(color, text-primary-on-light);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: stretch;
		gap: 1em;
		.form-card {
			padding: 1em;
			.description {
				margin-bottom: 1em;
				.heading {
					@include typography.typography(headline5);
					margin: 0 0 0.25em;
				}
				.supporting {
					@include typography.typography(body2);
					margin: 0;
				}
			}
			.grids {
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: flex-start;
				gap: 1em;
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
</style>
