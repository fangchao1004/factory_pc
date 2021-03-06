import React from 'react'
import { Modal, Form, Input, DatePicker, Switch, TreeSelect } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
/**
 * 添加创建任务界面
 */
function AddTaskForm(props) {
    const { getFieldDecorator } = props.form
    const [isMessage, setIsMessage] = React.useState(false)
    return <Form>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                rules: [{ required: true, message: '请选择执行人' }]
            })(<TreeSelect showSearch treeNodeFilterProp="title" placeholder="请选择执行人" treeCheckable treeData={props.data}></TreeSelect>)}
        </Form.Item>
        <Form.Item label="主题" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入任务主题' }]
            })(<Input placeholder="请输入任务主题"></Input>)}
        </Form.Item>
        <Form.Item label="内容" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('content', {
                rules: [{ required: true, message: '请输入任务内容' }]
            })(<Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        <Form.Item label="截止日期" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('overTime', {
                rules: [{ required: true, message: '请选择截止日期' }]
            })(<DatePicker disabledDate={disabledDate} />)}
        </Form.Item>
        <Form.Item label="短信通知" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('isMessage', {
                initialValue: isMessage,
                rules: [{ required: false, message: '请选择是否短信通知' }]
            })(<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={isMessage} onChange={(v) => { setIsMessage(v) }} />)}
        </Form.Item>
    </Form >
}

function disabledDate(current) {
    return current && current < moment().subtract(1, 'day').endOf('day');
}

const TaskForm = Form.create({ name: 'staffForm' })(AddTaskForm)

export default function (props) {
    const staffFormRef = React.useRef(null)
    const [data, setData] = React.useState(null)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        // console.log(props.visible)
        if (!props.visible) {
            if (staffFormRef.current) {
                staffFormRef.current.resetFields()
            }
            setLoading(false)
        }
    }, [props.visible])

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
                setLoading(true)
                props.onOk(values)
            }
        })
    }
    return <Modal width={700} centered onOk={handlerOk} title="新建任务"
        confirmLoading={loading}
        onCancel={props.onCancel}
        visible={props.visible}>
        <TaskForm ref={staffFormRef} data={data}></TaskForm>
    </Modal>
}

async function getLevelData() {
    return new Promise((resolve, reject) => {
        HttpApi.getUserLevel({ effective: 1 }, data => {
            if (data.data.code === 0) {
                resolve(data.data.data)
            }
        })
    })
}
async function getUserData() {
    return new Promise((resolve, reject) => {
        HttpApi.getUserInfo({ effective: 1 }, data => {
            if (data.data.code === 0) {
                resolve(data.data.data)
            }
        })
    })
}