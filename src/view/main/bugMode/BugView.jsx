import React, { Component } from 'react';
import { Table, Tag, Modal } from 'antd'
import HttpApi, { Testuri } from '../../util/HttpApi'
import moment from 'moment'

var major_filter = [];///用于筛选任务状态的数据 选项

export default class BugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showModal: false,
            imguuid: null
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        major_filter.length = 0;
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => { major_filter.push({ text: item.name, value: item.id }) })
        console.log('marjorData:', marjorData);
        let finallyData = await this.getBugsInfo();
        finallyData.forEach((item) => { item.key = item.id + '' })
        console.log('bug数据：', finallyData);
        this.setState({
            data: finallyData
        })
    }
    getMajorInfo = () => {
        let sqlText = 'select m.id,m.name from majors m'
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getBugsInfo = () => {
        let sql1 = ' select t1.* ,users.name as fixed_user_name from'
        let sql2 = ' (select bugs.*,users.name as user_name ,majors.name as major_name,devices.name as device_name,areas.name as area_name from bugs'
        let sql3 = ' left join users on users.id = bugs.user_id left join majors on majors.id = bugs.major_id left join devices on devices.id = bugs.device_id'
        let sql4 = ' left join areas on areas.id = devices.area_id) t1 left join users on t1.fixed_user_id = users.id'
        let sqlText = sql1 + sql2 + sql3 + sql4;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    render() {
        const columns = [
            {
                key: 'createdAt', dataIndex: 'createdAt', title: '时间',
                // width: 190,
                sorter: (a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                },
                defaultSortOrder: 'descend',
                render: (text, record) => { return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> }
            },
            {
                key: 'device_name', dataIndex: 'device_name', title: '设备',
                // width: 120, 
                render: (text) => {
                    let result = '/'
                    if (text && text !== '') { result = text }
                    return <div>{result}</div>
                }
            },
            {
                key: 'user_name', dataIndex: 'user_name', title: '上报人',
                // width: 80 
            },
            // { key: 'status', dataIndex: 'status', title: '状态', width: 80 },
            {
                key: 'area_remark', dataIndex: 'area_remark', title: '区域',
                // width: 100, 
                render: (text, record) => {
                    let result = '/'
                    if (text) { result = text }
                    else { result = record.area_name }
                    return <div>{result}</div>
                }
            },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '等级',
                // width: 80, 
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
                    return <div>{resultCom}</div>
                }
            },
            {
                key: 'content', dataIndex: 'content', title: '内容', render: (text, record) => {
                    let obj = JSON.parse(text);
                    return <div><div style={{ color: '#438ef7' }}>{record.title_name}</div><div>{obj.select}</div><div>{obj.text}</div></div>
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
                key: 'img', dataIndex: 'content', title: '图片', render: (text) => {
                    let obj = JSON.parse(text);
                    let imgs_arr = JSON.parse(JSON.stringify(obj.imgs));
                    let result_arr = [];
                    imgs_arr.forEach((item, index) => {
                        result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
                    })
                    let comArr = [];
                    result_arr.forEach((item, index) => {
                        comArr.push(<span key={item.uuid} style={{ color: '#438ef7', marginRight: 10, cursor: "pointer" }}
                            onClick={e => {
                                this.setState({
                                    imguuid: item.uuid,
                                    showModal: true
                                })
                            }}>{item.name}</span>)
                    });
                    let result = '/'
                    if (comArr.length > 0) { result = comArr }
                    return <div>{result}</div>
                }
            }
        ]
        return (
            <div>
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
                <Modal
                    title="图片查看"
                    visible={this.state.showModal}
                    onCancel={() => { this.setState({ showModal: false }) }}
                    footer={null}
                    width={500}
                >
                    <img alt='' src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} style={{ width: 450, height: 600 }} />
                </Modal>
            </div>
        );
    }
}
