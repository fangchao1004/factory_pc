import React, { Component } from 'react';
import { Drawer, Table, Button, message } from 'antd';
import HttpApi from '../../util/HttpApi';
import OneRecordDetialView from '../equipmentMode/equipment/OneRecordDetialView';
var device_switch_filter = [{ text: '运行', value: 1 }, { text: '停运', value: 0 }];///用于筛选巡检点开停运状态的数据 选项
/**
 * 某个巡检点的所有records
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
                    console.log('record:', record)
                    return <div style={{ color: strColor }}>{str}</div>
                }
            },
            {
                title: '运/停',
                dataIndex: 'switch',
                width: 80,
                filters: device_switch_filter,
                align: 'center',
                onFilter: (value, record) => record.switch === value,
                render: (text, record) => {
                    return <div>{text === 0 ? '停运' : '运行'}</div>
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
        this.setState({
            selectRecord: record,
            showDetailDrawer: true,
            oneRecordData: record
        })
    }
    getBugsInfo = (bug_id_arr) => {
        return new Promise((resolve, reject) => {
            let sql = `select bugs.*,mjs.name as major_name from bugs 
            left join (select * from majors where effective = 1) mjs on mjs.id = bugs.major_id 
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
                destroyOnClose
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