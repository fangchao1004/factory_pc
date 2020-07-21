import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col, Popover, Button, Badge, notification, Avatar } from 'antd'
import { Route, Link, Redirect } from 'react-router-dom'
import logopng from '../../assets/logo.png'
import HomePageRoot from './homePageMode/HomePageRoot';
import EquipmentModeRoot from './equipmentMode/EquipmentModeRoot'
import AreaModeRoot from './areaMode/AreaModeRoot'
import TimeModeRoot from './timeMode/TimeModeRoot'
import StaffModeRoot from './staffMode/StaffModeRoot'
import TableModeRoot from './tableMode/TableModeRoot';
import TaskModeRoot from './taskMode/TaskModeRoot'
import BugModeRoot from './bugMode/BugModeRoot';
import BugAboutMeModeRoot from './bugAboutMeMode/BugAboutMeModeRoot';
import BugRunChecModekRoot from './bugRunCheckMode/BugRunChecModekRoot';
import SettingViewRoot from './settingMode/SettingViewRoot';
import TransactionModeRoot from './transactionMode/TransactionModeRoot';
import CarModeRoot from './carMode/CarModeRoot'
import AttendanceModeRoot from './attendanceMode/AttendanceModeRoot'
import ScheduleRoot from './scheduleMode/ScheduleRoot'
import TansactionApplyModeRoot from './tansactionApplyMode/TansactionApplyModeRoot'
import SchemeModeRoot from './schemeMode/SchemeModeRoot'
import RunlogModeRoot from './runlogMode/RunlogModeRoot'
import UserMenuView from './userMenu/UserMenuView'
import HttpApi from '../util/HttpApi';
// import Store from '../../redux/store/Store';
// import Socket from '../socket/Socket'
import { NOTICEINFO, BUGDATAUPDATETIME, NOTIFY_MP3 } from '../util/AppData'
import { checkLocalStorageBugIdList, BrowserType } from '../util/Tool';
import NoticeMenu from './noticeMenu/NoticeMenu';
import DetailModal from './noticeMenu/DetailModal';

var storage = window.localStorage;
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu
var noticeinfo = null;
var localUserInfo = '';
// let unsubscribe;
var time;
var tempNoticeStr = '';
export default class MainView extends Component {
    constructor(props) {
        super(props)
        localUserInfo = storage.getItem('userinfo')
        noticeinfo = storage.getItem('noticeinfo')
        this.state = {
            collapsed: false,
            isAdmin: localUserInfo && JSON.parse(localUserInfo).isadmin === 1,
            permissionManager: JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('0') !== -1,
            permissionRun: JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1,
            permissionFix: JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('3') !== -1,
            major_id_all: JSON.parse(localUserInfo).major_id_all,
            noticePopVisible: false,
            modalVisible: false,
            selectItem: null,
            aboutMeBugNum: 0,
            aboutMeTaskNum: 0,
            runBugNum: 0,
            noticeMenuData: [],
            dotCount: 0,
            area0List: [],
            unreadBugs: [],
        }
        tempNoticeStr = noticeinfo ? noticeinfo : ''///获取曾提醒过的最新内容。作为临时数据。
        BrowserType();
    }
    componentDidMount() {
        localUserInfo = storage.getItem('userinfo');
        this.init();
        // unsubscribe = Store.subscribe(() => {
        // });
        this.openPolling();///开启轮询---定时去获取缺陷了任务数据
        // Socket();
    }
    init = async () => {

        var myBugList = [];
        var runBugList = [];
        var taskList = await this.getTaskInfo();
        let area0List = await this.getArea0List();
        let unreadBugs = [];
        this.setState({
            area0List: area0List.map((item) => { return { id: item.id, name: item.name } })
        })
        ///根据个人所有的权限，整合需要获取哪些状态的bugs
        let bug_status_list = [];
        if (this.state.permissionFix) { bug_status_list.push(0); bug_status_list.push(1) }
        if (this.state.permissionManager) { bug_status_list.push(0); bug_status_list.push(2); bug_status_list.push(6); bug_status_list.push(7) }
        // if (this.state.permissionRun) { bug_status_list.push(3) }
        // console.log('bug_status_list:', bug_status_list.join(','))
        ///有专业 且 至少有维修或者专工中的一个权限
        if (this.state.major_id_all && (this.state.permissionFix || this.state.permissionManager)) {
            let unreadBugs1 = await HttpApi.getUnreadBugByMajorAndBugStatus({ status_all: bug_status_list.join(','), major_all: this.state.major_id_all })
            // console.log('维修或专工未读的bug:', unreadBugs1)
            unreadBugs = unreadBugs.concat(unreadBugs1)

            myBugList = await this.getMyBugsInfo();
        }
        ///如果有的运行权限没有专业
        if (this.state.permissionRun) {
            let unreadBugs2 = await HttpApi.getUnreadBugByMajorAndBugStatus({ status_all: 3 })
            // console.log('如果有的运行 未读的bug:', unreadBugs2)
            unreadBugs = unreadBugs.concat(unreadBugs2)
            runBugList = await this.getRunBugsInfo();
        }
        // console.log('unreadBugs:', unreadBugs)
        checkLocalStorageBugIdList(unreadBugs, this._audio)
        this.setState({ unreadBugs })
        if (this.state.aboutMeBugNum !== myBugList.length || this.state.aboutMeTaskNum !== taskList.length || this.state.runBugNum !== runBugList.length) {
            console.log('有关我的-缺陷和任务数量有变化-刷新');
            setTimeout(() => {
                this.setState({
                    aboutMeBugNum: myBugList.length,
                    aboutMeTaskNum: taskList.length,
                    runBugNum: runBugList.length,
                })
            }, 500);
        }
    }
    getArea0List = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from area_0 where effective = 1 `
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getMyBugsInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from bugs where bugs.status != 4 and bugs.major_id in (${JSON.parse(localUserInfo).major_id_all}) and bugs.effective = 1 `
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getRunBugsInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from bugs where bugs.status = 3 and bugs.effective = 1 `
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getTaskInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getTaskInfo({ to: { $like: `%,${JSON.parse(localUserInfo).id},%` }, status: 0, effective: 1 }, res => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result)
            })
        })
    }
    getLastNotice = async () => {
        // console.log('getLastNotice');
        // console.log('userinfo:', userinfo)
        let result = await this.getNoticeInfo(); ///JSON.parse(userinfo).notice
        // console.log('JSON.stringify(result):',JSON.stringify(result));
        if (JSON.stringify(result) !== '{}' && tempNoticeStr !== JSON.stringify(result)) {
            console.log('发现最新通知：', JSON.stringify(result));
            tempNoticeStr = JSON.stringify(result)
            // this.setState({ tempNoticeStr: JSON.stringify(result) })///获取到新的 先马上存在本地state中，避免重复执行
            this.openNotification(result);
        }
    }
    getNoticeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from notices order by id desc limit 1`
            let result = {};
            HttpApi.obs({ sql }, data => {
                if (data.data.code === 0) {
                    result = data.data.data[0]
                }
                resolve(result);
            })
        })
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }
    openPolling = () => {
        time = setInterval(() => {
            // console.log('Polling');
            this.init();
            this.getLastNotice();
        }, BUGDATAUPDATETIME);////10秒轮询一次
    }
    componentWillUnmount() {
        clearInterval(time);
        // unsubscribe();
    }
    openNotification = (result) => {
        const key = `open${Date.now()}`;
        const btn = <div style={{ display: 'flex', justifyContent: 'space-between', width: 330 }}>
            <span >{result.time} {result.name}</span>
            <Button type="primary" size="small" onClick={() => { notification.close(key); close(); }}>确认</Button>
        </div>
        const close = () => { storage[NOTICEINFO] = JSON.stringify(result) }
        const message = <div><Icon type="info-circle" style={{ color: '#108ee9' }} /><span style={{ marginLeft: 10 }}>最新通知</span></div>
        notification.open({
            message,
            description: result.content,
            btn,
            key,
            duration: 0,
            onClose: close,
        });
    };
    ///动态生成左边菜单栏
    renderByArea0 = (area0List) => {
        const getList = (item) => <SubMenu key={item.name} title={<span><Icon type="scan" /><span>{item.name}</span></span>}>
            <Menu.Item key={`/mainView/time_${item.id}`}>
                <Icon type="clock-circle" />
                <span>巡检时间段</span>
                <Link to={`${this.props.match.url}/time_${item.id}`} />
            </Menu.Item>
            <Menu.Item key={`/mainView/equipment_${item.id}`}>
                <Icon type="switcher" />
                <span>巡检点</span>
                <Link to={`${this.props.match.url}/equipment_${item.id}`} />
            </Menu.Item>
            {this.state.isAdmin ? <Menu.Item key={`/mainView/table_${item.id}`}>
                <Icon type="file" />
                <span>巡检表单</span>
                <Link to={`${this.props.match.url}/table_${item.id}`} />
            </Menu.Item> : null}
            {this.state.isAdmin ? <Menu.Item key={`/mainView/scheme_${item.id}`}>
                <Icon type="edit" />
                <span>巡检方案</span>
                <Link to={`${this.props.match.url}/scheme_${item.id}`} />
            </Menu.Item> : null}
            <Menu.Item key={`/mainView/runlog_${item.id}`} >
                <Icon type="unordered-list" />
                <span>运行日志</span>
                <Link to={`${this.props.match.url}/runlog_${item.id}`} />
            </Menu.Item>
        </SubMenu>
        return area0List.map((item) => { return getList(item) })
    }
    render() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={this.state.collapsed} trigger={null} width={255} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
                    <div style={{ height: 64, backgroundColor: '#011529', padding: '16 24', position: 'relative' }}>
                        <img src={logopng} alt="" width="32" height="32" style={{ position: 'absolute', left: 24, top: 16 }} />
                        {this.state.collapsed ? null :
                            <span style={{ position: 'absolute', top: 18, left: 60, width: 180, color: '#fff', fontSize: 17, marginLeft: 20 }}>信息综合管理平台</span>
                        }
                    </div>
                    <Menu theme="dark" mode="inline" selectedKeys={[this.props.location.pathname]} >
                        <Menu.Item key="/mainView/home">
                            <Icon type="home" />
                            <span>首页</span>
                            <Link to={`${this.props.match.url}/home`} />
                        </Menu.Item>
                        <Menu.Item key="/mainView/area">
                            <Icon type="environment" />
                            <span>区域</span>
                            <Link to={`${this.props.match.url}/area`} />
                        </Menu.Item>
                        <SubMenu key="巡检点" title={<span><Icon type="scan" /><span>巡检</span></span>}>
                            {this.renderByArea0(this.state.area0List)}
                        </SubMenu>
                        <SubMenu key="缺陷" title={
                            <span>
                                <Icon type="reconciliation" />
                                <span>缺陷</span>
                                <Badge dot={JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1 ? (this.state.aboutMeBugNum + this.state.runBugNum) > 0 : this.state.aboutMeBugNum > 0} style={{ marginLeft: 30 }} />
                            </span>
                        }>{JSON.parse(localUserInfo).major_id_all ?
                            <Menu.Item key="/mainView/bugAboutMe">
                                <Icon type="hdd" />
                                <span>专业相关</span>
                                <Badge count={this.state.aboutMeBugNum} overflowCount={99} style={{ marginLeft: 35 }} />
                                <Link to={`${this.props.match.url}/bugAboutMe`} />
                            </Menu.Item> : null}
                            {JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1 ?
                                <Menu.Item key="/mainView/bugRunCheck">
                                    <Icon type="hdd" />
                                    <span>运行验收</span>
                                    <Badge count={this.state.runBugNum} overflowCount={99} style={{ marginLeft: 35 }} />
                                    <Link to={`${this.props.match.url}/bugRunCheck`} />
                                </Menu.Item>
                                : null}
                            <Menu.Item key="/mainView/bug">
                                <Icon type="hdd" />
                                <span>所有缺陷</span>
                                <Link to={`${this.props.match.url}/bug`} />
                            </Menu.Item>
                        </SubMenu>
                        {this.state.isAdmin ?
                            <Menu.Item key="/mainView/staff">
                                <Icon type="team" />
                                <span>员工</span>
                                <Link to={`${this.props.match.url}/staff`} />
                            </Menu.Item> : null}
                        <Menu.Item key="/mainView/task">
                            <Icon type="project" />
                            <span>任务</span>
                            <Badge count={this.state.aboutMeTaskNum} overflowCount={99} style={{ marginLeft: 35 }}>
                            </Badge>
                            <Link to={`${this.props.match.url}/task`} />
                        </Menu.Item>
                        <SubMenu key="消费" title={
                            <span>
                                <Icon type="money-collect" />
                                <span>消费</span>
                            </span>
                        }>
                            <Menu.Item key="/mainView/transaction">
                                <Icon type="ordered-list" />
                                <span>消费记录</span>
                                <Link to={`${this.props.match.url}/transaction`} />
                            </Menu.Item>
                            <Menu.Item key="/mainView/applytrans">
                                <Icon type="form" />
                                <span>消费申请</span>
                                <Link to={`${this.props.match.url}/applytrans`} />
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="考勤" title={
                            <span>
                                <Icon type="pushpin" />
                                <span>考勤</span>
                            </span>
                        }>
                            <Menu.Item key="/mainView/attendance">
                                <Icon type="contacts" />
                                <span>考勤信息</span>
                                <Link to={`${this.props.match.url}/attendance`} />
                            </Menu.Item>
                            <Menu.Item key="/mainView/schedule">
                                <Icon type="schedule" />
                                <span>工作排班</span>
                                <Link to={`${this.props.match.url}/schedule`} />
                            </Menu.Item>
                        </SubMenu>
                        <Menu.Item key="/mainView/car">
                            <Icon type="car" />
                            <span>车辆</span>
                            <Link to={`${this.props.match.url}/car`} />
                        </Menu.Item>
                        <SubMenu key="设置" title={<span><Icon type="setting" /><span>设置</span></span>}>
                            <Menu.Item key="/mainView/usersetting"><Icon type="switcher" /><span>个人设置</span><Link to={`${this.props.match.url}/usersetting`} /></Menu.Item>
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout style={{ marginLeft: this.state.collapsed ? 80 : 255 }}>
                    <Header style={{ position: 'fixed', zIndex: 10, width: `calc(100% - ${this.state.collapsed ? 80 : 255}px)`, backgroundColor: '#fff', padding: 0, borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#e8e8e8' }}>
                        <Row>
                            <Col span={2}>
                                <Icon className="trigger" style={{ fontSize: 24, marginLeft: 30 }} type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} onClick={this.toggle} />
                            </Col>
                            <Col span={22} style={{ textAlign: 'right', paddingRight: 24 }}>
                                <span style={{ marginRight: 24 }}>
                                    <Popover visible={this.state.noticePopVisible} onVisibleChange={(visible) => { this.setState({ noticePopVisible: visible }) }} trigger="click" destroyTooltipOnHide placement="bottomRight" content={<NoticeMenu {...this.props} data={this.state.unreadBugs}
                                        closePop={() => { this.setState({ noticePopVisible: false }) }}
                                        closePopAndOpenModal={(item) => { this.setState({ noticePopVisible: false, modalVisible: true, selectItem: item }) }} />}>
                                        <Badge count={this.state.unreadBugs.length}>
                                            <Icon type="bell" style={{ fontSize: 24, color: '#597ef7', cursor: "pointer" }} />
                                        </Badge>
                                    </Popover>
                                    <div style={{ display: 'none' }}>
                                        <audio ref={(audio) => { this._audio = audio }} src={NOTIFY_MP3} controls="controls" ></audio>
                                    </div>
                                    <DetailModal visible={this.state.modalVisible} item={this.state.selectItem} onCancel={() => { this.setState({ modalVisible: false }) }} />
                                </span>
                                <Popover trigger="click" width={200} placement="bottomRight" content={<UserMenuView />}>
                                    <Avatar style={{ backgroundColor: '#597ef7', verticalAlign: 'middle', cursor: "pointer" }} size="large">
                                        {JSON.parse(localUserInfo).name}
                                    </Avatar>
                                </Popover>
                            </Col>
                        </Row>
                    </Header>
                    <ContentView {...this.props} data={this.state.area0List} />
                </Layout>
            </Layout >
        );
    }
}

class ContentView extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data) ///目的是让 MainView中重新渲染时，ContentView 始终不会被重复渲染
    }
    ///动态生成路由--有几个片区就要复制几份
    renderRouterByArea0 = () => {
        const area0List = this.props.data;
        const getRoute = (item) => [<Route
            key={`1_${item.id}`}
            exact
            path={`${this.props.match.path}/equipment_${item.id}`}
            component={() => (storage.getItem('userinfo') ? <EquipmentModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`2_${item.id}`}
            exact
            path={`${this.props.match.path}/time_${item.id}`}
            component={() => (storage.getItem('userinfo') ? <TimeModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`3_${item.id}`}
            exact
            path={`${this.props.match.path}/runlog_${item.id}`}
            component={() => (storage.getItem('userinfo') ? <RunlogModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`4_${item.id}`}
            exact
            path={`${this.props.match.path}/table_${item.id}`}
            component={() => (storage.getItem('userinfo') ? <TableModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`5_${item.id}`}
            exact
            path={`${this.props.match.path}/scheme_${item.id}`}
            component={() => (storage.getItem('userinfo') ? <SchemeModeRoot {...item} /> : <Redirect to='/' />)}
        />]
        let tempRouteList = [];
        area0List.forEach((area0Item) => {
            tempRouteList.push(...getRoute(area0Item))
        })
        return tempRouteList
    }
    render() {
        return <Content style={{ background: '#fff', minHeight: 280, marginTop: 64 }}>
            <section>
                <Route
                    exact
                    path={`${this.props.match.path}/home`}
                    component={(props) => (storage.getItem('userinfo') ? <HomePageRoot {...props} /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/area`}
                    component={() => (storage.getItem('userinfo') ? <AreaModeRoot /> : <Redirect to='/' />)}
                />
                {this.renderRouterByArea0()}
                <Route
                    exact
                    path={`${this.props.match.path}/staff`}
                    component={() => (storage.getItem('userinfo') ? <StaffModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/bug`}
                    component={() => (storage.getItem('userinfo') ? <BugModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/bugAboutMe`}
                    component={() => (storage.getItem('userinfo') ? <BugAboutMeModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/bugRunCheck`}
                    component={() => (storage.getItem('userinfo') ? <BugRunChecModekRoot /> : <Redirect to='/' />)}
                />
                <Route
                    path={`${this.props.match.path}/usersetting`}
                    render={props => storage.getItem('userinfo') ? <SettingViewRoot {...props} /> : <Redirect to='/' />}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/task`}
                    component={() => (storage.getItem('userinfo') ? <TaskModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/transaction`}
                    component={() => (storage.getItem('userinfo') ? <TransactionModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/applytrans`}
                    component={() => (storage.getItem('userinfo') ? <TansactionApplyModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/car`}
                    component={() => (storage.getItem('userinfo') ? <CarModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/attendance`}
                    component={() => (storage.getItem('userinfo') ? <AttendanceModeRoot /> : <Redirect to='/' />)}
                />
                <Route
                    exact
                    path={`${this.props.match.path}/schedule`}
                    component={() => (storage.getItem('userinfo') ? <ScheduleRoot /> : <Redirect to='/' />)}
                />
            </section>
        </Content>
    }
}