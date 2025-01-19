<script lang="ts">
	import Avatar from 'svelte-avatar';
	import Banner from '@smui/banner';
	import Button, { Icon, Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import FormField from '@smui/form-field';
	import Tab from '@smui/tab';
	import Textfield from '@smui/textfield';
	import TabBar from '@smui/tab-bar';

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

	let content = $state('');
</script>

{#if form?.success}
	<Banner open fixed mobileStacked content$style="max-width: max-content;">
		{#snippet label()}
			<Label>Posts submitted successfully</Label>
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
			<li class="post mdc-card mdc-card--outlined">
				<div class="author">
					<Avatar src={data.selfInfo.image} name={data.selfInfo.name} size="40px" />
					<hgroup class="textual">
						<h2 class="name">
							<span class="sr-only">
								Post by{' '}
							</span>
							{data.selfInfo.name}
						</h2>
					</hgroup>
				</div>
				<form class="content" method="POST" use:enhance>
					<Textfield
						bind:value={content}
						textarea
						input$name="content"
						input$aria-label="Post content"
						class="content-textarea"
					/><span class="content-courses"
						><span class="posted-in">Posted in{" "}</span>{#each data.courses as course}<FormField
								><Checkbox value={course} input$name="courses" />{#snippet label()}
									{course}
								{/snippet}</FormField
							>{/each}
					</span><Button class="content-submit" variant="outlined">
						<Icon class="material-symbols-outlined">send</Icon>
						<Label>Submit</Label>
					</Button>
				</form>
			</li>
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
		<DataTable class="tutoring-list">
			<Head>
				<Row>
					<Cell>Student</Cell>
					<Cell>Tutor</Cell>
					<Cell>Start time</Cell>
					<Cell>End time</Cell>
					<Cell>Course</Cell>
					<Cell>Goal description</Cell>
				</Row>
			</Head>
			<Body>
				{#each data.sessions as session}
					<Row>
						<Cell>{session.student}</Cell>
						{#if session.start}
							<Cell>{session.tutor}</Cell>
							<Cell>{format(session.start, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
							<Cell>{format(session.end, 'EEE d MMM yyyy hhmm', { locale: enGB })}</Cell>
						{:else}
							<Cell colspan={3}>Unmatched, estimated {session.estimatedTime} min</Cell>
						{/if}
						<Cell>{session.course}</Cell>
						<Cell>{session.goalDescription}</Cell>
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
				:global(.content-textarea),
				.content-courses,
				:global(.content-submit) {
					width: 100%;
					margin-bottom: 0.5em;
				}
				.content-courses {
					@include typography.typography(body2);
					display: block;
					.posted-in {
						vertical-align: middle;
					}
				}
			}
		}
	}
	:global(.tutoring-list) {
		margin-top: 1em;
		max-width: 100%;
		:global(.mdc-data-table__cell) {
			max-width: 256px;
		}
	}
</style>
