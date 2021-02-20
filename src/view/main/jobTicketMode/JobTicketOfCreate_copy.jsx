import { Button, Col, Empty, Row, Select, Tag, Affix, Modal, message, Table } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
// import { testData } from '../../../assets/testJson'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { checkDataIsLostValue, createNewJobTicketApply, checkCellWhichIsEmpty } from '../../util/Tool'
import moment from 'moment'
const { OptGroup, Option } = Select
const { confirm } = Modal
const storage = window.localStorage
var ticketNextUserNameList = [];
let per_list = []///上次副票的选择项
export default function JobTicketOfCreate_copy() {
    const [jobTicketsOption, setJobTicketsOption] = useState([])
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})
    const [userList, setUserList] = useState([])
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [scaleNum, setScaleNum] = useState(1)
    const [ticketSampleId, setTicketSampleId] = useState(null)
    const [ticketNextUserList, setTicketNextUserList] = useState([])
    const [allSubTicketList, setAllSubTicketList] = useState([])
    const getJobTicketById = useCallback(async id => {
        if (id !== null) {
            let res = await HttpApi.getJobTicketsList({ id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // tempObj.pages = testData
                setCurrentJobTicketValue(tempObj)
                const major_id = tempObj.major_id
                // console.log('major_id', major_id);
                let managerList_res = await HttpApi.getManagerIdListByMajorId({ major_id })
                if (managerList_res.data.code === 0) {
                    const managerlist = managerList_res.data.data;
                    // console.log('managerlist:', managerlist);
                    userList.forEach((item) => {
                        item.is_current_major_manager = false
                        managerlist.forEach((manager) => {
                            if (item.id === manager.user_id) {
                                item.is_current_major_manager = true
                            }
                        })
                    })
                    setUserList(userList)
                }
            }
        } else {
            setCurrentJobTicketValue({})
            setScaleNum(1)
        }
        setTicketSampleId(id)
        per_list = []
    }, [userList])
    const init = useCallback(async () => {
        let res = await HttpApi.getJobTicketsOptionList()
        if (res.data.code === 0) {
            setJobTicketsOption(res.data.data)
        }
        let res_user = await HttpApi.getUserInfo({ effective: 1 })
        if (res_user.data.code === 0) {
            let user_list = res_user.data.data.map(item => {
                return { id: item.id, name: item.name }
            })
            setUserList(user_list)
        }
    }, [])
    const getUserGroupList = useCallback(() => {
        if (!userList) { return null }
        let manager_list = [];
        let other_list = [];
        userList.forEach((item) => {
            if (item.is_current_major_manager) {
                manager_list.push(item)
            } else { other_list.push(item) }
        })
        return [<OptGroup key='a' label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>当前专业专工</span><Button type='link' size='small' onClick={() => {
            setTicketNextUserList(manager_list.map((item) => item.id))
            ticketNextUserNameList = manager_list.map((item) => item.name)
        }}>全选</Button></div>}>
            {manager_list.map((item, index) => { return <Option key={'a' + index} value={item.id}>{item.name}</Option> })}
        </OptGroup>,
        <OptGroup key='b' label="其他">
            {other_list.map((item, index) => { return <Option key={'b' + index} value={item.id}>{item.name}</Option> })}
        </OptGroup>]
    }, [userList])
    const pickupcheckgroupvalue = useCallback(async (ticketvalue) => {
        let checkgroup_list = []
        ticketvalue.pages.forEach((page) => {
            const cpts = page.components
            cpts.forEach((cpt) => {
                if (cpt.type === 'checkboxgroup') {
                    checkgroup_list = cpt.attribute.value
                }
            })
        })
        let lost_list = []
        let add_list = []
        if (per_list.length > checkgroup_list.length) {
            per_list.forEach(item1 => {
                let flag = false;
                checkgroup_list.forEach(item2 => {
                    if (item1 === item2) {
                        flag = true;
                    }
                })
                if (!flag) {
                    lost_list.push(item1);
                }
            })
            // console.log('移除:', lost_list)
            let after_remove_sub = allSubTicketList.filter((item) => {
                if (item.type_name !== lost_list[0]) { return true } else { return false }
            })
            // console.log('after_remove_sub:', after_remove_sub);
            setAllSubTicketList(after_remove_sub.map((item, index) => { item.key = index; return item }))
            // console.log('checkgroup_list:', checkgroup_list);
        } else if (per_list.length < checkgroup_list.length) {
            checkgroup_list.forEach(item1 => {
                let flag = false;
                per_list.forEach(item2 => {
                    if (item1 === item2) {
                        flag = true;
                    }
                })
                if (!flag) {
                    add_list.push(item1);
                }
            })
            // console.log('新增:', add_list)
            let res = await HttpApi.getSubJobTicketsList({ type_name: add_list[0] })
            if (res.data.code === 0) {
                // console.log('数据库查询到:', res.data.data);
                let after_add_sub = [...allSubTicketList, ...res.data.data]
                // console.log('after_add_sub:', after_add_sub);
                setAllSubTicketList(after_add_sub.map((item, index) => { item.key = index; return item }))
            }
            // console.log('checkgroup_list:', checkgroup_list);
        }
        per_list = JSON.parse(JSON.stringify(checkgroup_list))
    }, [allSubTicketList])
    const renderAllPage = useCallback(() => {
        if (currentJobTicketValue && currentJobTicketValue.pages) {
            return currentJobTicketValue.pages.map((_, index) => {
                // return <RenderEngine jsonlist={pagelist} page={index} />
                return <RenderEngine
                    key={index}
                    jsonlist={currentJobTicketValue}
                    userList={userList}
                    currentUser={currentUser}
                    currentStatus={0}
                    currentPageIndex={index}
                    scaleNum={scaleNum}
                    callbackValue={v => {
                        pickupcheckgroupvalue(v)
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [currentJobTicketValue, currentUser, scaleNum, userList, pickupcheckgroupvalue])
    useEffect(() => {
        init()
    }, [init])
    const columns = [{ title: '类型', dataIndex: 'type_name', key: 'type_name' }, {
        title: '类型', dataIndex: 'action', key: 'action', width: 90, render: () => {
            return <Button icon='edit' size='small' type='link'>编辑</Button>
        }
    }]
    return (
        <div style={styles.root}>
            <div style={styles.head}>
                <h2 style={styles.title}>创建工作票</h2>
            </div>
            <div style={styles.body}>
                <Row gutter={10}>
                    <Col span={18}>
                        <div style={styles.rightPart}>
                            {!currentJobTicketValue.pages ? <Empty style={{ padding: 36 }} description={'请先选择需要的工作票'} /> : renderAllPage()}
                        </div>
                    </Col>
                    <Col span={6}>
                        <Affix>
                            <div style={styles.leftPart}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center'
                                }}>
                                    <Tag color='blue'>选择</Tag>
                                    <Select
                                        style={{ width: '100%' }}
                                        bordered={false}
                                        allowClear={true}
                                        placeholder='请选择工作票'
                                        showSearch
                                        optionFilterProp='children'
                                        value={ticketSampleId}
                                        onChange={value => {
                                            if (value >= 0) {
                                                getJobTicketById(value)
                                            } else {
                                                getJobTicketById(null)
                                            }
                                        }}
                                        filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                        {jobTicketsOption.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.id}>
                                                    {item.ticket_name}
                                                </Option>
                                            )
                                        })}
                                    </Select>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    marginTop: 10
                                }}>
                                    <Tag color='blue'>人员</Tag>
                                    <Select
                                        maxTagCount={5}
                                        disabled={!currentJobTicketValue.pages}
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        bordered={false}
                                        allowClear={true}
                                        placeholder='请选择下一步处理人'
                                        showSearch
                                        optionFilterProp='children'
                                        value={ticketNextUserList}
                                        onChange={(value, option) => {
                                            setTicketNextUserList(value)
                                            ticketNextUserNameList = option.map((item) => { return item.props.children })
                                        }}
                                    >
                                        {getUserGroupList()}
                                    </Select>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    marginTop: 10
                                }}>
                                    <Tag color='blue'>操作</Tag>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row-reverse',
                                        width: '100%',
                                        padding: 5
                                    }}>
                                        <Button
                                            type='danger'
                                            size='small'
                                            disabled={!currentJobTicketValue.pages}
                                            onClick={() => {
                                                if (ticketNextUserList.toString().length === 0) { message.error('请选择好处理人员，再进行提交'); return }
                                                let user_str = ',' + ticketNextUserList.toString() + ','
                                                // console.log('user_str:', user_str);
                                                // console.log('ticketNextUserNameList:', ticketNextUserNameList);
                                                // return;
                                                let afterCheckObj = checkCellWhichIsEmpty(currentJobTicketValue, 0)
                                                // console.log('afterCheckObj:', afterCheckObj);
                                                setCurrentJobTicketValue(JSON.parse(JSON.stringify(afterCheckObj)))
                                                let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj)
                                                if (needValueButIsEmpty) {
                                                    message.error('请填写好工作票后，再进行提交')
                                                    return
                                                }
                                                // return;
                                                confirm({
                                                    title: '确认提交当前的工作票吗?',
                                                    content: '请确保所填信息的准确和完整',
                                                    okText: '确认',
                                                    okType: 'danger',
                                                    cancelText: '取消',
                                                    onOk: async function () {
                                                        let res = await createNewJobTicketApply(afterCheckObj, user_str)
                                                        if (res) {
                                                            message.success('提交成功')
                                                            getJobTicketById(null)
                                                            ///获取最新提交的记录id
                                                            let res = await HttpApi.getLastJTApplyRecordId()
                                                            if (res.data.code === 0) {
                                                                const jbtar_id = res.data.data[0]['max_id']
                                                                let obj = {};
                                                                obj['jbtar_id'] = jbtar_id
                                                                obj['user_id'] = currentUser.id
                                                                obj['user_name'] = currentUser.name
                                                                obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss')
                                                                obj['step_des'] = '创建工作票 提交至 ' + ticketNextUserNameList.join(',')
                                                                obj['remark'] = ''
                                                                HttpApi.addJbTStepLog(obj)///添加log
                                                                setTicketNextUserList([])
                                                                ticketNextUserNameList = []
                                                            }
                                                        }
                                                    }
                                                })
                                            }}>
                                            提交
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {allSubTicketList.length > 0 ?
                                <div style={{ ...styles.leftPart, marginTop: 10 }}>
                                    <Table pagination={false} size='small' bordered columns={columns} dataSource={allSubTicketList} />
                                </div>
                                : null
                            }
                        </Affix>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

const styles = {
    root: {
        padding: 10
    },
    head: {
        backgroundColor: '#FFFFFF',
        padding: '10px 10px 5px 10px'
    },
    title: {
        borderLeft: 4,
        borderLeftColor: '#3080fe',
        borderLeftStyle: 'solid',
        paddingLeft: 5,
        fontSize: 16,
        backgroundColor: '#FFFFFF'
    },
    body: {
        marginTop: 10
    },
    leftPart: {
        backgroundColor: '#FFFFFF',
        padding: 15
    },
    rightPart: {
        backgroundColor: '#FFFFFF'
    }
}