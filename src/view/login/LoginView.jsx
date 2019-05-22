import React from 'react'
import { Form, Card, message } from 'antd'
import LoginFromClass from './LoginForm'
import HttpApi from '../util/HttpApi'
import Background from '../../assets/bg.jpg';
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

const LoginFrom = Form.create({ name: 'normal_login' })(LoginFromClass)

export default class LoginView extends React.Component {
  onLoginOk = e => {
    this.refs.form.validateFields((error, values) => {
      if (!error) {
        HttpApi.getUserInfo(values, doc => {
          if (doc.data.code === 0 && doc.data.data.length > 0) {
            // 登录成功
            this.props.history.push('/mainView')
          } else {

            message.error("用户名/密码错误")
          }
        })
      }
    })
  }

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: `url(${Background})`
        }}
        
      >
        <Card title="登录" style={{ width: 300, height: 210, top: 100 ,left :150}}>
          <LoginFrom ref="form" onLoginOk={this.onLoginOk} />
        </Card>
      </div>
    )
  }
}
