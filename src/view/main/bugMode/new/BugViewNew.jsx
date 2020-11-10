import React, { useState, useEffect, useCallback } from 'react';
import { originStatus, BUGLOOPTIME, BUGDATAUPDATETIME, originOverTime } from '../../../util/AppData'
import moment from 'moment'
import HttpApi, { Testuri } from '../../../util/HttpApi';
import { Table, Tag, Button, message, Tooltip, Input, Icon, Modal, Popconfirm } from 'antd'
import { getDuration, checkOverTime, removeOneBugIdFromList } from '../../../util/Tool';
import { changeRecordData } from '../../../util/OpreationTool';
import StepLogView from '../../bugMode/new/StepLogView';
import AddBugView from '../AddBugView';
import ExportBugView from '../ExportBugView';

const storage = window.localStorage;
const localUserInfo = storage.getItem('userinfo');
var major_filter = [];///用于筛选任务专业的数据 选项
var status_filter = [];///用于筛选状态的数据
var bug_level_filter = [];///用于筛选缺陷等级 一二三级 选项
var uploader_filter = [];///用于筛选上传者的数据 选项
var originalData = [];

export default props => {
    const [searchKey, setSearchKey] = useState('');///搜索关键字
    const [bugList, setBugList] = useState([]);///数据
    const [imguuid, setImguuid] = useState(null);///图片的uuid
    const [currentRecord, setcurrentRecord] = useState({});///当前选择的某一行。某一个缺陷对象
    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面
    const [currentTime, setCurrentTime] = useState(null);///当前时刻
    const [isAdmin] = useState(JSON.parse(localUserInfo) && JSON.parse(localUserInfo).isadmin === 1)
    const [addBugVisible, setAddBugVisible] = useState(false)
    const [exportBugVisible, setExportBugVisible] = useState(false)

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
        let sql_get_bug = `select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,
            area_1.name as area1_name,area_1.id as area1_id,
            area_2.name as area2_name,area_2.id as area3_id,
            area_3.name as area3_name,area_3.id as area3_id,
            concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
           	tmp_freeze_table.freeze_id as bug_freeze_id,
            tmp_freeze_table.freeze_des as bug_freeze_des,
            tmp_freeze_table.major_id as bug_step_major_id,
            tmp_freeze_table.tag_id as bug_step_tag_id,
            bsd.duration_time as bsd_duration_time,
            bld.duration_time as bld_duration_time
            from bugs
            left join (select * from bug_level_duration where effective = 1) bld on bld.level_value = bugs.buglevel
            left join (select * from bug_status_duration where effective = 1) bsd on bsd.status = bugs.status
            left join (select * from devices where effective = 1) des on bugs.device_id = des.id
            left join (select * from users where effective = 1) urs on bugs.user_id = urs.id
            left join (select * from majors where effective = 1) mjs on bugs.major_id = mjs.id
            left join (select * from area_3 where effective = 1) area_3 on des.area_id = area_3.id
            left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
            left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
            left join (select t2.*,bug_tag_status.des as tag_des,bug_freeze_status.des as freeze_des 
           				from (select bug_id,max(id) as max_id from bug_step_log where effective = 1 group by bug_id) t1
						left join (select * from bug_step_log where effective = 1) t2 on t2.id = t1.max_id
						left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = t2.tag_id
						left join (select * from bug_freeze_status where effective = 1) bug_freeze_status on bug_freeze_status.id = t2.freeze_id
						) tmp_freeze_table on tmp_freeze_table.bug_id = bugs.id
            where bugs.status != 4 and bugs.effective = 1 order by bugs.id desc`
        let res_bug_list = await HttpApi.obs({ sql: sql_get_bug });///从数据库中获取最新的bugs数据
        if (res_bug_list.data.code === 0) {
            let bug_list = res_bug_list.data.data
            bug_list = bug_list.map((item) => { item.key = item.id; return item })
            // console.log('bug_list:', bug_list)
            originalData = bug_list;
            setBugList(bug_list);
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
    const deleteBugsHandler = useCallback(async (record) => {
        let res = await HttpApi.obs({ sql: `update bugs set effective = 0 where id = ${record.id} ` })
        if (res.data.code === 0) {
            message.success('移除缺陷成功');
            init();
            changeRecordData(record.id, true);
        }
    }, [init])

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
            if (searchKey === '') { init() }
        }, BUGDATAUPDATETIME);////5秒循环一次 获取数据
        return () => {
            clearInterval(loop_for_timestamp)
            clearInterval(loop_for_buglist)
        }
    }, [searchKey, init])

    const columns = [
        {
            key: 'id',
            dataIndex: 'id',
            title: '编号',
            align: 'center',
            width: 120,
            render: (text, record) => {
                return <div>{text}</div>
            }
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
                return <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Button size="small" type="default" onClick={() => { setStepLogVisible(true); setcurrentRecord(record); }}>处理记录</Button>
                    {isAdmin ?
                        <>
                            <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                            <Popconfirm title="确定要删除该缺陷吗?" onConfirm={() => { deleteBugsHandler(record); removeOneBugIdFromList(record.id) }}>
                                <Button size="small" type="danger">删除</Button>
                            </Popconfirm>
                        </> : null}
                </div>
            }
        }
    ]
    return <div style={styles.root}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <Button size="small" type="primary" icon='plus' onClick={() => { setAddBugVisible(true) }}>添加缺陷</Button>
            <Button size="small" icon='download' style={{ marginLeft: 14 }} onClick={() => { setExportBugVisible(true) }}>导出文件</Button>
            <div style={{ textAlign: 'right', width: '100%' }}>
                <Input.Search size="small" style={{ width: 340 }} allowClear placeholder="支持内容、巡检点和巡检范围的模糊查询"
                    onChange={(e) => { setSearchKey(e.target.value); if (e.target.value === '') { init() } }}
                    onPressEnter={(e) => { filterBySearch(e.target.value) }} onSearch={filterBySearch} enterButton />
            </div>
        </div>
        <Table
            size="small"
            style={{ marginTop: 10 }}
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
        <AddBugView
            showModal={addBugVisible}
            ok={() => { init(); setAddBugVisible(false) }}
            cancel={() => { setAddBugVisible(false) }} />
        <ExportBugView
            showModal={exportBugVisible}
            cancel={() => { setExportBugVisible(false) }} />
    </div>
}
const styles = {
    root: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        padding: 10,
    }
}