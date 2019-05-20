import React from 'react'
import { Modal, Form, Input, Select, Upload, Icon } from 'antd'
import HttpApi from '../../util/HttpApi'

function AddTaskForm(props) {
    const { getFieldDecorator } = props.form
    const userOptions = props.users.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)

    return <Form>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                rules: [{ required: true, message: '请选择执行人' }]
            })(<Select showSearch mode="multiple" filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            } optionFilterProp="children" placeholder="请选择执行人">{userOptions}</Select>)}
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
        <Form.Item label="附件" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Upload.Dragger name='file'>
                <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                </p>
                <p>Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
            </p>
            </Upload.Dragger>
        </Form.Item>
    </Form >
}

const TaskForm = Form.create({ name: 'staffForm' })(AddTaskForm)

export default function AddTaskView(props) {
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
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }
    return <Modal width={700} centered onOk={handlerOk} title="新建任务"
        onCancel={props.onCancel}
        visible={props.visible}>
        <TaskForm ref={staffFormRef} users={users}></TaskForm>
    </Modal>
}