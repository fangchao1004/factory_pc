import React, { Fragment } from 'react'
import { Modal, Form, Input, Select, DatePicker, Switch, Button, Divider, Steps, message } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
const { Step } = Steps;
const storage = window.localStorage;
var userinfo;
/**
 * 分配给我的任务 详情界面 表单
 */
function UpdateTaskForm(props) {
    const { getFieldDecorator } = props.form
    const userOptions = props.users.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)
    const tos = props.task.to.split(',').map(item => parseInt(item))
    const from = props.task.from;
    tos.shift()
    tos.pop();
    return <Form>
        <Form.Item label="任务发起人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                initialValue: from,
                rules: [{ required: true, message: '' }]
            })(<Select disabled showSearch mode="multiple" filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            } optionFilterProp="children" placeholder="任务发起人">{userOptions}</Select>)}
        </Form.Item>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                initialValue: tos,
                rules: [{ required: true, message: '请选择执行人' }]
            })(<Select disabled showSearch mode="multiple" filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            } optionFilterProp="children" placeholder="请选择执行人">{userOptions}</Select>)}
        </Form.Item>
        <Form.Item label="主题" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('title', {
                initialValue: props.task.title,
                rules: [{ required: true, message: '请输入任务主题' }]
            })(<Input disabled placeholder="请输入任务主题"></Input>)}
        </Form.Item>
        <Form.Item label="内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('content', {
                initialValue: props.task.content,
                rules: [{ required: true, message: '请输入任务内容' }]
            })(<Input.TextArea disabled autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        {props.task.remark ?
            <Form.Item label="追加内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('remark', {
                    initialValue: props.task.remark,
                    rules: [{ required: false, message: '请输入任务内容' }]
                })(<Input.TextArea disabled autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入任务内容"></Input.TextArea>)}
            </Form.Item>
            : null}
        <Form.Item label="截止日期" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('overTime', {
                initialValue: moment(props.task.overTime),
                rules: [{ required: true, message: '请选择截止日期' }]
            })(<DatePicker disabled={true} />)}
        </Form.Item>
        <Form.Item label="短信通知" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('overTime', {
                initialValue: null,
                rules: [{ required: true, message: '请选择短信通知' }]
            })(<Switch disabled={true} checkedChildren="开" unCheckedChildren="关" checked={props.task.isMessage === 1} />)}
        </Form.Item>
    </Form >
}

const TaskForm = Form.create({ name: 'taskForm' })(UpdateTaskForm)

export default function UpdateTaskView(props) {
    userinfo = JSON.parse(storage.getItem("userinfo"))
    const taskFormRef = React.useRef(null)
    const [users, setUsers] = React.useState(null)
    const [remarkText, setRemarkText] = React.useState(null);///备注文本的值
    React.useEffect(() => {
        HttpApi.getUserInfo({ effective: 1 }, data => {
            if (data.data.code === 0) {
                setUsers(data.data.data)
            }
        })
    }, [])
    const handlerOk = () => {
        let newTask = JSON.parse(JSON.stringify(props.task));
        newTask.status = 1;
        props.onOk(newTask)
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
        let oldStepRemarkCopy = JSON.parse(props.task.step_remark);
        let currentList = oldStepRemarkCopy[currentStep]
        currentList.push({ from: userinfo.id + '', remark: remarkText ? remarkText : '已收到，开始处理', time: moment().format('YYYY-MM-DD HH:mm:ss') });
        oldStepRemarkCopy[currentStep] = currentList;
        let newValues = {
            step_remark: JSON.stringify(oldStepRemarkCopy)
        }
        props.onOk(newValues, true);
        setRemarkText(null)
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

    // console.log('props.task:', props.task);
    return <Modal width={700}
        centered
        title="任务详情"
        visible={props.visible}
        onCancel={props.onCancel}
        footer={
            props.task && props.task.status === 1 ?
                null :
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <Button onClick={() => { updateStepRemark(1); }}>{remarkText ? '说明情况' : '收到-开始处理'}</Button>
                        <Input style={{ width: 300, marginLeft: 30 }} placeholder="可以输入备注说明" value={remarkText} onChange={(e) => { setRemarkText(e.target.value) }} />
                    </div>
                    <div>
                        <Button onClick={props.onCancel}>取消</Button>
                        <Button type={'primary'} onClick={handlerOk}>已完成</Button>
                    </div>
                </div>
        }
    >
        <TaskForm ref={taskFormRef} users={users} task={props.task}></TaskForm>
        <Divider orientation="left">当前进度</Divider>
        <Steps direction="vertical" size="small" current={props.task && props.task.status + 1}>
            <Step title='任务分配' description={renderStatusX(0)} />
            <Step title='处理过程' description={renderStatusX(1)} />
            <Step title='已完成' />
        </Steps>
    </Modal>
}