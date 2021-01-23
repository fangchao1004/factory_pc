import React, { useCallback } from 'react'
import { Button, Col, Form, Input, message, Row } from 'antd'
import Background1 from '../../assets/bg2.jpg'
import svgs from '../../assets/svg'
import HttpApi from '../util/HttpApi'
import { USERINFO } from '../util/AppData'

const storage = window.localStorage
export default props => {
  const loginHandler = useCallback(async values => {
    // 测试时注释掉
    // const verfiyResult = await HttpApi.verify(values)
    // if (!verfiyResult || !verfiyResult.data || verfiyResult.data.code !== 0) {
    //   message.error('禁止访问,请联系管理员')
    //   return
    // }
    let sql = `select users.* ,group_concat(u_m_j.mj_id) as major_id_all, group_concat(majors.name) as major_name_all,levels.name as level_name from users
        left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = users.id
        left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
        left join (select * from levels  where effective = 1) levels on levels.id = users.level_id
        where users.username = '${values.username}' and users.password = '${values.password}' and users.effective = 1
        group by users.id`
    let result = await HttpApi.obs({ sql })
    if (result.data.code === 0 && result.data.data.length > 0) {
      const user = result.data.data[0]
      storage.removeItem(USERINFO)
      ///查询登录用户的角色数据
      let sql = `select roles.id,roles.value,roles.des from role_map_user
          left join roles on roles.id = role_map_user.role_id
          where user_id = ${user.id} and effective = 1`
      let result_role = await HttpApi.obs({ sql })
      let tempObj = {}
      if (result_role.data.code === 0 && result_role.data.data.length > 0) {
        const role_list = result_role.data.data
        tempObj['role_id_all'] = role_list.map(item => item.id).join(',')
        tempObj['role_name_all'] = role_list.map(item => item.des).join(',')
        tempObj['role_value_all'] = role_list.map(item => item.value).join(',') ///用role 替代 permission
        tempObj['permission'] = role_list.map(item => item.value).join(',')
      }
      const new_user = { ...user, ...tempObj }
      storage[USERINFO] = JSON.stringify(new_user)
      props.history.push('/mainView/home')
      // setTimeout(() => {
      //   window.location.reload()
      // }, 100)
    } else {
      message.error('用户名/密码错误')
    }
    // eslint-disable-next-line
  }, [])
  return (
    <div style={styles.root}>
      <div style={styles.imgV}>
        <div style={styles.img}></div>
      </div>
      <div style={styles.panelV}>
        <div style={styles.titleV}>
          <Row gutter={20}>
            <Col span={8}>{svgs.loginTitle(90, 90)}</Col>
            <Col span={16}>
              <div style={{ marginTop: 20 }}>
                <div style={styles.title}>Welcome.CECEP</div>
                <div style={styles.subTitle}>中节能【合肥】信息综合管理平台</div>
              </div>
            </Col>
          </Row>
        </div>
        <MyLoginForm loginHandler={loginHandler} />
      </div>
    </div>
  )
}
const styles = {
  root: {
    width: '800px',
    height: '400px',
    backgroundColor: 'rgba(255,255,255,1)',
    display: 'flex',
    direction: 'row'
  },
  title: {
    color: '#3C4265',
    fontSize: 20,
    fontWeight: 800,
    fontStyle: 'oblique'
  },
  subTitle: {
    color: '#8FB7FF',
    fontStyle: 'oblique'
  },
  titleV: {
    height: 200,
    padding: 20
  },
  panelV: {
    width: '300px',
    height: '100%'
  },
  imgV: {
    width: '500px',
    height: '100%'
  },
  img: {
    backgroundImage: `url(${Background1})`,
    height: '100%',
    width: '100%'
  }
}

function LoginForm(props) {
  const { getFieldDecorator } = props.form
  return (
    <Form
      onSubmit={e => {
        e.preventDefault()
        props.form.validateFields(async (err, values) => {
          if (!err) {
            console.log('values:', values)
            console.log('props:', props)
            props.loginHandler(values)
            return
          }
        })
      }}>
      <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
        {getFieldDecorator('username', {
          rules: [{ required: true, message: '请输入账号' }]
        })(<Input placeholder='请输入账号' />)}
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
        {getFieldDecorator('password', {
          rules: [{ required: true, message: '请输入密码' }]
        })(<Input type='password' placeholder='请输入密码' />)}
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
        <div style={{ textAlign: 'right' }}>
          <Button style={{ width: '100%' }} type='primary' htmlType='submit' icon='login'>
            登录
          </Button>
        </div>
      </Form.Item>
    </Form>
  )
}

const MyLoginForm = Form.create({ name: 'staffForm' })(LoginForm)
