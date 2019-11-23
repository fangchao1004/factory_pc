import React from 'react'
import { Modal, Form, Input } from 'antd';

///更新bugLevel bugType major的对话界面
export default props => {
    const ltmformRef = React.useRef(null)
    const onOk = () => {
        ltmformRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values);
            }
        })
    }
    const onCancel = () => {
        props.onCancel();
        if (ltmformRef.current) {
            ltmformRef.current.resetFields()
        }
    }
    return <Modal
        title={props.title}
        visible={props.visible}
        onCancel={onCancel}
        onOk={onOk}
    >
        <LTMForm ref={ltmformRef} record={props.record} />
    </Modal>

}
function LtmForm(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="名称:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('name', {
                initialValue: props.record.name,
                rules: [{ required: true, message: '请输入名称' }]
            })(<Input placeholder='请输入名称'></Input>)}
        </Form.Item>
    </Form>
}
const LTMForm = Form.create({ name: 'ltmForm' })(LtmForm)