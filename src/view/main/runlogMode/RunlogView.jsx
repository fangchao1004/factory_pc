import React, { Component } from 'react';
import { Button, Table, Popconfirm, Divider, message } from 'antd';
import AddRunlogView from './AddRunlogView';
import HttpApi from '../../util/HttpApi';
import UpdateRunlogView from './UpdateRunlogView';
// const testData = [{ key: 0, time: '2020-01-01 09:24:12', content: 'dadasdeqwdhkjahdak', upload_id: 0 },
// { key: 1, time: '2020-01-01 09:24:12', content: 'dadasdeqwdhkjahdak', upload_id: 1 },
// { key: 2, time: '2020-01-01 09:24:12', content: 'dadasdeqwdhkjahdak', upload_id: 2 }]
class RunlogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasource: [],
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin === 1,
            myId: JSON.parse(window.localStorage.getItem('userinfo')).id,
            addVisible: false,
            updateVisible: false,
            record: null,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let result = await this.getRunlog();
        this.setState({
            datasource: result.map((item, index) => { item.key = index; return item })
        })
    }
    getRunlog = () => {
        return new Promise((resolve, reject) => {
            let sql = `select runlog.*,users.name as upname from runlog
            left join (select * from users where effective = 1) users on users.id = runlog.upid
             where runlog.effective = 1
             order by runlog.time desc`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result)
            })
        })
    }
    onCanceladd = () => {
        this.setState({ addVisible: false })
    }
    onCancelupdate = () => {
        this.setState({ updateVisible: false })
    }
    onOkadd = async (value) => {
        let result = await this.insertRunlog(value);
        if (result === 0) { message.success('添加日志成功'); this.onCanceladd(); this.init(); }
        else { message.error('添加日志失败'); }
    }
    onOkupdate = async (value) => {
        let result = await this.updateRunlog(value);
        if (result === 0) { message.success('修改日志成功'); this.onCancelupdate(); this.init(); }
        else { message.error('修改日志失败'); }
    }
    insertRunlog = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO runlog (time,content,upid) VALUES ('${value.time}','${value.content}',${this.state.myId})`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    updateRunlog = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE runlog SET time = '${value.time}',content = '${value.content}' WHERE id = ${value.id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteConfirm = (value) => {
        let sql = `update runlog set effective = 0 where id = ${value.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('删除成功'); this.init(); }
            else { message.error('删除失败'); }
        })
    }

    render() {
        const columns = [
            {
                title: '时间',
                dataIndex: 'time',
                width: 200,
            },
            {
                title: '内容',
                dataIndex: 'content'
            }, {
                title: '记录人',
                dataIndex: 'upname',
                width: 100,
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => {
                    let disable = this.state.isAdmin ? false : (this.state.myId === record.upid ? false : true);
                    return <div style={{ textAlign: 'center' }}>
                        <Popconfirm disabled={disable} title={<div>确定要删除该日志吗？</div>} onConfirm={() => { this.deleteConfirm(record) }}>
                            <Button disabled={disable} size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button disabled={disable} size="small" type="primary" onClick={() => { this.setState({ updateVisible: true, record: record }) }}>修改</Button>
                    </div>
                }
            }
        ]
        return (
            <div>
                <Button type='primary' onClick={() => { this.setState({ addVisible: true }) }}>添加日志</Button>
                <Table
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.datasource}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <AddRunlogView visible={this.state.addVisible} onCancel={this.onCanceladd} onOk={this.onOkadd} />
                <UpdateRunlogView visible={this.state.updateVisible} onCancel={this.onCancelupdate} onOk={this.onOkupdate} record={this.state.record} />
            </div >
        );
    }
}

export default RunlogView;