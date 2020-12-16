import React, { useState, useEffect, useCallback, useContext } from 'react';
import { originStatus, BUGLOOPTIME, BUGDATAUPDATETIME, originOverTime } from '../../../util/AppData'
import moment from 'moment'
import HttpApi, { Testuri } from '../../../util/HttpApi';
import { Table, Tag, Button, message, Tooltip, Alert, Input, Icon, Modal } from 'antd'
import { getDuration, checkOverTime } from '../../../util/Tool';
import { completeByEngineer, completeByRunner, dontNeedfixByRepair, exchangeBugMajorByEngineer, exchangeBugMajorByRepair, fixCompleteByRepair, freezeBugStepByEngineer, freezeBugStepByRepair, goBackEngineerByRunner, goBackFixByEngineer, goBackStartByEngineer, passByEngineer } from '../../../util/OpreationTool';
import StepLogView from '../../bugMode/new/StepLogView';
import FuncPanelForRunner from '../../bugMode/new/FuncPanelForRunner';
import FuncPanelForEngineer from '../../bugMode/new/FuncPanelForEngineer';
import FuncPanelForRepair from '../../bugMode/new/FuncPanelForRepair';
import { AppDataContext } from '../../../../redux/AppRedux';


const storage = window.localStorage;
var localUserInfo = storage.getItem('userinfo');
var major_filter = [];///用于筛选任务专业的数据 选项
var status_filter = [];///用于筛选状态的数据
var bug_level_filter = [];///用于筛选缺陷等级 一二三级 选项
var uploader_filter = [];///用于筛选上传者的数据 选项
var originalData = [];

export default props => {
    localUserInfo = storage.getItem('userinfo');
    const { appState, appDispatch } = useContext(AppDataContext)
    const [searchKey, setSearchKey] = useState('');///搜索关键字
    const [bugList, setBugList] = useState([]);///数据
    const [imguuid, setImguuid] = useState(null);///图片的uuid
    const [currentRecord, setcurrentRecord] = useState({});///当前选择的某一行。某一个缺陷对象
    const [repairVisible, setRepairVisible] = useState(false);///展示维修界面
    const [engineerVisible, setEngineerVisible] = useState(false);///展示专工界面
    const [runnerVisible, setRunnerVisible] = useState(false);///展示运行界面
    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面
    // const [heightLightBugId, setHeightLightNumber] = useState(0);///高亮的缺陷id
    const [currentTime, setCurrentTime] = useState(null);///当前时刻
    const [hasP3] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('3') !== -1);///维修权限
    const [hasP1] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1);///运行权限
    const [hasP0] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('0') !== -1);///专工权限

    ///初始化过滤选项
    const initFilter = useCallback(async () => {
        console.log('初始化过滤选项')
        ///挂起状态
        let sql = `select * from bug_freeze_status where effective = 1`
        let res_bugfreeze = await HttpApi.obs({ sql })
        if (res_bugfreeze.data.code === 0) {
            const bugFreezeData = res_bugfreeze.data.data;
            status_filter.length = 0;
            status_filter = [...originStatus, ...bugFreezeData.map((item) => { return { text: item.des, value: 5 + '-' + item.id, freeze_value: item.id } })]
        }
        ///一二三级
        let res_level = await HttpApi.getBugLevel({ effective: 1 })
        if (res_level.data.code === 0) {
            let bugLevelData = res_level.data.data
            bug_level_filter.length = 0;
            bug_level_filter = bugLevelData.map((item) => { return { text: item.name, value: item.id } })
            // console.log('bug_level_filter:', bug_level_filter)
        }
        ///各个专业
        let sql_major = `select m.id,m.name from majors m where effective = 1`
        let res_major = await HttpApi.obs({ sql: sql_major })
        if (res_major.data.code === 0) {
            let marjorData = res_major.data.data
            major_filter.length = 0;
            major_filter = marjorData.map((item) => { return { text: item.name, value: item.id } })
        }
        ///所有上传者
        if (JSON.parse(localUserInfo).major_id_all) {
            let sql_all_uploader = `select distinct(users.name) as user_name,bugs.user_id from bugs
            left join(select * from users where effective = 1) users on users.id = bugs.user_id
            where bugs.effective = 1 and bugs.status != 4 and bugs.major_id in (${JSON.parse(localUserInfo).major_id_all})`
            let res_all_uploader = await HttpApi.obs({ sql: sql_all_uploader })
            if (res_all_uploader.data.code === 0) {
                let uploaderData = res_all_uploader.data.data
                uploader_filter.length = 0;
                uploader_filter = uploaderData.map((item) => { return { text: item.user_name, value: item.user_id } })
            }
        }
    }, [])
    ///初始化数据
    const init = useCallback(async () => {
        console.log('初始化')
        if (JSON.parse(localUserInfo).major_id_all) {
            let res_bug_list = await HttpApi.getBugListAboutMe(JSON.parse(localUserInfo).major_id_all)///从数据库中获取最新的bugs数据
            if (res_bug_list.data.code === 0) {
                let bug_list = res_bug_list.data.data
                bug_list = bug_list.map((item) => { item.key = item.id; return item })
                // console.log('bug_list:', bug_list)
                originalData = bug_list;
                autoFixHandler(bug_list);
                setBugList(bug_list);
                ///这里要根据个人的专业、权限，和当前缺陷的状态、进行过滤，得到实际的当前用户待处理的缺陷数量
                let afterFilterByNeedHandler = checkActuallyNeedDoBugs(JSON.parse(localUserInfo), bug_list, hasP0, hasP1, hasP3)
                appDispatch({ type: 'aboutMeBugCount', data: afterFilterByNeedHandler.length })
            }
        }
        setCurrentTime(moment().toDate().getTime())
        // eslint-disable-next-line 
    }, [])
    ///自动维修处理
    const autoFixHandler = useCallback(async (list) => {
        let user_id = JSON.parse(localUserInfo).id;
        let user_major_id = JSON.parse(localUserInfo).major_id_all;
        ///有维修权限 且 有专业
        if (hasP3 && user_major_id && user_major_id.length > 0) {
            let needList = [];
            list.forEach(element => {
                if (user_major_id.indexOf(element.major_id) !== -1 && element.status === 0) {
                    needList.push(element.id);
                }
            });
            console.log('有维修权限,待自动维修的缺陷id有:', needList)
            // return;
            //应该用批量插入
            if (needList.length > 0) {
                let valuesStr = '';
                let time = moment().format('YYYY-MM-DD HH:mm:ss');
                needList.forEach(bug_id => {
                    valuesStr += `(${bug_id},10,${user_id},'${time}'),`
                });
                valuesStr = valuesStr.substring(0, valuesStr.length - 1);
                let sql_step = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,createdAt) VALUES ${valuesStr}`
                let res_step = await HttpApi.obs({ sql: sql_step });
                if (res_step.data.code === 0) {
                    let sql_update_bug = `update bugs set isread = 1,status = 1,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id in (${needList.join(',')}) `;
                    let res_update_bug = await HttpApi.obs({ sql: sql_update_bug });
                    if (res_update_bug.data.code === 0) {
                        message.success('默认自动开始维修');
                        init();
                    } else { message.error('自动添加维修记录操作失败') }
                } else { message.error('自动添加维修记录操作失败') }
                return
            }
        } else {
            console.log('没有同时拥有维修权限和专业')
        }
    }, [init, hasP3])
    const filterBySearch = useCallback((v) => {
        if (v === '0') { message.error('请输入详细信息'); return }
        let data = JSON.parse(JSON.stringify(originalData));
        data.forEach((item) => {
            if (item.area_remark && item.area_remark.indexOf(v) !== -1) {
                let coptAreaRemark = item.area_remark;
                let subStr = new RegExp(v);//创建正则表达式对象
                let afterReplace = coptAreaRemark.replace(subStr, `<span style='background-color:#FDFF05'>${v}</span>`);
                item.area_remark = afterReplace
                item.exist = true
            }
            if (item.content && JSON.parse(item.content).text && JSON.parse(item.content).text.indexOf(v) !== -1) {
                let coptItemContent = JSON.parse(item.content);
                let subStr = new RegExp(v);//创建正则表达式对象
                let afterReplace = coptItemContent.text.replace(subStr, `<span style='background-color:#FDFF05'>${v}</span>`);
                coptItemContent.text = afterReplace
                item.content = JSON.stringify(coptItemContent)
                item.exist = true
            }
            if (item.device_name && item.device_name.indexOf(v) !== -1) {
                let coptDeviceName = item.device_name;
                let subStr = new RegExp(v);//创建正则表达式对象
                let afterReplace = coptDeviceName.replace(subStr, `<span style='background-color:#FDFF05'>${v}</span>`);
                item.device_name = afterReplace
                item.exist = true
            }
        })
        let newResult = data.filter((item) => { return item.exist === true })
        setBugList(newResult)
    }, [])
    ///跳转来的缺陷，位置置顶
    const changeTargetItemTop = useCallback(() => {
        // console.log('跳转来的缺陷，位置置顶')
        // console.log('高亮id:', appState.heightLightBugId)
        // console.log('originalData:', originalData)
        if (appState.heightLightBugId && originalData.length > 0) {
            let targetItem = {};
            originalData.forEach((item) => {
                if (item.id === appState.heightLightBugId) { targetItem = item }
            })
            let filterList = originalData.filter((item) => { return item.id !== appState.heightLightBugId })
            let resList = [targetItem, ...filterList].map((item, index) => { item.key = index; return item });
            // console.log('resList:', resList)
            setBugList(resList)
        }
    }, [appState.heightLightBugId])

    useEffect(() => {
        initFilter();
        init();
    }, [initFilter, init])

    useEffect(() => {
        let loop_for_timestamp;
        if (loop_for_timestamp) { clearInterval(loop_for_timestamp) }
        loop_for_timestamp = setInterval(() => {
            setCurrentTime(moment().toDate().getTime())
        }, BUGLOOPTIME);////1秒循环一次 刷新计时
        let loop_for_buglist;
        if (loop_for_buglist) { clearInterval(loop_for_buglist) }
        loop_for_buglist = setInterval(() => {
            if (searchKey === '' && !appState.heightLightBugId) { init() }
        }, BUGDATAUPDATETIME);////5秒循环一次 获取数据
        return () => {
            clearInterval(loop_for_timestamp)
            clearInterval(loop_for_buglist)
        }
    }, [searchKey, appState.heightLightBugId, init])

    useEffect(() => {
        changeTargetItemTop();
    }, [changeTargetItemTop])

    const columns = [
        {
            key: 'id',
            dataIndex: 'id',
            title: '编号',
            align: 'center',
            width: 120,
            // render: (text, record) => {
            //     return <Tag color={record.is_red ? '#f5222d' : '#1890ff'}>{text}</Tag>
            // }
        },
        {
            key: 'checkedAt', dataIndex: 'checkedAt', title: '时间',
            width: 120,
            align: 'center',
            sorter: (a, b) => {
                return new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
            },
            render: (text, record) => { return <div>{text || '/'}</div> }
        },
        {
            key: 'device_name', dataIndex: 'device_name', title: '巡检点',
            width: 140,
            align: 'center',
            render: (text, record) => {
                let result = '/'
                let iconType = 'laptop'
                if (text && text !== '') { result = text }
                else { result = record.area_remark; iconType = 'environment' }
                return <div className='hideText lineClamp5'>
                    <Tooltip title={<div dangerouslySetInnerHTML={{ __html: result }} />}>
                        <Icon type={iconType} style={{ marginRight: 4 }} />
                        <div dangerouslySetInnerHTML={{ __html: result }} />
                    </Tooltip>
                </div>
            }
        },
        {
            key: 'user_name', dataIndex: 'user_name', title: '发现人',
            width: 120,
            align: 'center',
            filters: uploader_filter,
            onFilter: (value, record) => record.user_id === value,
        },
        {
            key: 'area_remark', dataIndex: 'area_remark', title: '巡检范围',
            width: 140,
            align: 'center',
            render: (text, record) => {
                let result = '/'
                let iconType = 'environment'
                if (text) { result = text }
                else { result = record.area_name }
                return <div className='hideText lineClamp5'>
                    <Tooltip title={<div dangerouslySetInnerHTML={{ __html: result }} />}>
                        <Icon type={iconType} style={{ marginRight: 4 }} />
                        <div dangerouslySetInnerHTML={{ __html: result }} />
                    </Tooltip>
                </div>
            }
        },
        {
            key: 'content',
            dataIndex: 'content',
            title: '内容',
            align: 'center',
            render: (text, record) => {
                let obj = JSON.parse(text);
                let contentobj = JSON.parse(record.content);
                let imgs_arr = JSON.parse(JSON.stringify(contentobj.imgs));
                let result_arr = [];
                imgs_arr.forEach((item, index) => {
                    result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
                })
                let comArr = [];
                result_arr.forEach((item, index) => {
                    comArr.push(
                        <img alt='' style={{ width: 50, height: 50, marginRight: 10 }} key={index} src={Testuri + 'get_jpg?uuid=' + item.uuid}
                            onClick={() => {
                                setImguuid(item.uuid)
                            }}
                        />
                    )
                });
                let result = ''
                if (comArr.length > 0) { result = comArr }
                return <div>
                    <div className='hideText lineClamp3' style={{ fontWeight: 900, minWidth: 120 }}>
                        <Tooltip title={<span>{record.title_name}{record.title_remark}</span>} placement='topLeft'>
                            <span>{record.title_name}</span>
                            <span style={{ color: '#41A8FF' }}>
                                {record.title_remark}
                            </span>
                        </Tooltip>
                    </div>
                    {record.title_name ? <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} /> : null}
                    <div className={record.title_name ? 'hideText lineClamp2' : 'hideText lineClamp5'}>
                        <Tooltip title={<div dangerouslySetInnerHTML={{ __html: obj.text }} />}>
                            <div dangerouslySetInnerHTML={{ __html: obj.text }} />
                        </Tooltip>
                    </div>
                    {imgs_arr && imgs_arr.length > 0 ? <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} /> : null}
                    <div>{result}</div>
                </div>
            }
        },
        {
            key: 'buglevel', dataIndex: 'buglevel', title: '等级',
            width: 80,
            align: 'center',
            filters: bug_level_filter,
            onFilter: (value, record) => record.buglevel === value,
            render: (text) => {
                let result = null;
                let resultCom = '/'
                let color = '#505659';
                if (text) {
                    if (text === 1) { result = '一级'; color = '#f50' }
                    else if (text === 2) { result = '二级'; color = '#FF9900' }
                    else if (text === 3) { result = '三级'; color = '#87d068' }
                    resultCom = <Tag color={color}>{result}</Tag>
                }
                return resultCom
            }
        },
        {
            key: 'major_id', dataIndex: 'major_id', title: '专业',
            width: 120,
            align: 'center',
            filters: major_filter,
            onFilter: (value, record) => record.major_id === value,
            render: (text, record) => {
                return <div dangerouslySetInnerHTML={{ __html: record.major_name }} />
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            filters: status_filter,
            align: 'center',
            width: 80,
            onFilter: (value, record) => record.status === value || record.status + '-' + record.bug_freeze_id === value,
            render: (text, record) => {
                let str = '';
                let color = record.status === 5 ? '#9254de' : 'blue'
                switch (text) {
                    case 0:
                        str = '待维修'
                        break;
                    case 1:
                        str = '维修中'
                        break;
                    case 2:
                        str = '专工验收中'
                        break;
                    case 3:
                        str = '运行验收中'
                        break;
                    case 4:
                        str = '完毕'
                        break;
                    case 5:
                        str = record.bug_freeze_des || '状态被删除'
                        break;
                    case 6:
                        str = '申请转专业中'
                        break;
                    case 7:
                        str = '申请挂起中'
                        break;
                    default:
                        break;
                }
                let result = checkOverTime(record, currentTime)
                let isOver = result.isOver;
                let durationTime = result.durationTime;
                let timeColor = isOver ? 'red' : 'green'
                return {
                    children: <div>
                        <Tag color={color}>{str}</Tag>
                        <br />
                        {record.last_status_time && record.status !== 5 ? <Tag style={{ marginTop: 8 }} color={timeColor}>{getDuration(durationTime, 1, true)}</Tag> : null}
                    </div>,
                    props: {
                        colSpan: 2,
                    }
                }
            }
        },
        {
            title: '用时',
            dataIndex: 'over',
            filters: originOverTime,
            align: 'center',
            width: 80,
            onFilter: (value, record) => {
                let isOver = checkOverTime(record, currentTime).isOver
                let overValue = isOver ? 0 : 1;
                return overValue === value
            },
            render: () => {
                return {
                    props: {
                        colSpan: 0,
                    }
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'actions',
            align: 'center',
            width: 100,
            render: (_, record) => {
                let majorHasFlag = JSON.parse(localUserInfo).major_id_all && JSON.parse(localUserInfo).major_id_all.split(',').indexOf(String(record.major_id)) !== -1
                let fixable = majorHasFlag && (record.status < 2 || record.status === 6 || record.status === 7);
                let engable = majorHasFlag && (record.status < 3 || record.status > 4);
                let runable = record.status === 3;
                return <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Button size="small" icon='unordered-list' type="default" onClick={() => { setStepLogVisible(true); setcurrentRecord(record); }}>记录</Button>
                    {hasP3 && fixable ?
                        <>
                            <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                            <Button size="small" type="primary" onClick={() => { setRepairVisible(true); setcurrentRecord(record); }}>维修处理</Button>
                        </> : null}
                    {hasP0 && engable ?
                        <>
                            <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                            <Button size="small" type="primary" onClick={() => { setEngineerVisible(true); setcurrentRecord(record); }}>专工处理</Button>
                        </> : null}
                    {hasP1 && runable ?
                        <>
                            <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                            <Button disabled={!runable} size="small" type="primary" onClick={() => { setRunnerVisible(true); setcurrentRecord(record); }}>运行处理</Button>
                        </> : null}
                </div>
            }
        }
    ]
    return <div style={styles.root}>
        <Alert message="以专业来划分是否相关; 维修权限人员打开该页面后, 那些待维修的缺陷自动改变为维修中状态" type="info" showIcon />
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ textAlign: 'right', width: '100%' }}>
                <Input.Search size="small" style={{ width: 340 }} allowClear placeholder="支持内容、巡检点和巡检范围的模糊查询"
                    onChange={(e) => { setSearchKey(e.target.value); if (e.target.value === '') { init() } }}
                    onPressEnter={(e) => { filterBySearch(e.target.value) }} onSearch={filterBySearch} enterButton />
            </div>
        </div>
        <Table
            size="small"
            style={{ marginTop: 10 }}
            rowClassName={(record, index) => { if (record.id === appState.heightLightBugId) { return 'row' } else { return '' } }}
            bordered
            dataSource={bugList}
            columns={columns}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100'],
                onChange: () => {
                    document.documentElement.scrollTop = document.body.scrollTop = 0;
                },
                onShowSizeChange: () => {
                    document.documentElement.scrollTop = document.body.scrollTop = 0;
                }
            }}
        />
        <Modal visible={imguuid !== null} destroyOnClose centered
            width={410} bodyStyle={{ textAlign: 'center', padding: 5, margin: 0 }} footer={null} onCancel={() => { setImguuid(null) }}>
            <img alt='' style={{ width: 400 }} src={Testuri + 'get_jpg?uuid=' + imguuid} />
        </Modal>
        {/* <ShowImgView showModal={showModal1} cancel={() => { setShowModal1(false) }} showLoading={showLoading} imguuid={imguuid} /> */}
        <StepLogView visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} record={currentRecord} />
        <FuncPanelForRepair visible={repairVisible} onOk={(v) => {
            switch (v.selectValue) {
                case 1:
                    exchangeBugMajorByRepair(v, currentRecord, init);
                    break;
                case 2:
                    freezeBugStepByRepair(v, currentRecord, init);
                    break;
                case 3:
                    fixCompleteByRepair(v, currentRecord, init);
                    break;
                case 4:
                    dontNeedfixByRepair(v, currentRecord, init);
                    break;
                default:
                    break;
            }
            setRepairVisible(false)
        }} onCancel={() => { setRepairVisible(false) }} />
        <FuncPanelForEngineer visible={engineerVisible} record={currentRecord} onOk={(v) => {
            switch (v.selectValue) {
                case 1:
                    exchangeBugMajorByEngineer(v, currentRecord, init);
                    break;
                case 2:
                    freezeBugStepByEngineer(v, currentRecord, init);
                    break;
                case 3:
                    goBackStartByEngineer(v, currentRecord, init);
                    break;
                case 4:
                    completeByEngineer(v, currentRecord, init);
                    break;
                case 5:
                    goBackFixByEngineer(v, currentRecord, init);
                    break;
                case 6:
                    passByEngineer(v, currentRecord, init);
                    break;
                default:
                    break;
            }
            setEngineerVisible(false)
        }} onCancel={() => { setEngineerVisible(false) }} />
        <FuncPanelForRunner visible={runnerVisible} onOk={(v) => {
            switch (v.selectValue) {
                case 1:
                    completeByRunner(v, currentRecord, init);
                    break;
                case 2:
                    goBackEngineerByRunner(v, currentRecord, init);
                    break;
                default:
                    break;
            }
            setRunnerVisible(false)
        }} onCancel={() => { setRunnerVisible(false) }} />
    </div>
}
const styles = {
    root: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        padding: 10,
    }
}
function checkActuallyNeedDoBugs(userinfoObj, bugList, hasP0, hasP1, hasP3) {
    bugList.forEach((bug) => {
        bug.majorMatch = false
        bug.needHandler = false
        if (userinfoObj.major_id_all.split(',').indexOf(String(bug.major_id)) !== -1) {
            bug.majorMatch = true;///缺陷的专业与当前用户的专业匹配
            let fixable = (bug.status < 2 || bug.status === 6 || bug.status === 7);///可维修
            let engable = (bug.status < 3 || bug.status > 4);///可专工
            let runable = bug.status === 3;///可运行
            if (hasP3 && fixable) {
                bug.needHandler = true;
            }
            if (hasP0 && engable) {
                bug.needHandler = true;
            }
            if (hasP1 && runable) {
                bug.needHandler = true;
            }
        }
    })
    let afterFilterByneedHandler = bugList.filter((bug) => bug.needHandler === true)
    return afterFilterByneedHandler;
}