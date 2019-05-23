import React from 'react'
import { Modal, Form, Input, Select, Upload, Icon } from 'antd'
import HttpApi from '../../util/HttpApi'

/**
 * 我分配给别人的任务 详情界面
 */
function UpdateTaskForm(props) {
    const { getFieldDecorator } = props.form
    const userOptions = props.users.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)
    const tos = props.task.to.split(',').map(item => parseInt(item))
    tos.shift()
    tos.pop();
    return <Form>
        <Form.Item label="执行人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('to', {
                initialValue: tos,
                rules: [{ required: true, message: '请选择执行人' }]
            })(<Select disabled showSearch mode="multiple"  filterOption={(input, option) =>
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
            })(<Input.TextArea disabled style={{ height: 150 }} placeholder="请输入任务内容"></Input.TextArea>)}
        </Form.Item>
        <Form.Item label="附件" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Upload.Dragger disabled name='file'>
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

const TaskForm = Form.create({ name: 'staffForm' })(UpdateTaskForm)

export default function PreviewTaskView(props) {
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
    return <Modal width={700} centered onOk={handlerOk} title="任务详情"
        onCancel={props.onCancel}
        visible={props.visible}
        footer={null}>
        <TaskForm ref={staffFormRef} users={users} task={props.staff}></TaskForm>
    </Modal>
}