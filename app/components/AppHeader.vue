<script setup lang="ts">

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
		<div class="navbar-end" />
	</header>
</template>
