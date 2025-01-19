<script lang="ts">
	import { page } from '$app/state';
</script>

<title>{page.status} – {page.error?.message}</title>
<div class="error container">
	<h1 class="title">{page.status}</h1>
	<p class="message">{page.error?.message}</p>
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

	.error {
		padding-top: 2em;
		padding-bottom: 2em;
		.title {
			@include typography.typography(headline3);
			margin: 0;
		}
		.message {
			@include typography.typography(headline5);
			margin: 0;
		}
	}
</style>
