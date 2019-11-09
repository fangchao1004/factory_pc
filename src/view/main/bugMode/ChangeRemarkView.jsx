import React, { useState, useEffect } from 'react'
import { Form, Input, Modal, message, Select } from 'antd'
import HttpApi from '../../util/HttpApi';

/**
 * 修改缺陷的最新备注
 */
export default function ChangeRemarkView(props) {
    const remarkFormRef = React.useRef(null)
    const [bugTypeId, setBugTypeId] = useState([]);
    useEffect(() => {
        async function fetchData() {
            const bugTypeData = await getBugTypeInfo();
            setBugTypeId(bugTypeData);
        }
        fetchData();
    }, [])
    const getBugTypeInfo = () => {
        let sql = `select bt.id,bt.name from bug_types bt where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    const okHandler = () => {
        remarkFormRef.current.validateFields((error, values) => {
            if (!error) {
                HttpApi.updateBugInfo({ query: { id: props.oneBug.id }, update: { last_remark: values.remarkText, bug_type_id: values.bugTypeId } }, (res) => {
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
        <RemarkForm ref={remarkFormRef} data={bugTypeId} />
    </Modal>
}

function changeRemarkForm(props) {
    const { getFieldDecorator } = props.form
    const options = props.data.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)

    return <Form>
        <Form.Item label="类型" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('bugTypeId', {
                rules: [{ required: false, message: '请选择类型' }]
            })(<Select placeholder='如果不选则会保持原有类型'>{options}</Select>)}
        </Form.Item>
        <Form.Item label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remarkText', {
                rules: [{ required: true, message: '请输入备注' }]
            })(<Input.TextArea></Input.TextArea>)}
        </Form.Item>
    </Form >
}
const RemarkForm = Form.create({ name: 'remarkForm' })(changeRemarkForm)