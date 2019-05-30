import React, { useEffect, useState, useRef } from 'react'
import { List, Modal, Form, Input, message } from 'antd'
import HttpApi from '../../util/HttpApi'

var storage = window.localStorage;

function ChangePasswordForm(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="原密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('oldpassword', {
                rules: [{ required: true, message: '请输入原密码' }]
            })(<Input type='password'></Input>)}
        </Form.Item>
        <Form.Item label="新密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('newPassword', {
                rules: [{ required: true, message: '请输入新密码' }]
            })(<Input type='password' maxLength={12} placeholder={'最大支持12位'}></Input>)}
        </Form.Item>
        <Form.Item label="确认密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('confrimPassword', {
                rules: [{ required: true, message: '请确认密码' }]
            })(<Input type='password' maxLength={12} placeholder={'最大支持12位'}></Input>)}
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
                // console.log("撒打算打算打算：", values)
                if (values.newPassword !== values.confrimPassword) { message.error('新密码不一致，请检查后重新确认'); return }
                let userInfo = storage.getItem('userinfo')
                HttpApi.getUserInfo({ id: JSON.parse(userInfo).id }, (res) => {
                    if (res.data.code === 0) {
                        let password = res.data.data[0].password;
                        if (password !== values.oldpassword) { message.error('原密码错误'); return }
                        else {
                            HttpApi.updateUserInfo({ query: { id: JSON.parse(userInfo).id }, update: { password: values.newPassword } }, (res) => {
                                if (res.data.code === 0) {
                                    message.success('修改密码成功');
                                    setVisible(false)
                                } else {
                                    message.error('修改密码失败');
                                }
                            })


                        }
                    }
                })

            }
        })
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
            <NormalForm ref={form} />
        </Modal>
    </div>
}