import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col, Popover, Button } from 'antd'
import { Route, Link, Redirect } from 'react-router-dom'
import logopng from '../../assets/logo.png'
import HomePageViewRoot from './homePageMode/HomePageViewRoot';
import EquipmentModeRoot from './equipmentMode/EquipmentModeRoot'
import StaffModeRoot from './staffMode/StaffModeRoot'
import TableModeRoot from './tableMode/TableModeRoot';
import UserModeRoot from './usercenter/UserModeRoot'
import SettingEquipmentModeRoot from './settingMode/settingEquipmentMode/SettingEquipmentModeRoot';
import SettingStaffModeRoot from './settingMode/settingStaffMode/SettingStaffModeRoot';
import SettingTableModeRoot from './settingMode/settingTableMode/SettingTableModeRoot';

var storage = window.localStorage;
const { Header, Content, Sider } = Layout;

class MainView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false
        }
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }
    render() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    collapsible
                    collapsed={this.state.collapsed}
                    onCollapse={this.onCollapse}
                    trigger={null}
                    width="200"
                >
                    <div
                        style={{
                            height: 64,
                            background: 'rgba(8,32,61,1)',
                            padding: '16 24',
                            position: 'relative'
                        }}
                    >
                        <img
                            src={logopng}
                            alt=""
                            width="32"
                            height="32"
                            style={{ position: 'absolute', left: 24, top: 16 }}
                        />
                        {this.state.collapsed ? null : (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 18,
                                    left: 60,
                                    width: 180,
                                    color: '#fff',
                                    fontSize: 20
                                }}
                            >
                                工厂管理平台
              </span>
                        )}
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        onClick={this.onMeunClick}
                    >
                        <Menu.Item key="首页">
                            <Icon type="home" />
                            <span>首页</span>
                            <Link to={`${this.props.match.url}`} />
                        </Menu.Item>
                        <Menu.Item key="设备">
                            <Icon type="switcher" />
                            <span>设备</span>
                            <Link to={`${this.props.match.url}/equipment`} />
                        </Menu.Item>
                        <Menu.Item key="员工">
                            <Icon type="team" />
                            <span>员工</span>
                            <Link to={`${this.props.match.url}/staff`} />
                        </Menu.Item>
                        <Menu.Item key="表单">
                            <Icon type="file" />
                            <span>表单</span>
                            <Link to={`${this.props.match.url}/table`} />
                        </Menu.Item>
                        <Menu.Item key="个人中心">
                            <Icon type="user" />
                            <span>个人中心</span>
                            <Link to={`${this.props.match.url}/user`} />
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Row>
                            <Col span={8}>
                                <Icon
                                    className="trigger"
                                    style={{ fontSize: 24, marginLeft: 30 }}
                                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                    onClick={this.toggle}
                                />

                            </Col>
                            <Col span={16} style={{ textAlign: 'right', paddingRight: 24 }}>
                                <Popover width={100} placement="rightBottom" title={storage.getItem('userinfo') ? "用户名: " + JSON.parse(storage.getItem('userinfo')).username : "不存在"}
                                    content={<Button type='primary' style={{ width: 150 }}
                                        onClick={() => {
                                            storage.clear();
                                            window.location.href = "/";
                                        }}>退出登录</Button>} trigger="click">
                                    <Icon type="user" style={{ fontSize: 24 }} />
                                </Popover>
                            </Col>
                        </Row>
                    </Header>
                    <Content
                        style={{
                            background: '#fff',
                            margin: 14,
                            padding: 14,
                            minHeight: 280,
                            height: '100%'
                        }}
                    >
                        <section>
                            <Route
                                exact
                                path={`${this.props.match.path}`}
                                // component={HomePageViewRoot}
                                component={() => (storage.getItem('userinfo') ? <HomePageViewRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/equipment`}
                                // component={EquipmentModeRoot}
                                component={() => (storage.getItem('userinfo') ? <EquipmentModeRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/staff`}
                                // component={StaffModeRoot}
                                component={() => (storage.getItem('userinfo') ? <StaffModeRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/table`}
                                // component={TableModeRoot}
                                component={() => (storage.getItem('userinfo') ? <TableModeRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/user`}
                                // component={UserModeRoot}
                                component={() => (storage.getItem('userinfo') ? <UserModeRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/setting/equipmentModeRoot`}
                                // component={SettingEquipmentModeRoot}
                                component={() => (storage.getItem('userinfo') ? <SettingEquipmentModeRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/setting/staffModeRoot`}
                                // component={SettingStaffModeRoot}
                                component={() => (storage.getItem('userinfo') ? <SettingStaffModeRoot /> : <Redirect to='/' />)}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/setting/tableModeRoot`}
                                // component={SettingTableModeRoot}
                                component={() => (storage.getItem('userinfo') ? <SettingTableModeRoot /> : <Redirect to='/' />)}
                            />
                        </section>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default MainView;
