import React from 'react'
import { Modal, Form, Input } from 'antd'

function AddDeviceTypeFrom(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="设备类型名称" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入设备类型名称' }]
            })(<Input></Input>)}
        </Form.Item>
        {/* <Form.Item label="设备类型表单名称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('sample_name', {
                rules: [{ required: true, message: '请输入设备类型表单名称' }]
            })(<Input></Input>)}
        </Form.Item> */}
    </Form>
}

const DeviceTypeForm = Form.create({ name: 'staffForm' })(AddDeviceTypeFrom)

export default function AddDeviceTypeView(props) {
    const staffFormRef = React.useRef(null)
    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                values.sample_name = values.name + '表单'
                props.onOk(values)
            }
        })
    }
    return <Modal centered onOk={handlerOk} title="添加设备类型"
        onCancel={props.onCancel}
        visible={props.visible}>
        <DeviceTypeForm ref={staffFormRef}></DeviceTypeForm>
    </Modal>
}