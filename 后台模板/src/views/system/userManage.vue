<template>
    <div class="home-box">
        <div class="search-box">
            <el-card shadow="always">
                <el-form :model="searchForm" label-width="auto">
                    <el-form-item label="搜索：">
                        <el-input placeholder="请输入用户名称查询" v-model="searchForm.name"></el-input>
                        <div class="search-inline">
                            <el-select v-model="searchForm.locked" placeholder="请选择用户状态" clearable
                                @change="getTableData">
                                <el-option label="正常" :value="0"></el-option>
                                <el-option label="锁定" :value="1"></el-option>
                            </el-select>
                        </div>
                        <div class="search-inline">
                            <el-button type="primary" :icon="Search" @click="getTableData">搜索</el-button>
                            <el-button type="primary" :icon="Plus" @click="addNew" v-if="hasNewPer">新增</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <div class="bot-box">
            <div class="tree-box">
                <el-card shadow="always">
                    <el-form-item label="当前选中：">
                        <el-input readonly v-model="deptTreeChoosed.name"></el-input>
                    </el-form-item>
                    <el-tree :data="deptTree" :props="{ children: 'childList', label: 'name' }"
                        @node-click="treeNodeClick"></el-tree>
                </el-card>
            </div>
            <div class="table-box">
                <el-card shadow="always">
                    <el-table :data="tableData">
                        <el-table-column type="index" width="60px" label="序号" align="center"></el-table-column>
                        <el-table-column prop="userName" label="登录名" width="100px"></el-table-column>
                        <el-table-column label="所属部门" width="130px">
                            <template #default="scope">
                                <span>{{ scope.row.officeVo.id == '-1' ? '系统' : scope.row.officeVo.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="姓名" width="130px"></el-table-column>
                        <el-table-column prop="phone" label="手机号" width="150px"></el-table-column>
                        <el-table-column prop="createDate" label="创建时间"></el-table-column>
                        <el-table-column label="是否锁定" width="130px" align="center">
                            <template #default="scope">
                                <el-switch active-color="#ff4949" inactive-color="#13ce66" inactive-text="否"
                                    active-text="是" :active-value="true" :inactive-value="false"
                                    v-model="scope.row.lockedVal"
                                    @change="(val) => { changeUserLocked(val, scope.row) }"></el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作" width="280px">
                            <template #default="scope">
                                <el-button type="primary" text @click="updateRowFun(scope.row)" v-if="hasUpdatePer">修改
                                </el-button>
                                <el-button type="primary" text @click="resetRowFun(scope.row)" v-if="hasUpdatePer">重置密码
                                </el-button>
                                <el-button type="danger" text @click="deleteRowFun(scope.row)" v-if="hasDeletePer">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="table-page">
                        <el-pagination background layout="prev, pager, next, total" :total="pageParams.total"
                            :current-page="pageParams.page" @current-change="changePage"></el-pagination>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
    <el-dialog v-model="editDialogShow" append-to-body destroy-on-close width="600px" title="编辑用户">
        <el-form ref="dialogFormRef" :model="dialogForm" label-width="auto" :rules="dialogFormRules">
            <el-form-item label="登录名：" prop="userName">
                <el-input v-model="dialogForm.userName" placeholder="请输入登录名" :disabled="Boolean(dialogForm.id)">
                </el-input>
            </el-form-item>
            <el-form-item label="密码：" prop="passWord" v-if="!dialogForm.id">
                <el-input v-model="dialogForm.passWord" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="姓名：" prop="name">
                <el-input v-model="dialogForm.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
            <el-form-item label="所属部门：" prop="officeId" v-if="!dialogForm.id">
                <el-cascader :options="deptTree" v-model="dialogForm.officeIdOver" ref="parentHandle" :props="casProp"
                    placeholder="请选择所在部门" @change="chooseParentId"></el-cascader>
            </el-form-item>
            <el-form-item label="角色：" prop="roleId" v-if="!dialogForm.id">
                <el-select v-model="dialogForm.roleId" placeholder="请选择所属角色">
                    <el-option v-for="(item, index) in roleList" :key="index" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="手机号：" prop="phone">
                <el-input v-model="dialogForm.phone" type="tel" placeholder="请输入手机号"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" @click="submitDialog" :loading="submitDialogLoading">提交</el-button>
            <el-button @click="editDialogShow = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { onMounted, reactive, toRefs, ref, onBeforeMount } from 'vue-demi'
import { Search, Plus } from '@element-plus/icons-vue'
import { getOfficeTree, getUserPage, getUserDetail, newUser, updateUser, deleteUser, getRoleList, resetUserPwd, lockUser } from '../../api/userApi'
import { ElMessage, ElMessageBox } from 'element-plus'
import { checkPer } from '../../common/comFun'
export default {
    setup() {

        const hasNewPer = ref(false)
        const hasDeletePer = ref(false)
        const hasUpdatePer = ref(false)

        const editDialogShow = ref(false)
        const submitDialogLoading = ref(false)
        const dialogFormRef = ref(null)
        const editMenuShow = ref(false)
        const menuTreeRef = ref(null)

        const dialogFormRules = reactive({
            userName: [
                {
                    required: true,
                    message: "请输入登录名",
                    trigger: "blur",
                },
            ],
            passWord: [
                {
                    required: true,
                    message: "请输入密码",
                    trigger: "blur",
                },
                {
                    min: 8,
                    max: 20,
                    message: "长度在8到20个字母、数字、特殊符号至少两种",
                    trigger: "blur",
                },
            ],
            name: [
                {
                    required: true,
                    message: "请输入姓名",
                    trigger: "blur",
                },
            ],
            officeId: [
                {
                    required: true,
                    message: "请选择所属部门",
                    trigger: "blur",
                },
            ],
            roleId: [
                {
                    required: true,
                    message: "请选择所属角色",
                    trigger: "blur",
                },
            ],
            phone: [
                {
                    required: true,
                    message: "请输入手机号",
                    trigger: "blur",
                },
                {
                    pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                    trigger: "blur",
                    message: "请输入正确手机号",
                },
            ],
        })

        const casProp = reactive({
            checkStrictly: true,
            label: "name",
            value: "id",
            children: "childList",
        })

        const menuTreeProps = reactive({
            label: 'name',
            children: 'childList'
        })

        const state = reactive({
            pageParams: {
                total: 0,
                page: 1
            },
            deptTree: [],
            searchForm: {},
            tableData: [],
            dialogForm: {},
            deptTreeChoosed: {},
            menuChangeId: '',
            checkedMenu: [],
            menuTree: [],
            roleList: [],
            switchChange: false
        })

        onBeforeMount(() => {
            hasNewPer.value = checkPer('sys:user:save')
            hasUpdatePer.value = checkPer('sys:user:update')
            hasDeletePer.value = checkPer('sys:user:delete')
        })

        onMounted(() => {
            getDeptTreeFun()
            getTableData()
        })

        const getDeptTreeFun = () => {
            getOfficeTree().then(res => {
                state.deptTree = res.data
                state.deptTreeChoosed = res.data[0]
            })
        }

        const getTableData = () => {
            state.switchChange = true
            getUserPage({
                ...state.searchForm,
                size: 10,
                current: state.pageParams.page,
                officeId: state.deptTreeChoosed.id
            }).then(res => {
                state.tableData = res.data.records
                state.pageParams.total = Number(res.data.total)
                setTimeout(() => {
                    state.switchChange = false
                }, 100);
            })
        }

        const addNew = () => {
            state.dialogForm = {
                sort: 99
            }
            editDialogShow.value = true
        }

        const treeNodeClick = (node) => {
            console.log(node.id)
            state.deptTreeChoosed = node
            getTableData()
        }

        const changePage = (e) => {
            state.pageParams.page = e
            getTableData()
        }

        const chooseParentId = (e) => {
            if (e && e.length) {
                state.dialogForm.officeId = e[e.length - 1]
                state.dialogForm.office = {
                    id: e[e.length - 1]
                }
                state.roleList = []
                state.dialogForm.roleId = ''
                getRoleList({ officeId: e[e.length - 1] }).then(res => {
                    state.roleList = res.data
                })
            }
        }

        const submitDialog = () => {
            dialogFormRef.value.validate(valid => {
                if (valid) {
                    submitDialogLoading.value = true
                    if (state.dialogForm.id) {
                        updateUser(state.dialogForm).then(res => {
                            if (res) {
                                ElMessage.success('修改成功')
                                getTableData()
                                editDialogShow.value = false
                            }
                        }).finally(() => {
                            submitDialogLoading.value = false
                        })
                    } else {
                        state.dialogForm.roles = [{ id: state.dialogForm.roleId }]
                        newUser(state.dialogForm).then(res => {
                            if (res) {
                                ElMessage.success('添加成功')
                                getTableData()
                                editDialogShow.value = false
                            }
                        }).finally(() => {
                            submitDialogLoading.value = false
                        })
                    }
                }
            })
        }

        const updateRowFun = (row) => {
            getUserDetail({ id: row.id }).then(res => {
                state.dialogForm = res.data
                state.dialogForm.parentIdOver = res.data.officeVo.parentIds ? res.data.officeVo.parentIds.split(',').concat([row.officeId]) : []
                state.dialogForm.parentId = res.data.officeVo ? res.data.officeVo.id : ''
                editDialogShow.value = true
            })
        }

        const deleteRowFun = (row) => {
            ElMessageBox.confirm('删除用户后无法恢复，确认删除？', '提示', {
                type: 'error'
            }).then(() => {
                deleteUser({ id: row.id }).then(res => {
                    if (res) {
                        ElMessage.success('删除成功')
                        getTableData()
                        getDeptTreeFun()
                    }
                })
            }).catch(() => {
                ElMessage('已取消')
            })
        }

        const resetRowFun = (row) => {
            ElMessageBox.prompt('重置密码后，之前密码将不可用，确认后输入新密码', '提示', {
                type: 'warning',
                inputPlaceholder: '请输入新密码',
                inputType: 'password'
            }).then((e) => {
                // console.log(e)
                resetUserPwd({ id: row.id, passWord: e.value }).then(res => {
                    if (res) ElMessage.success('重置密码成功')
                })
            })
        }

        const changeUserLocked = (status, row) => {
            lockUser({
                id: row.id,
                locked: Number(status)
            }).then(res => {
                if (res) {
                    ElMessage.success('修改成功')
                } else {
                    row.locked = Number(!status)
                }
            }).catch(err => {
                getTableData()
            })
        }

        return {
            ...toRefs(state),
            Search,
            Plus,
            getTableData,
            addNew,
            treeNodeClick,
            changePage,
            editDialogShow,
            casProp,
            dialogFormRules,
            chooseParentId,
            submitDialogLoading,
            submitDialog,
            dialogFormRef,
            updateRowFun,
            deleteRowFun,
            editMenuShow,
            menuTreeProps,
            resetRowFun,
            menuTreeRef,
            changeUserLocked,
            hasDeletePer,
            hasUpdatePer,
            hasNewPer,
        }
    }
}
</script>