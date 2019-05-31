import React from 'react'
import { Modal, Form, Input, DatePicker, Switch, TreeSelect } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
/**
 * 添加创建任务界面
 */
function AddTaskForm(props) {
    const { getFieldDecorator } = props.form

    return <Form>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                rules: [{ required: true, message: '请选择执行人' }]
            })(<TreeSelect placeholder="请选择执行人" treeCheckable treeData={props.data}></TreeSelect>)}
        </Form.Item>
        <Form.Item label="主题" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入任务主题' }]
            })(<Input placeholder="请输入任务主题"></Input>)}
        </Form.Item>
        <Form.Item label="内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('content', {
                rules: [{ required: true, message: '请输入任务内容' }]
            })(<Input.TextArea style={{ height: 150 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        <Form.Item label="截止日期" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('overTime', {
                rules: [{ required: true, message: '请选择截止日期' }]
            })(<DatePicker disabledDate={disabledDate} />)}
        </Form.Item>
        <Form.Item label="短信通知" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('isMessage', {
                initialValue: true,
                rules: [{ required: false, message: '请选择是否短信通知' }]
            })(<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={true} />)}
        </Form.Item>
    </Form >
}

function disabledDate(current) {
    return current && current < moment().subtract(1, 'day').endOf('day');
}

const TaskForm = Form.create({ name: 'staffForm' })(AddTaskForm)

export default function AddTaskView(props) {
    const staffFormRef = React.useRef(null)
    const [data, setData] = React.useState(null)
    React.useEffect(() => {
        async function initData() {
            const levels = await getLevelData()
            levels.map(level => {
                level.title = level.name
                level.key = level.id
                level.value = level.id
                level.children = []
                return level
            })
            const users = await getUserData()
            users.forEach(user => {
                levels.map(level => {
                    if (level.id === user.level_id) {

                        level.children.push({
                            title: user.name,
                            value: level.id + '-' + user.id,
                            key: level.id + '-' + user.id,
                            ...user
                        })
                    }
                    return level
                })
            })
            setData(levels)
        }
        initData()
    }, [])
    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }
    return <Modal width={700} centered onOk={handlerOk} title="新建任务"
        onCancel={props.onCancel}
        visible={props.visible}>
        <TaskForm ref={staffFormRef} data={data}></TaskForm>
    </Modal>
}

async function getLevelData() {
    return new Promise((resolve, reject) => {
        HttpApi.getUserLevel(null, data => {
            if (data.data.code === 0) {
                resolve(data.data.data)
            }
        })
    })
}
async function getUserData() {
    return new Promise((resolve, reject) => {
        HttpApi.getUserInfo(null, data => {
            if (data.data.code === 0) {
                resolve(data.data.data)
            }
        })
    })
}