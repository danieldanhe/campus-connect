<script lang="ts">
	import '$lib/global.scss';

	import Avatar from 'svelte-avatar';
	import Drawer, { AppContent, Content, Header, Scrim, Subtitle, Title } from '@smui/drawer';
	import IconButton from '@smui/icon-button';
	import List, { Graphic, Item, Separator, Subheader, Text } from '@smui/list';
	import Menu from '@smui/menu';
	import TopAppBar, { AutoAdjust, Row, Section, Title as AppBarTitle } from '@smui/top-app-bar';
	import Tooltip, { Wrapper } from '@smui/tooltip';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	let { data, children } = $props();
	import { enhance } from '$app/forms';

	let topAppBar: TopAppBar | null = $state(null);
	let drawerOpen = $state(false);
	let menu: Menu;

	let largeScreen = $state(false);
	onMount(() => {
		const updateLarge = () => {
			largeScreen = window.innerWidth > 1050;
			drawerOpen = largeScreen;
		};
		updateLarge();
		window.addEventListener('resize', updateLarge);
		return () => window.removeEventListener('resize', updateLarge);
	});
</script>

<TopAppBar bind:this={topAppBar} variant="fixed">
	<Row>
		<Section>
			<Wrapper>
				<IconButton class="material-symbols-outlined" onclick={() => (drawerOpen = !drawerOpen)}
					>menu</IconButton
				>
				<Tooltip>Main menu</Tooltip>
			</Wrapper>
			<AppBarTitle>CampusConnect</AppBarTitle>
		</Section>
		<Section align="end">
			<span>
				<IconButton
					onclick={() => menu.setOpen(true)}
					class="account-button"
					aria-label="Your account"
					><Avatar src="https://picsum.photos/40" name="Teacher Name" size="32px" /></IconButton
				>
				<Menu bind:this={menu} anchorCorner="BOTTOM_LEFT">
					<List>
						<Item>
							<Text>Sign out</Text>
						</Item>
					</List>
				</Menu>
			</span>
		</Section>
	</Row>
</TopAppBar>
<Drawer
	variant={largeScreen ? 'dismissible' : 'modal'}
	bind:open={drawerOpen}
	class={largeScreen ? 'mdc-top-app-bar--fixed-adjust' : 'small-drawer'}
>
	<Content>
		<h2 class="header sr-only">Navigation</h2>
		<Header>
			<Title tag="h3">CampusConnect</Title>
			<Subtitle tag="p">Connecting students to tutors</Subtitle>
		</Header>
		<List>
			{#if data.student.length}
				<Separator />
				<Subheader tag="h3">Student</Subheader>
				{#each data.student as course}
					<Item
						href={'/student/' + course}
						activated={page.route.id === '/student/[course]' && page.params.course === course}
					>
						<Text>{course}</Text>
					</Item>
				{/each}
			{/if}
			{#if data.tutor.length}
				<Separator />
				<Subheader tag="h3">Tutor</Subheader>
				{#each data.tutor as group}
					<Item
						href={'/tutor/' + group}
						activated={page.route.id === '/tutor/[group]' && page.params.group === group}
					>
						<Text>{group}</Text>
					</Item>
				{/each}
			{/if}
			{#if data.administrator.length}
				<Separator />
				<Subheader tag="h3">Administrator</Subheader>
				{#each data.administrator as group}
					<Item
						href={'/administrator/' + group}
						activated={page.route.id === '/administrator/[group]' && page.params.group === group}
					>
						<Text>{group}</Text>
					</Item>
				{/each}
			{/if}
			<Separator />
			<Item href="/available-times" activated={page.route.id === '/available-times'}>
				<Graphic class="material-symbols-outlined">schedule</Graphic>
				<Text>Available times</Text>
			</Item>
			<Item href="/add-course" activated={page.route.id === '/add-course'}>
				<Graphic class="material-symbols-outlined">add</Graphic>
				<Text>Add course</Text>
			</Item>
		</List>
	</Content>
</Drawer>
<Scrim />
<AppContent>
	<AutoAdjust {topAppBar}>
		{@render children()}
	</AutoAdjust>
</AppContent>

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
	.header {
		@include typography.typography(headline3);
		margin: 0;
	}
	:global(.account-button) {
		padding: 8px;
	}
</style>
