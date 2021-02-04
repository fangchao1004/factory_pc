import { Button, Drawer, Select, message, Modal, Affix, Tag, Input } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { changeShowLabByStauts, checkCellWhichIsEmpty, checkDataIsLostValue, getJTRecordContentAndPlanTime } from '../../util/Tool';
import moment from 'moment'
const { confirm } = Modal;
const { TextArea } = Input;
const { Option, OptGroup } = Select
const storage = window.localStorage;
var step_des = '';
var ticketNextUserNameList = [];
export default function JobTicketDrawer({ visible, onClose, record, resetData }) {
    // console.log('record:', record);
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})///填写改动后的数值- 提交时使用
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [userList, setUserList] = useState([])
    const [selectValue, setSelectValue] = useState(null)
    const [selectDisable, setSelectDisable] = useState(true)///操作项默认不可操作
    const [userSelectDisable, setUserSelectDisable] = useState(true)///人员项默认不可操作
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)///是否显示删除按钮
    const [showStopBtn, setShowStopBtn] = useState(false)///是否显示终止作废按钮
    const [showBackOption, setShowBackOption] = useState(false)///是否显示打回按钮
    const [takeTicketAndPrint, setTakeTicketAndPrint] = useState(false)///是否接票并且打印
    const [canPrint, setCanPrint] = useState(false)///是否可以打印
    const [runnerList, setRunnerList] = useState([])
    const [otherList, setOtherList] = useState([])
    const [ticketNextUserList, setTicketNextUserList] = useState([])
    const [remark, setRemark] = useState('')


    const runUserlist = useCallback(async (user_list, role_id) => {
        let res = await HttpApi.getRunnerIdList({ role_id })
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

    const init = useCallback(async () => {
        // console.log('init');
        if (record && record.job_t_r_id) {
            let res = await HttpApi.getJTRecords({ id: record.job_t_r_id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // tempObj.pages = testData
                // console.log('testData:', testData);
                setCurrentJobTicketValue(tempObj)///票数据初始化
            }
            let res_user = await HttpApi.getUserInfo({ effective: 1 })
            if (res_user.data.code === 0) {
                var user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
                setUserList(user_list)
            }
            if (record.is_sub === 1) {
                console.log('副票');
                // console.log('record:', record);
                setShowDeleteBtn(false)
                setShowStopBtn(false)
                setSelectDisable(false)
                if (record.status === 1 && currentUser.permission && currentUser.permission.split(',').indexOf("1") !== -1) {
                    ///副票 状态1 待安措时 运行可以操作
                    runUserlist(user_list, 8)///初审人名单
                } else if (record.status === 2 && currentUser.permission && currentUser.permission.split(',').indexOf("7") !== -1) {
                    runUserlist(user_list, 9)///复审人名单
                } else if (record.status === 3 && currentUser.permission && currentUser.permission.split(',').indexOf("8") !== -1) {
                    runUserlist(user_list, 10)///批准人名单
                } else if (record.status === 4 && currentUser.permission && currentUser.permission.split(',').indexOf("9") !== -1) {
                    runUserlist(user_list, 2)///运行人名单
                }
                else if (record.status === 6) {
                    setSelectDisable(true)
                }
            } else {
                console.log('主票');
                if (record.status === 1 && currentUser.id === record.user_id) {
                    ///1待签发  状态时，申请人可以操作
                    setSelectDisable(false)
                    if (record.status === 1) {
                        setShowDeleteBtn(true)
                        if (currentUser.permission.split(',').indexOf("0") === -1) {
                            setSelectDisable(true)
                            setShowStopBtn(false)
                        }
                    } else {
                        setShowDeleteBtn(false)
                        setShowStopBtn(true)
                    }
                }
                // console.log('currentUser:', currentUser);
                // console.log('专工权限:', currentUser.permission.split(',').indexOf("0") !== -1);
                // console.log('运行权限:', currentUser.permission.split(',').indexOf("1") !== -1);
                if (record.status === 1 && currentUser.major_id_all && currentUser.major_id_all.split(',').indexOf(String(record.major_id)) !== -1 && currentUser.permission && currentUser.permission.split(',').indexOf("0") !== -1) {
                    ///1待审核 状态时，对应专业的专工可以操作
                    setSelectDisable(false)
                    setShowStopBtn(true)
                    ///1待审核 状态时 专工要有运行人员名单
                    // console.log('1待审核 状态时 专工要有运行人员名单');
                    // runUserlist(user_list)
                }
                if ((record.status === 2 || record.status === 3) && currentUser.major_id_all && currentUser.permission && currentUser.permission.split(',').indexOf("1") !== -1) {
                    ///2待接票 3待完结 状态时，运行可以操作
                    setSelectDisable(false)
                    setShowDeleteBtn(false)
                    setShowStopBtn(true)
                    ///2待接票 状态时 运行要有运行人员名单
                    // if (record.status === 2) {
                    //     // console.log('2待接票 状态时 运行要有运行人员名单');
                    //     runUserlist(user_list)
                    // }
                }
                if (record.status === 4) {
                    setSelectDisable(true)
                    setShowDeleteBtn(false)
                    setShowStopBtn(false)
                } else if (record.status === 1 || record.status === 2) {
                    runUserlist(user_list, 2)
                }
            }
        }
    }, [record, currentUser, runUserlist])

    const resetHandler = useCallback(() => {
        onClose()
        resetData()
        setSelectValue(null)
        setRemark('')
        setTicketNextUserList([])
        step_des = '';
        ticketNextUserNameList = '';
    }, [onClose, resetData])
    const init2 = useCallback(() => {
        // console.log('init2--判断是否为运行的接票并且打印操作');
        if (record && record.is_sub === 1) {
            setTakeTicketAndPrint(false)
            setCanPrint(true)
            if (record.status === 5) {
                setUserSelectDisable(true)
            } else if (record.status < 5) {
                setUserSelectDisable(false)
            }
            if (record.status < 5 && record.status > 1) {
                setShowBackOption(true)
            } else { setShowBackOption(false) }
        } else {
            if (record && record.status === 2 && selectValue === '1') {
                setTakeTicketAndPrint(true)
            } else if (record && record.status === 3) {
                setCanPrint(true)
            } else {
                setTakeTicketAndPrint(false)
                setCanPrint(false)
            }
            if (record && record.status === 3) {
                setUserSelectDisable(true)
            } else if (record && record.status < 3) {
                setUserSelectDisable(false)
            }
            if (record && record.status !== 3 && record.status !== 1) {
                setShowBackOption(true)
            } else { setShowBackOption(false) }
        }
    }, [record, selectValue])
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
        if (otherList.length > 0) {
            return [<OptGroup key='1' label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>对应权限人员</span><Button type='link' size='small' onClick={() => {
                setTicketNextUserList(runnerList.map((item) => item.id))
                ticketNextUserNameList = runnerList.map((item) => item.name)
            }}>全选</Button></div>}>
                {runnerList.map((item, index) => { return <Option key={'1' + index} value={item.id}>{item.name}</Option> })}
            </OptGroup>,
            <OptGroup key='2' label="其他">
                {otherList.map((item, index) => { return <Option key={'2' + index} value={item.id}>{item.name}</Option> })}
            </OptGroup>]
        }
    }, [runnerList, otherList])
    useEffect(() => {
        init();
    }, [init])
    useEffect(() => {
        init2();
    }, [init2])
    return (
        <Drawer
            destroyOnClose={true}
            width={1200}
            title="工作票处理"
            placement='left'
            onClose={resetHandler}
            visible={visible}
        >
            <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#F1F2F5', padding: '10px 10px 0px 10px', }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {renderAllPage()}
                </div>
                <Affix offsetTop={100}>
                    <div style={styles.panel}>
                        {showStopBtn ?
                            <Button type='danger' size='small' icon='stop' style={{ marginRight: 10 }} onClick={() => {
                                confirm({
                                    title: '确认作废当前工作票吗?',
                                    content: '请自行保证准确性',
                                    okText: '确认',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk: async () => {
                                        let res = await HttpApi.updateJTApplyRecord({ id: record.id, is_stop: 1 })
                                        if (res.data.code === 0) {
                                            message.success('已经作废')
                                            resetHandler()
                                        }
                                    }
                                })
                            }}>作废</Button> : null}
                        {showDeleteBtn ?
                            <Button type='danger' size='small' icon='delete' style={{ marginTop: 10 }} onClick={() => {
                                confirm({
                                    title: '确认删除当前工作票吗?',
                                    content: '请自行保证准确性',
                                    okText: '确认',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk: async () => {
                                        let res = await HttpApi.updateJTApplyRecord({ id: record.id, is_delete: 1 })
                                        if (res.data.code === 0) {
                                            message.success('已经删除')
                                            resetHandler()
                                        }
                                    }
                                })
                            }}>删除</Button> : null}
                        <div style={{ marginTop: 10, ...styles.bar }}>
                            <span><Tag size='small' color='blue'>处理</Tag></span>
                            <Select value={selectValue} placeholder='请选择处理项' allowClear size='small' style={{ width: '100%' }} disabled={selectDisable}
                                onChange={(v, v2) => {
                                    setSelectValue(v)
                                    if (v2) { step_des = v2.props.children }
                                    if (v === '-1' || step_des === '完结') { setTicketNextUserList([]) }
                                }}
                            >
                                <Option value='1'>{record && record.status >= 1 ? changeShowLabByStauts(record.status, record.is_sub) : '通过'}</Option>
                                {showBackOption ? <Option value='-1'>打回</Option> : null}
                            </Select>
                        </div>
                        <div style={{ marginTop: 10, ...styles.bar }}>
                            <span><Tag size='small' color='blue'>人员</Tag></span>
                            <Select showSearch mode='multiple' optionFilterProp='children' maxTagCount={5} value={ticketNextUserList} placeholder='下一步处理人员' allowClear size='small' style={{ width: '100%' }} disabled={selectValue === '-1' || userSelectDisable}
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
                            <TextArea disabled={selectDisable} rows={4} value={remark} onChange={(e) => { setRemark(e.target.value) }} />
                        </div>
                        <Button disabled={selectDisable} type='primary' size='small' icon={takeTicketAndPrint ? '' : 'upload'} style={{ marginTop: 10, marginRight: 10 }} onClick={async () => {
                            // console.log('step_des:', step_des);
                            // console.log('ticketNextUserNameList:', ticketNextUserNameList);
                            // console.log('ticketNextUserList:', ticketNextUserList);
                            // console.log('remark:', remark);
                            // console.log('saaaaa', step_des + ' ' + ticketNextUserNameList.join(','));
                            // return;
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
                                            if (record.is_sub === 1) {///副票情况
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
                                        }
                                        ///每次处理 未读重置
                                        let newJTAR_data = {
                                            is_read: record.status === 3 ? 1 : 0,
                                            id: record.id,
                                            status: new_status,
                                            job_content, time_begin: time_list[0], time_end: time_list[1],
                                            per_step_user_id: currentUser.id, per_step_user_name: currentUser.name,
                                            current_step_user_id_list: current_step_user_id_list_temp
                                        }
                                        let res2 = await HttpApi.updateJTApplyRecord(newJTAR_data)
                                        if (res2.data.code === 0) {
                                            message.success('提交成功')
                                            let obj = {};
                                            obj['jbtar_id'] = record.id
                                            obj['user_id'] = currentUser.id
                                            obj['user_name'] = currentUser.name
                                            obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss')
                                            if (record.is_sub === 1) {///副票
                                                if (selectValue === '1') {///下一步
                                                    if (record.status === 5) {///当前是5 下一步就是6
                                                        obj['step_des'] = step_des
                                                    } else {
                                                        obj['step_des'] = step_des + '至 ' + ticketNextUserNameList.join(',')
                                                    }
                                                } else {///打回
                                                    obj['step_des'] = step_des + '至 ' + record.per_step_user_name
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
                                                }
                                            }
                                            obj['remark'] = remark
                                            console.log('log obj:', obj);
                                            HttpApi.addJbTStepLog(obj)///添加log
                                            resetHandler()
                                            if (takeTicketAndPrint) {
                                                console.log('打印');
                                                window.open(`http://60.174.196.158:12345/print/index.html?id=${record.job_t_r_id}`)
                                            }
                                        }
                                    }
                                },
                            });
                        }}>{takeTicketAndPrint ? '提交打印' : '提交'}</Button>
                        {canPrint ? <Button type='danger' icon='file' size='small' style={{ marginTop: 10 }} onClick={() => {
                            window.open(`http://60.174.196.158:12345/print/index.html?id=${record.job_t_r_id}`)
                        }}>打印</Button> : null}
                    </div>
                </Affix>
            </div>
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