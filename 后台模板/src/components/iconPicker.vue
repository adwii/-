<template>
  <el-dialog v-model="visible" width="800px">
    <div class="icon_picker_view">
      <div v-for="(item, index) in iconList" :key="index" @click="chooseOne(index)"
        :class="activeIndex == index ? 'active' : ''">
        <p>
          <i class="iconfont" :class="'icon-' + item"></i>
        </p>
        <p>{{ item }}</p>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { onMounted, reactive, ref, toRefs } from "vue-demi";
import iconJson from "../icon/iconfont.json";
export default {
  name: "IconPicker",
  emits: ['choosed', 'chooseConfirm'],
  setup(props, context) {
    const visible = ref(false);
    const activeIndex = ref(null)
    const state = reactive({
      iconList: [],
    });
    onMounted(() => {
      changeIcon();
    });
    const changeIcon = () => {
      let arr = iconJson.glyphs.map((item) => {
        return item.name.replace(' ', '');
      });
      state.iconList = arr;
    };
    const open = (i) => {
      if (i) {
        let active = null
        state.iconList.map((item, index) => {
          if (item == i) {
            active = index
          }
        })
        activeIndex.value = active
      }
      visible.value = true
    }
    const chooseOne = (i) => {
      activeIndex.value = i
      context.emit('choosed', state.iconList[i])
    }
    return {
      visible,
      ...toRefs(state),
      activeIndex,
      open,
      close,
      chooseOne,
    };
  },
};
</script>

<style lang="scss" scoped>
.icon_picker_view {
  display: flex;
  flex-wrap: wrap;
  height: 550px;
  overflow-y: scroll;
  text-align: center;

  div {
    width: 100px;
    border: 1px solid #ccc;
    margin-top: 4px;
    margin-right: 4px;

    p {
      &:nth-of-type(1) {
        margin-top: 6px;

        i {
          font-size: 24px;
        }
      }

      &:nth-of-type(2) {
        font-size: 13px;
        margin: 4px 0 10px;
      }
    }
  }

  .active {
    background: #8CC5FF;
    border: 1px solid #fff;
    color: #fff;
  }
}
</style>