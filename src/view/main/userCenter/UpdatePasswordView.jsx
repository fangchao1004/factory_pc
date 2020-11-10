import React, { useRef, useCallback } from 'react'
import { Modal, Form, Input, message } from 'antd'
import HttpApi from '../../util/HttpApi'

const storage = window.localStorage;
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
const NormalForm = Form.create({ name: 'Form' })(ChangePasswordForm)
export default (props) => {
    const form = useRef(null)
    const onOk = useCallback(() => {
        form.current.validateFields(async (error, values) => {
            if (!error) {
                if (values.newPassword !== values.confrimPassword) { message.error('新密码不一致，请检查后重新确认'); return }
                let userInfo = storage.getItem('userinfo')
                let res_user = await HttpApi.getUserInfo({ id: JSON.parse(userInfo).id });
                if (res_user.data.code === 0) {
                    let password = res_user.data.data[0].password;
                    if (password !== values.oldpassword) { message.error('原密码错误'); return }
                    let res_update = await HttpApi.updateUserInfo({ query: { id: JSON.parse(userInfo).id }, update: { password: values.newPassword } })
                    if (res_update.data.code === 0) {
                        message.success('修改密码成功');
                        props.onCancel()
                    } else { message.error('修改密码失败'); }
                }
            }
        })
    }, [props])
    return <Modal
        title="密码修改"
        destroyOnClose
        visible={props.visible}
        onOk={onOk}
        onCancel={() => { props.onCancel() }}
    >
        <NormalForm ref={form} />
    </Modal>
}