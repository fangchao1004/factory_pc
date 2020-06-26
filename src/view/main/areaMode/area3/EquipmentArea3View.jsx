import React, { Component } from 'react';
import HttpApi from '../../../util/HttpApi';
import { Table, Popconfirm, Button, Divider, Row, Col, message } from 'antd';
import moment from 'moment'
import AddArea3View from './AddArea3View';
import UpdateArea3View from './UpdateArea3View';


class EquipmentArea3View extends Component {
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
        let area3Result = await this.getArea3Info();
        // console.log('area3Result:', area3Result);
        this.setState({
            dataSource: area3Result.map((item, index) => { item.key = index; return item })
        })
    }
    addArea3ok = async (value) => {
        // console.log('确定添加：', value);
        let tempData = {};
        tempData.area2_id = parseInt(value.area012_id.split('-')[2]);
        tempData.area3_name = value.area3_name;
        let result = await this.insertArea3Info(tempData);
        if (result === 0) { message.success('添加成功'); }
        this.setState({
            addVisible: false
        })
        this.init();
    }
    addArea3cancel = () => {
        this.setState({ addVisible: false })
    }
    getArea3Info = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_3.id as area3_id,area_3.name as area3_name,area_2.id as area2_id,area_2.name as area2_name,area_1.id as area1_id,area_1.name as area1_name,area_0.id as area0_id,area_0.name as area0_name from area_3
            left join (select * from area_2 where effective = 1) area_2 on area_2.id = area_3.area2_id
            left join (select * from area_1 where effective = 1) area_1 on area_1.id = area_2.area1_id
            left join (select * from area_0 where effective = 1) area_0 on area_0.id = area_1.area0_id
            where area_3.effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    insertArea3Info = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO area_3 (name,area2_id,createdAt) VALUES ('${value.area3_name}','${value.area2_id}',
            '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}')`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea3Confirm = async (record) => {
        let result2 = await this.deleteArea3Info(record.area3_id);
        if (result2 === 0) { ///删除三级
            message.success('删除成功');
        }
        this.init();
    }
    deleteArea3Info = (area3_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_3 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE id = ${area3_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    updateArea3ok = async (value) => {
        let tempData = {};
        tempData.area2_id = parseInt(value.area012_id.split('-')[2]);
        tempData.area3_name = value.area3_name;
        let result = await this.updateArea3Info(tempData);
        if (result === 0) { message.success('修改成功'); }
        this.setState({
            updateVisible: false
        })
        this.init();
    }
    updateArea3cancel = () => {
        this.setState({ updateVisible: false })
    }
    updateArea3Info = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_3 SET name = '${value.area3_name}',area2_id = '${value.area2_id}',updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' 
            WHERE id = ${this.state.areaRecord.area3_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }

    render() {
        const columns = [
            {
                title: '所属片区',
                dataIndex: 'area0_name'
            },
            {
                title: '所属一级区域',
                dataIndex: 'area1_name'
            },
            {
                title: '所属二级位置',
                dataIndex: 'area2_name'
            }, {
                title: '巡检点及范围名称',
                dataIndex: 'area3_name'
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                align: 'center',
                render: (text, record) => {
                    return <div style={{ textAlign: 'center' }}>
                        <Popconfirm title={<div>确定要删除该第三级巡检点范围吗？</div>} onConfirm={() => { this.deleteArea3Confirm(record) }}>
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
                <div>
                    <Row>
                        <Col span={6}>
                            <Button onClick={() => { this.setState({ addVisible: true }) }} type="primary" style={{ marginBottom: 10 }}>
                                添加第三级巡检点范围
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
                    <AddArea3View visible={this.state.addVisible} onOk={this.addArea3ok} onCancel={this.addArea3cancel} />
                    <UpdateArea3View visible={this.state.updateVisible} onOk={this.updateArea3ok} onCancel={this.updateArea3cancel} area={this.state.areaRecord} />
                </div>
            </div>
        );
    }
}

export default EquipmentArea3View;