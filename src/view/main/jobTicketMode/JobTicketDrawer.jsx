import { Button, Drawer, Select, message, Modal, Affix, Tag, Input, Spin, Alert } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { changeShowLabByStauts, checkCellWhichIsEmpty, checkDataIsLostValue, checkJBTStatusIsChange, deleteMainSubJBT, getJTRecordContentAndPlanTime, getPinYin, getTargetMajorManagerList } from '../../util/Tool';
import moment from 'moment'
import JobTicketStepLogView from './JobTicketStepLogView';
const { confirm } = Modal;
const { TextArea } = Input;
const { Option, OptGroup } = Select
const storage = window.localStorage;
var step_des = '';
var ticketNextUserNameList = [];
export default function JobTicketDrawer({ isAgent, visible, onClose, record, resetData }) {
    // console.log('record:', record);

    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})///填写改动后的数值- 提交时使用
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [userList, setUserList] = useState([])
    const [selectValue, setSelectValue] = useState('1')

    const [actionSelectAble, setActionSelectAble] = useState(true)///处理选项是否可以操作
    const [userSelectAble, setUserSelectAble] = useState(true)///人员项是否可以操作
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)///是否显示删除按钮
    const [showStopBtn, setShowStopBtn] = useState(false)///是否显示终止作废按钮
    const [showBackOption, setShowBackOption] = useState(false)///是否显示打回按钮
    const [takeTicketAndPrint, setTakeTicketAndPrint] = useState(false)///是否接票并且打印
    const [showPrintBtn, setShowPrintBtn] = useState(false)///是否显示打印按钮
    const [perStepIsBack, setPerStepIsBack] = useState(false)///操作记录中上一步已经是打回操作

    const [runnerList, setRunnerList] = useState([])
    const [otherList, setOtherList] = useState([])
    const [ticketNextUserList, setTicketNextUserList] = useState([])
    const [remark, setRemark] = useState('')
    const [loading, setLoading] = useState(true)
    const [printing, setPrinting] = useState(false)

    const runUserlist = useCallback(async (user_list, role_id_list) => {
        let res = await HttpApi.getRunnerIdList({ role_id_list })
        if (res.data.code === 0) {
            let runner_list1 = res.data.data;
            // console.log('res:', res.data.data);
            // console.log('user_list:', user_list);
            let copy_user_list = JSON.parse(JSON.stringify(user_list))
            copy_user_list.forEach((user) => {
                user.is_runner = false
                runner_list1.forEach((runner) => {
                    if (user.id === runner.user_id) { user.is_runner = true }
                })
            })
            let runner_list = [];
            let other_list = [];
            copy_user_list.forEach((item) => {
                const { id, name } = item
                if (item.is_runner) {
                    runner_list.push({ id, name })
                } else { other_list.push({ id, name }) }
            })
            // console.log('runner_list:', runner_list);
            // console.log('other_list:', other_list);
            setRunnerList(runner_list)
            setOtherList(other_list)
        }
    }, [])

    const init2 = useCallback(async () => {
        if (record && record.job_t_r_id) {
            let res_user = await HttpApi.getUserInfo({ effective: 1 })
            if (res_user.data.code === 0) {
                var user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
                setUserList(user_list)
            }
            ///初始化
            setTakeTicketAndPrint(false)///【提交打印】关闭
            setShowDeleteBtn(false)///不展示删除按钮
            setShowStopBtn(false)///作废按钮
            setShowPrintBtn(false)///打印按钮
            setActionSelectAble(true)///操作选择项可以选
            setUserSelectAble(true)///人员选择项可以选
            setShowBackOption(false)///不可以打回
            if (record.is_sub === 1) {///措施票情况【一级措施票】【后续新增二级情况】
                // console.log('1111措施票');
                if (record.status === 0) {
                    runUserlist(user_list, [11])//////值长人名单[针对下一步1-待安措]
                } else if (record.status === 1) {///当前待安措时
                    if (currentUser.id === record.user_id) {///如果用户是创建者，那么可以删除
                        setShowDeleteBtn(true)///展示删除按钮
                    }
                    setShowBackOption(true)///可以打回
                    ///措施票 状态1 待安措时 运行可以操作
                    runUserlist(user_list, isAgent ? [11] : [8])///初审人名单[针对下一步2-待初审]
                } else if (record.status === 2) {///当前待初审时
                    setShowBackOption(true)///可以打回
                    setShowStopBtn(true)///可以作废
                    runUserlist(user_list, isAgent ? [8] : [9])///复审人名单[针对下一步3-待复审]
                } else if (record.status === 3) {///当前待复审时
                    setShowBackOption(true)///可以打回
                    setShowStopBtn(true)///可以作废
                    runUserlist(user_list, isAgent ? [9] : [10])///批准人名单[针对下一步4-待批准]
                } else if (record.status === 4) {///当前待批准
                    setShowBackOption(true)///可以打回
                    setShowStopBtn(true)///可以作废
                    runUserlist(user_list, isAgent ? [10] : [11])///运行值长名单[针对下一步5-待接票打印]
                } else if (record.status === 5) {///当前待接票打印
                    setShowBackOption(true)///可以打回
                    setShowStopBtn(true)///可以作废
                    runUserlist(user_list, [11])///运行值长名单[针对下一步5-待终结]
                }
                else if (record.status === 6) {///当前待终结
                    setShowBackOption(true)///可以打回
                    setShowStopBtn(true)///可以作废
                    setShowPrintBtn(true)///可以打印
                    if (!isAgent) setUserSelectAble(false)///处理情况下不可选择人员
                    runUserlist(user_list, [11])
                } else if (record.status === 7) {
                    setUserSelectAble(false)///不可选择人员
                }
            } else if (record.is_sub === 0) {///主票情况
                // console.log('1111主票');
                if (record.status === 0) {
                    let { majorManagerList, otherList } = await getTargetMajorManagerList({ major_id: record.major_id })
                    setRunnerList(majorManagerList) ///当前专业专工
                    setOtherList(otherList)
                } else if (record.status === 1) {///当前待签发
                    if (isAgent) {
                        let { majorManagerList, otherList } = await getTargetMajorManagerList({ major_id: record.major_id })
                        setRunnerList(majorManagerList) ///当前专业专工
                        setOtherList(otherList)
                    } else {
                        setShowBackOption(true)///可以打回
                        runUserlist(user_list, [11])///运行值长
                    }
                    if (currentUser.id === record.user_id) {
                        setShowDeleteBtn(true)///展示删除按钮
                    }
                } else if (record.status === 2) {///当前待接票
                    // if (!isAgent && selectValue === '1') setTakeTicketAndPrint(true)///处理 下一步时 可以【提交打印】
                    setShowStopBtn(true)///可以作废
                    setShowBackOption(true)///可以打回
                    runUserlist(user_list, [11])///运行值长
                } else if (record.status === 3) {///当前待终结
                    setShowStopBtn(true)///可以作废
                    setShowPrintBtn(true)///可以打印
                    setShowBackOption(true)///可以打回
                    if (!isAgent) setUserSelectAble(false)///处理情况下不可选择人员
                    runUserlist(user_list, [11])///运行值长
                } else if (record.status === 4) {///终结时
                    setUserSelectAble(false)///不可选择人员
                }
            }

            ///判断上一步操作
            let res_step = await HttpApi.getJTStepLogs({ jbtar_id: record.id })
            if (res_step.data.code === 0) {
                const step_list = res_step.data.data
                const last_step_des = step_list[step_list.length - 1].step_des
                if (last_step_des) {
                    const last_is_back = last_step_des.indexOf('打回') !== -1 || last_step_des.indexOf('撤回') !== -1 || last_step_des.indexOf('调度') !== -1
                    setPerStepIsBack(last_is_back)
                }

            }
            // console.log('init2 selectValue:', selectValue);
            ///处理 下一步时 可以【提交打印】
            if (!isAgent && selectValue === '1') {
                if (record.is_sub === 0 && record.status === 2) { setTakeTicketAndPrint(true) }
                else if (record.is_sub === 1 && record.status === 5) { setTakeTicketAndPrint(true) }
            } else { setTakeTicketAndPrint(false) }
            if (selectValue === '1' && record && record.status >= 0) {
                step_des = changeShowLabByStauts(record.status, record.is_sub)
            } else if (selectValue === '-1') {
                step_des = '打回'
                runUserlist(user_list, [0])///所有人
            }
        }
    }, [currentUser, runUserlist, isAgent, selectValue, record])

    const init = useCallback(async () => {
        // console.log('init');
        if (record && record.job_t_r_id) {
            setSelectValue('1')
            let res = await HttpApi.getJTRecords({ id: record.job_t_r_id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                setCurrentJobTicketValue(tempObj)///票数据初始化
            }
        }
        setLoading(false)
    }, [record])

    const resetHandler = useCallback(() => {
        onClose()
        resetData()
        setSelectValue(null)
        setRemark('')
        setTicketNextUserList([])
        step_des = '';
        ticketNextUserNameList = '';
    }, [onClose, resetData])

    const renderAllPage = useCallback(() => {
        if (record && currentJobTicketValue && currentJobTicketValue.pages) {
            // console.log('aaaa:', currentJobTicketValue);
            let scalObj = {}
            if (currentJobTicketValue.scal) {
                scalObj = JSON.parse(currentJobTicketValue.scal)
            }
            return currentJobTicketValue.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={currentJobTicketValue}
                    isAgent={record.is_agent}
                    currentStatus={record ? record.status : 1}
                    userList={userList}
                    currentUser={currentUser}
                    currentPageIndex={index}
                    scaleNum={scalObj.scaleNum || 1}
                    bgscaleNum={scalObj.bgscalNum || 1}
                    callbackValue={v => {
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [record, currentJobTicketValue, currentUser, userList])
    const getUserGroupList = useCallback(() => {
        let result = []
        if (otherList.length > 0) {
            result = [<OptGroup key='1' label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>对应权限人员</span><Button type='link' size='small' onClick={() => {
                setTicketNextUserList(runnerList.map((item) => item.id))
                ticketNextUserNameList = runnerList.map((item) => item.name)
            }}>全选</Button></div>}>
                {runnerList.map((item, index) => { return <Option key={'1' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
            </OptGroup>,
            <OptGroup key='2' label="其他">
                {otherList.map((item, index) => { return <Option key={'2' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
            </OptGroup>
            ]
        }
        if (!isAgent && selectValue !== '-1') {
            return result.slice(0, 1)///非代理情况下。移除其他分组
        }
        return result
    }, [runnerList, otherList, isAgent, selectValue])
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            init();
        }, 300);
    }, [init])
    useEffect(() => {
        setTimeout(() => {
            init2();
        }, 500);
    }, [init2])
    useEffect(() => {
        if (window.electron) {
            console.log('添加监听');
            window.electron.ipcRenderer.on('message', (_, arg) => {
                if (arg === 'printStart') { message.info('开始打印') }
                else if (arg === 'printSuccess') { message.success('打印成功'); setPrinting(false) }
                else { message.error('打印失败'); setPrinting(false) }
            })
        }
        return () => {
            if (window.electron) {
                console.log('移除监听');
                window.electron.ipcRenderer.removeAllListeners('message')
            }
        }
    }, [])
    return (
        <Drawer
            destroyOnClose={true}
            width={1200}
            title={isAgent ? "工作票调度" : "工作票处理"}
            placement='left'
            onClose={onClose}
            visible={visible}
        >
            {loading ?
                <Spin tip="加载数据中...">
                    <Alert
                        message="正在打开【工作票处理】页面"
                        description="在此页面进行工作票的流程处理"
                        type="info"
                    />
                </Spin> :
                <Spin spinning={printing}>
                    <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#F1F2F5', padding: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {renderAllPage()}
                        </div>
                        <Affix offsetTop={100}>
                            <div style={styles.panel}>
                                {showStopBtn && !isAgent ?
                                    <Button type='danger' size='small' icon='stop' style={{ marginRight: 10 }} onClick={() => {
                                        confirm({
                                            title: '确认作废当前工作票吗?',
                                            content: record.is_sub === 0 ? '其下措施票也会一并作废' : '请自行保证准确性',
                                            okText: '确认',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                let res_status = await checkJBTStatusIsChange(record)
                                                if (res_status.code !== 0) {
                                                    message.error('当前工作票的最新状态已经发生变动；当前操作无效。已经为你刷新数据', 5)
                                                    resetHandler()
                                                    return
                                                }
                                                let res_delete = await deleteMainSubJBT(record, 0)
                                                if (res_delete.code === 0) { message.success(res_delete.message) } else { message.error(res_delete.message) }
                                                resetHandler()
                                            }
                                        })
                                    }}>作废</Button> : null}
                                {showDeleteBtn && !isAgent ?
                                    <Button type='danger' size='small' icon='delete' style={{ marginTop: 10, marginRight: 10 }} onClick={() => {
                                        confirm({
                                            title: '确认删除当前工作票吗?',
                                            content: record.is_sub === 0 ? '其下措施票也会一并删除' : '请自行保证准确性',
                                            okText: '确认',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                let res_status = await checkJBTStatusIsChange(record)
                                                if (res_status.code !== 0) {
                                                    message.error('当前工作票的最新状态已经发生变动；当前操作无效。已经为你刷新数据', 5)
                                                    resetHandler()
                                                    return
                                                }
                                                let res_delete = await deleteMainSubJBT(record)
                                                if (res_delete.code === 0) { message.success(res_delete.message) } else { message.error(res_delete.message) }
                                                resetHandler()
                                            }
                                        })
                                    }}>删除</Button> : null}
                                <Button icon='unordered-list' size='small' type='default' onClick={() => {
                                    // console.log('选择的措施票数据:', item);
                                    setStepLogVisible(true);
                                }}>记录</Button>
                                {!isAgent ?
                                    <div style={{ marginTop: 10, ...styles.bar }}>
                                        <span><Tag size='small' color='blue'>处理</Tag></span>
                                        <Select value={selectValue} placeholder='请选择处理项' allowClear size='small' style={{ width: '100%' }} disabled={!actionSelectAble}
                                            onChange={(v, v2) => {
                                                setSelectValue(v)
                                                if (v2) { step_des = v2.props.children }
                                                if (v === '-1' || step_des === '终结') { setTicketNextUserList([]) }
                                            }}
                                        >
                                            <Option value='1'>{record && record.status >= 1 ? changeShowLabByStauts(record.status, record.is_sub) : '通过'}</Option>
                                            {showBackOption ? <Option value='-1'>打回</Option> : null}
                                        </Select>
                                    </div> : null}
                                <div style={{ marginTop: 10, ...styles.bar }}>
                                    <span><Tag size='small' color='blue'>人员</Tag></span>
                                    <Select showSearch mode='multiple'
                                        filterOption={(input, option) => {
                                            if (option.props.short_lab) {
                                                let res = option.props.short_lab.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                return res
                                            } else {
                                                return false
                                            }
                                        }}
                                        maxTagCount={5}
                                        value={ticketNextUserList}
                                        placeholder={isAgent ? '新处理人' : '下一步处理人员'} allowClear size='small' style={{ width: '100%' }}
                                        disabled={(selectValue === '-1' && !perStepIsBack) || !userSelectAble}
                                        onChange={(v, option) => {
                                            setTicketNextUserList(v)
                                            ticketNextUserNameList = option.map((item) => { return item.props.children })
                                        }}
                                    >
                                        {getUserGroupList()}
                                    </Select>
                                </div>
                                <div style={{ marginTop: 10, ...styles.bar }}>
                                    <span><Tag size='small' color='blue'>备注</Tag></span>
                                    <TextArea rows={4} value={remark} onChange={(e) => { setRemark(e.target.value) }} />
                                </div>
                                <Button disabled={!actionSelectAble} type='primary' size='small' icon={takeTicketAndPrint ? '' : 'upload'} style={{ marginTop: 10, marginRight: 10 }} onClick={async () => {
                                    if (isAgent) {
                                        console.log('调度的情况时');
                                        if (ticketNextUserNameList.length === 0) { message.error('请选择新的处理人员'); return }
                                        if (!remark) { message.error('调度时，备注必填'); return }
                                        confirm({
                                            title: '确认提交吗?',
                                            content: '请自行保证准确性',
                                            okText: '确认',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                let current_step_user_id_list_temp = ',' + ticketNextUserList.join(',') + ','
                                                ///每次处理 未读重置
                                                let newJTAR_data = {
                                                    is_read: 0,
                                                    id: record.id,
                                                    per_step_user_id: currentUser.id,
                                                    per_step_user_name: currentUser.name,
                                                    current_step_user_id_list: current_step_user_id_list_temp,///当前处理人id ,0,1,
                                                    history_step_user_id_list: record.history_step_user_id_list + (current_step_user_id_list_temp.length > 1 ? current_step_user_id_list_temp.substring(1) : ''),
                                                    is_agent: 1
                                                }
                                                let res2 = await HttpApi.updateJTApplyRecord(newJTAR_data)
                                                if (res2.data.code === 0) {
                                                    let obj = {};
                                                    obj['jbtar_id'] = record.id
                                                    obj['user_id'] = currentUser.id
                                                    obj['user_name'] = currentUser.name
                                                    obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss')
                                                    obj['step_des'] = '调度至 ' + ticketNextUserNameList.join(',')
                                                    obj['remark'] = remark
                                                    obj['is_agent'] = 1
                                                    HttpApi.addJbTStepLog(obj)///添加log
                                                    message.success('调度成功')
                                                    resetHandler()
                                                }
                                            }
                                        })
                                        return;
                                    }
                                    if (!selectValue) { message.error('请先选择处理项'); return }
                                    let afterCheckObj;
                                    if (selectValue === "1") {///前往下一步时，数据不全
                                        if (record.is_sub === 1) {
                                            if (record.status < 5 && ticketNextUserNameList.length === 0) { message.error('请选择下一步的处理人员'); return }
                                        } else {
                                            if (record.status < 3 && ticketNextUserNameList.length === 0) { message.error('请选择下一步的处理人员'); return }
                                        }
                                        afterCheckObj = checkCellWhichIsEmpty(currentJobTicketValue, record.status)
                                        // console.log('afterCheckObj:', afterCheckObj);
                                        setCurrentJobTicketValue(afterCheckObj)
                                        let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj)
                                        // console.log('是否数据缺少:', needValueButIsEmpty);
                                        if (needValueButIsEmpty) {
                                            message.error('请填写好工作票后，再进行提交')
                                            return
                                        }
                                    } else {///返回上一步时，重新检查一边数据。状态-1
                                        if (perStepIsBack && ticketNextUserNameList.length === 0) {
                                            message.error('连续打回时，请选择打回处理人'); return
                                        }
                                        if (!remark) { message.error('打回时，备注必填'); return }
                                        afterCheckObj = checkCellWhichIsEmpty(currentJobTicketValue, record.status - 1)
                                        setCurrentJobTicketValue(afterCheckObj)
                                    }
                                    // return;
                                    confirm({
                                        title: '确认提交吗?',
                                        content: '请自行保证准确性',
                                        okText: '确认',
                                        okType: 'danger',
                                        cancelText: '取消',
                                        onOk: async () => {
                                            ///修改 job_tickets_records 中的pages 和 job_tickets_apply_records 中的status
                                            let res1 = await HttpApi.updateJTRecord({ id: currentJobTicketValue.id, pages: JSON.stringify(afterCheckObj.pages) })
                                            if (res1.data.code === 0) {
                                                let new_status = record.status;
                                                if (selectValue === "1") {
                                                    new_status = record.status + 1
                                                } else {
                                                    new_status = record.status - 1
                                                }
                                                let { job_content, time_list } = getJTRecordContentAndPlanTime({ pages: JSON.stringify(currentJobTicketValue.pages) })
                                                let current_step_user_id_list_temp = ''///下一步要给哪些人
                                                if (selectValue === '1') {
                                                    if (record.is_sub !== 0) {///措施票情况
                                                        if (record.status === 5) {
                                                            current_step_user_id_list_temp = ''
                                                        } else {
                                                            current_step_user_id_list_temp = ',' + ticketNextUserList.join(',') + ','
                                                        }
                                                    } else {///主票情况
                                                        if (record.status === 3) {
                                                            current_step_user_id_list_temp = ''
                                                        } else {
                                                            current_step_user_id_list_temp = ',' + ticketNextUserList.join(',') + ','
                                                        }
                                                    }
                                                } else {
                                                    current_step_user_id_list_temp = ',' + record.per_step_user_id + ','
                                                    ///zzz 上一步操作已经打回过一次
                                                    console.log('上一步操作已经打回过一次:', perStepIsBack);
                                                    if (perStepIsBack) {
                                                        current_step_user_id_list_temp = ',' + ticketNextUserList.join(',') + ','
                                                    }
                                                    console.log('current_step_user_id_list_temp:', current_step_user_id_list_temp);
                                                }
                                                let is_read = 0;
                                                if (record.is_sub !== 0) {
                                                    is_read = record.status === 5 ? 1 : 0 ///措施票状态5时，一下步就是6终结了 不需要在read重置
                                                } else {
                                                    is_read = record.status === 3 ? 1 : 0 ///主票状态3时，一下步就是4终结了 不需要在read重置
                                                }
                                                ///每次处理 未读重置
                                                let newJTAR_data = {
                                                    is_read: is_read,
                                                    id: record.id,
                                                    status: new_status,
                                                    job_content, time_begin: time_list[0], time_end: time_list[1],
                                                    per_step_user_id: currentUser.id, per_step_user_name: currentUser.name,///下一步 还是打回 上一步处理人都是当前的操作人
                                                    current_step_user_id_list: current_step_user_id_list_temp,///当前处理人id ,0,1,
                                                    history_step_user_id_list: record.history_step_user_id_list + (current_step_user_id_list_temp.length > 1 ? current_step_user_id_list_temp.substring(1) : ''),
                                                    is_agent: 0
                                                }
                                                let res2 = await HttpApi.updateJTApplyRecord(newJTAR_data)
                                                if (res2.data.code === 0) {
                                                    message.success('提交成功')
                                                    let obj = {};
                                                    obj['jbtar_id'] = record.id
                                                    obj['user_id'] = currentUser.id
                                                    obj['user_name'] = currentUser.name
                                                    obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss')
                                                    if (record.is_sub === 1) {///措施票
                                                        if (selectValue === '1') {///下一步
                                                            if (record.status === 5) {///当前是5 下一步就是6
                                                                obj['step_des'] = step_des
                                                            } else {
                                                                obj['step_des'] = step_des + '至 ' + ticketNextUserNameList.join(',')
                                                            }
                                                        } else {///打回
                                                            obj['step_des'] = step_des + '至 ' + record.per_step_user_name
                                                            if (perStepIsBack) {
                                                                obj['step_des'] = step_des + '至 ' + ticketNextUserNameList.join(',')
                                                            }
                                                        }
                                                    } else {///主票
                                                        if (selectValue === '1') {///下一步
                                                            if (record.status === 3) {///当前是3 下一步就是4
                                                                obj['step_des'] = step_des
                                                            } else {
                                                                obj['step_des'] = step_des + '至 ' + ticketNextUserNameList.join(',')
                                                            }
                                                        } else {///打回
                                                            obj['step_des'] = step_des + '至 ' + record.per_step_user_name
                                                            if (perStepIsBack) {
                                                                obj['step_des'] = step_des + '至 ' + ticketNextUserNameList.join(',')
                                                            }
                                                        }
                                                    }
                                                    obj['remark'] = remark
                                                    HttpApi.addJbTStepLog(obj)///添加log
                                                    resetHandler()
                                                    if (takeTicketAndPrint) {
                                                        console.log('打印1');
                                                        if (window.electron) {
                                                            setPrinting(true)
                                                            setTimeout(() => {
                                                                setPrinting(false)
                                                            }, 60000);
                                                            window.electron.ipcRenderer.send('message', { content: 'printStart', id: record.job_t_r_id })
                                                        }
                                                        else { message.warning('请使用桌面版本进行打印操作') }
                                                    }
                                                }
                                            }
                                        },
                                    });
                                }}>{takeTicketAndPrint ? '提交打印' : '提交'}</Button>
                                {showPrintBtn ? <Button type='danger' icon='file' size='small' style={{ marginTop: 10 }} onClick={() => {
                                    console.log('打印2');
                                    if (window.electron) {
                                        setPrinting(true)
                                        setTimeout(() => {
                                            setPrinting(false)
                                        }, 60000);
                                        window.electron.ipcRenderer.send('message', { content: 'printStart', id: record.job_t_r_id })
                                    }
                                    else { message.warning('请使用桌面版本进行打印操作') }
                                }}>打印</Button> : null}
                            </div>
                        </Affix>
                    </div>
                    <JobTicketStepLogView record={record} visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} />
                </Spin>
            }
        </Drawer >
    )
}
const styles = {
    panel: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        width: 260,
    },
    bar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
}