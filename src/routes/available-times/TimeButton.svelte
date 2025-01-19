<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import { type EventHandler } from 'svelte/elements';

	const {
		onSelected,
		onDeselected,
		time
	}: {
		onSelected: EventHandler;
		onDeselected: EventHandler;
		time: {
			start: {
				hour: number;
				minute: number;
			};
			end: {
				hour: number;
				minute: number;
			};
		};
	} = $props();

	const timeString =
		String(time.start.hour).padStart(2, '0') +
		String(time.start.minute).padStart(2, '0') +
		'–' +
		String(time.end.hour).padStart(2, '0') +
		String(time.end.minute).padStart(2, '0');

	/*
	let deselected = $state(false);
	const changeSelected = () => {
		if (deselected) {
			deselected = false;
			onSelected();
		}
		if (!deselected) {
			deselected = true;
			onDeselected();
		}
	};
	*/
</script>

<!--
	onclick={changeSelected} class={'time-button' + (deselected ? ' deselected' : '')}
-->
<Wrapper
	><Button class="time-button"
		><Label>{timeString}</Label></Button
	><Tooltip>Click to remove</Tooltip></Wrapper
>

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

	@use '@material/button';

	:global {
		.time-button {
			font-variant-numeric: tabular-nums;
			margin-right: 0.5em;
			&.deselected {
				@include button.ink-color(text-secondary-on-light);
				text-decoration: line-through;
			}
		}
	}
</style>
