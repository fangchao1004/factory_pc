import React, { Component, Fragment } from 'react';
import { Table, Tag, Button, message, Popconfirm, Tooltip } from 'antd'
import HttpApi from '../../../util/HttpApi'
import Store from '../../../../redux/store/Store';
import { showBugNum } from '../../../../redux/actions/BugAction';
import StepLogView from '../../bugMode/new/StepLogView';
import ShowImgView from '../../bugMode/ShowImgView';

var major_filter = [];///用于筛选任务专业的数据 选项
var bug_type_filter = [];///用于筛选类别的数据 选项
const bug_level_filter = [];
var uploader_filter = [];///用于筛选上传者的数据 选项

var storage = window.localStorage;
var localUserInfo = '';

export default class BugAboutMeCompletedViewNew extends Component {
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
        localUserInfo = storage.getItem('userinfo');
        this.init();
    }

    init = async () => {
        major_filter.length = 0;
        uploader_filter.length = 0;
        bug_type_filter.length = 0;
        bug_level_filter.length = 0;
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
        this.setState({
            data: finallyData,
            userData,
        })
    }

    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select users.*, users.name as title, levels.name level_name, CONCAT(users.level_id, '-', users.id) 'key', CONCAT(users.level_id, '-', users.id) 'value' from users
                left join(select * from levels where effective = 1)levels
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
        let sql = `select distinct(users.name) as user_name, bugs.user_id from bugs
                left join(select * from users where effective = 1) users
                on users.id = bugs.user_id
                where bugs.effective = 1 and bugs.status != 4`
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
        let sql = `select m.id, m.name from majors m where effective = 1`
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
        let sql = `select bugs.* from bugs where id = ${bug_id} and effective = ${isDelete ? 0 : 1} `;
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
            sql = `select bugs.*, des.name as device_name, urs.name as user_name, mjs.name as major_name,
                    area_1.name as area1_name, area_1.id as area1_id,
                    area_2.name as area2_name, area_2.id as area3_id,
                    area_3.name as area3_name, area_3.id as area3_id,
                    concat_ws('/', area_1.name, area_2.name, area_3.name) as area_name
                from bugs
                left join(select * from devices where effective = 1) des on bugs.device_id = des.id
                left join(select * from users where effective = 1) urs on bugs.user_id = urs.id
                left join(select * from majors where effective = 1) mjs on bugs.major_id = mjs.id
                left join(select * from area_3 where effective = 1) area_3 on des.area_id = area_3.id
                left join(select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
                left join(select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
                where bugs.status = 4 and bugs.major_id in (${ JSON.parse(localUserInfo).major_id}) and bugs.effective = 1 order by bugs.id desc`
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
        let sql1 = ' select * from records rds where device_id = ' + device_id + ' order by rds.id desc limit 1';
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

    ///根据userid 查找 username
    getLocalUserName = (userId) => {
        let name = '';
        if (this.state.userData && this.state.userData.length > 0) { this.state.userData.forEach((item) => { if (item.id === userId) { name = item.name } }) }
        return name;
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
        // console.log('这个巡检点还有几个bug:', bug_id_count);
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
        // oneRecordInfo.user_id = JSON.parse(localUserInfo).id;///更新record的上传人。
        delete oneRecordInfo.id;
        delete oneRecordInfo.createdAt;
        delete oneRecordInfo.updatedAt;
        // console.log('待入库的最新record:', oneRecordInfo);
        HttpApi.insertRecordInfo(oneRecordInfo, (res) => {
            if (res.data.code === 0) {
                // console.log('入库成功。');
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
                        comArr.push(<span key={item.uuid} style={{ color: '#438ef7', fontWeight: 500, marginRight: 10, cursor: "pointer" }}
                            onClick={e => {
                                if (this.state.preImguuid !== item.uuid) {
                                    this.setState({
                                        showLoading: true,
                                    })
                                } else {
                                    this.setState({
                                        showLoading: false,
                                    })
                                }
                                this.setState({
                                    imguuid: item.uuid,
                                    showModal1: true,
                                    preImguuid: item.uuid,
                                })
                            }}>{item.name}</span>)
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
                key: 'major_id', dataIndex: 'major_id', title: '缺陷专业',
                filters: major_filter,
                onFilter: (value, record) => record.major_id === value,
                render: (text, record) => {
                    return <div>{record.major_name}</div>
                }
            },
            {
                title: '缺陷状态',
                dataIndex: 'status',
                align: 'center',
                render: (text, record) => {
                    let str = '完毕';
                    let color = '#888888'
                    return <Tag color={color}>{str}</Tag>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button size="small" type="default" onClick={() => { this.setState({ stepLogVisible: true, currentRecord: record }) }}>日志</Button>
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
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <ShowImgView showModal={this.state.showModal1} cancel={() => { this.setState({ showModal1: false }) }} showLoading={this.state.showLoading} imguuid={this.state.imguuid} />
                <StepLogView visible={this.state.stepLogVisible} onCancel={() => { this.setState({ stepLogVisible: false }) }} bugId={this.state.currentRecord.id} />
            </Fragment >
        );
    }
}