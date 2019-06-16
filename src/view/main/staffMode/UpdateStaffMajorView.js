import React from 'react'
import { Modal, Form, Input } from 'antd'

/**
 * 更新员工的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateStaffForm(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="专业名称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                initialValue: props.level.name,
                rules: [{ required: true, message: '请输入专业名称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const StaffForm = Form.create({ name: 'staffForm' })(UpdateStaffForm)


/**
 * 更新员工界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function UpdateStaffMajorView(props) {
    const staffFormRef = React.useRef(null)
    React.useEffect(() => {
        if (staffFormRef.current) {
            staffFormRef.current.resetFields()
        }
    }, [props.level])

    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }

    return <Modal centered onOk={handlerOk} title="修改专业"
        onCancel={props.onCancel}
        visible={props.visible}>
        <StaffForm ref={staffFormRef} level={props.level}></StaffForm>
    </Modal>
}