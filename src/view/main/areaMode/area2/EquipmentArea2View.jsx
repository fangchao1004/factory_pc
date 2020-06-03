import React, { Component } from 'react';
import HttpApi from '../../../util/HttpApi';
import { Table, Popconfirm, Button, Divider, Row, Col, message } from 'antd';
import AddArea2View from './AddArea2View';
import moment from 'moment'
import UpdateArea2View from './UpdateArea2View';


class EquipmentArea2View extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addVisible: false,
            updateVisible: false,
            dataSource: [],
            areaRecord: {},
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let area2Result = await this.getArea2Info();
        this.setState({
            dataSource: area2Result.map((item, index) => { item.key = index; return item })
        })
    }
    addArea2ok = async (value) => {
        let tempData = {};
        tempData.area1_id = parseInt(value.area01_id.split('-')[1]);
        tempData.area2_name = value.area2_name;
        let result = await this.insertArea2Info(tempData);
        if (result === 0) { message.success('添加成功'); }
        this.setState({
            addVisible: false
        })
        this.init();
    }
    addArea2cancel = () => {
        this.setState({ addVisible: false })
    }
    updateArea2ok = async (value) => {
        let tempData = {};
        tempData.area1_id = value.area01_id.split('-')[1];
        tempData.area2_name = value.area2_name;
        let result = await this.updateArea2Info(tempData);
        if (result === 0) { message.success('修改成功'); }
        this.setState({
            updateVisible: false
        })
        this.init();
    }
    updateArea2cancel = () => {
        this.setState({ updateVisible: false })
    }
    deleteArea2Confirm = async (record) => {
        let result2 = await this.deleteArea2Info(record.area2_id);
        if (result2 === 0) { ///删除二级 - 再删除旗下所属的所有三级
            let result3 = await this.deleteArea3Info(record.area2_id);
            if (result3 === 0) {
                message.success('删除成功');
            }
        }
        this.init();
    }
    getArea2Info = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_2.id as area2_id,area_2.name as area2_name,area_1.id as area1_id,area_1.name as area1_name,area_0.id as area0_id,area_0.name as area0_name from area_2
            left join (select * from area_1)area_1 on area_1.id = area_2.area1_id
            left join (select * from area_0)area_0 on area_0.id = area_1.area0_id
            where area_2.effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    insertArea2Info = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO area_2 (name,area1_id,createdAt) VALUES ('${value.area2_name}','${value.area1_id}',
            '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}')`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    updateArea2Info = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_2 SET name = '${value.area2_name}',area1_id = '${value.area1_id}',updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' 
            WHERE id = ${this.state.areaRecord.area2_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea2Info = (area2_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_2 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE id = ${area2_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea3Info = (area2_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_3 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE area2_id = ${area2_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    render() {
        const columns = [
            {
                title: '所属厂区',
                dataIndex: 'area0_name'
            },
            {
                title: '所属一级区域',
                dataIndex: 'area1_name'
            }, {
                title: '名称',
                dataIndex: 'area2_name'
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => {
                    return <div style={{ textAlign: 'center' }}>
                        <Popconfirm title={<div>确定要删除该二级区域吗？<br />其下所包含的三级区域也会统一删除</div>} onConfirm={() => { this.deleteArea2Confirm(record) }}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" type="primary" onClick={() => { this.setState({ updateVisible: true, areaRecord: record }) }}>修改</Button>
                    </div>
                }
            }
        ]
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button onClick={() => { this.setState({ addVisible: true }) }} type="primary" style={{ marginBottom: 16 }}>
                            添加二级巡检位置
                         </Button>
                    </Col>
                </Row>
                <Table
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <AddArea2View visible={this.state.addVisible} onOk={this.addArea2ok} onCancel={this.addArea2cancel} />
                <UpdateArea2View visible={this.state.updateVisible} onOk={this.updateArea2ok} onCancel={this.updateArea2cancel} area={this.state.areaRecord} />
            </div>
        );
    }
}

export default EquipmentArea2View;