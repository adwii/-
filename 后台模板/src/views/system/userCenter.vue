<template>
    <div class="home-box">
        <div class="table_box">
            <el-card shadow="always">
                <div class="user_form">
                    <el-form :model="infoForm" label-width="auto" :rules="formRules">
                        <!-- <el-form-item label="所属机构：">
                            <el-input disabled v-model="infoForm.officeVo.name"></el-input>
                        </el-form-item> -->
                        <el-form-item label="所属部门：">
                            <el-input disabled v-model="infoForm.officeVo.name"></el-input>
                        </el-form-item>
                        <el-form-item label="角色：">
                            <el-input disabled v-model="infoForm.roles[0].name"></el-input>
                        </el-form-item>
                        <el-form-item label="登录账号：" prop="userName">
                            <el-input placeholder="请输入登录账号" disabled v-model="infoForm.userName"></el-input>
                        </el-form-item>
                        <el-form-item label="昵称：" prop="name">
                            <el-input placeholder="请输入昵称" v-model="infoForm.name"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号：" prop="phone">
                            <el-input placeholder="请输入手机号" v-model="infoForm.phone"></el-input>
                        </el-form-item>
                    </el-form>
                    <div>
                        <el-button type="primary" @click="updateUserInfo" :loading="submitLoading">保存</el-button>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
import { reactive, toRefs, getCurrentInstance, onMounted, ref } from 'vue-demi'

import { getSelfInfo, updateSelf } from '../../api/userApi'
export default {
    setup() {
        const that = getCurrentInstance().proxy;
        const pageInfo = that.$route.meta;


        const submitLoading = ref(false)
        const state = reactive({
            infoForm: {
                officeVo: {},
                roles: [{}]
            }
        })

        const formRules = reactive({
            name: [
                {
                    trigger: 'blur',
                    message: '请填写昵称',
                    required: true
                }
            ],
            phone: [
                {
                    trigger: 'blur',
                    message: '请填写手机号',
                    required: true
                },
                {
                    pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                    trigger: "blur",
                    message: "请输入正确手机号",
                },
            ]
        })

        onMounted(() => {
            getSelfInfoFun()
        })

        const getSelfInfoFun = () => {
            getSelfInfo().then(res => {
                // console.log(res)
                state.infoForm = res.data
            })
        }

        const updateUserInfo = () => {
            submitLoading.value = true
            updateSelf(state.infoForm).then(res => {
                if (res) {
                    that.$message.success('保存成功')
                    localStorage.setItem('userInfo', JSON.stringify(state.infoForm))
                    setTimeout(() => {
                        location.reload()
                    }, 200);
                }
            }).finally(() => {
                setTimeout(() => {
                    submitLoading.value = false
                }, 400);
            })
        }

        return {
            ...toRefs(state),
            pageInfo,
            updateUserInfo,
            formRules,
            submitLoading
        }
    }
}
</script>

<style lang="scss" scoped>
.user_form {
    width: 500px;
}
</style>