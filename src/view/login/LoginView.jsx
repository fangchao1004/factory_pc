import React from 'react'
import { Form, Card, message } from 'antd'
import LoginFromClass from './LoginForm'
import HttpApi from '../util/HttpApi'
import Background from '../../assets/bg.jpg';

const LoginFrom = Form.create({ name: 'normal_login' })(LoginFromClass)
var storage = window.localStorage;
export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.init();
  }
  init = () => {
    if (!window.localStorage) {
      alert("浏览器不支持localstorage");
    }
  }

  onLoginOk = e => {
    this.refs.form.validateFields((error, values) => {
      if (!error) {
        HttpApi.getUserInfo(values, doc => {
          if (doc.data.code === 0 && doc.data.data.length > 0) {
            storage.clear();
            console.log(doc.data.data[0])
            storage['userinfo'] = JSON.stringify(doc.data.data[0]);
            console.log("获取storage", storage.getItem('userinfo'));
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
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#0099FF'
        }}
      >
        <div style={{ width: '100%', height: 600 }}>
          <div style={{ height: 100, fontSize: 30, padding: 40, paddingLeft: 150, color: '#FFFFFF', fontWeight: 800 }}>中节能（合肥）信息综合管理平台</div>
          <div style={{
            width: '100%', height: 400, backgroundImage: `url(${Background})`,
            display: 'flex', flexDirection: 'row-reverse', alignItems: 'center'
          }}>
            <Card title="登录" style={{ width: 300, height: 260, marginRight: 150 }}>
              <LoginFrom ref="form" onLoginOk={this.onLoginOk} />
            </Card>
          </div>
        </div>
      </div>
    )
  }
}
