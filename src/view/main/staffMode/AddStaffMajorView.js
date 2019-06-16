import React from 'react'
import { Modal, Form, Input } from 'antd'

/**
 * 添加员工类型的表单界面
 *
 * @param {*} props
 * @returns
 */
function AddStaffTypeForm(props) {
    const { getFieldDecorator } = props.form

    return <Form>
        <Form.Item label="专业名称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入专业名称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const StaffTypeForm = Form.create({ name: 'staffForm' })(AddStaffTypeForm)


/**
 * 添加员工类型界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function AddStaffMajorView(props) {
    const staffFormRef = React.useRef(null)

    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }
    return <Modal centered onOk={handlerOk} title="添加专业"
        onCancel={props.onCancel}
        visible={props.visible}>
        <StaffTypeForm ref={staffFormRef}></StaffTypeForm>
    </Modal>
}