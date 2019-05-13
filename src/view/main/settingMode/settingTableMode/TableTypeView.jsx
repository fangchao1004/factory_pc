import React, { Component } from 'react';
import { Table, Button } from 'antd'
import HttpApi from '../../../util/HttpApi';

class TableTypeView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: []
        }
    }

    componentDidMount() {
        this.getDeviceTypeData();
    }

    getDeviceTypeData = () => {
        HttpApi.getDeviceTypeInfo({}, (res) => {
            // console.log(res);
            if (res.data.code === 0) {
                res.data.data.map((item) => (
                    item.key = item.id + ""
                ))
                this.setState({
                    dataSource: res.data.data
                })
            }
        })
    }

    render() {

        const columns = [
            {
                title: '编号',
                dataIndex: 'key',
                width: '8%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '设备类型名',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '类型表单名',
                dataIndex: 'sample_name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                dataIndex: 'operation',
                width: '15%',
                render: (text, record) => {
                    if (this.state.dataSource.length >= 1) {
                        return (
                            <Button type='primary'>修改</Button>
                        )
                    }
                },
            }

        ];

        return (
            <div>
                表单类型管理界面
                <Table
                    size={'small'}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                />
            </div>
        );
    }
}

export default TableTypeView;