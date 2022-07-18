<template>
    <div class="home-box">
        <div class="search-box">
            <el-card shadow="always">
                <el-form :model="searchForm" label-width="auto">
                    <el-form-item label="搜索：">
                        <el-input placeholder="请输入菜单名称查询"></el-input>
                        <div class="search-inline">
                            <el-button type="primary" :icon="Search">搜索</el-button>
                            <el-button type="primary" :icon="Plus" @click="addNew" v-if="hasNewPer">新增</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <div class="table-box">
            <el-card shadow="always">
                <el-table :data="tableData" ref="menuTable" row-key="id"
                    :tree-props="{ children: 'childList', hasChildren: 'hasChildren' }" lazy :load="getChildList"
                    :key="tableKey">
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="type" label="类型" width="100px">
                        <template #default="scope">
                            {{
                                    scope.row.type == 0
                                        ? "目录"
                                        : scope.row.type == 1
                                            ? "菜单"
                                            : "权限"
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="href" label="路径" align="center"></el-table-column>
                    <el-table-column label="是否显示" align="center" width="120px">
                        <template #default="scope">{{ scope.row.isShow ? "是" : "否" }}</template>
                    </el-table-column>
                    <el-table-column prop="permission" label="权限标识" align="center"></el-table-column>
                    <el-table-column prop="sort" label="排序" align="center" width="100px">
                        <template #default="scope">
                            <el-input v-model="scope.row.sort" type="number" :readonly="!hasUpdatePer"
                                @change="changeSortRow(scope.row)" class="table_input">
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="icon" label="图标" align="center" width="100px">
                        <template #default="scope">
                            <i class="iconfont" :class="'icon-' + scope.row.icon"></i>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                        <template #default="scope">
                            <el-button type="primary" text @click="editMenuOpen(scope.row)" v-if="hasUpdatePer">修改
                            </el-button>
                            <el-button type="danger" text @click="removeMenuFun(scope.row)" class="danger-color"
                                v-if="hasRemovePer">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
    </div>
    <el-dialog v-model="editDialogShow" width="700px" title="编辑菜单" append-to-body destroy-on-close>
        <div>
            <el-form ref="dialogFormRef" :model="dialogForm" label-width="auto" :rules="dialogFormRules">
                <el-form-item label="菜单类型：" prop="type">
                    <el-radio-group v-model="dialogForm.type" @change="changeMenuType"
                        :disabled="Boolean(dialogForm.id && dialogForm.id.length)">
                        <el-radio :label="0">目录</el-radio>
                        <el-radio :label="1">菜单</el-radio>
                        <el-radio :label="2">权限</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="父级菜单：" prop="parentId">
                    <el-cascader v-if="casShow" :options="parentList"
                        :disabled="dialogForm.type == 0 || Boolean(dialogForm.id && dialogForm.id.length)"
                        v-model="dialogForm.parentId" ref="parentHandle" :props="casProp" clearable
                        @change="chooseParentId" placeholder="请选择父级菜单">
                    </el-cascader>
                    <!-- :key="Math.random()" -->
                </el-form-item>
                <el-form-item label="菜单名称：" prop="name">
                    <el-input v-model="dialogForm.name"></el-input>
                </el-form-item>
                <el-form-item v-if="dialogForm.type == 0" label="图标：" prop="icon">
                    <el-input v-model="dialogForm.icon" @focus="showIconChoose">
                        <template #prepend>
                            <span>
                                <i class="iconfont" :class="'icon-' + dialogForm.icon"></i>
                            </span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item v-if="dialogForm.type == 2" label="权限标识：" prop="permission">
                    <el-input v-model="dialogForm.permission"></el-input>
                </el-form-item>
                <el-form-item v-if="dialogForm.type == 1" label="路径：" prop="href">
                    <el-input v-model="dialogForm.href"></el-input>
                </el-form-item>
                <el-form-item label="排序：" prop="sort">
                    <el-input v-model="dialogForm.sort" type="number"></el-input>
                </el-form-item>
                <el-form-item label="备注：" prop="remarks">
                    <el-input v-model="dialogForm.remarks"></el-input>
                </el-form-item>
                <el-form-item label="是否显示：" prop="isShow" v-show="dialogForm.type != 2">
                    <el-radio-group v-model="dialogForm.isShow">
                        <el-radio :label="1">是</el-radio>
                        <el-radio :label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-button type="primary" @click="submitDialog" :loading="submitDialogLoading">提交</el-button>
            <el-button @click="editDialogShow = false">取消</el-button>
        </template>
    </el-dialog>
    <iconPickerVue ref="iconpicker" @choosed="choosedIcon" />
</template>

<script>
import { onMounted, reactive, ref, toRefs, inject, onBeforeMount } from 'vue-demi'
import { Search, Plus } from '@element-plus/icons-vue'
import { getMenuList, newMenu, updateMenu, updateMenuSort, removeMenu } from '../../api/userApi'
import iconPickerVue from '../../components/iconPicker.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { checkPer } from '../../common/comFun'
export default {
    components: { Search, Plus, iconPickerVue },
    setup() {

        const injector = inject('reloadMenu')

        const hasNewPer = ref(false)
        const hasUpdatePer = ref(false)
        const hasRemovePer = ref(false)

        const editDialogShow = ref(false)
        const casShow = ref(true)
        const iconpicker = ref(null)
        const submitDialogLoading = ref(false)
        const dialogFormRef = ref(null)

        const dialogFormRules = reactive({
            name: [
                {
                    required: true,
                    message: "请输入菜单名称",
                    trigger: "blur",
                },
            ],
            icon: [
                {
                    required: true,
                    message: "请输入菜单图标",
                    trigger: "blur",
                },
            ],
        })

        const casProp = reactive({
            checkStrictly: true,
            label: "name",
            value: "id",
            lazy: true,
            lazyLoad(node, resolve) {
                let { data } = node
                getMenuList({
                    parentId: data.id
                }).then(res => {
                    // console.log(res)
                    let arr = res.data.map(item => {
                        item.disabled = item.type === 2
                        if (item.type == 0 && state.dialogForm.type == 2) {
                            item.disabled = true
                        }
                        if (item.type == 1 && state.dialogForm.type == 1) {
                            item.disabled = true
                        }
                        return item
                    })
                    resolve(arr)
                })
            }
        })

        const state = reactive({
            searchForm: {},
            dialogForm: {},
            tableData: [],
            tableKey: 1,
            parentList: []
        })

        onBeforeMount(() => {
            hasNewPer.value = checkPer('sys:menu:save')
            hasUpdatePer.value = checkPer('sys:menu:update')
            hasRemovePer.value = checkPer('sys:menu:delete')
        })

        onMounted(() => {
            getTableData()
        })

        const getTableData = () => {
            getMenuList({
                name: state.searchForm.name
            }).then(res => {
                for (let i = 0; i < res.data.length; i++) {
                    res.data[i].hasChildren = true;
                    // res.data[i].domainList = res.data[i].domains.split(',')
                }
                state.tableData = JSON.parse(JSON.stringify(res.data))
                state.tableKey += 1
            })
        }

        const addNew = () => {
            state.dialogForm = {
                type: 0,
                isShow: 1,
                sort: 99
            }
            editDialogShow.value = true
        }

        const editMenuOpen = (row) => {
            state.dialogForm = row
            editDialogShow.value = true
            changeMenuType(dialogForm.type)
        }

        const removeMenuFun = (row) => {
            ElMessageBox.confirm('删除菜单后无法恢复，确认删除？', '提示', {
                type: 'error'
            }).then(() => {
                removeMenu({ id: row.id }).then(res => {
                    if (res) {
                        ElMessage.success('已删除')
                        getTableData()
                        injector()
                    }
                })
            }).catch(() => {
                ElMessage('已取消')
            })
        }

        const changePage = (e) => {
            state.pageParams.page = e
            getTableData()
        }

        const getChildList = (row, node, resolve) => {
            getMenuList({
                parentId: row.id
            }).then((res) => {
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].type < 2) {
                        res.data[i].hasChildren = true;
                    }
                }
                // node.childList = res.data.data
                resolve(JSON.parse(JSON.stringify(res.data)));
            });
        }

        const changeMenuType = (e) => {
            delete state.dialogForm.parentId
            if (e == 2) {
                delete dialogFormRules.icon;
                delete dialogFormRules.href;
                state.dialogForm.isShow = 0
                dialogFormRules.permission = [
                    {
                        required: true,
                        message: "请输入权限标识",
                        trigger: "blur",
                    },
                ]
            } else {
                if (e == 1) {
                    delete dialogFormRules.icon
                    delete dialogFormRules.permission
                    dialogFormRules.href = [
                        {
                            required: true,
                            message: "请输入URL",
                            trigger: "blur",
                        },
                    ];
                } else {
                    delete dialogFormRules.href
                    delete dialogFormRules.permission
                    dialogFormRules.icon = [
                        {
                            required: true,
                            message: "请输入菜单图标",
                            trigger: "blur",
                        },
                    ];

                }
            }
            casShow.value = false
            setTimeout(() => {
                casShow.value = true
            }, 0);
        }

        const chooseParentId = (e) => {
            // console.log(that.$refs.parentHandle);
            state.dialogForm.parentId = e[e.length - 1];
            state.dialogForm.parentIds = e.join(",");
            // that.$refs.parentHandle.dropDownVisible = false;
        }

        const showIconChoose = () => {
            // console.log(iconpicker.value);
            iconpicker.value.open(state.dialogForm.icon);
        }

        const choosedIcon = (e) => {
            state.dialogForm.icon = e;
        };

        const submitDialog = () => {
            dialogFormRef.value.validate(valid => {
                if (valid) {
                    submitDialogLoading.value = true
                    if (state.dialogForm.id) {
                        updateMenu(state.dialogForm).then(res => {
                            if (res) {
                                ElMessage.success('修改成功')
                                getTableData()
                                editDialogShow.value = false
                                injector()
                            }
                        }).finally(() => {
                            submitDialogLoading.value = false
                        })
                    } else {
                        newMenu(state.dialogForm).then(res => {
                            if (res) {
                                ElMessage.success('添加成功')
                                getTableData()
                                editDialogShow.value = false
                                injector()
                            }
                        }).finally(() => {
                            submitDialogLoading.value = false
                        })
                    }
                }
            })
        }

        const changeSortRow = (row) => {
            updateMenuSort(row).then(res => {
                console.log(res)
                if (res) {
                    ElMessage.success('修改成功')
                    injector()
                }
            })
        }

        return {
            ...toRefs(state),
            Search,
            Plus,
            editDialogShow,
            addNew,
            editMenuOpen,
            removeMenuFun,
            changePage,
            getChildList,
            casShow,
            changeMenuType,
            dialogFormRules,
            casProp,
            chooseParentId,
            showIconChoose,
            iconpicker,
            choosedIcon,
            submitDialog,
            submitDialogLoading,
            dialogFormRef,
            changeSortRow,
            hasNewPer,
            hasRemovePer,
            hasUpdatePer,
        }
    }
}
</script>