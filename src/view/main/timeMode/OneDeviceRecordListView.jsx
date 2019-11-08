import React, { Component } from 'react';
import { Drawer, Table, Button, message } from 'antd';
import HttpApi from '../../util/HttpApi';
import OneRecordDetialView from '../equipmentMode/equipment/OneRecordDetialView';

/**
 * 某个设备的所有records
 */
class OneDeviceRecordListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDrawer: false,
            recordList: [],
            title: '',
            showDetailDrawer: false,///显示巡检记录详情界面
            selectRecord: {},///选中的某个巡检记录数据
            oneRecordData: {},///要渲染的缺陷数据
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showDrawer: nextProps.showDrawer
        })
        if (nextProps.showDrawer) {
            this.setState({
                recordList: nextProps.record.recordList.map((item, index) => { item.key = index + ''; return item }),
                title: nextProps.record.name
            })
        }
    }

    renderDeviceRecordsView = () => {
        const columns = [
            {
                title: '巡检时间',
                dataIndex: 'checkedAt',
                render: (text, record) => (
                    <div>{text || '/'}</div>
                )
            },
            {
                title: '基本状态',
                dataIndex: 'device_status',
                render: (text, record) => {
                    let str = '';
                    let strColor = '#555555'
                    if (text === 1) { str = '正常'; strColor = '#66CC00' }
                    else if (text === 2) { str = '故障'; strColor = '#FF3333' }
                    else { str = '待检' }
                    return <div style={{ color: strColor }}>{str}</div>
                }
            },
            {
                title: '报告人',
                dataIndex: 'user_name',
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                title: '操作',
                width: 75,
                dataIndex: 'operation',
                render: (text, record) => {
                    return (
                        <Button style={{ marginLeft: 10 }} size="small" type='primary' onClick={() => this.openDrawer(record)} >详情</Button>
                    )
                },
            }
        ]
        return <Table
            bordered
            dataSource={this.state.recordList}
            columns={columns}
        />
    }

    openDrawer = async (record) => {
        if (!record) { message.warn('无记录数据'); return }
        let bug_id_arr = [];
        let bug_key_id_arr = [];///key标题和bugId的对应关系
        let collectAndInputDataList = [];/// 采集组件 和 输入组件 对应的
        JSON.parse(record.content).forEach((item) => {
            if (item.bug_id !== null) {
                bug_id_arr.push(item.bug_id);
                bug_key_id_arr.push({ key: item.key, bug_id: item.bug_id });
            }
            if (item.type_id === '2' || item.type_id === '6' || item.type_id === '10' || item.type_id === '11' || item.type_id === '13') {
                collectAndInputDataList.push(item);
            }
        })
        let bugs_info_arr = await this.getBugsInfo(bug_id_arr);
        bugs_info_arr.forEach((oneBugInfo) => {
            bug_key_id_arr.forEach((one_key_bug_id) => {
                if (oneBugInfo.id === one_key_bug_id.bug_id) {
                    oneBugInfo.key = one_key_bug_id.key
                }
            })
        })

        let oneRecordData = {
            table_name: record.table_name,
            device_name: record.device_name,
            user_name: record.user_name,
            content: bugs_info_arr,///bugs数据
            collect: collectAndInputDataList,///采集的数据
            updatedAt: record.updatedAt,
            checkedAt: record.checkedAt
        }
        this.setState({
            selectRecord: record,
            showDetailDrawer: true,
            oneRecordData
        })
    }
    getBugsInfo = (bug_id_arr) => {
        return new Promise((resolve, reject) => {
            let sql = `select bugs.*,mjs.name as major_name from bugs 
            left join (select * from majors) mjs on mjs.id = bugs.major_id 
            where bugs.id in (${bug_id_arr.join(',')}) and bugs.effective = 1`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    renderOneRecordView = () => {
        return (
            <Drawer
                title={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
                    <span>当次记录</span>
                    <span>{this.state.selectRecord.checkedAt}</span>
                </div>}
                placement="left"
                width={500}
                closable={false}
                onClose={() => { this.setState({ showDetailDrawer: false }) }}
                visible={this.state.showDetailDrawer}
            >
                <OneRecordDetialView renderData={this.state.oneRecordData} />
            </Drawer>
        )
    }

    render() {
        return (
            <Drawer
                title={'当前时间段内- ' + this.state.title + '的所有巡检记录'}
                placement='left'
                width={600}
                visible={this.state.showDrawer}
                onClose={() => { this.props.onClose() }}
            >
                {this.renderDeviceRecordsView()}
                {this.renderOneRecordView()}
            </Drawer>
        );
    }
}

export default OneDeviceRecordListView;