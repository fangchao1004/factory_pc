import React, { Component } from 'react';
import HttpApi from '../../util/HttpApi';
import { Table, Alert, Button, message } from 'antd';
import { getDuration } from '../../util/Tool'
import UpdateBugDurationView from './UpdateBugDurationView';

class BugDurationView extends Component {
    constructor(props) {
        super(props);
        this.state = { dataSource: [], updateVisible: false, currentRecord: {} }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let result = await this.getBugStatusDuration();
        let result2 = await this.getBugLevelDuration();
        this.setState({
            dataSource: [...result2, ...result].map((item, index) => {
                item.key = index;
                item.lab = item.level_name || item.status_name
                return item
            })
        })
    }
    getBugLevelDuration = () => {
        let sql = `select * from bug_level_duration where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getBugStatusDuration = () => {
        let sql = `select * from bug_status_duration where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    okHandler = (value) => {
        let table_name = this.state.currentRecord.status_name ? 'bug_status_duration' : 'bug_level_duration'
        let ms = (value.day * 24 * 60 * 60 + value.hour * 60 * 60 + value.minute * 60) * 1000
        let param = ms > 0 ? ms : null;
        let sql = `update ${table_name} set duration_time = ${param} where id = ${this.state.currentRecord.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('修改时间区间成功'); this.init() } else { message.warn('修改时间区间失败') }
        })
        this.setState({ updateVisible: false })
    }

    render() {
        const columns = [{
            title: '对应缺陷等级或状态',
            dataIndex: 'lab',
        }, {
            title: '时间区间',
            dataIndex: 'duration_time',
            render: (text, record) => {
                let result = '/'
                if (text) {
                    result = getDuration(text, 1, false);
                }
                return <div>{result}</div>
            }
        }, {
            title: '操作',
            width: 100,
            dataIndex: 'actions',
            align: 'center',
            render: (text, record) => {
                return <Button size='small' type='primary' onClick={() => {
                    this.setState({ currentRecord: record, updateVisible: true })
                }}>修改</Button>
            }
        }]
        return (
            <div>
                <Alert message={
                    <div>此数据只用于判断当前时刻与缺陷的上一状态记录时刻的差值是否超出, <span style={{ color: '#1790FF' }}>如超出则标红于缺陷表单中</span></div>
                } type="info" showIcon />
                <Table
                    style={{ marginTop: 20 }}
                    bordered
                    columns={columns}
                    dataSource={this.state.dataSource}
                />
                <UpdateBugDurationView visible={this.state.updateVisible} data={this.state.currentRecord}
                    onOk={this.okHandler}
                    onCancel={() => { this.setState({ updateVisible: false }) }} />
            </div>
        );
    }
}

export default BugDurationView;