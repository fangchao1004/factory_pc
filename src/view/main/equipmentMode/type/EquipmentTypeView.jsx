import React, { Component } from 'react';
import { Table, Button, message, Popconfirm } from 'antd'
import HttpApi from '../../../util/HttpApi';
import AddDeviceTypeView from './AddDeviceTypeView';
import UpdateDeviceTypeView from './UpdateDeviceTypeView';

class EquipmentTypeView extends Component {
    constructor(props) {
        console.log('EquipmentTypeView:', props)
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
        HttpApi.getDeviceTypeInfo({ effective: 1, area0_id: this.props.id }, (res) => {
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
        newValues.area0_id = this.props.id
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
        HttpApi.obs({ sql: `update device_types set effective = 0 where id = ${record.id} ` }, (data) => {
            // HttpApi.removeDeviceTypeInfo({ id: record.id }, data => {
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
            // {
            //     title: '编号',
            //     dataIndex: 'key',
            //     render: (text, record) => (
            //         <div>{text}</div>
            //     )
            // },
            {
                title: '巡检点类型',
                dataIndex: 'name',
                sorter: (a, b) => {
                    return a.name.charCodeAt(0) - b.name.charCodeAt(0)
                },
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
                width: 80,
                align: 'center',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button icon='edit' size="small" onClick={this.updateStaff.bind(this, record)}>修改</Button>
                        <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                        <Popconfirm title="确定要删除该巡检点类型吗?" onConfirm={this.deleteStaffConfirm.bind(null, record)}>
                            <Button icon='delete' size="small" type="danger">删除</Button>
                        </Popconfirm>
                    </div>
                )
            }

        ];

        return (
            <div style={{ backgroundColor: '#FFFFFF', padding: 10 }}>
                <Button icon='plus' size="small" onClick={this.addStaff} type="primary" style={{ marginBottom: 10 }}>添加巡检点类型</Button>
                <Table
                    size="small"
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                    }}
                />
                <AddDeviceTypeView onOk={this.addStaffOnOk} onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible} {...this.props} />
                <UpdateDeviceTypeView staff={this.state.updateStaffData} onOk={this.updateStaffOnOk}
                    onCancel={this.updateStaffOnCancel} visible={this.state.updateStaffVisible} {...this.props} />
            </div>
        );
    }
}

export default EquipmentTypeView;