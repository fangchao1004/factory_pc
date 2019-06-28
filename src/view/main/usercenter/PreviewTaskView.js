import React from 'react'
import { Modal, Form, Input, Select, DatePicker, Switch, Button } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'

/**
 * 我分配给别人的任务 详情界面 表单
 * 
 * 增加支持修改
 */
function UpdateTaskForm(props) {
    const isEditable = props.isEditable
    const isExtra = props.isExtra
    const { getFieldDecorator } = props.form
    const userOptions = props.users.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)
    const tos = props.task.to.split(',').map(item => parseInt(item))
    tos.shift()
    tos.pop();
    // console.log('props.task:截止时间：', moment(props.task.overTime).format('YYYY-MM-DD HH:mm:ss'));
    // console.log('props.taskppp:', props.task);
    return <Form>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                initialValue: tos,
                rules: [{ required: true, message: '请选择执行人' }]
            })(<Select disabled={!isEditable || isExtra} showSearch mode="multiple" filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            } optionFilterProp="children" placeholder="请选择执行人">{userOptions}</Select>)}
        </Form.Item>
        <Form.Item label="主题" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('title', {
                initialValue: props.task.title,
                rules: [{ required: true, message: '请输入任务主题' }]
            })(<Input disabled={!isEditable || isExtra} placeholder="请输入任务主题"></Input>)}
        </Form.Item>
        <Form.Item label="内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('content', {
                initialValue: props.task.content,
                rules: [{ required: true, message: '请输入任务内容' }]
            })(<Input.TextArea disabled={!isEditable || isExtra} style={{ height: 50 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        {props.task.remark ?
            <Form.Item label="已追加" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('remark', {
                    initialValue: props.task.remark,
                    rules: [{ required: false, message: '请输入任务内容' }]
                })(<Input.TextArea disabled={!isEditable || isExtra} style={{ height: 50 }} placeholder="请输入任务内容"></Input.TextArea>)}
            </Form.Item>
            : null}
        {isExtra ?
            <Form.Item label="追加内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('newRemark', {
                    initialValue: '',
                    rules: [{ required: true, message: '请输入追加内容' }]
                })(<Input.TextArea disabled={!isEditable} style={{ height: 50 }} placeholder="请输入任务内容"></Input.TextArea>)}
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
                initialValue: props.task.isMessage === 1,
                rules: [{ required: true, message: '请选择短信通知' }]
            })(<Switch disabled={!isEditable} checkedChildren="开" unCheckedChildren="关" defaultChecked={props.task.isMessage === 1} />)}
        </Form.Item>
    </Form >
}

function disabledDate(current) {
    // console.log('disabledDate current:',current); subtract(1, 'day')
    return current && current < moment().endOf('day');
}

const TaskForm = Form.create({ name: 'staffForm' })(UpdateTaskForm)

export default function PreviewTaskView(props) {
    const staffFormRef = React.useRef(null)
    const [users, setUsers] = React.useState(null)
    const [isEditable, setIsEditeable] = React.useState(false);///是否可编辑
    const [isExtra, setIsExtra] = React.useState(false);///是否为 追加任务的情况
    React.useEffect(() => {
        HttpApi.getUserInfo({}, data => {
            if (data.data.code === 0) {
                setUsers(data.data.data)
            }
        })
    }, [])
    React.useEffect(() => {
        if (staffFormRef && staffFormRef.current)
            staffFormRef.current.resetFields();
    }, [props.staff])
    /**
     * 确定修改
     */
    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                let newValues = {
                    to: "," + values.to.join(',') + ",",
                    title: values.title,
                    content: values.content,
                    overTime: values.overTime.toDate().getTime(),
                    isMessage: values.isMessage ? 1 : 0,
                    remark: values.remark
                }
                props.onOk(newValues);
                setIsEditeable(false)
                setIsExtra(false)
            }
        })
    }
    /**
     * 确定追加
     */
    const handlerAdd = () => {
        staffFormRef.current.validateFields((error, values) => {
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
                // console.log('newValues:',newValues);
                props.onOk(newValues);
                setIsEditeable(false)
                setIsExtra(false)
            }
        })
    }
    // console.log('props.staff.status:', props.staff);
    return <Modal width={700}
        centered
        // onOk={handlerOk}
        title="任务详情"
        onCancel={() => {
            props.onCancel();
            setIsEditeable(false);
            setIsExtra(false);
        }}
        visible={props.visible}
        footer={
            <div>
                <Button onClick={() => { props.onCancel(); setIsEditeable(false); setIsExtra(false) }}>取消</Button>
                {isEditable ? null :
                    (props.staff && props.staff.status === 0 ?
                        <Button type={'danger'} onClick={() => { setIsEditeable(true); setIsExtra(false); }}>修改任务</Button> :
                        <Button type={'danger'} onClick={() => { setIsEditeable(true); setIsExtra(true); }}>追加任务</Button>)}

                {isEditable ? (isExtra ? <Button type={'primary'} onClick={handlerAdd}>确定追加</Button> : <Button type={'primary'} onClick={handlerOk}>确定修改</Button>)
                    : null}
            </div>
        }>
        <TaskForm ref={staffFormRef} isEditable={isEditable} isExtra={isExtra} users={users} task={props.staff}></TaskForm>
    </Modal>
}