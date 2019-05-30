import React, { useEffect, useState, useRef } from 'react'
import { List, Modal, Form, Input } from 'antd'

function ChangePasswordForm(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('username', {
                rules: [{ required: true, message: '请输入员工用户名' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="确认密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入员工昵称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const NormalForm = Form.create({ name: 'staffForm' })(ChangePasswordForm)

export default function SecuritySettingView(props) {
    const [data, setData] = useState([])
    const [visible, setVisible] = useState(false)
    const form = useRef(null)

    useEffect(() => {
        const listData = [{ title: '密码', description: '********' }]
        setData(listData)
    }, [])

    function onOk() {
        form.current.validateFields((error, values) => {
            if (!error) {
                console.log(values)
            }
        })
        setVisible(false)
    }

    function onCancel() {
        setVisible(false)
    }

    return <div>
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={item => (
                <List.Item actions={[<a onClick={e => { setVisible(true) }}>修改</a>]}>
                    <List.Item.Meta
                        title={item.title}
                        description={item.description}
                    />
                </List.Item>
            )}
        />
        <Modal visible={visible} onOk={onOk} onCancel={onCancel} title="修改密码">
            <NormalForm ref={form}/>
        </Modal>
    </div>
}