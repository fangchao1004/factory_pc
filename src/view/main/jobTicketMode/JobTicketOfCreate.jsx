import { Button, Col, Empty, Row, Select, Tag, Affix, Modal, message, Table } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
// import { testData } from '../../../assets/testJson'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { checkDataIsLostValue, createNewJobTicketApply, checkCellWhichIsEmpty, copyArrayItem, checkDataIsLostUserlist, autoCalculateFootPageValue, getPinYin } from '../../util/Tool'
import moment from 'moment'
import SubJobTicketOfCreateDrawer from './SubJobTicketOfCreateDrawer'
const { OptGroup, Option } = Select
const { confirm } = Modal
const storage = window.localStorage
var ticketNextUserNameList = [];
let per_list = []///上次副票的选择项
var currentJTExtraPageSample = []
var per_page_value = 0///上次附页的数量
export default function JobTicketOfCreate() {
    const [jobTicketsOption, setJobTicketsOption] = useState([])
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})
    const [userList, setUserList] = useState([])
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [scaleNum, setScaleNum] = useState(1)
    const [ticketSampleId, setTicketSampleId] = useState(null)
    const [ticketNextUserList, setTicketNextUserList] = useState([])
    const [allSubTicketList, setAllSubTicketList] = useState([])
    const [sbtvisible, setSbtvisible] = useState(false)
    const [currentSubJBT, setCurrentSubJBT] = useState({})
    const getJobTicketById = useCallback(async id => {
        if (id !== null) {
            let res = await HttpApi.getJobTicketsList({ id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // tempObj.pages = testData
                setCurrentJobTicketValue(tempObj)
                let currentJBT_id = tempObj.id;
                let res_extra = await HttpApi.getExtraJobTicketsList({ p_id: currentJBT_id })
                if (res_extra.data.code === 0 && res_extra.data.data.length > 0) {
                    let pages_extra = JSON.parse(res_extra.data.data[0].pages)
                    // console.log(pages_extra);///额外的附页
                    pages_extra.forEach((page_extra) => { page_extra.is_extra = true })
                    currentJTExtraPageSample = pages_extra
                }
                const major_id = tempObj.major_id
                // console.log('major_id', major_id);
                if (!major_id) { message.error('请为当前工作票配置对应专业'); return }
                ///首先判断出哪些人员是当前专业的专工 和 运行
                let managerList_res = await HttpApi.getManagerIdListByMajorId({ major_id })
                let runnerList_res = await HttpApi.getRunnerIdList({ role_id: 2 })
                if (managerList_res.data.code === 0) {
                    let copy_userList = JSON.parse(JSON.stringify(userList))
                    const managerlist = managerList_res.data.data;
                    copy_userList.forEach((item) => {
                        item.is_current_major_manager = false
                        managerlist.forEach((manager) => {
                            if (item.id === manager.user_id) {
                                item.is_current_major_manager = true
                            }
                        })
                    })
                    if (runnerList_res.data.code === 0) {
                        const runnerList = runnerList_res.data.data;
                        copy_userList.forEach((item) => {
                            item.is_runner = false
                            runnerList.forEach((manager) => {
                                if (item.id === manager.user_id) {
                                    item.is_runner = true
                                }
                            })
                        })
                        setUserList(copy_userList)
                    }
                }
            }
        } else {
            setCurrentJobTicketValue({})
            setScaleNum(1)
        }
        setTicketSampleId(id)
        per_list = []
        per_page_value = 0
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
            {manager_list.map((item, index) => { return <Option key={'a' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
        </OptGroup>,
        <OptGroup key='b' label="其他">
            {other_list.map((item, index) => { return <Option key={'b' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
        </OptGroup>]
    }, [userList])
    /**
     * 提取出措施票的选项
     */
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
                let parse_res = res.data.data.map((item) => { item.pages = JSON.parse(item.pages); return item })
                let after_add_sub = [...allSubTicketList, ...parse_res]
                // console.log('after_add_sub:', after_add_sub);
                setAllSubTicketList(after_add_sub.map((item, index) => { item.key = index; return item }))
            }
            // console.log('checkgroup_list:', checkgroup_list);
        }
        per_list = JSON.parse(JSON.stringify(checkgroup_list))
    }, [allSubTicketList])
    /**
     * 提取出附页的数值
     */
    const pickupextrapagevalue = useCallback((ticketvalue) => {
        ticketvalue.pages.forEach((page) => {
            const cpts = page.components
            cpts.forEach((cpt) => {
                if (cpt.is_extra === true) {///找出代表附页的数字输入组件【只能有一个】
                    let diff_page_value = (parseInt(cpt.attribute.value) || 0) - per_page_value
                    // console.log('diff_page_value:', diff_page_value);///差值 +x 还是 -x
                    if (diff_page_value > 0) {///增
                        let after_copy = copyArrayItem(currentJTExtraPageSample, diff_page_value)
                        let after_combine = [...ticketvalue.pages, ...after_copy]
                        after_combine.forEach((page, index) => {
                            page.index = index
                        })
                        // console.log('after_combine:', after_combine);
                        //  autoCalculateFootPageValue(after_combine)
                        ticketvalue.pages = autoCalculateFootPageValue(after_combine)
                        setCurrentJobTicketValue(ticketvalue)
                        // ticketvalue.pages.push()
                    } else if (diff_page_value < 0) {///减
                        // console.log('ticketvalue.pages:', ticketvalue.pages);
                        let after_cut = ticketvalue.pages.slice(0, ticketvalue.pages.length + diff_page_value)
                        // console.log('after_cut:', after_cut);
                        ticketvalue.pages = autoCalculateFootPageValue(after_cut)
                        setCurrentJobTicketValue(ticketvalue)
                    }
                    per_page_value = (parseInt(cpt.attribute.value) || 0)
                }
            })
        })
    }, [])
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
                        pickupextrapagevalue(v)
                        pickupcheckgroupvalue(v)
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [currentJobTicketValue, currentUser, scaleNum, userList, pickupcheckgroupvalue, pickupextrapagevalue])
    useEffect(() => {
        init()
    }, [init])
    const columns = [{ title: '类型', dataIndex: 'type_name', key: 'type_name' }, {
        title: '操作', dataIndex: 'action', key: 'action', width: 90, render: (_, record) => {
            return <Button icon='edit' size='small' type='link' onClick={() => {
                setSbtvisible(true)
                setCurrentSubJBT(record)
            }}>编辑</Button>
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
                                        // optionFilterProp='children'
                                        value={ticketSampleId}
                                        onChange={value => {
                                            if (value >= 0) {
                                                getJobTicketById(value)
                                            } else {
                                                getJobTicketById(null)
                                            }
                                        }}
                                        filterOption={(input, option) => {
                                            let res = option.props.short_lab.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            return res
                                        }}>
                                        {jobTicketsOption.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.id} short_lab={getPinYin(item.ticket_name)[0] || ''}>
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
                                        value={ticketNextUserList}
                                        filterOption={(input, option) => {
                                            if (option.props.short_lab) {
                                                let res = option.props.short_lab.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                return res
                                            } else {
                                                return false
                                            }
                                        }}
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
                                                // console.log('allsbj:', allSubTicketList);
                                                // return;
                                                if (ticketNextUserList.toString().length === 0) { message.error('请选择好主工作票处理人员，再进行提交'); return }
                                                let user_str = ',' + ticketNextUserList.toString() + ','
                                                // console.log('user_str:', user_str);
                                                // console.log('ticketNextUserNameList:', ticketNextUserNameList);
                                                // return;
                                                let afterCheckObj = checkCellWhichIsEmpty(currentJobTicketValue, 0)
                                                // console.log('afterCheckObj:', afterCheckObj);
                                                // return;
                                                setCurrentJobTicketValue(JSON.parse(JSON.stringify(afterCheckObj)))
                                                let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj)
                                                if (needValueButIsEmpty) {
                                                    message.error('请填写好主工作票后，再进行提交')
                                                    return
                                                }
                                                for (let index = 0; index < allSubTicketList.length; index++) {
                                                    let element = allSubTicketList[index];///每个副票
                                                    let afterCheckObj_sub = checkCellWhichIsEmpty(element, 0)
                                                    let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj_sub)
                                                    var copyAllSubTicketList = JSON.parse(JSON.stringify(allSubTicketList))
                                                    copyAllSubTicketList[index] = afterCheckObj_sub
                                                    setAllSubTicketList(copyAllSubTicketList)
                                                    if (needValueButIsEmpty) {
                                                        message.error('请填写好措施票后，再进行提交')
                                                        return
                                                    }
                                                    let user_id_is_lost = checkDataIsLostUserlist(element)
                                                    if (user_id_is_lost) {
                                                        message.error('请选择好措施票处理人后，再进行提交')
                                                        return
                                                    }
                                                }
                                                // return;
                                                confirm({
                                                    title: '确认提交当前的工作票吗?',
                                                    content: '请确保所填信息的准确和完整',
                                                    okText: '确认',
                                                    okType: 'danger',
                                                    cancelText: '取消',
                                                    onOk: async function () {
                                                        ///添加主票
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
                                                                ///循环添加多个措施票记录
                                                                for (let index = 0; index < copyAllSubTicketList.length; index++) {
                                                                    let element = copyAllSubTicketList[index];///每个副票
                                                                    element.p_id = jbtar_id;
                                                                    let user_str = ',' + element.userInfo.user_id_list.toString() + ','
                                                                    await createNewJobTicketApply(element, user_str)
                                                                    // console.log('添加副票记录:', res);
                                                                    let res1 = await HttpApi.getLastJTApplyRecordId()
                                                                    if (res1.data.code === 0) {
                                                                        let jbtar_id_sub = res1.data.data[0]['max_id']
                                                                        let obj = {};
                                                                        obj['jbtar_id'] = jbtar_id_sub /// 添加副票记录 的id
                                                                        obj['user_id'] = currentUser.id
                                                                        obj['user_name'] = currentUser.name
                                                                        obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss')
                                                                        obj['step_des'] = '创建措施票 提交至 ' + element.userInfo.user_name_list.join(',')
                                                                        obj['remark'] = ''
                                                                        await HttpApi.addJbTStepLog(obj)///添加log
                                                                    }
                                                                }
                                                                setAllSubTicketList([])
                                                                setCurrentSubJBT({})
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
                <SubJobTicketOfCreateDrawer
                    visible={sbtvisible}
                    onClose={() => { setSbtvisible(false); }}
                    currentSubJBT={currentSubJBT}
                    userList={userList}
                    currentUser={currentUser}
                    sbjtvalueChangeCallback={(v) => {
                        v.pages.forEach((page) => {
                            const cpts = page.components
                            cpts.forEach((cpt) => {
                                if (cpt.is_active) {
                                    const active_value = cpt.attribute.value;
                                    const twins_id = cpt.twins_id
                                    cpts.forEach((cpt2) => {
                                        if (cpt2.is_response && cpt2.twins_id === twins_id) {
                                            if (active_value) {
                                                cpt2.attribute.value = cpt2.default_value
                                            } else {
                                                cpt2.attribute.value = ''
                                            }
                                        }
                                    })
                                }
                            })
                        })
                        allSubTicketList.forEach((oneSubTicket) => {
                            if (oneSubTicket.id === currentSubJBT.id) {
                                oneSubTicket.pages = v.pages
                            }
                        })
                        setAllSubTicketList(allSubTicketList)
                    }}
                />
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
        backgroundColor: '#FFFFFF',
        display:'flex',
        flexDirection:'column',
        alignItems: 'center',
    }
}
