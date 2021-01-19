import { Button, Drawer, Select, message, Modal, Affix } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { changeShowLabByStauts, checkCellWhichIsEmpty, checkDataIsLostValue } from '../../util/Tool';
const { confirm } = Modal;
const storage = window.localStorage;
export default function JobTicketDrawer({ visible, onClose, record, resetData }) {
    // const [currentJobTicket, setCurrentJobTicket] = useState({})///当前票的数据
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})///填写改动后的数值-二者区分开 提交时使用
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [userList, setUserList] = useState([])
    const [selectValue, setSelectValue] = useState(null)
    const [selectDisable, setSelectDisable] = useState(true)///默认不可操作
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)///是否显示删除按钮
    const [showStopBtn, setShowStopBtn] = useState(false)///是否显示终止作废按钮
    const [takeTicketAndPrint, setTakeTicketAndPrint] = useState(false)///是否接票并且打印

    const init = useCallback(async () => {
        // console.log('init');
        if (record && record.job_t_r_id) {
            let res = await HttpApi.getJTRecords({ id: record.job_t_r_id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // tempObj.pages = testData
                // console.log('testData:', testData);
                // setCurrentJobTicket(tempObj)///票数据初始化
                setCurrentJobTicketValue(tempObj)///票数据初始化
            }
            let res_user = await HttpApi.getUserInfo({ effective: 1 })
            if (res_user.data.code === 0) {
                let user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
                setUserList(user_list)
            }
            // const localUserInfo = storage.getItem('userinfo');
            // const currentUser = JSON.parse(localUserInfo)
            // setCurrentUser(currentUser)
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
            console.log('currentUser:', currentUser);
            console.log('专工权限:', currentUser.permission.split(',').indexOf("0") !== -1);
            console.log('运行权限:', currentUser.permission.split(',').indexOf("1") !== -1);
            if (record.status === 1 && currentUser.major_id_all && currentUser.major_id_all.split(',').indexOf(String(record.major_id)) !== -1 && currentUser.permission && currentUser.permission.split(',').indexOf("0") !== -1) {
                ///1待审核 状态时，对应专业的专工可以操作
                setSelectDisable(false)
                setShowStopBtn(true)

            }
            if ((record.status === 2 || record.status === 3) && currentUser.major_id_all && currentUser.permission && currentUser.permission.split(',').indexOf("1") !== -1) {
                ///2待接票 3待完结 状态时，运行可以操作
                setSelectDisable(false)
                setShowDeleteBtn(false)
                setShowStopBtn(true)
            }
            if (record.status === 4) {
                setSelectDisable(true)
                setShowDeleteBtn(false)
                setShowStopBtn(false)
            }
        }
    }, [record, currentUser])
    const resetHandler = useCallback(() => {
        onClose()
        resetData()
        setSelectValue(null)
    }, [onClose, resetData])
    const init2 = useCallback(() => {
        // console.log('init2--判断是否为运行的接票并且打印操作');
        if (record && record.status === 2 && selectValue === '1') {
            setTakeTicketAndPrint(true)
        } else { setTakeTicketAndPrint(false) }
    }, [record, selectValue])
    const renderAllPage = useCallback(() => {
        if (record && currentJobTicketValue && currentJobTicketValue.pages) {
            return currentJobTicketValue.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={currentJobTicketValue}
                    currentStatus={record ? record.status : 1}
                    userList={userList}
                    currentUser={currentUser}
                    currentPageIndex={index}
                    callbackValue={v => {
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [record, currentJobTicketValue, currentUser, userList])
    useEffect(() => {
        init();
    }, [init])
    useEffect(() => {
        init2();
    }, [init2])
    return (
        <Drawer
            destroyOnClose={true}
            width={1020}
            title="工作票处理"
            placement='left'
            onClose={onClose}
            visible={visible}
        >
            <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#F1F2F5', padding: '10px 10px 0px 10px', }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {renderAllPage()}
                </div>
                <Affix offsetTop={100}>
                    <div style={styles.panel}>
                        {/* <Alert message='处理栏选择后点击提交上传数据；工作票进入下一状态' type='info' showIcon /> */}
                        {showStopBtn ?
                            <Button type='danger' size='small' icon='stop' onClick={() => {
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
                            <Select value={selectValue} placeholder='请选择处理项' allowClear size='small' style={{ width: 66 }} disabled={selectDisable}
                                onChange={(v) => { setSelectValue(v) }}
                            >
                                <Select.Option value='1'>{record && record.status >= 1 ? changeShowLabByStauts(record.status) : '通过'}</Select.Option>
                                {record && record.status !== 3 && record.status !== 1 ? <Select.Option value='-1'>打回</Select.Option> : null}
                            </Select>
                        </div>
                        <Button disabled={selectDisable} type='primary' size='small' icon={takeTicketAndPrint ? '' : 'upload'} style={{ marginTop: 10 }} onClick={async () => {
                            if (!selectValue) { message.error('请先选择处理项'); return }
                            confirm({
                                title: '确认提交吗?',
                                content: '请自行保证准确性',
                                okText: '确认',
                                okType: 'danger',
                                cancelText: '取消',
                                onOk: async () => {
                                    let afterCheckObj = checkCellWhichIsEmpty(currentJobTicketValue, record.status)
                                    // console.log('afterCheckObj:', afterCheckObj);
                                    let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj)
                                    console.log('是否数据缺少:', needValueButIsEmpty);
                                    if (selectValue === "1" && needValueButIsEmpty) {///前往下一步时，数据不全
                                        message.error('请填写好工作票后，再进行提交')
                                        return
                                    }
                                    // return;
                                    // console.log('selectValue:', selectValue);
                                    // console.log('值:', currentJobTicketValue);
                                    // console.log('record:', record);
                                    ///修改 job_tickets_records 中的pages 和 job_tickets_apply_records 中的status
                                    let res1 = await HttpApi.updateJTRecord({ id: currentJobTicketValue.id, pages: JSON.stringify(currentJobTicketValue.pages) })
                                    if (res1.data.code === 0) {
                                        let new_status = record.status;
                                        if (selectValue === "1") {
                                            new_status = record.status + 1
                                        } else {
                                            new_status = record.status - 1
                                        }
                                        let res2 = await HttpApi.updateJTApplyRecord({ id: record.id, status: new_status })
                                        if (res2.data.code === 0) {
                                            message.success('提交成功')
                                            resetHandler()
                                            if (takeTicketAndPrint) {
                                                console.log('打印');
                                                // window.open(`http://60.174.196.158:12345/print/index.html?id=${record.job_t_r_id}`)
                                            }
                                        }
                                    }
                                },
                            });
                        }}>{takeTicketAndPrint ? '提交打印' : '提交'}</Button>
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
        width: 90,
    },
    bar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
}