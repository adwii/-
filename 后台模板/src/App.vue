<script setup>
// This starter template is using Vue 3 <script setup> SFCs

import { onMounted } from '@vue/runtime-core';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { setRouter } from './common/comFun';

// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
const store = useStore()
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  // let menuList = store.state.menuList
  // if (menuList && menuList.length > 0) {
  //   console.log(menuList, route)
  //   await setRouter(menuList)
  // }
})


</script>

<template>
  <router-view></router-view>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

* {
  margin: 0;
  padding: 0;
}

.el-dialog .el-form {

  .el-cascader {
    width: 100%;
  }

  .el-select {
    width: 100%;
  }
}
</style>
