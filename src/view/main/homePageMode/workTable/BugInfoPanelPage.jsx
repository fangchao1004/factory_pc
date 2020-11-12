import { Button, Card, Descriptions, Icon, Modal, Tag, Timeline } from 'antd';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import HttpApi, { Testuri } from '../../../util/HttpApi';
import { statusToDes } from './AllAboutMeInfoPage';
import moment from 'moment';
import { checkOverTime, combin2BugList, getDuration, sortById_desc } from '../../../util/Tool';
import FuncPanelForEngineer from '../../bugMode/new/FuncPanelForEngineer';
import { completeByEngineer, completeByRunner, dontNeedfixByRepair, exchangeBugMajorByEngineer, exchangeBugMajorByRepair, fixCompleteByRepair, freezeBugStepByEngineer, freezeBugStepByRepair, goBackEngineerByRunner, goBackFixByEngineer, goBackStartByEngineer, passByEngineer } from '../../../util/OpreationTool';
import FuncPanelForRunner from '../../bugMode/new/FuncPanelForRunner';
import FuncPanelForRepair from '../../bugMode/new/FuncPanelForRepair';
import { AppDataContext } from '../../../../redux/AppRedux';
import { BUGLOOPTIME } from '../../../util/AppData';
const storage = window.localStorage;
const localUserInfo = storage.getItem('userinfo');
export default props => {
    const { appState, appDispatch } = useContext(AppDataContext)
    const [stepList, setStepList] = useState([])
    const [imguuid, setImguuid] = useState(null);///图片的uuid
    const [fixable, setFixable] = useState(false)///当前缺陷是否处于可维修操作状态
    const [engable, setEngable] = useState(false)///当前缺陷是否处于可专工操作状态
    const [runable, setRunable] = useState(false)///当前缺陷是否处于可运行操作状态
    const [repairVisible, setRepairVisible] = useState(false);///展示维修界面
    const [engineerVisible, setEngineerVisible] = useState(false);///展示专工界面
    const [runnerVisible, setRunnerVisible] = useState(false);///展示运行界面
    const [hasP0] = useState(localUserInfo && JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('0') !== -1);///专工权限
    const [hasP1] = useState(localUserInfo && JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1);///运行权限
    const [hasP3] = useState(localUserInfo && JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('3') !== -1);///维修权限
    const [bug, setBug] = useState(props.bug)
    const [currentTime, setCurrentTime] = useState(null);///当前时刻

    const initbug = useCallback(() => {
        if (props.bug) { setBug(appState.allAboutMeBugList.filter((item) => { return item.id === props.bug.id })[0]) }
        setCurrentTime(moment().toDate().getTime())
    }, [appState.allAboutMeBugList, props.bug])
    const init = useCallback(async () => {
        if (!bug) { return }
        let res = await HttpApi.getBugStepLogList(bug.id);
        if (res.data.code === 0) {
            let firstStep = [{ createdAt: bug.checkedAt, user_name: bug.user_name, tag_des: '上报缺陷' }];
            setStepList([...firstStep, ...res.data.data])
        }
        let fixable = (bug.status < 2 || bug.status === 6 || bug.status === 7);
        let engable = (bug.status < 3 || bug.status > 4);
        let runable = bug.status === 3;
        setFixable(fixable)
        setEngable(engable)
        setRunable(runable)
    }, [bug])
    const refreshStepAndBuglistStore = useCallback(async () => {
        let myBugList = [];
        let runBugList = [];
        let res_my_bug_list = await HttpApi.getBugListAboutMe(JSON.parse(localUserInfo).major_id_all)
        if (res_my_bug_list.data.code === 0) {
            myBugList = res_my_bug_list.data.data
        }
        if (hasP1) {
            let sql = `select bugs.*,majors.name as major_name from bugs
            left join (select * from majors where effective = 1) majors on majors.id = bugs.major_id
            where bugs.status = 3 and bugs.effective = 1 `
            let res_run_bug_list = await HttpApi.obs({ sql })
            if (res_run_bug_list.data.code === 0) {
                runBugList = res_run_bug_list.data.data
            }
        }
        let result = combin2BugList(runBugList, myBugList)
        appDispatch({ type: 'allAboutMeBugList', data: sortById_desc(result) })
        init()
    }, [appDispatch, hasP1, init])
    const getTimeHandler = useCallback(() => {
        let result = checkOverTime(bug, currentTime)
        let isOver = result.isOver;
        let durationTime = result.durationTime;
        let timeColor = isOver ? 'red' : 'green'
        let temp = bug.last_status_time && bug.status !== 5 ? <Tag style={{ marginTop: 8 }} color={timeColor}>{getDuration(durationTime, 1, true)}</Tag> : '-'
        return temp
    }, [bug, currentTime])
    useEffect(() => {
        initbug()
        init();
    }, [initbug, init])
    useEffect(() => {
        let loop_for_timestamp;
        if (loop_for_timestamp) { clearInterval(loop_for_timestamp) }
        loop_for_timestamp = setInterval(() => {
            setCurrentTime(moment().toDate().getTime())
        }, BUGLOOPTIME);////1秒循环一次 刷新计时
        return () => {
            clearInterval(loop_for_timestamp)
        }
    }, [])
    return <Modal
        width={800}
        title='缺陷信息'
        destroyOnClose
        visible={props.visible}
        onCancel={props.onCancel}
        footer={null}
    >
        {bug ?
            <Descriptions bordered size='small' column={2}>
                <Descriptions.Item label="编号">{bug.id}</Descriptions.Item>
                <Descriptions.Item label="时间">{bug.checkedAt}</Descriptions.Item>
                <Descriptions.Item label="专业">{bug.major_name}</Descriptions.Item>
                <Descriptions.Item label="计时"> {getTimeHandler()}</Descriptions.Item>
                <Descriptions.Item label="区域">{bug.area_name || bug.area_remark}</Descriptions.Item>
                <Descriptions.Item label="巡检点">{bug.device_name || '-'}</Descriptions.Item>
                <Descriptions.Item label="等级">{levelToDes(bug)}</Descriptions.Item>
                <Descriptions.Item label="发现人">{bug.user_name}</Descriptions.Item>
                <Descriptions.Item label="状态">{statusToDes(bug).des}</Descriptions.Item>
                <Descriptions.Item label="内容">{<RenderContent data={bug} setImguuid={setImguuid} />}</Descriptions.Item>
            </Descriptions> : null}
        <Card style={styles.card} title='处理记录' size='small' bodyStyle={{ paddingBottom: 0 }}>
            <div >
                {stepList.length > 0 ?
                    <Timeline style={{ marginTop: 10 }} >
                        {RenderTimeLine(stepList, setImguuid)}
                    </Timeline> : null}
            </div>
        </Card>
        <Card style={styles.card} title='操作面板' size='small'>
            <div >
                {fixable && hasP3 ? <Button icon='tool' size="small" style={styles.button} type='primary' onClick={() => { setRepairVisible(true) }}>维修处理</Button> : null}
                {engable && hasP0 ? <Button icon='tool' size="small" style={styles.button} type='primary' onClick={() => { setEngineerVisible(true) }}>专工处理</Button> : null}
                {runable && hasP1 ? <Button icon='tool' size="small" style={styles.button} type='primary' onClick={() => { setRunnerVisible(true) }}>运行处理</Button> : null}
            </div>
        </Card>
        <Modal visible={imguuid !== null} destroyOnClose centered
            width={410} bodyStyle={{ textAlign: 'center', padding: 5, margin: 0 }} footer={null} onCancel={() => { setImguuid(null) }}>
            <img alt='' style={{ width: 400 }} src={Testuri + 'get_jpg?uuid=' + imguuid} />
        </Modal>
        <FuncPanelForRepair visible={repairVisible} onOk={(v) => {
            switch (v.selectValue) {
                case 1:
                    exchangeBugMajorByRepair(v, bug, refreshStepAndBuglistStore);
                    break;
                case 2:
                    freezeBugStepByRepair(v, bug, refreshStepAndBuglistStore);
                    break;
                case 3:
                    fixCompleteByRepair(v, bug, refreshStepAndBuglistStore);
                    break;
                case 4:
                    dontNeedfixByRepair(v, bug, refreshStepAndBuglistStore);
                    break;
                default:
                    break;
            }
            setRepairVisible(false)
        }} onCancel={() => { setRepairVisible(false) }} />
        <FuncPanelForEngineer visible={engineerVisible} record={bug} onOk={(v) => {
            switch (v.selectValue) {
                case 1:
                    exchangeBugMajorByEngineer(v, bug, refreshStepAndBuglistStore);
                    break;
                case 2:
                    freezeBugStepByEngineer(v, bug, refreshStepAndBuglistStore);
                    break;
                case 3:
                    goBackStartByEngineer(v, bug, refreshStepAndBuglistStore);
                    break;
                case 4:
                    completeByEngineer(v, bug, refreshStepAndBuglistStore);
                    break;
                case 5:
                    goBackFixByEngineer(v, bug, refreshStepAndBuglistStore);
                    break;
                case 6:
                    passByEngineer(v, bug, refreshStepAndBuglistStore);
                    break;
                default:
                    break;
            }
            setEngineerVisible(false)
        }} onCancel={() => { setEngineerVisible(false) }} />
        <FuncPanelForRunner visible={runnerVisible} onOk={(v) => {
            switch (v.selectValue) {
                case 1:
                    completeByRunner(v, bug, refreshStepAndBuglistStore);
                    break;
                case 2:
                    goBackEngineerByRunner(v, bug, refreshStepAndBuglistStore);
                    break;
                default:
                    break;
            }
            setRunnerVisible(false)
        }} onCancel={() => { setRunnerVisible(false) }} />
    </Modal>
}
const styles = {
    card: { marginTop: 16 },
    icon: { marginRight: 5 },
    button: { marginRight: 10 },
}
function RenderContent(params) {
    let record = params.data
    let contentobj = JSON.parse(record.content);
    let imgs_arr = JSON.parse(JSON.stringify(contentobj.imgs));
    let result_arr = [];
    imgs_arr.forEach((item, index) => {
        result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
    })
    let comArr = [];
    result_arr.forEach((item, index) => {
        comArr.push(
            <img alt='' style={{ width: 50, height: 50, marginRight: 10, cursor: "pointer" }} key={index} src={Testuri + 'get_jpg?uuid=' + item.uuid}
                onClick={() => {
                    params.setImguuid(item.uuid)
                }}
            />
        )
    });
    let result = ''
    if (comArr.length > 0) { result = comArr }
    // console.log('record.title_name:', record.title_name)
    return <div>
        <div style={{ fontWeight: 900 }}>
            <span>{record.title_name}</span><span style={{ color: '#41A8FF' }}>{record.title_remark}</span>
        </div>
        {record.title_name ? <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: '5px 0px 5px 0px' }} /> : null}
        <div>{contentobj.text}</div>
        {imgs_arr && imgs_arr.length > 0 ? <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: '5px 0px 5px 0px' }} /> : null}
        <div>{result}</div>
    </div>
}
function levelToDes(bug) {
    let des = '-'
    switch (bug.buglevel) {
        case 1:
            des = '一级'
            break;
        case 2:
            des = '二级'
            break;
        case 3:
            des = '三级'
            break;
        default:
            break;
    }
    return des
}

export function RenderTimeLine(stepList, setImguuidHandler) {
    let resultList = [];
    stepList.forEach((item, index) => {
        let createdAtTime = moment(item.createdAt).toDate().getTime();
        let preCreatedAtTime = index > 0 ? moment(stepList[index - 1].createdAt).toDate().getTime() : 0
        resultList.push(<Timeline.Item key={index}>
            <div style={{ backgroundColor: '' }}>
                <div>
                    {index > 0 ? <Tag style={{ marginBottom: 8 }} color={'#d3adf7'}><Icon style={styles.icon} type="hourglass" />{getDuration(createdAtTime - preCreatedAtTime)}</Tag> : null}
                </div>
                <div>
                    <Tag color={'#1690FF'}><Icon style={styles.icon} type="clock-circle" />{item.createdAt}</Tag>
                    <Tag color={'#ff7a45'} ><Icon style={styles.icon} type="user" />{item.user_name}</Tag>
                    {item.tag_des ? <Tag color={'blue'}><Icon style={styles.icon} type="tool" />{item.tag_des} {item.freeze_des ? '- ' + item.freeze_des : (item.major_name ? '- ' + item.major_name : '')}</Tag> : null}
                </div>
                {/* {index > 0 && stepList[index - 1].bug_next_status === 3 ? <Tag color={color} >{"用时:" + getDuration(createdAtTime - preCreatedAtTime)}</Tag> : null} */}
                <div>{item.imgs ? item.imgs.split(',').map((img, i) =>
                    <img alt='' style={{ width: 50, height: 50, marginTop: 10, marginRight: 10, cursor: "pointer" }} key={img} src={Testuri + 'get_jpg?uuid=' + img}
                        onClick={() => {
                            setImguuidHandler(item.uuid)
                        }}
                    />
                )
                    : ''}</div>
                {item.remark ? <div style={{ color: '#FF9900', marginTop: 5 }}>{'备注: ' + item.remark}</div> : ''}
            </div>
        </Timeline.Item>)
    })
    return resultList;
}