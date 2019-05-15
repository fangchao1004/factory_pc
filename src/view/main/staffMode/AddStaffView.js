import React from 'react'
import { Modal, Form, Input } from 'antd'

function AddStaffForm(props) {
    return <Form>
        <Form.Item label="test">
            <Input></Input>
        </Form.Item>
    </Form>
}

const StaffForm = Form.create({name: 'test'})(AddStaffForm)

export default function AddStaffView(props) {
    return <Modal onOk={props.onOk}
        onCancel={props.onCancel}
        visible={props.visible}>
        <div style={{ height: 400 }}>
            <StaffForm></StaffForm>
        </div>
    </Modal>
}