<script setup lang="ts">
const themes = [
	'default',
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'forest',
	'luxury',
	'dim',
	'abyss',
	'sunset',
];
</script>

<template>
	<header class="navbar bg-base-100 shadow-sm">
		<div class="navbar-start">
			<NuxtLink
				to="/"
				class="btn btn-ghost text-xl"
			>Компьютерная графика</NuxtLink>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				<li>
					<NuxtLink to="/lab/1">Работа 1</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/lab/2">Работа 2</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/lab/3">Работа 3</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/lab/4">Работа 4</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/lab/5">Работа 5</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/lab/6">РГР</NuxtLink>
				</li>
			</ul>
		</div>
		<div class="navbar-end">
			<div class="dropdown dropdown-end ">
				<div
					tabindex="0"
					role="button"
					class="btn btn-ghost m-1"
				>
					Тема
					<svg
						width="12px"
						height="12px"
						class="inline-block h-2 w-2 fill-current opacity-60"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 2048 2048"
					>
						<path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
					</svg>
				</div>
				<ul
					tabindex="0"
					class="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
				>
					<li
						v-for="theme in themes"
						:key="theme"
					>
						<input
							type="radio"
							name="theme-dropdown"
							class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
							:aria-label="theme"
							:value="theme"
						>
					</li>
				</ul>
			</div>
		</div>
	</header>
</template>
