import { Badge, Button, Col, DatePicker, Dropdown, Form, Input, Menu, Row, Select, Switch, Table, Tooltip } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi';
import { autoFillNo, changeJobTicketStatusToText } from '../../util/Tool';
import JobTicketDrawer from './JobTicketDrawer';
import JobTicketDrawerForShowEdit from './JobTicketDrawerForShowEdit';
import JobTicketStepLogView from './JobTicketStepLogView';
import moment from 'moment'
import { JOB_TICKETS_STATUS, SUB_JOB_TICKETS_STATUS } from '../../util/AppData';
import { AppDataContext } from '../../../redux/AppRedux';
import SubJobTicketOfCreateDrawer from './SubJobTicketOfCreateDrawer';
const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const storage = window.localStorage;
var searchCondition = {};
var pageCondition = {};
export default function JobTicketOfMy() {
    const { appDispatch } = useContext(AppDataContext)
    const [defaultTime] = useState([moment().add(-6, 'month').startOf('day'), moment().endOf('day')])
    const [list, setList] = useState([])
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [drawer2Visible, setDrawer2Visible] = useState(false)
    const [currentSelectRecord, setCurrentSelectRecord] = useState(null)
    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面
    const [currentUser, setCurrentUser] = useState({})
    const [isAgent, setIsAgent] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [listLength, setListLength] = useState(0)
    const [loading, setLoading] = useState(false)
    const [typeOptionList, setTypeOptionList] = useState([])
    const [onlyShow, setOnlyShow] = useState(true)
    const [isCurrentMe, setIsCurrentMe] = useState(true)
    const [hasFixPer, setHasFixPer] = useState(false)
    const [hasManagerPer, setHasManagerPer] = useState(false)
    const [sbtvisible, setSbtvisible] = useState(false)
    const [currentSubJBT, setCurrentSubJBT] = useState({})
    const [userList, setUserList] = useState([])
    const init = useCallback(async () => {
        setLoading(true)
        const localUserInfo = storage.getItem('userinfo');
        let userinfo = JSON.parse(localUserInfo);
        setCurrentUser(userinfo)
        // console.log('userinfo:', userinfo);
        setHasManagerPer(userinfo.permission.split(',').indexOf('0') !== -1)
        setHasFixPer(userinfo.permission.split(',').indexOf('3') !== -1)
        let res_user = await HttpApi.getUserInfo({ effective: 1 })
        if (res_user.data.code === 0) {
            var user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
            // setUserList(user_list)
            let runnerList_res = await HttpApi.getRunnerIdList({ role_id: 11 })///运行值长
            if (runnerList_res.data.code === 0) {
                let runnerList = runnerList_res.data.data;
                user_list.forEach((user) => {
                    user.is_runner = false
                    runnerList.forEach((runner) => {
                        if (user.id === runner.user_id) {
                            user.is_runner = true
                        }
                    })
                })
                setUserList(user_list)
            }
        }
        let res = await HttpApi.getJobTicketsOptionList({ is_sub: [0, 1] })
        if (res.data.code === 0) { setTypeOptionList(res.data.data) }
        let conditions = { ...searchCondition, ...pageCondition, user_id: userinfo.id, is_current: isCurrentMe }
        // console.log('conditions:', conditions);
        let test_res_count = await HttpApi.getMyJTApplyRecordsCountByCondition(conditions)
        if (test_res_count.data.code === 0) { setListLength(test_res_count.data.data[0]['count']) }
        let test_res = await HttpApi.getMyJTApplyRecordsByLimit(conditions)
        var main_list = []
        if (test_res.data.code === 0) {
            // console.log('与我相关的票:', test_res.data.data);
            main_list = test_res.data.data.map((item, index) => { item.key = index; return item })
            let mainidlist_in_all = test_res.data.data.filter((item) => {
                return item.is_sub === 0
            }).map((item) => { return item.id })///其中有哪些是主票，根据主票的id，再去查询对应的措施票数据
            // console.log('其中有哪些是主票，根据主票的id:', mainidlist_in_all);
            if (mainidlist_in_all.length > 0) {
                let test_sub_res = await HttpApi.getSubJTApplyRecordsByPidList({ p_id_list: mainidlist_in_all })
                if (test_sub_res.data.code === 0) {
                    var sub_list = test_sub_res.data.data
                    // console.log('对应措施票:', sub_list);
                }
                main_list.forEach((item_m) => {
                    if (item_m.is_sub === 0) { item_m.sub_tickets = [] }
                    sub_list.forEach((item_s) => {
                        if (item_m.id === item_s.p_id) { item_m.sub_tickets.push(item_s) }
                    })
                })
            }
        }
        // console.log('main_list:', main_list);
        setList(main_list)
        setLoading(false)
    }, [isCurrentMe])
    const readLocalRecord = useCallback(async (record) => {
        if (record.is_read) { return }
        let copy_list = JSON.parse(JSON.stringify(list))
        copy_list.forEach((item) => {
            if (item.id === record.id) { item.is_read = 1 }
        })
        setList(copy_list)
        await HttpApi.updateJTApplyRecord({ id: record.id, is_read: 1 })
    }, [list])
    useEffect(() => {
        ///初始条件
        searchCondition = { time: [defaultTime[0].format(FORMAT), defaultTime[1].format(FORMAT)], is_current: isCurrentMe }
        pageCondition = { page: 1, pageSize: 10 }
        init();
    }, [init, defaultTime, isCurrentMe])
    useEffect(() => {
        let loop = setInterval(() => {
            init();
        }, 10000 * 1000)
        return () => {
            clearInterval(loop)
        }
    }, [init])
    const resetReduxCount = useCallback(async () => {
        const user_id = currentUser.id
        const time = [moment().add(-6, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')];
        let res_jbt_current_is_me = await HttpApi.getMyJTApplyRecordsCountByCondition({ user_id, time, is_current: true })
        if (res_jbt_current_is_me.data.code === 0) {
            const jbt_current_is_me_count = res_jbt_current_is_me.data.data[0].count
            appDispatch({ type: 'currentJBTCount', data: jbt_current_is_me_count })
        }
    }, [currentUser, appDispatch])
    const columns = [
        {
            title: '', dataIndex: 'p_id', key: 'p_id', width: 30, render: (text, record) => {
                return <div>{text ?
                    <Tooltip title={'查看对应主票'} placement="left">
                        <Button size='small' icon='file-search' type='link' onClick={async () => {
                            let res = await HttpApi.getMainJTApplyRecordsById({ id: text })
                            if (res.data.code === 0) {
                                // console.log('res.data.data[0]:', res.data.data[0]);
                                const mainJBT = res.data.data[0];
                                setCurrentSelectRecord(mainJBT)
                                setDrawer2Visible(true)
                            }
                            setOnlyShow(true)
                        }} />
                    </Tooltip>
                    : null}</div>
            }
        },
        {
            title: '序号', dataIndex: 'id', key: 'id', width: 60, render: (text, record) => {
                return <div>{record.is_read ? null : <Badge status="processing" />}{text}</div>
            }
        },
        { title: '编号', dataIndex: 'no', key: 'no', width: 170 },
        { title: '发起时间', dataIndex: 'time', key: 'time', width: 120 },
        {
            title: '计划开始', dataIndex: 'time_begin', key: 'time_begin', width: 120, render: (text) => {
                return text || '-'
            }
        },
        {
            title: '计划结束', dataIndex: 'time_end', key: 'time_end', width: 120, render: (text) => {
                return text || '-'
            }
        },
        {
            title: '内容', dataIndex: 'job_content', key: 'job_content', render: (text) => {
                return text ? <Tooltip title={text} placement="topLeft">
                    <div className='hideText lineClamp2'>{text}</div>
                </Tooltip> : '-'
            }
        },
        { title: '申请人', dataIndex: 'user_name', key: 'user_name', width: 100 },
        { title: '上步处理人', dataIndex: 'user_name', key: 'per_step_user_name', width: 100 },
        {
            title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (text, record) => {
                return changeJobTicketStatusToText(text, record.is_sub)
            }
        },
        {
            title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 100, render: (_, record) => {
                let is_over = false
                if (record.is_sub !== 1 && record.status === 4) { is_over = true }
                else if (record.is_sub === 1 && record.status === 6) { is_over = true }///是否完结
                let inCurrentUserList = false
                inCurrentUserList = record.current_step_user_id_list.indexOf(`,${currentUser.id},`) !== -1;///是否为当前处理人
                return <div>
                    {inCurrentUserList ?
                        <Button disabled={!inCurrentUserList} size='small' type='primary' icon='file-search' onClick={(e) => { e.stopPropagation(); setIsAgent(false); setCurrentSelectRecord(record); setDrawerVisible(true); readLocalRecord(record); }}>处理</Button>
                        :
                        <Button size='small' icon='eye' onClick={(e) => { e.stopPropagation(); setDrawer2Visible(true); setCurrentSelectRecord(record); setOnlyShow(false) }}>查看</Button>
                    }
                    {
                        currentUser.isadmin === 1 ?
                            <>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button disabled={is_over} icon='audit' size="small" type="danger" onClick={(e) => { e.stopPropagation(); setIsAgent(true); setDrawerVisible(true); readLocalRecord(record); setCurrentSelectRecord(record); }}>调度</Button>
                            </> : null
                    }
                    <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                    <Button icon='unordered-list' size="small" type="default" onClick={(e) => { e.stopPropagation(); setStepLogVisible(true); setCurrentSelectRecord(record); }}>记录</Button>
                </div>
            }
        },
    ]
    return (
        <div style={styles.root}>
            <div style={styles.header}>
                <Searchfrom defaultTime={defaultTime} typeOptionList={typeOptionList} startSearch={async (conditionsValue) => {
                    searchCondition = conditionsValue;
                    pageCondition = { page: 1, pageSize: 10 }
                    setCurrentPage(1)
                    init();
                }} />
                <span style={styles.switch}>
                    <span>待我处理：</span><Switch checkedChildren="是" unCheckedChildren="否" checked={isCurrentMe} onChange={(v) => { setIsCurrentMe(v) }} />
                </span>
            </div>
            <div style={styles.body}>
                <Table
                    loading={loading}
                    bordered
                    size='small'
                    columns={columns}
                    dataSource={list}
                    expandIcon={(props) => {
                        // console.log('props.record:',props.record);
                        let is_over = false
                        if (props.record.is_sub !== 1 && props.record.status === 4) { is_over = true }
                        else if (props.record.is_sub === 1 && props.record.status === 6) { is_over = true }///是否完结
                        let topAdd = props.record.is_sub === 0 && !is_over && (hasFixPer || hasManagerPer) ? ///主票未完结时且有维修或专工权限
                            <div key={'x'}>
                                <Tooltip title={'新增措施票'} placement="left">
                                    <Dropdown size='small' overlay={() => {
                                        return <Menu onClick={(e) => {
                                            let tempSubJBTObj = JSON.parse(JSON.stringify(e.item.props.record))
                                            let tempPageList = JSON.parse(tempSubJBTObj.pages)
                                            tempSubJBTObj.pages = tempPageList
                                            setCurrentSubJBT(tempSubJBTObj)
                                            setSbtvisible(true)
                                            setCurrentSelectRecord(props.record)
                                        }}>
                                            {typeOptionList.filter((item) => { return item.is_sub !== 0 }).map((item, index) => {
                                                return <Menu.Item key={index} record={item}><div>{item.ticket_name}</div></Menu.Item>
                                            })}
                                        </Menu>
                                    }} trigger={['click']}>
                                        <Button size='small' type='link' icon='plus' style={{ color: '#fa541c' }} onClick={e => e.preventDefault()}></Button>
                                    </Dropdown>
                                </Tooltip>
                            </div> : null
                        if (props.record.sub_tickets && props.record.sub_tickets.length > 0) {
                            let tags = props.record.sub_tickets.map((item, index) => {
                                return <Tooltip key={index} title={item.id + ' ' + item.no} placement="left">
                                    <Button icon='tag' size='small' type='link' onClick={() => {
                                        setCurrentSelectRecord(item)
                                        setDrawer2Visible(true)
                                        setOnlyShow(true)
                                    }} />
                                </Tooltip>
                            })
                            return [topAdd, ...tags]
                        } else { return null }
                    }}
                    pagination={{
                        total: listLength,
                        showTotal: () => {
                            return <div>共{listLength}条记录</div>
                        },
                        current: currentPage,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '50', '100'],
                        onShowSizeChange: (page, pageSize) => {
                            pageCondition = { page, pageSize }
                            setCurrentPage(page)
                            init();
                        },
                        onChange: (page, pageSize) => {
                            pageCondition = { page, pageSize }
                            setCurrentPage(page)
                            init();
                        }
                    }}
                />
            </div>
            <JobTicketDrawerForShowEdit onlyShow={onlyShow} visible={drawer2Visible} onClose={() => { setDrawer2Visible(false); }} record={currentSelectRecord} resetData={init} />
            <JobTicketDrawer isAgent={isAgent} visible={drawerVisible} onClose={() => { setDrawerVisible(false); }} record={currentSelectRecord} resetData={() => { init(); resetReduxCount() }} />
            <JobTicketStepLogView record={currentSelectRecord} visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} />
            <SubJobTicketOfCreateDrawer
                pId={currentSelectRecord ? currentSelectRecord.id : null}
                pNo={currentSelectRecord ? currentSelectRecord.no : null}
                isExtraAdd={true}///额外添加的情况
                resetList={() => { init() }}
                visible={sbtvisible}
                onClose={() => { setSbtvisible(false); }}
                currentSubJBT={currentSubJBT}
                userList={userList}
                currentUser={currentUser}
                sbjtvalueChangeCallback={(v) => {
                    let new_v = autoFillNo(v)
                    setCurrentSubJBT(new_v)
                }}
            />
        </div>
    )
}

const Searchfrom = Form.create({ name: 'form' })(props => {
    const itemProps = { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
    return <Form onSubmit={(e) => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            // console.log('values:', values);
            // return;
            ///values搜寻条件数据过滤
            let newObj = {};
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    const element = values[key];
                    if (element) {
                        if (key === 'time') {
                            newObj[key] = [element[0].startOf('day').format(FORMAT), element[1].endOf('day').format(FORMAT)]
                        } else {
                            newObj[key] = element
                        }
                    }
                }
            }
            props.startSearch(newObj);
        });
    }}>
        <Row>
            <Col span={6}>
                <Form.Item label='发起时间'  {...itemProps}>
                    {props.form.getFieldDecorator('time', {
                        initialValue: props.defaultTime,
                        rules: [{ required: false }]
                    })(
                        <DatePicker.RangePicker
                            allowClear={false}
                            style={{ width: '100%' }}
                            disabledDate={(current) => {
                                return current > moment().endOf('day');
                            }}
                            ranges={{
                                今日: [moment(), moment()],
                                昨日: [moment().add(-1, 'day'), moment().add(-1, 'day')],
                                本月: [moment().startOf('month'), moment().endOf('day')],
                                上月: [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')]
                            }}
                        />
                    )}
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item label='票类型' {...itemProps}>
                    {props.form.getFieldDecorator('type_id', {
                        rules: [{ required: false }]
                    })(<Select allowClear placeholder="请选择票类型" >
                        {props.typeOptionList.map((item, index) => {
                            return <Select.Option value={item.id} key={index} all={item}>{item.ticket_name}</Select.Option>
                        })}
                    </Select>)}
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item label='主票状态' {...itemProps}>
                    {props.form.getFieldDecorator('status', {
                        rules: [{ required: false }]
                    })(<Select allowClear placeholder="请选择主票状态" >
                        {JOB_TICKETS_STATUS.map((item, index) => {
                            return <Select.Option value={item.value} key={index} all={item}>{item.text}</Select.Option>
                        })}
                    </Select>)}
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item label='措施票状态' {...itemProps}>
                    {props.form.getFieldDecorator('sub_status', {
                        rules: [{ required: false }]
                    })(<Select allowClear placeholder="请选择措施票状态" >
                        {SUB_JOB_TICKETS_STATUS.map((item, index) => {
                            return <Select.Option value={item.value} key={index} all={item}>{item.text}</Select.Option>
                        })}
                    </Select>)}
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item label='编号查询' {...itemProps}>
                    {props.form.getFieldDecorator('no', {
                        rules: [{ required: false }]
                    })(<Input placeholder='请输入编号(模糊查询)' />)}
                </Form.Item>
            </Col>
            <Col span={18}>
                <div style={{ textAlign: 'right', paddingTop: 3 }}>
                    <Button type="primary" htmlType="submit">查询</Button>
                    <Button style={{ marginLeft: 8 }} onClick={() => { props.form.resetFields() }}>清除</Button>
                </div>
            </Col>
        </Row>
    </Form>
})

const styles = {
    root: {
        padding: 10,
    },
    switch: {
        marginTop: -30,
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: '24px 24px 24px 24px',
    },
    title: {
        borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16, backgroundColor: '#FFFFFF',
    },
    body: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        marginTop: 10
    }
}