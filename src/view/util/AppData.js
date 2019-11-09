/**
 * 固定数据统一存放类
 */
export const permisstion = [{ name: '专工权限', value: 0 }, { name: '运行权限', value: 1 }, { name: '消费审批权限', value: 2 }, { name: '维修专工权限', value: 3 }]
export const permisstionWithDes = [
    { name: '专工权限', value: 0, des: '可以在缺陷处理过程中，进行缺陷的分配和验收工作，添加缺陷备注' },
    { name: '运行权限', value: 1, des: '可以在缺陷处理过程中，进行最后的运行验收工作' },
    { name: '消费审批权限', value: 2, des: '可以处理消费申请，进行审批操作' },
    { name: '维修专工权限', value: 3, des: '可以自行处理未分配的权限，无需专工分配，添加缺陷备注' }]

// const optionsDataOld = [{ "value": "1", "text": "文本输入框" }, { "value": "2", "text": "数字输入框" }, { "value": "3", "text": "单选" },
// { "value": "4", "text": "多选" }, { "value": "5", "text": "文本域" }, { "value": "6", "text": "图片选择器" }, { "value": "7", "text": "表单类型",{ "value": "10", "text": "测温组件" }, { "value": "11", "text": "测振组件" },{ "value": "12", "text": "默认" }];
export const tableCellOptionsData = [
    { "value": "7", "text": "表单类型" }, { "value": "12", "text": "通用" },
    { "value": "10", "text": "测温组件" }, { "value": "11", "text": "测振组件" },
    { "value": "6", "text": "图片选择器" }, { "value": "2", "text": "数字输入框" },
    { "value": "13", "text": "副标题" }];

export const VersionlistData = [
    { title: '版本号', description: 'V 1.2.4 dev' },
    // { title: '更新', description: '1.0.7支持缺陷数据导出为Excel' }
    // { title: '更新', description: '1.0.8 添加考勤信息-测试版本' }
    // { title: '更新', description: '1.0.9 添加设备信息修改功能' }
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
    { title: '更新', description: '1.2.4 dev 支持表单拖拽修改' }
]