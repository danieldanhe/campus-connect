<script lang="ts">
	import Button, { Icon, Label } from '@smui/button';
	import { Subheader } from '@smui/list';
	import Select, { Option } from '@smui/select';

	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	import { enhance } from '$app/forms';
</script>

<title>Add course</title>

{#if form?.success}
	<p class="success-message container">Your have successfully added this course.</p>
{:else}
	<form method="POST" use:enhance class="container">
		<h1 class="title">Add course</h1>
		<Select variant="outlined" label="Course" hiddenInput input$name="courseName" class="options">
			{#each data.coursesList as group}
				<Subheader>{group.group}</Subheader>
				{#each group.courses as course}
					<Option value={course}>{course}</Option>
				{/each}
			{/each}
		</Select>
		<Button variant="raised" class="submit">
			<Icon class="material-symbols-outlined">add</Icon>
			<Label>Add course</Label>
		</Button>
	</form>
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

	.container {
		padding-top: 2em;
		.title {
			@include typography.typography(headline3);
			margin: 0 0 0.5em;
		}
		:global {
			.options {
				width: 100%;
				max-width: 384px;
				.mdc-deprecated-list-group__subheader {
					font-weight: 700;
				}
			}
		}
		:global(.submit) {
			width: 100%;
			margin-top: 1em;
		}
	}
</style>
