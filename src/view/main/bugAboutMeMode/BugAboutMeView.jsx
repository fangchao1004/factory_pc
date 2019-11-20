import React, { Component, Fragment } from 'react';
import { Table, Tag, Button, message, Popconfirm, Tooltip } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
import Store from '../../../redux/store/Store';
import { showBugNum } from '../../../redux/actions/BugAction';
import ShowImgView from '../bugMode/ShowImgView';
import DistributionView from '../bugMode/actions/DistributionView';
import RepairView from '../bugMode/actions/RepairView';
import ManagerView from '../bugMode/actions/ManagerView';
import RunnerView from '../bugMode/actions/RunnerView';
import BaseModal from '../bugMode/actions/BaseModal';
import ChangeRemarkView from '../bugMode/ChangeRemarkView';
import '../bugMode/BugViewCss.css'

var major_filter = [];///用于筛选任务专业的数据 选项
var bug_type_filter = [];///用于筛选类别的数据 选项
const status_filter = [{ text: '待分配', value: 0 }, { text: '维修中', value: 1 },
{ text: '专工验收中', value: 2 }, { text: '运行验收中', value: 3 }];///用于筛选状态的数据
const bug_level_filters = [{ text: '一级', value: '1' }, { text: '二级', value: '2' }, { text: '三级', value: '3' }, { text: '/', value: 'null' }]

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
            showModal9: false,///修改最新的备注
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
        let bugTypeData = await this.getBugTypeInfo();
        bugTypeData.forEach((item) => {
            bug_type_filter.push({ text: item.name, value: item.id });
        })
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => {
            major_filter.push({ text: item.name, value: item.id });
        })
        let finallyData = await this.getBugsInfo();///从数据库中获取最新的bugs数据
        // console.log('finallyData:', finallyData);
        finallyData.forEach((item) => { item.key = item.id + '' })
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
    getBugsInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.findBugsAboutMe({ userId: JSON.parse(localUserInfo).id, isCompleted: 0 }, (res) => {
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
    /**
     * statusValue  当前bug的状态status字段。（0，1，2，3，4)
     * 0 -- 等待分配
     * 1 -- 分配完成，等待维修
     * 2 -- 维修完成，等待专工验收
     * 3 -- 专工验收完成，等待运行验收
     * 4 -- 运行验收完成，流程结束
     */

    /**
    * statusValue  当前bug的状态status字段。（0，1，2，3，4)
    * 0 -- 等待分配
    * 1 -- 分配完成，等待维修
    * 2 -- 维修完成，等待专工验收
    * 3 -- 专工验收完成，等待运行验收
    * 4 -- 运行验收完成，流程结束
    * @param {*} targetStatus 目标状态 目的是将bug 的status 置成什么值
    * @param {*} currentStep 当前步骤值
    * @param {*} remarkText 每一步的备注
    * @param {*} fromId 来自人 id
    * @param {*} toId  目标人 id
    */
    changeBugStatus = (targetStatus, currentStep, remarkText, fromId, toId = null) => {
        // console.log('要将bug的status置成：', targetStatus, '当前流程在哪一步：', currentStep, '备注的文本：', remarkText, '操作人：', fromId, '目标对象：', toId);
        // return;
        ////首先要先把当前的bug的remak信息全copy一份。
        // console.log("this.state.currentRecord.remark:", this.state.currentRecord.remark);
        let remarkCopy = {};
        if (this.state.currentRecord.remark) {
            remarkCopy = JSON.parse(this.state.currentRecord.remark);
        }
        // console.log('remarkCopy:', remarkCopy);
        if (remarkCopy && remarkCopy[currentStep]) {
            ///如果remark已经存在。
            // console.log(remarkCopy[currentStep]);
            if (toId !== null) {
                remarkCopy[currentStep].push({ from: fromId, to: toId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
            } else {
                remarkCopy[currentStep].push({ from: fromId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
            }
        } else {
            if (toId !== null) {
                remarkCopy[currentStep] = [{ from: fromId, to: toId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') }]
            } else {
                remarkCopy[currentStep] = [{ from: fromId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') }]
            }
        }
        ///将最新的 remark 数据 更新到 bugs 表中。并且判断要把 status 改到哪一步
        let newValue = { status: targetStatus, remark: JSON.stringify(remarkCopy) }
        if (targetStatus === 4) { ///当 运行验收后， 状态为 4 此时还要记录一下缺陷的解决时间，为什么不用 updatedAt 来判断？ 因为怕 混乱 
            newValue = { ...newValue, closedAt: moment().format('YYYY-MM-DD HH:mm:ss') }
        }
        if (toId !== null) {
            newValue.fix_id = toId;
        }
        HttpApi.updateBugInfo({ query: { id: this.state.currentRecord.id }, update: newValue }, (res) => {
            if (res.data.code === 0) {
                this.init();
                if (targetStatus === 1 || targetStatus === 4) { /// 1是分配  4是处理完毕缺陷消除  这个时候 显示缺陷的计数都要更新
                    this.updateDataByRedux();
                }
                ///成功以后要立即刷新当前的bug数据。
                HttpApi.getBugInfo({ id: this.state.currentRecord.id }, (res) => {
                    if (res.data.code === 0) {
                        message.success('发布成功');
                        this.setState({ currentRecord: res.data.data[0] })
                        ////如果是状态4 则说明这个bug已经解决了。要把这个bug对应的record给更新（复制原有数据，本地修改，再作为新数据插入数据库record表）
                        if (targetStatus === 4) {
                            this.changeRecordData(this.state.currentRecord.id); setTimeout(() => {
                                this.setState({ showModal2: false })
                            }, 1000);
                        }
                    }
                })
            }
        })
    }

    ////改变包含了这个bug_id 的record 再数据库中的值。
    changeRecordData = async (bugId, isDelete = false) => {
        // let bugId = this.state.currentRecord.id;
        ///1，要根据bug_id 去bugs表中去查询该条数据，获取其中的 device_id 字段信息
        let oneBugInfo = await this.getOneBugInfo(bugId, isDelete);
        let device_id = oneBugInfo.device_id;
        if (!device_id) { return }
        ///2，根据 device_id 去record 表中 找到 这个设备最新的一次record。 获取到后，在本地修改。再最为一条新数据插入到records表中
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
        // console.log('这个设备还有几个bug:', bug_id_count);
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
                    ///手动更新数据库中，对应设备的状态
                    HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 1 } }, (res) => {
                        if (res.data.code === 0) { message.success('对应设备最新巡检记录更新-设备状态恢复正常'); }
                    })
                } else {
                    HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 2 } }, (res) => {
                        if (res.data.code === 0) { message.info('对应设备最新巡检记录更新'); } ///这么做的目的是只要有record上传，就要更新对应设备的updateAt
                    })
                }
            }
        })
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
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + this.getLocalUserName(item.to)}</span>
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
        let disabledFlag = true;
        if (btnV === 0) {
            ///有专工权限，且 status <= 1 时 可用。disableFlag = false;
            if (localUserInfo && JSON.parse(localUserInfo).permission) {
                if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('0') !== -1 && this.state.currentRecord.status <= 1) {
                    disabledFlag = false;
                }
            }
        } else if (btnV === 1) {
            ////当前用户是不是 0 数组中最后一位的 to  且 当前status 的值 =1
            if (localUserInfo && this.state.currentRecord.remark && this.state.currentRecord.status === 1) {
                let stepData_0_arr = JSON.parse(this.state.currentRecord.remark)['0'];
                if (stepData_0_arr) {
                    let to_id = stepData_0_arr[stepData_0_arr.length - 1].to; ////最新一次任务分配给了谁。
                    disabledFlag = to_id !== JSON.parse(localUserInfo).id;/// 如果不等于 则禁用
                }
            } else if (localUserInfo && JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('3') !== -1 && this.state.currentRecord.status === 0) { ///如果当前bug的状态还是0 未分配 但是你有维修专工权限，则维修按钮可用
                disabledFlag = false;
            }
        } else if (btnV === 2) {
            ///有专工权限，且 status = 2 时 可用。disableFlag = false;
            if (localUserInfo && JSON.parse(localUserInfo).permission && this.state.currentRecord.remark) {
                if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('0') !== -1 && this.state.currentRecord.status === 2) {
                    disabledFlag = false;
                }
            }
        } else if (btnV === 3) {
            // ///有运行权限，且 status = 3 时 可用。disableFlag = false;
            // if (localUserInfo && JSON.parse(localUserInfo).permission && this.state.currentRecord.remark) {
            //     if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('1') !== -1 && this.state.currentRecord.status === 3) {
            //         disabledFlag = false;
            //     }
            // }
            ////当前用户是不是 2 数组中最后一位的 to  且 当前status 的值 =3
            if (localUserInfo && this.state.currentRecord.remark && this.state.currentRecord.status === 3) {
                let stepData_2_arr = JSON.parse(this.state.currentRecord.remark)['2'];
                if (stepData_2_arr) {
                    let to_id = stepData_2_arr[stepData_2_arr.length - 1].to; ////最新一次任务分配给了谁。
                    disabledFlag = to_id !== JSON.parse(localUserInfo).id;/// 如果不等于 则禁用
                    // console.log('运行_to_id:',to_id);
                }
            }
        }
        return disabledFlag;
    }

    deleteBugsHandler = (record) => {
        HttpApi.obs({ sql: `update bugs set effective = 0 where id = ${record.id} ` }, (res) => {
            if (res.data.code === 0) {
                message.success('移除缺陷成功');
                this.init();
                ///要利用redux刷新 mainView处的徽标数
                this.updateDataByRedux();
                ///再创建一个新的record记录插入records表
                this.changeRecordData(record.id);
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
                render: (text) => {
                    let result = '/'
                    if (text && text !== '') { result = text }
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
            // {
            //     key: 'area_remark', dataIndex: 'area_remark', title: '具体设备范围',
            //     render: (text, record) => {
            //         let result = '/'
            //         if (text) { result = text }
            //         else { result = record.area_name }
            //         return <div>{result}</div>
            //     }
            // },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '缺陷类型',
                filters: bug_level_filters,
                onFilter: (value, record) => record.buglevel + '' === value,
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
                key: 'content', dataIndex: 'content', title: '内容', render: (text, record) => {
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
            /// {
            ///     key: 'img', dataIndex: 'content', title: '图片', render: (text) => {
            ///         let obj = JSON.parse(text);
            ///        let imgs_arr = JSON.parse(JSON.stringify(obj.imgs));
            ///       let result_arr = [];
            ///       imgs_arr.forEach((item, index) => {
            ///            result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
            ///         })
            ///         let comArr = [];
            ///         result_arr.forEach((item, index) => {
            ///             comArr.push(<span key={item.uuid} style={{ color: '#438ef7', fontWeight: 500, marginRight: 10, cursor: "pointer" }}
            ///                 onClick={e => {
            ///                     if (this.state.preImguuid !== item.uuid) {
            ///                         this.setState({
            ///                             showLoading: true,
            ///                         })
            ///                     } else {
            ///                         this.setState({
            ///                             showLoading: false,
            ///                         })
            ///                     }
            ///                     this.setState({
            ///                         imguuid: item.uuid,
            ///                         showModal1: true,
            ///                         preImguuid: item.uuid,
            ///                     })
            ///                 }}>{item.name}</span>)
            ///         });
            ///         let result = '/'
            ///         if (comArr.length > 0) { result = comArr }
            ///         return <div>{result}</div>
            ///     }
            /// },
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
                width: 80,
                render: (text, record) => {
                    let remarkObj = JSON.parse(record.remark);
                    let currentStatus = record.status;
                    let str = '/';
                    if (currentStatus === 1 && remarkObj) {
                        // console.log('id:', record.id,'数组长度:',remarkObj['0'].length,'最新:',remarkObj['0'][remarkObj['0'].length-1]);
                        // console.log('最新的维修人员id:',remarkObj['0'][remarkObj['0'].length-1].to);
                        let currentUserID = remarkObj['0'][remarkObj['0'].length - 1].to;
                        this.state.userData.forEach((item) => {
                            if (item.id === currentUserID) {
                                str = item.name
                            }
                        })
                    }
                    if (currentStatus === 2) {
                        str = '专工'
                    } else if (currentStatus === 3) {
                        // str = '运行人员'
                        let currentUserID;
                        if (remarkObj['2'] && remarkObj['2'].length > 0) {
                            currentUserID = remarkObj['2'][remarkObj['2'].length - 1].to;
                        }
                        this.state.userData.forEach((item) => {
                            if (item.id === currentUserID) {
                                str = item.name
                            }
                        })
                    } else if (currentStatus === 4) {
                        str = '/'
                    }
                    return <div>{str}</div>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button size="small" type="primary" onClick={() => { this.actionsHandler(record) }}>处理</Button>
                        {JSON.parse(localUserInfo).permission.indexOf('0') !== -1 || JSON.parse(localUserInfo).permission.indexOf('3') !== -1 ?
                            <Fragment>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button size="small" type="ghost" onClick={() => { this.setState({ showModal9: true, currentRecord: record }) }}>备注</Button>
                            </Fragment>
                            : null}
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
                <ChangeRemarkView
                    currentRecord={this.state.currentRecord}
                    getLocalUserName={this.getLocalUserName}
                    showModal={this.state.showModal9}
                    oneBug={this.state.currentRecord}
                    openRunerView={() => { this.setState({ showModal5: true }) }}
                    ok={() => { this.init(); this.setState({ showModal9: false }) }}
                    cancel={() => { this.setState({ showModal9: false }) }} />
                {/* 进度界面 */}
                <BaseModal showModal={this.state.showModal2} onClose={() => { this.setState({ showModal2: false }) }} renderStatusX={this.renderStatusX} currentStatus={this.state.currentRecord.status} openDrawer={this.openDrawerHandler} checkDisable={this.checkDisable} />
                {/* 分配人员操作界面 */}
                <DistributionView showModal={this.state.showModal3} onClose={() => { this.setState({ showModal3: false }) }} changeBugStatus={this.changeBugStatus} />
                {/* 维修人员操作界面 */}
                <RepairView showModal={this.state.showModal4} onClose={() => { this.setState({ showModal4: false }) }} changeBugStatus={this.changeBugStatus} />
                {/* 专工验收操作界面 */}
                <ManagerView showModal={this.state.showModal5} onClose={() => { this.setState({ showModal5: false, showModal9: false }) }} changeBugStatus={this.changeBugStatus} />
                {/* 运行验收操作界面 */}
                <RunnerView showModal={this.state.showModal6} onClose={() => { this.setState({ showModal6: false }) }} changeBugStatus={this.changeBugStatus} />
                {/* 图片显示界面 */}
                <ShowImgView showModal={this.state.showModal1} cancel={() => { this.setState({ showModal1: false }) }} showLoading={this.state.showLoading} imguuid={this.state.imguuid} />
            </Fragment >
        );
    }
}