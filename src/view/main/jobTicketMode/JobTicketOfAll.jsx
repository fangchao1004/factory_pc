import { Badge, Button, Col, DatePicker, Form, Icon, Input, Row, Select, Table, Tooltip } from 'antd';
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi';
import { changeJobTicketStatusToText } from '../../util/Tool';
import JobTicketDrawer from './JobTicketDrawer';
import JobTicketDrawerForShowEdit from './JobTicketDrawerForShowEdit';
import JobTicketStepLogView from './JobTicketStepLogView';
import moment from 'moment'
import { JOB_TICKETS_STATUS } from '../../util/AppData';
const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const storage = window.localStorage;
var searchCondition = {};
var pageCondition = {};
export default function JobTicketOfAll() {
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
    const init = useCallback(async () => {
        setLoading(true)
        const localUserInfo = storage.getItem('userinfo');
        let userinfo = JSON.parse(localUserInfo);
        setCurrentUser(userinfo)
        let res = await HttpApi.getJobTicketsOptionList({ is_sub: [0] })
        if (res.data.code === 0) {
            setTypeOptionList(res.data.data)
        }
        let conditions = { ...searchCondition, ...pageCondition }
        console.log('conditions:', conditions);
        let test_res_count = await HttpApi.getMainJTApplyRecordsCountByCondition(conditions)
        if (test_res_count.data.code === 0) {
            setListLength(test_res_count.data.data[0]['count'])
        }
        let test_res = await HttpApi.getMainJTApplyRecordsByLimit(conditions)
        var main_list = []
        if (test_res.data.code === 0) {
            // console.log('主票:', test_res.data.data);
            main_list = test_res.data.data.map((item, index) => { item.key = index; return item })
            let p_id_list = main_list.map((item) => { return item.id })
            if (p_id_list.length > 0) {
                let test_sub_res = await HttpApi.getSubJTApplyRecordsByPidList({ p_id_list })
                if (test_sub_res.data.code === 0) {
                    var sub_list = test_sub_res.data.data
                    // console.log('对应措施票:', sub_list);
                }
            }
        }
        main_list.forEach((item_m) => {
            if (item_m.is_sub === 0) { item_m.sub_tickets = [] }
            sub_list.forEach((item_s) => {
                if (item_m.id === item_s.p_id) { item_m.sub_tickets.push(item_s) }
            })
        })
        setList(main_list)
        setLoading(false)
    }, [])
    const readLocalRecord = useCallback(async (record, is_sub = 0) => {
        if (record.is_read) { return }
        let copy_list = JSON.parse(JSON.stringify(list))
        copy_list.forEach((item) => {
            if (is_sub === 1) {
                if (item.sub_tickets.length > 0) {
                    item.sub_tickets.forEach((subItem) => {
                        if (subItem.id === record.id) { subItem.is_read = 1 }
                    })
                }
            } else {
                if (item.id === record.id) { item.is_read = 1 }
            }
        })
        setList(copy_list)
        await HttpApi.updateJTApplyRecord({ id: record.id, is_read: 1 })
    }, [list])
    useEffect(() => {
        ///初始条件
        searchCondition = { time: [defaultTime[0].format(FORMAT), defaultTime[1].format(FORMAT)] }
        pageCondition = { page: 1, pageSize: 10 }
        init();
    }, [init, defaultTime])
    useEffect(() => {
        let loop = setInterval(() => {
            init();
        }, 10000 * 1000)
        return () => {
            clearInterval(loop)
        }
    }, [init])
    const columns = [
        {
            title: '序号', dataIndex: 'id', key: 'id', width: 80, align: 'center', render: (text, record) => {
                return <div>{record.is_read ? null : <Badge status="processing" />}{text}</div>
            }
        },
        { title: '编号', dataIndex: 'no', key: 'no', width: 170 },
        { title: '发起时间', dataIndex: 'time', key: 'time', width: 120 },
        { title: '计划开始', dataIndex: 'time_begin', key: 'time_begin', width: 120 },
        { title: '计划结束', dataIndex: 'time_end', key: 'time_end', width: 120 },
        {
            title: '内容', dataIndex: 'job_content', key: 'job_content', render: (text) => {
                return <Tooltip title={text} placement="topLeft">
                    <div className='hideText lineClamp2'>{text}</div>
                </Tooltip>
            }
        },
        { title: '申请人', dataIndex: 'user_name', key: 'user_name', width: 100 },
        { title: '上步处理人', dataIndex: 'user_name', key: 'per_step_user_name', width: 100 },
        {
            title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (text) => {
                return changeJobTicketStatusToText(text)
            }
        },
        {
            title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 100, render: (_, record) => {
                let is_over = false
                if (record.is_sub !== 1 && record.status === 4) { is_over = true }
                else if (record.is_sub === 1 && record.status === 6) { is_over = true }///是否终结
                let inCurrentUserList = false
                inCurrentUserList = record.current_step_user_id_list.indexOf(`,${currentUser.id},`) !== -1;///是否为当前处理人
                return <div>
                    {inCurrentUserList ?
                        <Button disabled={!inCurrentUserList} size='small' type='primary' icon='file-search' onClick={(e) => { e.stopPropagation(); setIsAgent(false); setCurrentSelectRecord(record); setDrawerVisible(true); readLocalRecord(record); }}>处理</Button>
                        :
                        <Button size='small' icon='eye' onClick={(e) => { e.stopPropagation(); setDrawer2Visible(true); setCurrentSelectRecord(record) }}>查看</Button>
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
            <div style={styles.header}><Searchfrom defaultTime={defaultTime} typeOptionList={typeOptionList} startSearch={async (conditionsValue) => {
                searchCondition = conditionsValue;
                pageCondition = { page: 1, pageSize: 10 }
                setCurrentPage(1)
                init();
            }} /></div>
            <div style={styles.body}>
                <Table
                    loading={loading}
                    bordered
                    size='small'
                    columns={columns}
                    dataSource={list}
                    expandIcon={(props) => {
                        if (props.record && props.record.sub_tickets && props.record.sub_tickets.length > 0) {
                            return <Icon type="tags" style={{ color: '#1890ff' }} />
                        } else { return null }
                    }}
                    expandRowByClick={true}
                    expandedRowRender={(record) => {
                        // console.log('record.sub_tickets:', record.sub_tickets);
                        if (record.is_sub === 0 && record.sub_tickets.length > 0) {
                            const columns = [{
                                title: '序号', dataIndex: 'id', key: 'id', width: 71, align: 'center', render: (text, record) => {
                                    return <div style={{ marginLeft: -10 }}>{record.is_read ? null : <Badge status="processing" />}{text}</div>
                                }
                            },
                            { title: '措施票编号', dataIndex: 'no', key: 'no', width: 170 },
                            { title: '发起时间', dataIndex: 'time', key: 'time', width: 120 },
                            { title: '计划开始', dataIndex: 'time_begin', key: 'time_begin', width: 120 },
                            { title: '计划结束', dataIndex: 'time_end', key: 'time_end', width: 120 },
                            {
                                title: '内容', dataIndex: 'job_content', key: 'job_content', render: (text) => {
                                    return <Tooltip title={text} placement="topLeft">
                                        <div className='hideText lineClamp2'>{text}</div>
                                    </Tooltip>
                                }
                            },
                            { title: '申请人', dataIndex: 'user_name', key: 'user_name', width: 100 },
                            { title: '上步处理人', dataIndex: 'user_name', key: 'per_step_user_name', width: 100 },
                            {
                                title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (text) => {
                                    return changeJobTicketStatusToText(text, 1)
                                }
                            },
                            {
                                title: '操作', dataIndex: 'action', key: 'action', width: 90, render: (_, record) => {
                                    let is_over = false
                                    // console.log('record:', record);
                                    if (record.is_sub !== 1 && record.status === 4) { is_over = true }
                                    else if (record.is_sub === 1 && record.status === 6) { is_over = true }///是否终结
                                    let inCurrentUserList = false
                                    inCurrentUserList = record.current_step_user_id_list.indexOf(`,${currentUser.id},`) !== -1;///是否为当前处理人
                                    return <div style={{ paddingLeft: 10 }}>
                                        {inCurrentUserList ?
                                            <Button disabled={!inCurrentUserList} size='small' type='primary' icon='file-search' onClick={(e) => {
                                                e.stopPropagation(); setIsAgent(false); setCurrentSelectRecord(record); setDrawerVisible(true); readLocalRecord(record, 1);
                                            }}>处理</Button>
                                            :
                                            <Button size='small' icon='eye' onClick={(e) => {
                                                e.stopPropagation(); setDrawer2Visible(true); setCurrentSelectRecord(record)
                                            }}>查看</Button>}
                                        {currentUser.isadmin === 1 ?
                                            <>
                                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                                <Button disabled={is_over} icon='audit' size="small" type="danger" onClick={(e) => {
                                                    e.stopPropagation(); setIsAgent(true); setDrawerVisible(true); readLocalRecord(record, 1); setCurrentSelectRecord(record);
                                                }}>调度</Button>
                                            </> : null}
                                        <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                        <Button icon='unordered-list' size="small" type="default" onClick={(e) => { setStepLogVisible(true); setCurrentSelectRecord(record); }}>记录</Button>
                                    </div>
                                }
                            }
                            ]
                            return <Table showHeader={false} pagination={false} size='small' bordered dataSource={record.sub_tickets} columns={columns} />
                        }
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
            <JobTicketDrawerForShowEdit visible={drawer2Visible} onClose={() => { setDrawer2Visible(false); setCurrentSelectRecord(null) }} record={currentSelectRecord} resetData={init} />
            <JobTicketDrawer isAgent={isAgent} visible={drawerVisible} onClose={() => { setDrawerVisible(false); setCurrentSelectRecord(null) }} record={currentSelectRecord} resetData={init} />
            <JobTicketStepLogView record={currentSelectRecord} visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} />
        </div>
    )
}

const Searchfrom = Form.create({ name: 'form' })(props => {
    const itemProps = { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
    return <Form onSubmit={(e) => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            ///values搜寻条件数据过滤
            let newObj = {};
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    const element = values[key];
                    if (element && (element.length > 0 || element)) {
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
                <Form.Item label='编号查询' {...itemProps}>
                    {props.form.getFieldDecorator('no', {
                        rules: [{ required: false }]
                    })(<Input placeholder='请输入编号(模糊查询)' />)}
                </Form.Item>
            </Col>
            <Col span={24}>
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