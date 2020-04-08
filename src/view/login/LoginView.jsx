import React from 'react'
import { Form, Card, message, Modal } from 'antd'
import LoginFromClass from './LoginForm'
import HttpApi from '../util/HttpApi'
import Background from '../../assets/bg.jpg';
import downloadUrl from '../../assets/downloadurl.png'


const LoginFrom = Form.create({ name: 'normal_login' })(LoginFromClass)
var storage = window.localStorage;
export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.init();
    this.state = { modalvisible: false }
  }
  init = () => {
    if (!window.localStorage) {
      alert("浏览器不支持localstorage");
    }
  }

  onLoginOk = e => {
    this.refs.form.validateFields((error, values) => {
      if (!error) {
        values.effective = 1;
        HttpApi.getUserInfo(values, doc => {
          if (doc.data.code === 0 && doc.data.data.length > 0) {
            storage.removeItem('userinfo');
            storage['userinfo'] = JSON.stringify(doc.data.data[0]);
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
            <Card title={<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              <span>登录</span>
              {/* <img src={downloadUrl} alt="" width="30" height="30" style={{ cursor: 'pointer' }}
                onClick={() => { this.setState({ modalvisible: true }) }}
              /> */}
            </div>}
              style={{ width: 300, height: 280, marginRight: 120 }}>
              <LoginFrom ref="form" onLoginOk={this.onLoginOk} />
            </Card>
            <Modal
              // confirmLoading={this.state.modalvisible}
              width={350}
              hight={500}
              title={<div>客户端下载二维码</div>}
              visible={this.state.modalvisible}
              onCancel={() => { this.setState({ modalvisible: false }) }}
              footer={null}
            >
              <img src={downloadUrl} alt="" width="300" height="300" />
            </Modal>
          </div>
        </div>
      </div>
    )
  }
}