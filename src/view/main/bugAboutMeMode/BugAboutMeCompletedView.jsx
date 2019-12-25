import React, { Component, Fragment } from 'react';
import { Table, Tag, Button, message, Popconfirm, Tooltip } from 'antd'
import HttpApi from '../../util/HttpApi'
import Store from '../../../redux/store/Store';
import { showBugNum } from '../../../redux/actions/BugAction';
import ShowImgView from '../bugMode/ShowImgView';
import BaseModal from '../bugMode/actions/BaseModal';
import '../bugMode/BugViewCss.css'

var major_filter = [];///用于筛选任务专业的数据 选项
var bug_type_filter = [];///用于筛选类别的数据 选项
const status_filter = [{ text: '待分配', value: 0 }, { text: '维修中', value: 1 },
{ text: '专工验收中', value: 2 }, { text: '运行验收中', value: 3 }];///用于筛选状态的数据
const bug_level_filter = []

var storage = window.localStorage;
var localUserInfo = '';

export default class BugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showModal1: false,///img显示框
            showLoading: true,///现实loading图片
            preImguuid: null,///上一次加载的图片的uuid
            showModal2: false,
            showModal3: false,
            showModal4: false,
            showModal5: false,
            showModal6: false,
            imguuid: null,
            userData: [],
            currentRecord: {},///当前选择的某一行。某一个缺陷对象
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }

    init = async () => {
        major_filter.length = 0;
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
        let finallyData = await this.getBugsInfo();///从数据库中获取最新的bugs数据
        // console.log('finallyData:', finallyData);
        finallyData.forEach((item) => { item.key = item.id + ''; })
        let userData = await this.getUsersInfo();
        this.setState({
            data: finallyData,
            userData,
        })
    }
    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            let sqlText = `select users.*,users.name as title,levels.name level_name,  CONCAT(users.level_id,'-',users.id) 'key',CONCAT(users.level_id,'-',users.id) 'value' from users
            left join (select * from levels where effective = 1)levels
            on users.level_id = levels.id
            where users.effective = 1
            order by users.level_id`
            HttpApi.obs({ sql: sqlText }, (res) => {
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
    getOneBugInfo = (bug_id) => {
        let sql = `select bugs.* from bugs where id = ${bug_id} and effective = 1`;
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
    getBugsInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.findBugsAboutMe({ userId: JSON.parse(localUserInfo).id, isCompleted: 1 }, (res) => {
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
    actionsHandler = (record) => {
        // console.log('详情：', record);
        // console.log('localUserInfo:',localUserInfo);
        this.setState({ showModal2: true, currentRecord: record })
    }
    ///根据userid 查找 username
    getLocalUserName = (userId) => {
        let name = '';
        if (this.state.userData && this.state.userData.length > 0) { this.state.userData.forEach((item) => { if (item.id === userId) { name = item.name } }) }
        return name;
    }
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////

    ///状态0 时渲染的界面
    renderStatusX = (statusValue) => {
        let oneStepContent = [];///每一步的所以内容
        if (this.state.currentRecord.remark) {
            let stepRemarkObj = JSON.parse(this.state.currentRecord.remark);
            // console.log("每一步的操作流程数据：", stepRemarkObj[statusValue]);
            if (stepRemarkObj[statusValue]) {
                let renderArr = stepRemarkObj[statusValue];
                renderArr.forEach((item, index) => {
                    let text = ''
                    let remarkText = item.remark ? item.remark : '';
                    /////////////////
                    let result_arr = [];
                    let comArr = [];///组件数组
                    if (item.imgs) {
                        item.imgs.forEach((item, index) => {
                            result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
                        })
                        result_arr.forEach((item, index) => {
                            comArr.push(<Button size={'small'} type={'primary'} key={item.uuid} style={{ marginLeft: 10, cursor: "pointer" }}
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
                                }}>{item.name}</Button>)
                        });
                    }
                    /////////////////
                    if (item.to || item.to >= 0) {
                        // text = '  ' + this.getLocalUserName(item.from) + '  分配给 ' + this.getLocalUserName(item.to);
                        text = <Fragment><span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{item.time}</span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + this.getLocalUserName(item.from)}</span>
                            <span> 分配给 </span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + item.to.map((id) => { return this.getLocalUserName(id) })}</span>
                            {remarkText ? <span style={{ color: '#888888' }}> 备注: </span> : null}
                            <span style={{ color: renderArr.length - 1 === index ? 'orange' : '#888888' }}>{remarkText}</span>
                        </Fragment>
                    } else {
                        text = '  ' + this.getLocalUserName(item.from);
                        text = <Fragment><span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{item.time}</span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + this.getLocalUserName(item.from)}</span>
                            {remarkText ? <span style={{ color: '#888888' }}> 备注: </span> : null}
                            <span style={{ color: renderArr.length - 1 === index ? 'orange' : '#888888' }}>{remarkText}</span>
                        </Fragment>
                    }
                    oneStepContent.push(<div key={index}>
                        {text}
                        {comArr}
                    </div>)
                })
            }
        }
        return oneStepContent
    }

    /////判断每一个button 在各种情况下，是否禁用
    checkDisable = (btnV) => {
        return true;
    }

    deleteBugsHandler = (record) => {
        HttpApi.obs({ sql: `update bugs set effective = 0 where id = ${record.id} ` }, (res) => {
            if (res.data.code === 0) {
                message.success('移除缺陷成功');
                this.init();
                ///要利用redux刷新 mainView处的徽标数
                this.updateDataByRedux();
            }
        })
    }
    updateDataByRedux = () => {
        ///每次删除
        Store.dispatch(showBugNum(null)) ///随便派发一个值，目的是让 mainView处监听到 执行init();
    }
    openDrawerHandler = (dataObj) => {
        this.setState({ ...dataObj })
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
                // defaultSortOrder: 'descend',
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
            },
            /// {
            ///     key: 'area_remark', dataIndex: 'area_remark', title: '具体巡检点范围',
            ///     render: (text, record) => {
            ///         let result = '/'
            ///         if (text) { result = text }
            //       else { result = record.area_name }
            ///         return <div>{result}</div>
            //     }
            // },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '缺陷类型',
                filters: bug_level_filter,
                onFilter: (value, record) => record.buglevel === value,
                render: (text) => {
                    // console.log(text);
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
                key: 'content', dataIndex: 'content', title: '内容',
                render: (text, record) => {
                    let obj = JSON.parse(text);
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
                    </div>
                }
            },
            {
                key: 'major_name', dataIndex: 'major_name', title: '专业',
                filters: major_filter,
                onFilter: (value, record) => record.major_id === value,
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                key: 'bug_type_name', dataIndex: 'bug_type_name', title: '备注类别',
                filters: bug_type_filter,
                onFilter: (value, record) => record.bug_type_id === value,
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                key: 'last_remark', dataIndex: 'last_remark', title: '备注内容',
                render: (text, record) => {
                    return <div className='hideText lineClamp5' style={{ minWidth: 80 }}>{text ?
                        < Tooltip title={text}>
                            <span>{text}</span>
                        </Tooltip> : '/'
                    }</div>
                }
            },
            {
                key: 'img', dataIndex: 'content', title: '图片', render: (text) => {
                    let obj = JSON.parse(text);
                    let imgs_arr = JSON.parse(JSON.stringify(obj.imgs));
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
                    let result = '/'
                    if (comArr.length > 0) { result = comArr }
                    return <div>{result}</div>
                }
            },
            {
                title: '缺陷状态',
                dataIndex: 'status',
                filters: status_filter,
                align: 'center',
                onFilter: (value, record) => record.status === value,
                render: (text, record) => {
                    let str = '';
                    let color = '#888888'
                    if (text === 0) { str = '待分配' } else if (text === 1) { str = '维修中'; color = '#FF9999' } else if (text === 2) { str = '专工验收中'; color = '#6699CC' }
                    else if (text === 3) { str = '运行验收中'; color = '#9933CC' } else if (text === 4) { str = '处理完毕'; color = '#87d068' }
                    return <Tag color={color}>{str}</Tag>;
                }
            },
            {
                title: '当前处理人员',
                dataIndex: 'a',
                render: (text, record) => {
                    return <div>/</div>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button size="small" type="primary" onClick={() => { this.actionsHandler(record) }}>查看</Button>
                        {JSON.parse(localUserInfo).isadmin === 1 ?
                            <Fragment>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Popconfirm title="确定要删除该缺陷吗?" onConfirm={() => { this.deleteBugsHandler(record); }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm>
                            </Fragment> : null
                        }
                    </div>
                )
            }
        ]
        return (
            <Fragment>
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                {/* 进度界面 */}
                <BaseModal showModal={this.state.showModal2} onClose={() => { this.setState({ showModal2: false }) }} renderStatusX={this.renderStatusX} currentStatus={this.state.currentRecord.status} openDrawer={this.openDrawerHandler} checkDisable={this.checkDisable} />
                {/* 图片显示界面 */}
                <ShowImgView showModal={this.state.showModal1} cancel={() => { this.setState({ showModal1: false }) }} showLoading={this.state.showLoading} imguuid={this.state.imguuid} />
            </Fragment >
        );
    }
}