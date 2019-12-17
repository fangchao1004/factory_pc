import React, { Fragment } from 'react'
import { Modal, Form, Input, Select, DatePicker, Switch, Button, Divider, Steps, message, Popconfirm } from 'antd'
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
    const isExtra = props.isExtrad
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
        <Form.Item label="截止日期" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('overTime', {
                initialValue: moment(props.task.overTime),
                rules: [{ required: true, message: '请选择截止日期' }]
            })(<DatePicker disabled={!isEditable} disabledDate={disabledDate} />)}
        </Form.Item>
        <Form.Item label="短信通知" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('isMessage', {
                initialValue: isMess,
                rules: [{ required: true, message: '请选择短信通知' }]
            })(
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
                    <Switch disabled={!isEditable} checkedChildren="开" unCheckedChildren="关" checked={isMess} onChange={(v) => { setIsMess(v) }} />
                    <Popconfirm disabled={!isMess || isEditable || status} title="确定要再次发送短信提醒吗?" onConfirm={sendMessAgain}>
                        <Button disabled={!isMess || isEditable || status} type='primary'>再次发送短信提醒</Button>
                    </Popconfirm>
                </div>
            )}
        </Form.Item>
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
     */
    const updateStepRemark = (currentStep) => {
        if (!props.task.step_remark) { message.warning('老的任务数据中-不包含步骤数据-请创建新的任务'); return }
        TaskFormRef.current.validateFields((error, values) => {
            if (!error) {
                // console.log("确定追加:", props.task.step_remark);
                let toStr = values.to.join(',');
                let oldStepRemarkCopy = JSON.parse(props.task.step_remark);
                let currentList = oldStepRemarkCopy[currentStep]
                currentList.push({ from: userinfo.id + '', to: toStr, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
                // console.log('currentList:', currentList);
                oldStepRemarkCopy[currentStep] = currentList;
                let newValues = {
                    to: "," + values.to.join(',') + ",",
                    title: values.title,
                    content: values.content,
                    overTime: values.overTime.toDate().getTime(),
                    isMessage: values.isMessage ? 1 : 0,
                    remark: values.remark,
                    step_remark: JSON.stringify(oldStepRemarkCopy)
                }
                // console.log('newValues:', newValues);
                props.onOk(newValues, true);
                setIsEditeable(false)
                setIsExtra(false)
                setStaffIsEditeable(false);
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
                        <Button disabled={props.task && props.task.status === 1} onClick={() => { setStaffIsEditeable(true); setIsExtra(false); setRemarkText(null) }}>人员重新分配</Button> :
                        <div style={{ flexDirection: 'column' }}>
                            <Button type='primary' onClick={() => { setStaffIsEditeable(false); setIsExtra(false); updateStepRemark(0); }}>确认分配</Button>
                            <Input style={{ width: 300, marginLeft: 30 }} placeholder="可以输入备注说明" value={remarkText} onChange={(e) => { setRemarkText(e.target.value) }} />
                        </div>
                    }
                </div>
                <div>
                    <Button onClick={() => { props.onCancel(); setIsEditeable(false); setIsExtra(false); setStaffIsEditeable(false); }}>取消</Button>
                    {isEditable ? null :
                        (props.task && props.task.status === 1 ?
                            <Button type={'danger'} onClick={() => { setIsEditeable(true); setIsExtra(true); }}>追加任务内容</Button> :
                            <Button type={'danger'} onClick={() => { setIsEditeable(true); setIsExtra(false); }}>修改任务内容</Button>)}
                    {isEditable ? (isExtra ? <Button type={'primary'} onClick={handlerAdd}>确定追加</Button> : <Button type={'primary'} onClick={() => { handlerOk() }}>确定修改</Button>)
                        : null}
                </div>
            </div>
        }>
        <TaskForm ref={TaskFormRef} isEditable={isEditable} isStaffEditable={isStaffEditable} isExtra={isExtra} users={users} task={props.task} sendMessAgain={sendMessAgain}></TaskForm>
        <Divider orientation="left">当前进度</Divider>
        <Steps direction="vertical" size="small" current={props.task && props.task.status + 1}>
            <Step title='任务分配' description={renderStatusX(0)} />
            <Step title='处理过程' description={renderStatusX(1)} />
            <Step title='已完成' />
        </Steps>
    </Modal>
}