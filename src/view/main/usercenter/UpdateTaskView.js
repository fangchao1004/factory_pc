import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import HttpApi from '../../util/HttpApi'

/**
 * 更新员工的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateTaskForm(props) {
    const { getFieldDecorator } = props.form
    const levelOptions = props.levels.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)
    return <Form>
        <Form.Item label="等级" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('level_id', {
                initialValue: props.staff.level_id,
                rules: [{ required: true, message: '请选择员工等级' }]
            })(<Select>{levelOptions}</Select>)}
        </Form.Item>
        <Form.Item label="NFC" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('nfc_id', {
                initialValue: props.staff.nfc_id,
                rules: [{ required: true, message: '请选择员工NFC' }]
            })(<Select>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="用户名" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('username', {
                initialValue: props.staff.username,
                rules: [{ required: true, message: '请输入员工用户名' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('password', {
                initialValue: props.staff.password,
                rules: [{ required: true, message: '请输入员工密码' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="昵称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                initialValue: props.staff.name,
                rules: [{ required: true, message: '请输入员工昵称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const TaskForm = Form.create({ name: 'staffForm' })(UpdateTaskForm)


/**
 * 更新员工界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function UpdateTaskView(props) {
    const staffFormRef = React.useRef(null)
    const [levels, setLevels] = React.useState(null)
    const [nfcs, setNfcs] = React.useState(null)

    React.useEffect(() => {
        HttpApi.getUserLevel({}, data => {
            if (data.data.code === 0) {
                setLevels(data.data.data)
            }
        })
        HttpApi.getNFCInfo({ type: 1 }, data => {
            if (data.data.code === 0) {
                setNfcs(data.data.data)
            }
        })
    }, [])

    React.useEffect(() => {
        if (staffFormRef.current) {
            staffFormRef.current.resetFields()
        }
    }, [props.staff])

    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }

    return <Modal centered onOk={handlerOk} title="修改员工"
        onCancel={props.onCancel}
        visible={props.visible}>
        <TaskForm ref={staffFormRef} staff={props.staff} levels={levels} nfcs={nfcs}></TaskForm>
    </Modal>
}