import React, { Component } from 'react';
import { Table, Button, Row, Col, message, Popconfirm, Divider } from 'antd'
import HttpApi from '../../util/HttpApi';
import AddDeviceTypeView from './AddDeviceTypeView';
import UpdateDeviceTypeView from './UpdateDeviceTypeView';

class EquipmentTypeView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            addStaffVisible: false, updateStaffVisible: false, updateStaffData: null
        }
    }
    componentDidMount() {
        this.getDeviceTypeData();
    }
    getDeviceTypeData = () => {
        HttpApi.getDeviceTypeInfo({}, (res) => {
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
    addStaff = () => {
        this.setState({ addStaffVisible: true })
    }
    addStaffOnOk = (newValues) => {
        HttpApi.addDeviceTypeInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addStaffVisible: false })
                message.success('添加成功')
                this.getDeviceTypeData();
            } else {
                message.error(data.data.data)
            }
        })
    }
    addStaffOnCancel = () => {
        this.setState({ addStaffVisible: false })
    }
    updateStaff(record) {
        this.setState({ updateStaffVisible: true, updateStaffData: record })
    }
    updateStaffOnOk = (newValues) => {
        HttpApi.updateDeviceTypeInfo({ query: { id: this.state.updateStaffData.id }, update: newValues }, data => {
            if (data.data.code === 0) {
                this.setState({ updateStaffVisible: false })
                message.success('更新成功')
                this.getDeviceTypeData();
            } else {
                message.error(data.data.data)
            }
        })
    }
    updateStaffOnCancel = () => {
        this.setState({ updateStaffVisible: false })
    }
    deleteStaffConfirm = (record) => {
        HttpApi.removeDeviceTypeInfo({ id: record.id }, data => {
            if (data.data.code === 0) {
                message.success('删除成功')
                this.getDeviceTypeData();
            } else {
                message.error(data.data.data)
            }
        })
    }

    render() {
        const columns = [
            {
                title: '编号',
                dataIndex: 'key',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '设备类型名',
                dataIndex: 'name',
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
                dataIndex: 'actions',
                width: 200,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title="确定要删除该设备类型吗?" onConfirm={this.deleteStaffConfirm.bind(null, record)}>
                            <Button type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button type="primary" onClick={this.updateStaff.bind(this, record)}>修改</Button></div>
                )
            }

        ];

        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button onClick={this.addStaff} type="primary" style={{ marginBottom: 16 }}>
                            添加设备类型
                         </Button>
                    </Col>
                </Row>
                <Table
                    size={'small'}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                />
                <AddDeviceTypeView onOk={this.addStaffOnOk} onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible} />
                <UpdateDeviceTypeView staff={this.state.updateStaffData} onOk={this.updateStaffOnOk}
                    onCancel={this.updateStaffOnCancel} visible={this.state.updateStaffVisible} />
            </div>
        );
    }
}

export default EquipmentTypeView;