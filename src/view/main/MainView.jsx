import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col } from 'antd'
import { Route, Link } from 'react-router-dom'
import logopng from '../../assets/logo.png'
import HomePageViewRoot from './homePageMode/HomePageViewRoot';
import EquipmentViewRoot from './equipmentMode/EquipmentViewRoot'
import StaffViewRoot from './staffMode/StaffViewRoot'
import SettingEquipmentModeRoot from './settingMode/settingEquipmentMode/SettingEquipmentModeRoot';
import SettingStaffModeRoot from './settingMode/settingStaffMode/SettingStaffModeRoot';
import SettingTableModeRoot from './settingMode/settingTableMode/SettingTableModeRoot';
import TableMode from './tableMode/TableMode';

const { SubMenu } = Menu;
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
                    width="254"
                >
                    <div
                        style={{
                            height: 64,
                            background: 'rgba(8,32,61,1)',
                            padding: '16 24',
                            position: 'relative'
                        }}
                    >
                        /> : (
                     {this.state.collapsed ? ( <img
                            src={logopng}
                            alt=""
                            width="96"
                            height="60"
                            style={{ position: 'absolute', left: 0, top: 0 }}
                        />) : (
                        <img
                            src={logopng}
                            alt=""
                            width="96"
                            height="60"
                            style={{ position: 'absolute', left: 24, top: 0 }}
                        />
                         )}
                        {this.state.collapsed ? null : (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 18,
                                    left: 120,
                                    width: 180,
                                    color: '#fff',
                                    fontSize: 20
                                }}
                            >
                                管理平台
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
                            <Icon type="pay-circle" />
                            <span>设备</span>
                            <Link to={`${this.props.match.url}/equipment`} />
                        </Menu.Item>
                        <Menu.Item key="员工">
                            <Icon type="read" />
                            <span>员工</span>
                            <Link to={`${this.props.match.url}/staff`} />
                        </Menu.Item>
                        <Menu.Item key="表单">
                            <Icon type="idcard" />
                            <span>表单</span>
                            <Link to={`${this.props.match.url}/table`} />
                        </Menu.Item>
                        <SubMenu
                            key="设置"
                            title={
                                <span>
                                    <Icon type="setting" />
                                    <span>设置</span>
                                </span>
                            }
                        >
                            <Menu.Item key="设备设置">
                                设备设置
                <Link to={`${this.props.match.url}/setting/equipmentModeRoot`} />
                            </Menu.Item>
                            <Menu.Item key="员工设置">
                                员工设置
                <Link to={`${this.props.match.url}/setting/staffModeRoot`} />
                            </Menu.Item>
                            <Menu.Item key="表单设置">
                                表单设置
                <Link to={`${this.props.match.url}/setting/tableModeRoot`} />
                            </Menu.Item>
                        </SubMenu>
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
                                <span style={{ fontSize: 20, fontWeight: 'bold' }}>
                                    {this.state.title}
                                </span>
                            </Col>
                            <Col span={16} style={{ textAlign: 'right', paddingRight: 24 }}>

                            </Col>
                        </Row>
                    </Header>
                    <Content
                        style={{
                            background: '#fff',
                            margin: 24,
                            padding: 24,
                            minHeight: 280
                        }}
                    >
                        <section>
                            <Route
                                exact
                                path={`${this.props.match.path}`}
                                component={HomePageViewRoot}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/equipment`}
                                component={EquipmentViewRoot}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/staff`}
                                component={StaffViewRoot}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/table`}
                                component={TableMode}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/setting/equipmentModeRoot`}
                                component={SettingEquipmentModeRoot}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/setting/staffModeRoot`}
                                component={SettingStaffModeRoot}
                            />
                            <Route
                                exact
                                path={`${this.props.match.path}/setting/tableModeRoot`}
                                component={SettingTableModeRoot}
                            />
                        </section>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default MainView;