import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Layout, Menu, Icon, Row, Col, Popover, Badge, Avatar, Dropdown, Modal } from 'antd'
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
import TransactionModeRoot from './transactionMode/TransactionModeRoot';
import CarModeRoot from './carMode/CarModeRoot'
import AttendanceModeRoot from './attendanceMode/AttendanceModeRoot'
import ScheduleRoot from './scheduleMode/ScheduleRoot'
import TansactionApplyModeRoot from './tansactionApplyMode/TansactionApplyModeRoot'
import SchemeModeRoot from './schemeMode/SchemeModeRoot'
import RunlogModeRoot from './runlogMode/RunlogModeRoot'
// import UserMenuView from './userMenu/UserMenuView'///废弃
// import SettingViewRoot from './settingMode/SettingViewRoot';///废弃
import HttpApi, { environmentIsTest } from '../util/HttpApi';
import { BUGDATAUPDATETIME, NOTIFY_MP3, WARN_MP3 } from '../util/AppData'
import { checkLocalStorageBugIdList, BrowserType, combin2BugList, sortById_desc } from '../util/Tool';
import NoticeMenu from './noticeMenu/NoticeMenu';
import DetailModal from './noticeMenu/DetailModal';
import { AppDataContext } from '../../redux/AppRedux'
import { useMemo } from 'react';
import UserCenterView from './userCenter/UserCenterView';
import UserLoginLogsView from './userLoginLogMode/UserLoginLogsView';

const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu
const storage = window.localStorage;
export default props => {
    const localUserInfo = storage.getItem('userinfo');
    const audio1 = useRef()
    const audio2 = useRef()
    const { appState, appDispatch } = useContext(AppDataContext)
    const [collapsed, setCollapsed] = useState(false);
    const [isAdmin] = useState(localUserInfo && JSON.parse(localUserInfo).isadmin === 1);
    const [permissionManager] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('0') !== -1)
    const [permissionRun] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1)
    const [permissionFix] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('3') !== -1)
    const [major_id_all] = useState(JSON.parse(localUserInfo).major_id_all)
    const [noticePopVisible, setNoticePopVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectItem, setSelectItem] = useState()
    const [area0List, setArea0List] = useState([])
    const [unreadBugList, setUnreadBugList] = useState([])
    const [unreadWarnList, setUnreadWarnList] = useState([])

    const menu = (
        <Menu onClick={(target) => {
            switch (target.key) {
                case '1':
                    props.history.push('/mainView/usersetting')
                    break;
                case '2':
                    Modal.confirm({
                        title: `确认要退出吗？`,
                        okText: '确定',
                        okType: 'danger',
                        onOk: function () {
                            storage.removeItem('userinfo');
                            props.history.replace('/')
                            setTimeout(() => {
                                window.location.href = environmentIsTest ? '/test/' : '/';
                            }, 1000);
                        }
                    })
                    break;
                default:
                    break;
            }
        }}>
            <Menu.Item key="1">
                <Icon type="user" />
                <span>个人中心</span>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="2">
                <Icon type="poweroff" />
                <span>退出登录</span>
            </Menu.Item>
        </Menu>
    );

    const init = useCallback(async () => {
        var myBugList = [];
        var runBugList = [];
        var taskList = [];
        var unreadBugs = [];
        var unreadWarns = [];
        ///获取任务数据🌟
        var res_task = await HttpApi.getTaskInfo({ to: { $like: `%,${JSON.parse(localUserInfo).id},%` }, status: 0, effective: 1 });
        if (res_task.data.code === 0) {
            taskList = res_task.data.data
            // console.log('任务数据:', res_task.data.data)///🌟
        }
        ///根据个人所有的权限，整合需要获取哪些状态的bugs
        let bug_status_list = [];
        if (permissionFix) { bug_status_list.push(0); bug_status_list.push(1) }
        if (permissionManager) { bug_status_list.push(0); bug_status_list.push(2); bug_status_list.push(6); bug_status_list.push(7) }
        ///有专业 且 至少有维修或者专工中的一个权限
        if (major_id_all && (permissionFix || permissionManager)) {
            let unreadBugs1 = await HttpApi.getUnreadBugByMajorAndBugStatus({ status_all: bug_status_list.join(','), major_all: major_id_all })
            // console.log('维修或专工未读的bug:', unreadBugs1)
            unreadBugs = unreadBugs.concat(unreadBugs1)
            ///getMyBugsInfo
            // let sql = `select bugs.*,majors.name as major_name from bugs
            // left join (select * from majors where effective = 1) majors on majors.id = bugs.major_id
            // where bugs.status != 4 and bugs.major_id in (${major_id_all}) and bugs.effective = 1 `
            // let res_my_bug_list = await HttpApi.obs({ sql });
            let res_my_bug_list = await HttpApi.getBugListAboutMe(major_id_all)
            if (res_my_bug_list.data.code === 0) {
                myBugList = res_my_bug_list.data.data
                // console.log('于我相关的缺陷数据:', res_my_bug_list.data.data) ///🌟
            }
        }
        ///如果有的运行权限没有专业
        if (permissionRun) {
            let unreadBugs2 = await HttpApi.getUnreadBugByMajorAndBugStatus({ status_all: 3 })
            // console.log('如果有的运行 未读的bug:', unreadBugs2)
            unreadBugs = unreadBugs.concat(unreadBugs2)
            ///getRunBugsInfo
            let sql = `select bugs.*,majors.name as major_name from bugs
            left join (select * from majors where effective = 1) majors on majors.id = bugs.major_id
            where bugs.status = 3 and bugs.effective = 1 `
            let res_run_bug_list = await HttpApi.obs({ sql })
            if (res_run_bug_list.data.code === 0) {
                runBugList = res_run_bug_list.data.data
                // console.log('运行相关的缺陷数据:', res_run_bug_list.data.data)///🌟
            }
            ///getWarningNotice
            let sql_warnings = `select * from monitor_warning where is_read = 0`
            let res_warnings = await HttpApi.obs({ sql: sql_warnings })
            if (res_warnings.data.code === 0) {
                unreadWarns = res_warnings.data.data
                // console.log('未读的报警信息:', unreadWarns)///🌟
                setUnreadWarnList(unreadWarns)
                if (unreadWarns.length > 0) {
                    audio2.current.play();
                }
            }
        }
        let result = combin2BugList(runBugList, myBugList)
        // console.log('myBugList:', myBugList)
        // console.log('未读的缺陷信息:', unreadBugs)///🌟
        checkLocalStorageBugIdList(unreadBugs, audio1.current) ///🌟 temp
        setUnreadBugList(unreadBugs)
        appDispatch({ type: 'unreadBugCount', data: unreadBugs.length })
        appDispatch({ type: 'unreadWarnCount', data: unreadWarns.length })
        appDispatch({ type: 'aboutMeBugCount', data: myBugList.length })
        appDispatch({ type: 'aboutMeTaskList', data: sortById_desc(taskList) })
        appDispatch({ type: 'runBugCount', data: runBugList.length })
        appDispatch({ type: 'allAboutMeBugList', data: sortById_desc(result) })
    }, [appDispatch, major_id_all, permissionFix, permissionManager, permissionRun, localUserInfo])
    const getArea0List = useCallback(async () => {
        ///获取area0数据动态生成菜单栏
        let sql = `select id,name from area_0 where effective = 1 `
        let res_area0 = await HttpApi.obs({ sql });
        if (res_area0.data.code === 0) {
            // console.log('厂区信息:', res_area0.data.data)
            setArea0List(res_area0.data.data.map((item) => { return { id: item.id, name: item.name } }))
        }
    }, [])
    useEffect(() => {
        getArea0List()
        BrowserType();
        init();
    }, [getArea0List, init])
    useEffect(() => {
        ///循环loop
        let loop;
        if (loop) { clearInterval(loop) }
        loop = setInterval(() => {
            init()
        }, BUGDATAUPDATETIME)
        return () => {
            ///移除clearloop
            clearInterval(loop)
        }
    }, [init])
    const renderByArea0 = useCallback(() => {
        const getList = (item) => <SubMenu key={item.name} title={<span><Icon type="scan" /><span>{item.name}</span></span>}>
            <Menu.Item key={`/mainView/time_${item.id}`}>
                <Icon type="clock-circle" />
                <span>巡检时间段</span>
                <Link to={`${props.match.url}/time_${item.id}`} />
            </Menu.Item>
            <Menu.Item key={`/mainView/equipment_${item.id}`}>
                <Icon type="switcher" />
                <span>巡检点</span>
                <Link to={`${props.match.url}/equipment_${item.id}`} />
            </Menu.Item>
            {isAdmin ? <Menu.Item key={`/mainView/table_${item.id}`}>
                <Icon type="file" />
                <span>巡检表单</span>
                <Link to={`${props.match.url}/table_${item.id}`} />
            </Menu.Item> : null}
            {isAdmin ? <Menu.Item key={`/mainView/scheme_${item.id}`}>
                <Icon type="edit" />
                <span>巡检方案</span>
                <Link to={`${props.match.url}/scheme_${item.id}`} />
            </Menu.Item> : null}
            <Menu.Item key={`/mainView/runlog_${item.id}`} >
                <Icon type="unordered-list" />
                <span>运行日志</span>
                <Link to={`${props.match.url}/runlog_${item.id}`} />
            </Menu.Item>
        </SubMenu>
        return area0List.map((item) => { return getList(item) })
    }, [area0List, isAdmin, props.match.url])
    const getRouteByArea0 = useCallback(() => {
        const getRoute = (item) => [<Route
            key={`1_${item.id}`}
            exact
            path={`${props.match.path}/equipment_${item.id}`}
            component={() => (localUserInfo ? <EquipmentModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`2_${item.id}`}
            exact
            path={`${props.match.path}/time_${item.id}`}
            component={() => (localUserInfo ? <TimeModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`3_${item.id}`}
            exact
            path={`${props.match.path}/runlog_${item.id}`}
            component={() => (localUserInfo ? <RunlogModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`4_${item.id}`}
            exact
            path={`${props.match.path}/table_${item.id}`}
            component={() => (localUserInfo ? <TableModeRoot {...item} /> : <Redirect to='/' />)}
        />,
        <Route
            key={`5_${item.id}`}
            exact
            path={`${props.match.path}/scheme_${item.id}`}
            component={() => (localUserInfo ? <SchemeModeRoot {...item} /> : <Redirect to='/' />)}
        />]
        let tempRouteList = [];
        area0List.forEach((area0Item) => {
            tempRouteList.push(...getRoute(area0Item))
        })
        return tempRouteList
    }, [area0List, props.match.path, localUserInfo])
    const contentView = useMemo(() => {
        return <Content>
            {getRouteByArea0()}
            <Route
                exact
                path={`${props.match.path}/home`}
                component={(props) => (localUserInfo ? <HomePageRoot {...props} /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/area`}
                component={() => (localUserInfo ? <AreaModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/staff`}
                component={() => (localUserInfo ? <StaffModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/bug`}
                component={() => (localUserInfo ? <BugModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/bugAboutMe`}
                component={() => (localUserInfo ? <BugAboutMeModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/bugRunCheck`}
                component={() => (localUserInfo ? <BugRunChecModekRoot /> : <Redirect to='/' />)}
            />
            <Route
                path={`${props.match.path}/usersetting`}
                render={() => localUserInfo ? <UserCenterView /> : <Redirect to='/' />}
            />
            <Route
                exact
                path={`${props.match.path}/task`}
                component={() => (localUserInfo ? <TaskModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/transaction`}
                component={() => (localUserInfo ? <TransactionModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/applytrans`}
                component={() => (localUserInfo ? <TansactionApplyModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/car`}
                component={() => (localUserInfo ? <CarModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/attendance`}
                component={() => (localUserInfo ? <AttendanceModeRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/schedule`}
                component={() => (localUserInfo ? <ScheduleRoot /> : <Redirect to='/' />)}
            />
            <Route
                exact
                path={`${props.match.path}/userloginlogs`}
                component={() => (localUserInfo ? <UserLoginLogsView /> : <Redirect to='/' />)}
            />
        </Content>
    }, [getRouteByArea0, props, localUserInfo])
    return <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} trigger={null} width={220} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
            <div style={{ height: 64, backgroundColor: '#011529', padding: '16 24', position: 'relative' }}>
                <img src={logopng} alt="" width="32" height="32" style={{ position: 'absolute', left: 24, top: 16 }} />
                {collapsed ? null :
                    <span style={{ position: 'absolute', top: 18, left: 60, width: 180, color: '#fff', fontSize: 17, marginLeft: 20 }}>信息管理平台</span>
                }
            </div>
            <Menu theme="dark" mode="inline" selectedKeys={[props.location.pathname]} >
                <Menu.Item key="/mainView/home">
                    <Icon type="home" />
                    <span>首页</span>
                    <Link to={`${props.match.url}/home`} />
                </Menu.Item>
                <Menu.Item key="/mainView/area">
                    <Icon type="environment" />
                    <span>区域</span>
                    <Link to={`${props.match.url}/area`} />
                </Menu.Item>
                <SubMenu key="巡检点" title={<span><Icon type="scan" /> <span>巡检</span></span>}>
                    {renderByArea0()}
                </SubMenu>
                <SubMenu key="缺陷" title={
                    <span>
                        <Icon type="reconciliation" />
                        <span>缺陷</span>
                        <Badge dot={permissionRun ? (appState.aboutMeBugCount + appState.runBugCount) > 0 : appState.aboutMeBugCount > 0}
                            style={{ marginLeft: 30 }} />
                    </span>
                }>{major_id_all ?
                    <Menu.Item key="/mainView/bugAboutMe">
                        <Icon type="hdd" />
                        <span>专业相关</span>
                        <Badge count={appState.aboutMeBugCount} overflowCount={99} style={{ marginLeft: 35 }} />
                        <Link to={`${props.match.url}/bugAboutMe`} />
                    </Menu.Item> : null}
                    {permissionRun ?
                        <Menu.Item key="/mainView/bugRunCheck">
                            <Icon type="hdd" />
                            <span>运行验收</span>
                            <Badge count={appState.runBugCount} overflowCount={99} style={{ marginLeft: 35 }} />
                            <Link to={`${props.match.url}/bugRunCheck`} />
                        </Menu.Item>
                        : null}
                    <Menu.Item key="/mainView/bug">
                        <Icon type="hdd" />
                        <span>所有缺陷</span>
                        <Link to={`${props.match.url}/bug`} />
                    </Menu.Item>
                </SubMenu>
                {isAdmin ?
                    <Menu.Item key="/mainView/staff">
                        <Icon type="team" />
                        <span>员工</span>
                        <Link to={`${props.match.url}/staff`} />
                    </Menu.Item> : null}
                <Menu.Item key="/mainView/task">
                    <Icon type="project" />
                    <span>任务</span>
                    <Badge count={appState.aboutMeTaskList.length} overflowCount={99} style={{ marginLeft: 35 }}>
                    </Badge>
                    <Link to={`${props.match.url}/task`} />
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
                        <Link to={`${props.match.url}/transaction`} />
                    </Menu.Item>
                    <Menu.Item key="/mainView/applytrans">
                        <Icon type="form" />
                        <span>消费申请</span>
                        <Link to={`${props.match.url}/applytrans`} />
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
                        <Link to={`${props.match.url}/attendance`} />
                    </Menu.Item>
                    <Menu.Item key="/mainView/schedule">
                        <Icon type="schedule" />
                        <span>工作排班</span>
                        <Link to={`${props.match.url}/schedule`} />
                    </Menu.Item>
                </SubMenu>
                <Menu.Item key="/mainView/car">
                    <Icon type="car" />
                    <span>车辆</span>
                    <Link to={`${props.match.url}/car`} />
                </Menu.Item>
                <SubMenu key="设置" title={<span><Icon type="setting" /><span>设置</span></span>}>
                    <Menu.Item key="/mainView/usersetting"><Icon type="switcher" /><span>个人中心</span><Link to={`${props.match.url}/usersetting`} /></Menu.Item>
                    <Menu.Item key="/mainView/userloginlogs"><Icon type="unordered-list" /><span>登录日志</span><Link to={`${props.match.url}/userloginlogs`} /></Menu.Item>
                </SubMenu>
            </Menu>
        </Sider>
        <Layout style={{ marginLeft: collapsed ? 80 : 220 }}>
            <Header style={{ width: '100%', backgroundColor: '#FFFFFF', padding: 0, borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#e8e8e8' }}>
                <Row>
                    <Col span={3}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                            <div style={{ width: 24, height: 24, display: 'flex', marginLeft: 10 }}>
                                <Icon style={{ fontSize: 24 }} type={collapsed ? 'menu-unfold' : 'menu-fold'} onClick={() => { setCollapsed(!collapsed); }} />
                            </div>
                            <div style={{ marginLeft: 20, height: 64 }}>
                                <div id="tp-weather-widget" style={{ marginLeft: 10 }} ></div>
                            </div>
                        </div>
                    </Col>
                    <Col span={21} style={{ textAlign: 'right', paddingRight: 24 }}>
                        <span style={{ marginRight: 24 }}>
                            <Popover visible={noticePopVisible} onVisibleChange={(visible) => { setNoticePopVisible(visible) }} trigger="click" destroyTooltipOnHide placement="bottomRight"
                                content={
                                    <NoticeMenu {...props} data={{ unreadBugs: unreadBugList, unreadWarns: unreadWarnList }}
                                        closePop={() => { setNoticePopVisible(false) }}
                                        closePopAndOpenModal={(item) => {
                                            setNoticePopVisible(false)
                                            setModalVisible(true)
                                            setSelectItem(item)
                                        }} />
                                }>
                                <Badge count={appState.unreadBugCount + appState.unreadWarnCount}>
                                    <Icon type="bell" style={{ fontSize: 24, color: '#597ef7', cursor: "pointer" }} />
                                </Badge>
                            </Popover>
                            <div style={{ display: 'none' }}>
                                <audio ref={audio1} src={NOTIFY_MP3} controls="controls" ></audio>
                                <audio ref={audio2} src={WARN_MP3} controls="controls" ></audio>
                            </div>
                            <DetailModal visible={modalVisible} item={selectItem} onCancel={() => { setModalVisible(false) }} />
                        </span>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} size={36}>{JSON.parse(localUserInfo).name}</Avatar>
                        </Dropdown>
                    </Col>
                </Row>
            </Header>
            {contentView}
        </Layout>
    </Layout >
}

