<template>
    <div class="home-box">
        <div class="search-box">
            <el-card shadow="always">
                <el-form :model="searchForm" label-width="auto">
                    <el-form-item label="搜索：">
                        <el-input placeholder="请输入角色名称查询"></el-input>
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
                        <el-table-column prop="name" label="名称"></el-table-column>
                        <el-table-column prop="enName" label="英文名"></el-table-column>
                        <el-table-column prop="remarks" label="所属部门">
                            <template #default="scope">
                                <span>{{ scope.row.officeVo.id == '-1' ? '系统' : scope.row.officeVo.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createDate" label="创建时间"></el-table-column>
                        <el-table-column align="center" label="备注" prop="remarks"></el-table-column>
                        <el-table-column align="center" label="操作" width="280px">
                            <template #default="scope">
                                <el-button type="primary" text @click="updateRowFun(scope.row)" v-if="hasUpdatePer">修改
                                </el-button>
                                <el-button type="primary" text @click="authMenuRowFun(scope.row)" v-if="hasUpdatePer">
                                    菜单授权</el-button>
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
    <el-dialog v-model="editDialogShow" append-to-body destroy-on-close width="600px" title="编辑角色">
        <el-form ref="dialogFormRef" :model="dialogForm" label-width="auto" :rules="dialogFormRules">
            <el-form-item label="所属部门：" prop="officeId" v-if="!dialogForm.id">
                <el-cascader :options="deptTree" v-model="dialogForm.officeIdOver" ref="parentHandle" :props="casProp"
                    clearable @change="chooseParentId" placeholder="请选择所在部门"></el-cascader>
            </el-form-item>
            <el-form-item label="名称：" prop="name">
                <el-input v-model="dialogForm.name" placeholder="请输入部门名称"></el-input>
            </el-form-item>
            <el-form-item label="英文名：" prop="enName">
                <el-input v-model="dialogForm.enName" placeholder="请输入唯一英文名"></el-input>
            </el-form-item>
            <!-- <el-form-item label="排序：" prop="sort">
                <el-input v-model="dialogForm.sort" type="number"></el-input>
            </el-form-item> -->
            <el-form-item label="备注：" prop="remarks">
                <el-input v-model="dialogForm.remarks"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" @click="submitDialog" :loading="submitDialogLoading">提交</el-button>
            <el-button @click="editDialogShow = false">取消</el-button>
        </template>
    </el-dialog>
    <el-dialog v-model="editMenuShow" custom-class="dialog_edit" title="菜单权限" width="600px" append-to-body
        destroy-on-close>
        <el-tree :data="menuTree" show-checkbox :props="menuTreeProps" :default-checked-keys="checkedMenu" node-key="id"
            @check-change="changeMenuCheck" ref="menuTreeRef"></el-tree>
        <template #footer>
            <el-button type="primary" @click="updateRoleMenuFun" :loading="submitDialogLoading">保存</el-button>
            <el-button @click="editMenuShow = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { onMounted, reactive, toRefs, ref, onBeforeMount } from 'vue-demi'
import { Search, Plus } from '@element-plus/icons-vue'
import { getOfficeTree, getRolePage, getRoleDetail, newRole, updateRole, deleteRole, updateRoleMenu, getMenuTree } from '../../api/userApi'
import { ElMessage, ElMessageBox } from 'element-plus'
import { checkPer } from '../../common/comFun'
export default {
    setup() {

        const hasNewPer = ref(false)
        const hasUpdatePer = ref(false)
        const hasDeletePer = ref(false)

        const editDialogShow = ref(false)
        const submitDialogLoading = ref(false)
        const dialogFormRef = ref(null)
        const editMenuShow = ref(false)
        const menuTreeRef = ref(null)

        const dialogFormRules = reactive({
            name: [
                {
                    required: true,
                    message: "请输入部门名称",
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
            enName: [
                {
                    required: true,
                    message: "请输入英文名（确保唯一）",
                    trigger: "blur",
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
            menuTree: []
        })

        onBeforeMount(() => {
            hasNewPer.value = checkPer('sys:role:save')
            hasUpdatePer.value = checkPer('sys:role:update')
            hasDeletePer.value = checkPer('sys:role:delete')
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

        const getMenuTreeFun = () => {
            getMenuTree().then(res => {
                state.menuTree = res.data
            })
        }

        const getTableData = () => {
            getRolePage({
                ...state.searchForm,
                size: 10,
                current: state.pageParams.page,
                officeId: state.deptTreeChoosed.id
            }).then(res => {
                state.tableData = res.data.records
                state.pageParams.total = Number(res.data.total)
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
            state.dialogForm.officeId = e[e.length - 1]
        }

        const submitDialog = () => {
            dialogFormRef.value.validate(valid => {
                if (valid) {
                    submitDialogLoading.value = true
                    if (state.dialogForm.id) {
                        updateRole(state.dialogForm).then(res => {
                            if (res) {
                                ElMessage.success('修改成功')
                                getTableData()
                                editDialogShow.value = false
                            }
                        }).finally(() => {
                            submitDialogLoading.value = false
                        })
                    } else {
                        newRole(state.dialogForm).then(res => {
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
            getRoleDetail({ id: row.id }).then(res => {
                state.dialogForm = res.data
                state.dialogForm.parentIdOver = res.data.officeVo.parentIds ? res.data.officeVo.parentIds.split(',').concat([row.officeId]) : []
                state.dialogForm.parentId = res.data.officeVo ? res.data.officeVo.id : ''
                editDialogShow.value = true
            })
        }

        const deleteRowFun = (row) => {
            ElMessageBox.confirm('删除角色后无法恢复，确认删除？', '提示', {
                type: 'error'
            }).then(() => {
                deleteRole({ id: row.id }).then(res => {
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

        const authMenuRowFun = (row) => {
            getMenuTreeFun()
            state.menuChangeId = row.id
            state.checkedMenu = []
            editMenuShow.value = true
            getRoleDetail({ id: row.id }).then(res => {
                state.checkedMenu = res.data.menuIds
            })
        }

        const changeMenuCheck = () => {
            state.checkedMenu = menuTreeRef.value.getCheckedKeys()
        }

        const updateRoleMenuFun = () => {
            submitDialogLoading.value = true
            updateRoleMenu({
                id: state.menuChangeId,
                menuIds: state.checkedMenu
            }).then(res => {
                if (res) {
                    ElMessage.success('保存成功')
                    editMenuShow.value = false
                    state.menuChangeId = ''
                    state.checkedMenu = []
                }
            }).finally(() => {
                submitDialogLoading.value = false
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
            changeMenuCheck,
            authMenuRowFun,
            updateRoleMenuFun,
            menuTreeRef,
            hasUpdatePer,
            hasNewPer,
            hasDeletePer,
        }
    }
}
</script>