import { defAxios } from "../axios";

//用户相关
export const login = params => defAxios.post('/sys/login', params, { headers: { 'Content-Type': 'multipart/form-data' } }); //用户登录
export const logout = params => defAxios.delete('/sys/logout', params)  //用户登出
export const getSelfInfo = () => defAxios.get('/sys/user/getSelfInfo')  //获取当前用户信息
export const reloadSelf = params => defAxios.put('/sys/user/reloadUser', params) //刷新缓存中的当前用户
export const updateSelf = params => defAxios.put('/sys/user/updateSelfinfo', params) //修改当前用户信息



//菜单
export const getMenuTreeNavigation = params => defAxios.get('/sys/menu/getMenuTreeNavigation', params) //获取左侧菜单
export const getMenuList = params => defAxios.get('/sys/menu/getMenuList', { params }) //获取菜单列表（菜单页面列表）
export const getMenuTree = params => defAxios.get('/sys/menu/getMenuTree', { params }) //获取菜单树
export const newMenu = params => defAxios.post('/sys/menu/saveMenu', params) //创建菜单
export const updateMenu = params => defAxios.put('/sys/menu/updateMenu', params) //修改菜单
export const updateMenuSort = params => defAxios.put('/sys/menu/updateSort', params)    //修改菜单排序
export const removeMenu = params => defAxios.delete('/sys/menu/deleteMenu', { params }) //删除菜单


//机构
export const getOfficeTree = params => defAxios.get('/sys/office/findOfficeTree', params)    //获取机构树结构
export const getOfficePage = params => defAxios.get('/sys/office/findOfficePage', { params })   //获取机构列表
export const getOfficeDetail = params => defAxios.get('/sys/office/getOfficeById', { params }) //获取机构详情
export const newOffice = params => defAxios.post('/sys/office/saveOffice', params)  //新增机构
export const updateOffice = params => defAxios.put('/sys/office/updateOffice', params) //修改机构
export const deleteOffice = params => defAxios.delete('/sys/office/deleteOffice', { params }) //删除机构


//角色
export const getRoleList = params => defAxios.get('/sys/role/findRoleList', { params }) //获取角色列表
export const getRolePage = params => defAxios.get('/sys/role/findRolePage', { params }) //分页获取角色列表
export const getRoleDetail = params => defAxios.get('/sys/role/getRoleById', { params }) //获取角色详情
export const newRole = params => defAxios.post('/sys/role/saveRole', params) //创建角色
export const updateRole = params => defAxios.put('/sys/role/updateRole', params) //修改角色
export const updateRoleMenu = params => defAxios.put('/sys/role/updateRoleMenu', params) // 修改角色菜单权限
export const deleteRole = params => defAxios.delete('/sys/role/deleteRole', { params })   //删除角色


//用户
export const getUserList = params => defAxios.get('/sys/user/findUserList', params) //获取所有用户列表
export const getUserPage = params => defAxios.get('/sys/user/findUserPage', { params }) //分页获取用户列表
export const getUserDetail = params => defAxios.get('/sys/user/getUserById', { params }) //获取用户详情
export const newUser = params => defAxios.post('/sys/user/saveUser', params)    //创建用户
export const updateUser = params => defAxios.put('/sys/user/updateUser', params) //修改用户信息
export const lockUser = params => defAxios.put('/sys/user/lockedUser', params) //修改用户锁定状态
export const resetUserPwd = params => defAxios.put('/sys/user/resetUserPassword', params)   //重置用户密码
export const deleteUser = params => defAxios.delete('/sys/user/deleteUser', { params })   //删除用户