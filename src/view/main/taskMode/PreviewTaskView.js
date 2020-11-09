import React, { Fragment } from 'react'
import { Modal, Form, Input, Select, DatePicker, Switch, Button, Divider, Steps, message, Popconfirm, Row, Col } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
const { Step } = Steps;
const storage = window.localStorage;
var userinfo;
/**
 * 我分配给别人的任务 详情界面 表单
 * 
 * 增加支持修改
 */
function UpdateTaskForm(props) {
    const sendMessAgain = props.sendMessAgain
    const status = props.task.status
    const isEditable = props.isEditable
    const isStaffEditable = props.isStaffEditable
    const isExtra = props.isExtra
    const { getFieldDecorator } = props.form
    const userOptions = props.users.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)
    const tos = props.task.to.split(',').map(item => parseInt(item))
    tos.shift()
    tos.pop();
    // console.log('props.task:截止时间：', moment(props.task.overTime).format('YYYY-MM-DD HH:mm:ss'));
    // console.log('props.taskppp:', props.task); 
    let isMessageflag = props.task.isMessage === 1;
    // console.log('当前任务的默认是否发送短信:',isMessageflag);
    const [isMess, setIsMess] = React.useState(isMessageflag);
    React.useEffect(() => {
        setIsMess(isMessageflag);
    }, [isMessageflag])
    return <Form>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                initialValue: tos,
                rules: [{ required: true, message: '请选择执行人' }]
            })(<Select disabled={!isStaffEditable || isExtra} showSearch mode="multiple" filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            } optionFilterProp="children" placeholder="请选择执行人">{userOptions}</Select>)}
        </Form.Item>
        <Form.Item label="任务主题" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('title', {
                initialValue: props.task.title,
                rules: [{ required: true, message: '请输入任务主题' }]
            })(<Input disabled={!isEditable || isExtra} placeholder="请输入任务主题"></Input>)}
        </Form.Item>
        <Form.Item label="任务内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('content', {
                initialValue: props.task.content,
                rules: [{ required: true, message: '请输入任务内容' }]
            })(<Input.TextArea disabled={!isEditable || isExtra} autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        {props.task.remark ?
            <Form.Item label="已追加" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('remark', {
                    initialValue: props.task.remark,
                    rules: [{ required: false, message: '请输入任务内容' }]
                })(<Input.TextArea disabled={!isEditable || isExtra} autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入任务内容"></Input.TextArea>)}
            </Form.Item>
            : null}
        {isExtra ?
            <Form.Item label="追加内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('newRemark', {
                    initialValue: '',
                    rules: [{ required: true, message: '请输入追加内容' }]
                })(<Input.TextArea disabled={!isEditable} autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入任务内容"></Input.TextArea>)}
            </Form.Item>
            : null}
        <Row>
            <Col span={12}>
                <Form.Item label="截止日期" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('overTime', {
                        initialValue: moment(props.task.overTime),
                        rules: [{ required: true, message: '请选择截止日期' }]
                    })(<DatePicker disabled={!isEditable} disabledDate={disabledDate} />)}
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="短信通知" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('isMessage', {
                        initialValue: isMess,
                        rules: [{ required: true, message: '请选择短信通知' }]
                    })(
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Switch disabled={!isEditable} checkedChildren="开" unCheckedChildren="关" checked={isMess} onChange={(v) => { setIsMess(v) }} />
                            <Popconfirm disabled={isEditable || status} title="确定要发送督促短信提醒吗?" onConfirm={sendMessAgain}>
                                <Button disabled={isEditable || status} type='primary'>督促短信</Button>
                            </Popconfirm>
                        </div>
                    )}
                </Form.Item>
            </Col>
        </Row>
    </Form >
}

function disabledDate(current) {
    // console.log('disabledDate current:',current); subtract(1, 'day')
    return current && current < moment().endOf('day');
}



const TaskForm = Form.create({ name: 'staffForm' })(UpdateTaskForm)

export default function PreviewTaskView(props) {
    userinfo = JSON.parse(storage.getItem("userinfo"))
    const TaskFormRef = React.useRef(null)
    const [users, setUsers] = React.useState(null)
    const [isEditable, setIsEditeable] = React.useState(false);///是否可编辑
    const [isExtra, setIsExtra] = React.useState(false);///是否为 追加任务的情况
    const [isStaffEditable, setStaffIsEditeable] = React.useState(false);///人员是否可编辑
    const [remarkText, setRemarkText] = React.useState(null);///备注文本的值
    React.useEffect(() => {
        HttpApi.getUserInfo({ effective: 1 }, data => {
            if (data.data.code === 0) {
                setUsers(data.data.data)
            }
        })
    }, [])
    React.useEffect(() => {
        if (TaskFormRef && TaskFormRef.current)
            TaskFormRef.current.resetFields();
    }, [props.task])
    /**
     * 确定修改
     */
    const handlerOk = (isOnlySendMessAgain = false) => {
        TaskFormRef.current.validateFields((error, values) => {
            if (!error) {
                let newValues = {
                    to: "," + values.to.join(',') + ",",
                    title: values.title,
                    content: values.content,
                    overTime: values.overTime.toDate().getTime(),
                    isMessage: values.isMessage ? 1 : 0,
                    remark: values.remark
                }
                // console.log('确定修改稿：', newValues, isOnlySendMessAgain)
                props.onOk(newValues, isOnlySendMessAgain);
                setIsEditeable(false)
                setIsExtra(false)
            }
        })
    }
    /**
     * 确定追加
     */
    const handlerAdd = () => {
        TaskFormRef.current.validateFields((error, values) => {
            if (!error) {
                // console.log("确定追加:", values);
                let newRemark = null;
                if (values.remark) {
                    newRemark = values.remark + '-' + values.newRemark
                } else {
                    newRemark = values.newRemark;
                }
                let newValues = {
                    to: "," + values.to.join(',') + ",",
                    title: values.title,
                    content: values.content,
                    remark: newRemark,
                    overTime: values.overTime.toDate().getTime(),
                    isMessage: values.isMessage ? 1 : 0,
                    status: 0
                }
                // console.log('newValues:', newValues);
                props.onOk(newValues, false);
                setIsEditeable(false)
                setIsExtra(false)
            }
        })
    }

    const sendMessAgain = () => {
        handlerOk(true);
    }

    /**
     * 渲染步骤条中的组件
     * @param {*} statusValue 
     */
    const renderStatusX = (statusValue) => {
        let taskRecord = props.task;
        if (!taskRecord) { return }
        let oneStepContent = [];///每一步的所以内容
        if (taskRecord.step_remark) {
            let stepRemarkObj = JSON.parse(taskRecord.step_remark);
            // console.log("每一步的操作流程数据：", stepRemarkObj[statusValue]);
            if (stepRemarkObj[statusValue]) {
                let renderArr = stepRemarkObj[statusValue];
                renderArr.forEach((item, index) => {
                    let text = ''
                    let remarkText = item.remark ? item.remark : '';
                    let comArr = [];///组件数组
                    if (item.to || item.to >= 0) {
                        text = <Fragment><span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{item.time}</span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + getLocalUserName(item.from)}</span>
                            <span> 分配给 </span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + getLocalUserName(item.to)}</span>
                            {remarkText ? <span style={{ color: '#888888' }}> 备注: </span> : null}
                            <span style={{ color: renderArr.length - 1 === index ? 'orange' : '#888888' }}>{remarkText}</span>
                        </Fragment>
                    } else {
                        text = <Fragment><span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{item.time}</span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + getLocalUserName(item.from)}</span>
                            {remarkText ? <span style={{ color: '#888888' }}> 备注: </span> : null}
                            <span style={{ color: renderArr.length - 1 === index ? 'orange' : '#888888' }}>{remarkText}</span>
                        </Fragment>
                    }
                    oneStepContent.push(<div key={index}>
                        {text}
                        {comArr}
                    </div>)
                })
            }
        }
        return oneStepContent
    }

    /**
     * 更新步骤数据 类似于修改
     * @param {Number} currentStep  当前所在步骤  0是分配完成 1是执行人的备注 
     * @param {Number} targetStatus 任务的status目标状态 0初始化状态未完成状态(已经分配了人员)    1人员已经完成了该任务 待验收确认的状态  2任务发布者已经验收通过处理完结状态
     * @param {String} defaultRmkTxt 默认备注
     * @param {Boolean} isOnlySendMessAgain 是否一定要再发送一次短信  这里发送的短信模版是 你有任务未完成的任务，请及时处理
     */
    const updateStepRemark = (currentStep, targetStatus = 0, defaultRmkTxt = null, isOnlySendMessAgain = false) => {
        if (!props.task.step_remark) { message.warning('老的任务数据中-不包含步骤数据-请创建新的任务'); return }
        TaskFormRef.current.validateFields((error, values) => {
            if (!error) {
                // console.log("确定追加:", props.task.step_remark);
                let toStr = values.to.join(',');
                let oldStepRemarkCopy = JSON.parse(props.task.step_remark);
                let currentList = oldStepRemarkCopy[currentStep]
                if (isOnlySendMessAgain) {///利用要不要另外发短信通知的标识位 来判断 是任务在修改，人员重新分配，还是仅仅在任务验收阶段。 要不要添加 to 这里字段到 步骤json中
                    currentList.push({ from: userinfo.id + '', to: toStr, remark: remarkText || defaultRmkTxt, time: moment().format('YYYY-MM-DD HH:mm:ss') });
                } else {
                    currentList.push({ from: userinfo.id + '', remark: remarkText || defaultRmkTxt, time: moment().format('YYYY-MM-DD HH:mm:ss') });
                }
                // console.log('currentList:', currentList);
                oldStepRemarkCopy[currentStep] = currentList;
                let newValues = {
                    to: "," + values.to.join(',') + ",",
                    title: values.title,
                    content: values.content,
                    overTime: values.overTime.toDate().getTime(),
                    isMessage: values.isMessage ? 1 : 0,
                    remark: values.remark,
                    step_remark: JSON.stringify(oldStepRemarkCopy),
                    status: targetStatus,
                }
                props.onOk(newValues, isOnlySendMessAgain, true);///是否一定要再发送一次短信
                setIsEditeable(false)
                setIsExtra(false)
                setStaffIsEditeable(false);
                setRemarkText(null)
            }
        })
    }

    /**
     * 将用户id的字符串转换成用户名称
     * @param {String} userid 
     */
    const getLocalUserName = (userid) => {
        if (!users) { return }
        let useridArr = userid.split(',');
        let usernameArr = [];
        users.forEach((item) => {
            useridArr.forEach((userid) => {
                if (item.id + '' === userid + '') {
                    usernameArr.push(item.name);
                }
            })
        })
        return usernameArr.join(',')
    }

    // console.log('props.task.status:', props.task);
    return <Modal width={700}
        destroyOnClose
        centered
        title="任务详情"
        onCancel={() => {
            props.onCancel();
            setIsEditeable(false);
            setIsExtra(false);
            setStaffIsEditeable(false);
        }}/// 右上角 关闭按钮
        visible={props.visible}
        footer={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    {!isStaffEditable ?
                        (props.task && props.task.status > 0 ? null : <Button disabled={props.task && props.task.status > 0} onClick={() => { setStaffIsEditeable(true); setIsExtra(false); setRemarkText(null) }}>人员重新分配</Button>) :
                        <div style={{ flexDirection: 'column' }}>
                            <Button type='primary' onClick={() => { setStaffIsEditeable(false); setIsExtra(false); updateStepRemark(0, 0, null, true); }}>确认分配</Button>
                            <Input style={{ width: 300, marginLeft: 30 }} placeholder="可以输入备注说明" value={remarkText} onChange={(e) => { setRemarkText(e.target.value) }} />
                        </div>
                    }
                </div>
                <div>
                    {/* <Button onClick={() => { props.onCancel(); setIsEditeable(false); setIsExtra(false); setStaffIsEditeable(false); }}>取消</Button> */}
                    {isEditable ? null :
                        (props.task && props.task.status === 0 ? <Button type={'danger'} onClick={() => { setIsEditeable(true); setIsExtra(false); }}>修改任务内容</Button> : (
                            props.task && props.task.status === 1 ?
                                <span>
                                    <Input style={{ width: 300, marginLeft: 30 }} placeholder="可以输入备注说明" value={remarkText} onChange={(e) => { setRemarkText(e.target.value) }} />
                                    <Popconfirm title="确定打回吗?" onConfirm={() => { updateStepRemark(2, 0, '任务未完成打回', false) }}><Button style={{ marginLeft: 10 }} type='danger'>任务未完成打回</Button></Popconfirm>
                                    <Popconfirm title="确定完结该任务吗?" onConfirm={() => { updateStepRemark(2, 2, '任务确认已完成', false) }}><Button type='primary'>任务确认已完成</Button></Popconfirm>
                                </span>
                                : <Button type={'danger'} onClick={() => { setIsEditeable(true); setIsExtra(true); }}>追加任务内容</Button>))}
                    {isEditable ? (isExtra ? <Button type={'primary'} onClick={handlerAdd}>确定追加</Button> : <Button type={'primary'} onClick={() => { handlerOk() }}>确定修改</Button>)
                        : null}
                </div>
            </div>
        }
    >
        <TaskForm ref={TaskFormRef} isEditable={isEditable} isStaffEditable={isStaffEditable} isExtra={isExtra} users={users} task={props.task} sendMessAgain={sendMessAgain}></TaskForm>
        <Divider orientation="left">当前进度</Divider>
        <Steps direction="vertical" size="small" current={props.task && props.task.status + 1}>
            <Step title='任务分配' description={renderStatusX(0)} />
            <Step title='正在处理' description={renderStatusX(1)} />
            <Step title='待检' description={renderStatusX(2)} />
            <Step title='完结' />
        </Steps>
    </Modal>
}