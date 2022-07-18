<template>
    <div class="home-box">
        <div class="search-box">
            <el-card shadow="always">
                <el-form :model="searchForm" label-width="auto">
                    <el-form-item label="搜索：">
                        <el-input placeholder="请输入机构名称查询"></el-input>
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
                    <el-tree :data="deptTree" :props="{ children: 'childList', label: 'name' }"
                        @node-click="treeNodeClick"></el-tree>
                </el-card>
            </div>
            <div class="table-box">
                <el-card shadow="always">
                    <el-table :data="tableData">
                        <el-table-column type="index" width="60px" label="序号" align="center"></el-table-column>
                        <el-table-column align="center" label="名称" prop="name"></el-table-column>
                        <el-table-column align="center" label="备注" prop="remarks"></el-table-column>
                        <el-table-column align="center" label="操作">
                            <template #default="scope">
                                <el-button type="primary" text @click="updateRowFun(scope.row)" v-if="hasUpdatePer">修改
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
    <el-dialog v-model="editDialogShow" append-to-body destroy-on-close width="700px" title="编辑机构">
        <el-form ref="dialogFormRef" :model="dialogForm" label-width="auto" :rules="dialogFormRules">
            <el-form-item label="上级部门：" prop="parentId">
                <el-cascader :options="deptTree" :disabled="dialogForm.id" v-model="dialogForm.parentIdOver"
                    ref="parentHandle" :props="casProp" clearable @change="chooseParentId" placeholder="请选择上级部门">
                </el-cascader>
            </el-form-item>
            <el-form-item label="部门名称：" prop="name">
                <el-input v-model="dialogForm.name" placeholder="请输入部门名称"></el-input>
            </el-form-item>
            <el-form-item label="排序：" prop="sort">
                <el-input v-model="dialogForm.sort" type="number"></el-input>
            </el-form-item>
            <el-form-item label="备注：" prop="remarks">
                <el-input v-model="dialogForm.remarks"></el-input>
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
import { getOfficeTree, getOfficePage, getOfficeDetail, newOffice, updateOffice, deleteOffice } from '../../api/userApi'
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

        const dialogFormRules = reactive({
            name: [
                {
                    required: true,
                    message: "请输入部门名称",
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

        const state = reactive({
            pageParams: {
                total: 0,
                page: 1
            },
            deptTree: [],
            searchForm: {},
            tableData: [],
            dialogForm: {}
        })

        onBeforeMount(() => {
            hasNewPer.value = checkPer('sys:office:save')
            hasUpdatePer.value = checkPer('sys:office:update')
            hasDeletePer.value = checkPer('sys:office:delete')
        })

        onMounted(() => {
            getDeptTreeFun()
            getTableData()
        })

        const getDeptTreeFun = () => {
            getOfficeTree().then(res => {
                state.deptTree = res.data
            })
        }

        const getTableData = (parentId) => {
            getOfficePage({
                ...state.searchForm,
                size: 10,
                current: state.pageParams.page,
                parentId: parentId
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
            getTableData(node.id)
        }

        const changePage = (e) => {
            state.pageParams.page = e
            getTableData()
        }

        const chooseParentId = (e) => {
            state.dialogForm.parentId = e[e.length - 1]
        }

        const submitDialog = () => {
            dialogFormRef.value.validate(valid => {
                if (valid) {
                    submitDialogLoading.value = true
                    if (state.dialogForm.id) {
                        updateOffice(state.dialogForm).then(res => {
                            if (res) {
                                ElMessage.success('修改成功')
                                getTableData()
                                editDialogShow.value = false
                            }
                        }).finally(() => {
                            submitDialogLoading.value = false
                        })
                    } else {
                        newOffice(state.dialogForm).then(res => {
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
            getOfficeDetail({ id: row.id }).then(res => {
                state.dialogForm = res.data
                state.dialogForm.parentIdOver = res.data.parentVo ? [res.data.parentVo.id] : ''
                state.dialogForm.parentId = res.data.parentVo ? res.data.parentVo.id : ''
                editDialogShow.value = true
            })
        }

        const deleteRowFun = (row) => {
            ElMessageBox.confirm('删除机构后无法恢复，确认删除？', '提示', {
                type: 'error'
            }).then(() => {
                deleteOffice({ id: row.id }).then(res => {
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
            hasUpdatePer,
            hasNewPer,
            hasDeletePer,
        }
    }
}
</script>