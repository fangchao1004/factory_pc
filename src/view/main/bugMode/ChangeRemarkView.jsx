import React from 'react'
import { Form, Input, Modal, message } from 'antd'
import HttpApi from '../../util/HttpApi';

/**
 * 修改缺陷的最新备注
 */
export default function ChangeRemarkView(props) {
    const remarkFormRef = React.useRef(null)
    const okHandler = () => {
        remarkFormRef.current.validateFields((error, values) => {
            if (!error) {
                HttpApi.updateBugInfo({ query: { id: props.oneBug.id }, update: { last_remark: values.remarkText } }, (res) => {
                    if (res.data.code === 0) {
                        message.success('更新成功');
                        props.ok();
                        remarkFormRef.current.resetFields();
                    }
                })
            }
        })
    }
    const cancelHandler = () => {
        remarkFormRef.current.resetFields();
        props.cancel();
    }
    return <Modal
        width={500}
        centered
        title='添加备注'
        visible={props.showModal}
        onCancel={cancelHandler}
        onOk={okHandler}
    >
        <RemarkForm ref={remarkFormRef} />
    </Modal>
}

function changeRemarkForm(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remarkText', {
                rules: [{ required: true, message: '请输入备注' }]
            })(<Input.TextArea></Input.TextArea>)}
        </Form.Item>
    </Form >
}
const RemarkForm = Form.create({ name: 'remarkForm' })(changeRemarkForm)