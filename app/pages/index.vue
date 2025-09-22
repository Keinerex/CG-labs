<template>
	<div>
		<section class="card bg-base-200 shadow-xl p-6 mb-6">
			<div class="card-body">
				<h1 class="text-4xl font-extrabold">
					Компьютерная графика
				</h1>
				<p class="mt-2 text-lg">
					Выполнили студенты группы <strong>АВТ-418</strong>:
				</p>
				<ul class="list-disc list-inside mt-2">
					<li class="text-base">
						Куриленко Платон Семенович
					</li>
					<li class="text-base">
						Юрков Владислав Юрьевич
					</li>
				</ul>
				<p class="mt-4 text-lg">
					Преподаватель: <strong>Надежницкая Вероника Анатольевна</strong>
				</p>
			</div>
		</section>

		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
			<div class="card bg-base-200 shadow-md p-4">
				<div class="card-body">
					<h2 class="card-title">
						Лабораторная работа &#8470; 1
					</h2>
					<NuxtLink
						to="/lab/1"
						class="text-primary"
					>Перейти</NuxtLink>
				</div>
			</div>
			<div class="card bg-base-200 shadow-md p-4">
				<div class="card-body">
					<h2 class="card-title">
						Лабораторная работа &#8470; 2
					</h2>
					<NuxtLink
						to="/lab/2"
						class="text-primary"
					>Перейти</NuxtLink>
				</div>
			</div>
			<div class="card bg-base-200 shadow-md p-4">
				<div class="card-body">
					<h2 class="card-title">
						Лабораторная работа &#8470; 3
					</h2>
					<NuxtLink
						to="/lab/3"
						class="text-primary"
					>Перейти</NuxtLink>
				</div>
			</div>
			<div class="card bg-base-200 shadow-md p-4">
				<div class="card-body">
					<h2 class="card-title">
						Лабораторная работа &#8470; 4
					</h2>
					<NuxtLink
						to="/lab/4"

						class="text-primary"
					>Перейти</NuxtLink>
				</div>
			</div>
			<div class="card bg-base-200 shadow-md p-4">
				<div class="card-body">
					<h2 class="card-title">
						Лабораторная работа &#8470; 5
					</h2>
					<NuxtLink
						to="/lab/5"
						class="text-primary"
					>Перейти</NuxtLink>
				</div>
			</div>
			<div class="card bg-base-200 shadow-md p-4">
				<div class="card-body">
					<h2 class="card-title">
						Расчетно-графическая работа
					</h2>
					<NuxtLink
						to="/lab/6"
						class="text-primary"
					>Перейти</NuxtLink>
				</div>
			</div>
			<div class="card bg-base-200 shadow-md p-4 col-span-full">
				<div class="card-body">
					<h2 class="card-title">
						GitHub
					</h2>
					<a
						href="https://github.com/Keinerex/CG-labs"
						class="text-primary"
					>Перейти на GitHub</a>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
</script>
