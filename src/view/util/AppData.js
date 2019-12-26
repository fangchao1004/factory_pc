/**
 * 固定数据统一存放类
 */
export const permisstion = [{ name: '专工权限', value: 0 }, { name: '运行权限', value: 1 }, { name: '消费审批权限', value: 2 }, { name: '维修权限', value: 3 }]
export const permisstionWithDes = [
    { name: '专工权限', value: 0, des: '可以在缺陷处理过程中，进行缺陷的分配和验收工作，可以直接消除缺陷，同时可以添加缺陷备注' },
    { name: '运行权限', value: 1, des: '可以在缺陷处理过程中，进行最后的运行验收工作' },
    { name: '维修权限', value: 3, des: '可以自行维修处理未分配过的缺陷，无需专工分配，同时可以添加缺陷备注' },
    { name: '消费审批权限', value: 2, des: '可以处理消费申请，进行审批操作' }]
export const adminPermission = { name: '管理员权限', des: '管理员权限，可以增减修改各个选项，查看所有信息' }
// const optionsDataOld = [{ "value": "1", "text": "文本输入框" }, { "value": "2", "text": "数字输入框" }, { "value": "3", "text": "单选" },
// { "value": "4", "text": "多选" }, { "value": "5", "text": "文本域" }, { "value": "6", "text": "图片选择器" }, { "value": "7", "text": "表单类型",{ "value": "10", "text": "测温组件" }, { "value": "11", "text": "测振组件" },{ "value": "12", "text": "默认" }];
export const tableCellOptionsData = [
    { "value": "7", "text": "表单类型" }, { "value": "12", "text": "通用" },
    { "value": "10", "text": "测温组件" }, { "value": "11", "text": "测振组件" },
    { "value": "6", "text": "图片选择器" }, { "value": "2", "text": "数字输入框" },
    { "value": "13", "text": "副标题" }];

export const VersionlistData = [
    { title: '版本号', description: 'V 1.3.9' },
    // { title: '更新', description: '1.0.7支持缺陷数据导出为Excel' }
    // { title: '更新', description: '1.0.8 添加考勤信息-测试版本' }
    // { title: '更新', description: '1.0.9 添加巡检点信息修改功能' }
    // { title: '更新', description: '1.1.0 消费审批' }
    // { title: '更新', description: '1.1.1 任务进程添加' }
    // { title: '更新', description: '1.1.2 点检record-改造+巡检记录展示改造' }
    // { title: '更新', description: '1.1.3 增加巡检点处-区域和巡检点类型筛选' }
    // { title: '更新', description: '1.1.4 多级区域' }
    // { title: '更新', description: '1.1.5 多级区域-自由选择' }
    // { title: '更新', description: '1.1.6 打点时间修改-添加巡检时间段模块' }
    // { title: '更新', description: '1.1.7 编辑表单模块增设通用组件' }
    // { title: '更新', description: '1.1.8' }
    // { title: '更新', description: '1.2.0' }
    // { title: '更新', description: '1.2.1 dev 创建表单时-支持图片选择器组件和数字输入框组件' }
    // { title: '更新', description: '1.2.2 dev 支持副标题-专工和运行专工可以添加缺陷的备注' }
    // { title: '更新', description: '1.2.3 dev 支持表单修改' }
    // { title: '更新', description: '1.2.4 dev 支持表单拖拽修改' }
    // { title: '更新', description: '1.2.5 缺陷备注添加日志记录功能' }
    // { title: '更新', description: '1.2.5 dev 删除缺陷，更新record' }
    // { title: '更新', description: '1.2.6 添加开停运功能-所有人可以导出缺陷excel' }
    // { title: '更新', description: '1.2.6 dev 支持时间端选择和修改' }
    // { title: '更新', description: '1.2.7 解决部分Bug' }
    // { title: '更新', description: '1.2.7 dev 添加值长功能' }
    // { title: '更新', description: '1.2.8 测试版' }
    // { title: '更新', description: '1.2.9' }
    // { title: '更新', description: '1.3.0 部分优化，编辑模版表单时，可以设置数组输入框的单位' }
    // { title: '更新', description: '1.3.1 解决部分bug' }
    // { title: '更新', description: '1.3.2 消费记录，车辆记录添加日期筛选 ' }
    // { title: '更新', description: '1.3.3 任务支持的再次手动发送短信提醒' }
    // { title: '更新', description: '1.3.4 时间段和设备之间-映射关系调整' }
    // { title: '更新', description: '1.3.5 部分bug修复' }
    // { title: '更新', description: '1.3.6 区域模块添加故障统计数显示' }
    // { title: '更新', description: '1.3.7 首页巡检统计调整' }
    // { title: '更新', description: '1.3.8 缺陷图片列整合置内容列中' }
    // { title: '更新', description: '1.3.9 首页缺陷统计调整' }
]