import React, { useState, useEffect, useCallback, useContext } from 'react';
import { originStatus, BUGLOOPTIME, BUGDATAUPDATETIME, originOverTime } from '../../util/AppData'
import moment from 'moment'
import HttpApi, { Testuri } from '../../util/HttpApi';
import { Table, Tag, Button, message, Tooltip, Input, Icon, Modal } from 'antd'
import { getDuration, checkOverTime } from '../../util/Tool';
import { completeByRunner, goBackEngineerByRunner } from '../../util/OpreationTool';
import StepLogView from '../bugMode/new/StepLogView';
import FuncPanelForRunner from '../bugMode/new/FuncPanelForRunner';
import { AppDataContext } from '../../../redux/AppRedux';


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
    const [runnerVisible, setRunnerVisible] = useState(false);///展示运行界面
    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面
    const [currentTime, setCurrentTime] = useState(null);///当前时刻
    const [hasP1] = useState(JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('1') !== -1);///运行权限

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
        let res1 = await HttpApi.getBugsList({ status_condtion: '= 3' })
        let res2 = await HttpApi.getFreezeStatusList()
        if (res1.data.code === 0 && res2.data.code === 0) {
            let bug_list = res1.data.data
            let bug_freeze_list = res2.data.data
            bug_list.forEach((bugItem) => {
                bug_freeze_list.forEach((freezeItem) => {
                    if (bugItem.id === freezeItem.bug_id) {
                        bugItem.bug_freeze_id = freezeItem.freeze_id
                        bugItem.bug_freeze_des = freezeItem.freeze_des
                        bugItem.bug_step_major_id = freezeItem.major_id
                        bugItem.bug_step_tag_id = freezeItem.tag_id
                    }
                })
            })
            bug_list = bug_list.map((item) => { item.key = item.id; return item })
            // console.log('run_bug_list:', bug_list)
            originalData = bug_list;
            setBugList(bug_list);
            appDispatch({ type: 'runBugCount', data: bug_list.length })
        }
        setCurrentTime(moment().toDate().getTime())
        // eslint-disable-next-line 
    }, [])

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
                let runable = record.status === 3;
                return <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Button icon='unordered-list' size="small" type="default" onClick={() => { setStepLogVisible(true); setcurrentRecord(record); }}>记录</Button>
                    {hasP1 ?
                        <>
                            <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                            <Button disabled={!runable} size="small" type="primary" onClick={() => { setRunnerVisible(true); setcurrentRecord(record); }}>运行处理</Button>
                        </> : null}
                </div>
            }
        }
    ]
    return <div style={styles.root}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
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
        <StepLogView visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} record={currentRecord} />
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