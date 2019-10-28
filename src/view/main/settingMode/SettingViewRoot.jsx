import React, { useState } from 'react'
import { Layout, Menu } from 'antd';
import { Route, Link } from 'react-router-dom'
import UserSettingView from './UserSettingView'
import SecuritySettingView from './SecuritySettingView'

/**
 * 设置界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function SettingViewRoot(props) {
    const [title, setTitle] = useState('基本设置')

    return <Layout>
        <Layout.Sider width={230}>
            <Menu mode="inline" onClick={item => { setTitle(item.key) }} defaultSelectedKeys={['基本设置']} style={{ height: '100%' }}>
                <Menu.Item key="基本设置"><span>基本设置</span><Link to={`${props.match.url}`} /></Menu.Item>
                <Menu.Item key="安全设置"><span>安全设置</span><Link to={`${props.match.url}/security`} /></Menu.Item>
            </Menu>
        </Layout.Sider>
        <Layout.Content style={{ paddingLeft: 20, paddingRight: 20, background: '#fff', minHeight: 800 }}>
            <section>
                <h2>{title}</h2>
                <Route exact path={`${props.match.path}`} component={UserSettingView} />
                <Route exact path={`${props.match.path}/security`} component={SecuritySettingView} />
            </section>
        </Layout.Content>
    </Layout>
}