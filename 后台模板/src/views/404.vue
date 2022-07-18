<template>
    <div class="404_page">
        404，页面未找到
    </div>
</template>

<script>
import { onBeforeMount } from '@vue/runtime-core'
export default {
    setup() {
        onBeforeMount(() => {
            console.log("404")
        })
        return {}
    }
}
</script>