import React, { Component, Fragment } from 'react';
import { Table, Tag, Button, message, Popconfirm, Tooltip, Alert, Modal, Input } from 'antd'
import HttpApi, { Testuri } from '../../../util/HttpApi'
import moment from 'moment'
import Store from '../../../../redux/store/Store';
import { showBugNum } from '../../../../redux/actions/BugAction';
import AddBugView from '../AddBugView';
import ExportBugView from '../ExportBugView';
import '../BugViewCss.css'
import FuncPanelForRepair from './FuncPanelForRepair';
import StepLogView from './StepLogView';
import FuncPanelForEngineer from './FuncPanelForEngineer';
import FuncPanelForRunner from './FuncPanelForRunner';
import { originStatus } from '../../../util/AppData'
import ShowImgView from '../ShowImgView';

var major_filter = [];///用于筛选任务专业的数据 选项
var bug_type_filter = [];///用于筛选类别的数据 选项
var status_filter = [];///用于筛选状态的数据
const bug_level_filter = [];
var uploader_filter = [];///用于筛选上传者的数据 选项

var storage = window.localStorage;
var localUserInfo = '';

export default class BugViewNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showModal1: false,///img显示框
            showLoading: true,///现实loading图片
            preImguuid: null,///上一次加载的图片的uuid
            imguuid: null,
            userData: [],
            currentRecord: {},///当前选择的某一行。某一个缺陷对象

            repairVisible: false,
            engineerVisible: false,
            runnerVisible: false,
            stepLogVisible: false,
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }

    init = async () => {
        status_filter.length = 0;
        major_filter.length = 0;
        uploader_filter.length = 0;
        bug_type_filter.length = 0;
        bug_level_filter.length = 0;
        let bugFreezeData = await this.getBugFreezeData();
        status_filter = [...originStatus, ...bugFreezeData.map((item) => { return { text: item.des, value: 5 + '-' + item.id, freeze_value: item.id } })]
        // console.log('status_filter:', status_filter)
        let bugTypeData = await this.getBugTypeInfo();
        bugTypeData.forEach((item) => {
            bug_type_filter.push({ text: item.name, value: item.id });
        })
        let bugLevelData = await this.getBugLevelInfo();
        bugLevelData.forEach((item) => {
            bug_level_filter.push({ text: item.name, value: item.id });
        })
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => {
            major_filter.push({ text: item.name, value: item.id });
        })
        let uploaderData = await this.getUploaderInfo();
        uploader_filter = uploaderData.map((item) => { return { text: item.user_name, value: item.user_id } })
        let finallyData = await this.getBugsInfo();///从数据库中获取最新的bugs数据
        finallyData.forEach((item) => { item.key = item.id + '' })
        let userData = await this.getUsersInfo();
        // console.log('finallyData:', finallyData);
        this.setState({
            data: finallyData,
            userData,
        })
    }
    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select users.*,users.name as title,levels.name level_name,  CONCAT(users.level_id,'-',users.id) 'key',CONCAT(users.level_id,'-',users.id) 'value' from users
            left join (select * from levels where effective = 1)levels
            on users.level_id = levels.id
            where users.effective = 1
            order by users.level_id`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    /**
     * 查询上传者 去重
     * 未完成的缺陷
     */
    getUploaderInfo = () => {
        let sql = `select distinct(users.name) as user_name,bugs.user_id from bugs
        left join (select * from users where effective = 1) users
        on users.id = bugs.user_id
        where bugs.effective = 1 and bugs.status !=4`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getBugFreezeData = () => {
        let sql = `select * from bug_freeze_status  where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getBugTypeInfo = () => {
        let sql = `select * from bug_types  where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getBugLevelInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getBugLevel({ effective: 1 }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getMajorInfo = () => {
        let sql = `select m.id,m.name from majors m where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getOneBugInfo = (bug_id, isDelete) => {
        let sql = `select bugs.* from bugs where id = ${bug_id} and effective = ${isDelete ? 0 : 1}`;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = null;
                if (res.data.code === 0) {
                    result = res.data.data[0]
                }
                resolve(result);
            })
        })
    }
    getBugsInfo = (sql = null) => {
        if (!sql) {
            sql = `select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,
            area_1.name as area1_name,area_1.id as area1_id,
            area_2.name as area2_name,area_2.id as area3_id,
            area_3.name as area3_name,area_3.id as area3_id,
            concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
           	tmp_freeze_table.freeze_id as bug_freeze_id,
           	tmp_freeze_table.freeze_des as bug_freeze_des
            from bugs
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
        }
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getOneRecordInfo = (device_id) => {
        let sql1 = ' select * from records rds where effective = 1 and device_id = ' + device_id + ' order by rds.id desc limit 1';
        let sqlText = sql1;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = null;
                if (res.data.code === 0) {
                    result = res.data.data[0]
                }
                resolve(result);
            })
        })
    }
    ////改变包含了这个bug_id 的record 再数据库中的值。 isDelete 是否为 删除缺陷的操作
    changeRecordData = async (bugId, isDelete = false) => {
        // let bugId = this.state.currentRecord.id;
        ///1，要根据bug_id 去bugs表中去查询该条数据，获取其中的 device_id 字段信息
        let oneBugInfo = await this.getOneBugInfo(bugId, isDelete);
        let device_id = oneBugInfo.device_id;
        // return;
        if (!device_id) { return }
        ///2，根据 device_id 去record 表中 找到 这个巡检点最新的一次record。 获取到后，在本地修改。再最为一条新数据插入到records表中
        let oneRecordInfo = await this.getOneRecordInfo(device_id);
        let bug_content = JSON.parse(oneRecordInfo.content);
        ///content 数组。找到其中bug_id 不为null的。把bug_id 和 bugId 相同的给至null,再手动判断是不是bug_id字段都是null了。如果是device_status就要至1（正常）
        let bug_id_count = 0;
        ///先知道 有多少个 bug_id 不为null
        bug_content.forEach((oneSelect) => {
            if (oneSelect.bug_id !== null) {
                bug_id_count++;
            }
        })
        // console.log('1 这个巡检点还有几个bug:', bug_id_count);
        if (bug_id_count > 0) {
            ///如果找到对应的bug_id。将它至null,说明这个缺陷已经解决了。就不要再出现在record中了。同时bug_id_count减1
            bug_content.forEach((oneSelect) => {
                if (oneSelect.bug_id === bugId) {
                    oneSelect.bug_id = null;
                    bug_id_count--;
                }
            })
            // console.log('处理完一个bug后的content为:', bug_content);
            oneRecordInfo.content = JSON.stringify(bug_content);
            if (bug_id_count === 0) {
                oneRecordInfo.device_status = 1;
            }
        }
        oneRecordInfo.user_id = JSON.parse(localUserInfo).id;///更新record的上传人。
        delete oneRecordInfo.id;
        delete oneRecordInfo.createdAt;
        delete oneRecordInfo.updatedAt;
        // console.log('待入库的最新record:', oneRecordInfo);
        HttpApi.insertRecordInfo(oneRecordInfo, (res) => {
            if (res.data.code === 0) {
                // console.log('所有 入库成功。');
                if (oneRecordInfo.device_status === 1) {
                    ///手动更新数据库中，对应巡检点的状态
                    HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 1 } }, (res) => {
                        if (res.data.code === 0) { message.success('对应巡检点最新巡检记录更新-巡检点状态恢复正常'); }
                    })
                } else {
                    HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 2 } }, (res) => {
                        if (res.data.code === 0) { message.info('对应巡检点最新巡检记录更新'); } ///这么做的目的是只要有record上传，就要更新对应巡检点的updateAt
                    })
                }
            }
        })
    }

    deleteBugsHandler = (record) => {
        HttpApi.obs({ sql: `update bugs set effective = 0 where id = ${record.id} ` }, (res) => {
            if (res.data.code === 0) {
                message.success('移除缺陷成功');
                this.init();
                ///要利用redux刷新 mainView处的徽标数
                this.updateDataByRedux();
                ///再创建一个新的record记录插入records表
                this.changeRecordData(record.id, true);
            }
        })
    }
    updateDataByRedux = () => {
        ///每次删除
        Store.dispatch(showBugNum(null)) ///随便派发一个值，目的是让 mainView处监听到 执行init();
    }
    render() {
        const columns = [
            {
                key: 'id',
                dataIndex: 'id',
                title: '编号',
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                key: 'checkedAt', dataIndex: 'checkedAt', title: '时间',
                width: 120,
                sorter: (a, b) => {
                    return new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
                },
                render: (text, record) => { return <div>{text || '/'}</div> }
            },
            {
                key: 'device_name', dataIndex: 'device_name', title: '巡检点',
                render: (text, record) => {
                    let result = '/'
                    if (text && text !== '') { result = text }
                    else { result = record.area_remark }
                    return <div className='hideText lineClamp5'>
                        <Tooltip title={result}>
                            <span>{result}</span>
                        </Tooltip>
                    </div>
                }
            },
            {
                key: 'user_name', dataIndex: 'user_name', title: '发现人',
                width: 100,
                filters: uploader_filter,
                onFilter: (value, record) => record.user_id === value,
            },
            {
                key: 'area_remark', dataIndex: 'area_remark', title: '具体巡检点范围',
                render: (text, record) => {
                    let result = '/'
                    if (text) { result = text }
                    else { result = record.area_name }
                    return <div>{result}</div>
                }
            },
            {
                key: 'content',
                dataIndex: 'content',
                title: '内容',
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
                            // <span key={item.uuid} style={{ color: 'red', fontWeight: 500, marginRight: 10, cursor: "pointer" }}
                            //     onClick={e => {
                            //         if (this.state.preImguuid !== item.uuid) {
                            //             this.setState({
                            //                 showLoading: true,
                            //             })
                            //         } else {
                            //             this.setState({
                            //                 showLoading: false,
                            //             })
                            //         }
                            //         this.setState({
                            //             imguuid: item.uuid,
                            //             showModal1: true,
                            //             preImguuid: item.uuid,
                            //         })
                            //     }}>{item.name}</span>
                            <img alt='' style={{ width: 50, height: 50, marginRight: 10 }} key={index} src={Testuri + 'get_jpg?uuid=' + item.uuid}
                                onClick={() => {
                                    this.setState({ imguuid: item.uuid })
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
                        <div className='hideText lineClamp2'>
                            <Tooltip title={obj.text}>
                                <span>{obj.text}</span>
                            </Tooltip>
                        </div>
                        {imgs_arr && imgs_arr.length > 0 ? <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} /> : null}
                        <div>{result}</div>
                    </div>
                }
            },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '缺陷类型',
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
                key: 'major_name', dataIndex: 'major_name', title: '缺陷专业',
                filters: major_filter,
                onFilter: (value, record) => record.major_id === value,
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                title: '缺陷状态',
                dataIndex: 'status',
                filters: status_filter,
                align: 'center',
                onFilter: (value, record) => record.status === value || record.status + '-' + record.bug_freeze_id === value,
                render: (text, record) => {
                    let str = '';
                    let color = '#888888'
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
                    return <Tag color={color}>{str}</Tag>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button size="small" type="default" onClick={() => { this.setState({ stepLogVisible: true, currentRecord: record }) }}>日志</Button>
                        {JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('3') !== -1 ?
                            <>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button disabled={
                                    (!JSON.parse(localUserInfo).major_id || JSON.parse(localUserInfo).major_id.indexOf(record.major_id) === -1) || !(record.status < 2 || record.status === 6 || record.status === 7)
                                } size="small" type="primary" onClick={() => { this.repairHandler(record) }}>维修处理</Button>
                            </> : null}
                        {JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('0') !== -1 ?
                            <>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button disabled={
                                    (!JSON.parse(localUserInfo).major_id || JSON.parse(localUserInfo).major_id.indexOf(record.major_id) === -1) || !(record.status < 3 || record.status > 4)
                                } size="small" type="primary" onClick={() => { this.engineerHandler(record) }}>专工处理</Button>
                            </> : null}
                        {JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('1') !== -1 ?
                            <>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button disabled={record.status !== 3} size="small" type="primary" onClick={() => { this.runnerHandler(record) }}>运行处理</Button>
                            </> : null}
                        {JSON.parse(localUserInfo).isadmin === 1 ?
                            <>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Popconfirm title="确定要删除该缺陷吗?" onConfirm={() => { this.deleteBugsHandler(record); }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm> </> : null
                        }
                    </div>
                )
            }
        ]
        return (
            < Fragment >
                <Alert message="当个人专业与缺陷专业匹配且当前进度符合流程顺序, 权限操作按钮才可正常使用; 可点击日志按钮查看每个缺陷的处理流程记录" type="info" showIcon />
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <Button type={'primary'} onClick={() => { this.setState({ showModal7: true }) }}>添加缺陷</Button>
                    <div style={{ textAlign: 'right' }}>
                        <Input.Search style={{ width: 340 }} allowClear placeholder="支持内容、巡检点和巡检范围的模糊查询"
                            onChange={(e) => { if (e.target.value === '') { this.init(); } }}
                            onPressEnter={(e) => { this.filterBySearch(e.target.value) }} onSearch={this.filterBySearch} enterButton />
                        {/* <Button style={{ marginLeft: 10 }} type={'primary'} onClick={() => { this.setState({ showModal8: true }) }}>导出缺陷</Button> */}
                    </div>
                </div>
                <Table
                    style={{ marginTop: 10 }}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <AddBugView
                    showModal={this.state.showModal7}
                    ok={() => { this.init(); this.setState({ showModal7: false }) }}
                    cancel={() => { this.setState({ showModal7: false }) }} />
                <ExportBugView
                    showModal={this.state.showModal8}
                    cancel={() => { this.setState({ showModal8: false }) }} />
                <ShowImgView showModal={this.state.showModal1} cancel={() => { this.setState({ showModal1: false }) }} showLoading={this.state.showLoading} imguuid={this.state.imguuid} />
                <StepLogView visible={this.state.stepLogVisible} onCancel={() => { this.setState({ stepLogVisible: false }) }} record={this.state.currentRecord} />
                <FuncPanelForRepair visible={this.state.repairVisible} onOk={(v) => {
                    switch (v.selectValue) {
                        case 1:
                            this.exchangeBugMajorByRepair(v);
                            break;
                        case 2:
                            this.freezeBugStepByRepair(v);
                            break;
                        case 3:
                            this.fixCompleteByRepair(v);
                            break;
                        case 4:
                            this.dontNeedfixByRepair(v);
                            break;
                        default:
                            break;
                    }
                    this.setState({ repairVisible: false })
                }} onCancel={() => { this.setState({ repairVisible: false }) }} />
                <FuncPanelForEngineer visible={this.state.engineerVisible} record={this.state.currentRecord} onOk={(v) => {
                    switch (v.selectValue) {
                        case 1:
                            this.exchangeBugMajorByEngineer(v);
                            break;
                        case 2:
                            this.freezeBugStepByEngineer(v);
                            break;
                        case 3:
                            this.goBackStartByEngineer(v);
                            break;
                        case 4:
                            this.completeByEngineer(v);
                            break;
                        case 5:
                            this.goBackFixByEngineer(v);
                            break;
                        case 6:
                            this.passByEngineer(v);
                            break;
                        default:
                            break;
                    }
                    this.setState({ engineerVisible: false })
                }} onCancel={() => { this.setState({ engineerVisible: false }) }} />
                <FuncPanelForRunner visible={this.state.runnerVisible} onOk={(v) => {
                    switch (v.selectValue) {
                        case 1:
                            this.completeByRunner(v);
                            break;
                        case 2:
                            this.goBackEngineerByRunner(v);
                            break;
                        default:
                            break;
                    }
                    this.setState({ runnerVisible: false })
                }} onCancel={() => { this.setState({ runnerVisible: false }) }} />
                <Modal visible={this.state.imguuid !== null} destroyOnClose centered
                    width={410} bodyStyle={{ textAlign: 'center', padding: 5, margin: 0 }} footer={null} onCancel={() => {
                        this.setState({ imguuid: null })
                    }}>
                    <img alt='' style={{ width: 400 }} src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} />
                    {/* <img alt='' style={{ width: 400 }} src={'http://ixiaomu.cn:3008/get_jpg?uuid=' + this.state.imguuid} /> */}
                </Modal>
            </Fragment >
        );
    }
    filterBySearch = (v) => {
        let data = JSON.parse(JSON.stringify(this.state.data));
        data.forEach((item) => {
            if (item.area_remark && item.area_remark.indexOf(v) !== -1) { item.exist = true }
            if (item.content && JSON.parse(item.content).text && JSON.parse(item.content).text.indexOf(v) !== -1) { item.exist = true }
            if (item.device_name && item.device_name.indexOf(v) !== -1) { item.exist = true }
        })
        let newResult = data.filter((item) => {
            return item.exist === true
        })
        this.setState({ data: newResult })
    }
    repairHandler = (record) => {
        this.setState({ repairVisible: true, currentRecord: record })
    }
    engineerHandler = (record) => {
        this.setState({ engineerVisible: true, currentRecord: record })
    }
    runnerHandler = (record) => {
        this.setState({ runnerVisible: true, currentRecord: record })
    }
    ////////////////////// 维修人员处理
    exchangeBugMajorByRepair = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let major_id = v.selectMajorId;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,major_id,user_id,remark,createdAt) VALUES (${bug_id},1,${major_id},${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 6 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('申请转专业成功'); this.init(); } else { message.error('申请转专业失败') }
                })
            } else { message.error('申请转专业失败') }
        })
    }
    freezeBugStepByRepair = (v) => {
        let remark = v.remarkText;
        let freeze_id = v.selectFreezeId;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (freeze_id,bug_id,tag_id,user_id,remark,createdAt) VALUES (${freeze_id},${bug_id},2,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 7 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('申请挂起成功'); this.init(); } else { message.error('申请挂起失败') }
                })
            } else { message.error('申请挂起失败') }
        })
    }
    fixCompleteByRepair = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},4,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 2 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('完成维修'); this.init(); } else { message.error('维修失败') }
                })
            } else { message.error('操作失败') }
        })
    }
    dontNeedfixByRepair = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},16,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 2 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('维修人员认为无需维修'); this.init(); } else { message.error('维修人员认为无需维修操作失败') }
                })
            } else { message.error('维修人员认为无需维修操作失败') }
        })
    }
    ////////////////////// 专工处理
    exchangeBugMajorByEngineer = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let major_id = v.selectMajorId;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,major_id,user_id,remark,createdAt) VALUES (${bug_id},3,${major_id},${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            let sql = `update bugs set major_id = ${major_id},status = 0 where id = ${bug_id}`;
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { message.success('转专业成功'); this.init(); } else { message.error('转专业失败') }
            })
        })
    }
    freezeBugStepByEngineer = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let freeze_id = v.selectFreezeId;
        let sql = `INSERT INTO bug_step_log (freeze_id,bug_id,tag_id,user_id,remark,createdAt) VALUES (${freeze_id},${bug_id},15,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 5 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('挂起成功'); this.init(); } else { message.error('挂起失败') }
                })
            } else { message.error('挂起失败') }
        })
    }
    goBackStartByEngineer = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},9,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 0 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('恢复维修流程成功'); this.init(); } else { message.error('恢复维修流程失败') }
                })
            } else { message.error('恢复维修流程失败') }
        })
    }
    completeByEngineer = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},5,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 3 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('专工完成验收'); this.init(); } else { message.error('专工验收操作失败') }
                })
            } else { message.error('专工验收操作失败') }
        })
    }
    goBackFixByEngineer = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},7,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 1 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('专工打回操作成功'); this.init(); } else { message.error('专工打回操作失败') }
                })
            } else { message.error('专工打回操作失败') }
        })
    }
    passByEngineer = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},17,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 3 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('专工确认无需维修'); this.init(); } else { message.error('专工确认无需维修操作失败') }
                })
            } else { message.error('专工确认无需维修操作失败') }
        })
    }
    /////////////// 运行处理
    completeByRunner = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},6,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 4 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('运行验收操作成功'); this.init(); this.changeRecordData(bug_id); } else { message.error('运行验收操作失败') }
                })
            } else { message.error('运行验收操作失败') }
        })
    }
    goBackEngineerByRunner = (v) => {
        let remark = v.remarkText;
        let bug_id = this.state.currentRecord.id;
        let user_id = JSON.parse(localUserInfo).id;
        let sql = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt) VALUES (${bug_id},8,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update bugs set status = 2 where id = ${bug_id}`;
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) { message.success('运行打回操作成功'); this.init(); } else { message.error('运行打回操作失败') }
                })
            } else { message.error('运行打回操作失败') }
        })
    }
}