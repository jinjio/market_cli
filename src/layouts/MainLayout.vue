<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <div style="flex: 1; display: flex; justify-content: flex-start">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="$router.back()"
            v-if="$route.path !== '/' && $route.path !== '/product_list'"
          />
        </div>
        <q-toolbar-title
          class="text-center"
          style="flex: 1; text-align: center"
        >
          Market App
        </q-toolbar-title>
        <div style="flex: 1; display: flex; justify-content: flex-end">
          <div>v{{ $q.version }}</div>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// ... existing code ...
</script>
