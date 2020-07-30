import React from 'react'
import { Form, Card, message } from 'antd'
import LoginFromClass from './LoginForm'
import HttpApi from '../util/HttpApi'
import Background from '../../assets/bg.jpg';
// import downloadUrl from '../../assets/downloadurl.png'
import { USERINFO } from '../util/AppData'


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
        let sql = `select users.* ,group_concat(u_m_j.mj_id) as major_id_all, group_concat(majors.name) as major_name_all from users
        left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = users.id
        left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
        where users.username = '${values.userName}' and users.password = '${values.password}' and users.effective = 1
        group by users.id`
        HttpApi.obs({ sql }, doc => {
          if (doc.data.code === 0 && doc.data.data.length > 0) {
            storage.removeItem(USERINFO);
            storage[USERINFO] = JSON.stringify(doc.data.data[0]);
            this.props.history.push('/mainView/home')
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
          // width: '100%',
          // height: '100vh',
          // display: 'flex',
          // flex: 1,
          // // flexDirection: 'row',
          // alignItems: 'center',
          // backgroundColor: '#0099FF'
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#6D8FFF'
        }}
      >
        <div style={{ width: '100%', height: 600, backgroundColor: 'rgba(255,255,255,0)' }}>
          <div style={{ height: 100, fontSize: 30, padding: 40, paddingLeft: 150, color: '#FFFFFF', fontWeight: 800 }}>中节能（合肥）信息综合管理平台</div>
          <div style={{
            width: '100%', height: 400, backgroundImage: `url(${Background})`,
            display: 'flex', flexDirection: 'row-reverse', alignItems: 'center'
          }}>
            <Card title={<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>登录</span>
              {/* <img src={downloadUrl} alt="" width="30" height="30" style={{ cursor: 'pointer' }}
                onClick={() => { this.setState({ modalvisible: true }) }}
              /> */}
            </div>}
              style={{ width: 300, height: 280, marginRight: 120 }}>
              <LoginFrom ref="form" onLoginOk={this.onLoginOk} />
            </Card>
            {/* <Modal
              // confirmLoading={this.state.modalvisible}
              width={350}
              hight={500}
              title={<div>客户端下载二维码</div>}
              visible={this.state.modalvisible}
              onCancel={() => { this.setState({ modalvisible: false }) }}
              footer={null}
            >
              <img src={downloadUrl} alt="" width="300" height="300" />
            </Modal> */}
          </div>
        </div>
        <div style={{ position: 'fixed', bottom: 15, textAlign: 'center' }}>
          <img style={{ cursor: 'pointer' }} src='https://hefeixiaomu.oss-cn-hangzhou.aliyuncs.com/xiaomu/xiaomu_logo_64.png' alt="" width="20" height="20" onClick={() => {
            window.open("https://www.ixiaomu.cn")
          }} />
          &nbsp;
        <span style={{ color: '#DDD', fontSize: 12, cursor: 'pointer' }} onClick={() => {
            window.open("https://www.ixiaomu.cn")
          }}>小木软件提供服务</span>
          &nbsp;&nbsp;&nbsp;
        <span style={{ color: '#DDD', fontSize: 12, cursor: 'pointer' }} onClick={() => {
            window.open("http://www.beian.miit.gov.cn")
          }}>皖ICP备17017819号</span>
        </div>
      </div>
    )
  }
}