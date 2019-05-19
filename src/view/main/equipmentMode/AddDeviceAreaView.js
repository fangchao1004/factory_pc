import React from 'react'
import { Modal, Form, Input } from 'antd'

function AddDeviceTypeFrom(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="设备区域名称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入设备区域名称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const DeviceTypeForm = Form.create({ name: 'staffForm' })(AddDeviceTypeFrom)

export default function AddDeviceTypeView(props) {
    const staffFormRef = React.useRef(null)
    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }
    return <Modal centered onOk={handlerOk} title="添加设备区域"
        onCancel={props.onCancel}
        visible={props.visible}>
        <DeviceTypeForm ref={staffFormRef}></DeviceTypeForm>
    </Modal>
}