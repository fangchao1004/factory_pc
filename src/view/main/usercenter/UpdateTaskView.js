import React from 'react'
import { Modal, Form, Input, Select, DatePicker, Switch, Button } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'

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
            })(<Input.TextArea disabled style={{ height: 50 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        {props.task.remark ?
            <Form.Item label="追加内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('remark', {
                    initialValue: props.task.remark,
                    rules: [{ required: false, message: '请输入任务内容' }]
                })(<Input.TextArea disabled style={{ height: 50 }} placeholder="请输入任务内容"></Input.TextArea>)}
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

const TaskForm = Form.create({ name: 'staffForm' })(UpdateTaskForm)

export default function UpdateTaskView(props) {
    const staffFormRef = React.useRef(null)
    const [users, setUsers] = React.useState(null)
    React.useEffect(() => {
        HttpApi.getUserInfo({}, data => {
            if (data.data.code === 0) {
                setUsers(data.data.data)
            }
        })
    }, [])
    const handlerOk = () => {
        props.onOk(props.staff)
    }
    // console.log('props.staff:', props.staff);
    return <Modal width={700}
        centered
        title="任务详情"
        visible={props.visible}
        onCancel={props.onCancel}
        footer={
            props.staff && props.staff.status === 0 ?
                <div>
                    <Button onClick={props.onCancel}>取消</Button>
                    <Button type={'primary'} onClick={handlerOk}>已完成</Button>
                </div>
                : null
        }
    >
        <TaskForm ref={staffFormRef} users={users} task={props.staff}></TaskForm>
    </Modal>
}