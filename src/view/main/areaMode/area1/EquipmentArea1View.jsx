import React, { Component } from 'react';
import HttpApi from '../../../util/HttpApi';
import { Popconfirm, Button, Divider, Table, Row, Col, message } from 'antd'
import AddArea1View from './AddArea1View';
import UpdateArea1View from './UpdateArea1View';
import moment from 'moment'

class EquipmentArea1View extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            addVisible: false,
            updateVisible: false,
            areaRecord: {},
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let area1Result = await this.getArea1Info();
        // console.log('area1Result:', area1Result);
        this.setState({ dataSource: area1Result.map((item, index) => { item.key = index; return item }) })
    }
    addArea1ok = async (value) => {
        // console.log('确认添加某个一级区域：', value);
        let result = await this.insertArea1Info(value);
        if (result === 0) { message.success('添加成功'); }
        this.setState({
            addVisible: false
        })
        this.init();
    }
    addArea1cancel = () => {
        this.setState({ addVisible: false })
    }
    deleteArea1Confirm = async (record) => {
        // console.log('确认删除某个一级区域', record);
        let result1 = await this.deleteArea1Info(record.area1_id);
        if (result1 === 0) {
            let area2idList = await this.getArea2ByArea1id(record.area1_id);
            // console.log('旗下包含的2级有这些：', area2idList);///这些二级都下被删除的一级下面
            let result2 = await this.deleteArea2Info(record.area1_id);
            if (result2 === 0) {
                let result3 = await this.deleteArea3Info(area2idList)///根据对应的二级id数组 去删除他们旗下的三级
                if (result3 === 0) {
                    message.success('删除成功');
                }
            }
        }
        this.init();
    }
    updateArea1ok = async (value) => {
        // console.log('确认修改某个一级区域', value);
        // return;
        let result = await this.updateArea1Info(value);
        if (result === 0) { message.success('修改成功'); }
        this.setState({
            updateVisible: false
        })
        this.init();
    }
    updateArea1cancel = () => {
        this.setState({ updateVisible: false })
    }
    getArea1Info = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.id as area1_id,area_1.name as area1_name,area0_id,area_0.name as area0_name from area_1
            left join (select * from area_0 where effective = 1) area_0 on area_0.id = area_1.area0_id
            where area_1.effective = 1 order by area_1.order_key`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    insertArea1Info = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO area_1 (name,area0_id,createdAt) VALUES ('${value.area1_name}',${value.area0_id},'${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}')`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    updateArea1Info = (value) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_1 SET name = '${value.area1_name}',area0_id = ${value.area0_id},updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE id = ${this.state.areaRecord.area1_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea1Info = (area1_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_1 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE id = ${area1_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    getArea2ByArea1id = (area1_id) => {
        return new Promise((resolve, reject) => {
            let sql = `select area_2.id,area_2.name from area_2 where area1_id = ${area1_id} `
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    deleteArea2Info = (area1_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_2 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE area1_id = ${area1_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea3Info = (area2idList) => {
        let area2idListStr = (area2idList.map((item) => { return item.id })).join(',')
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_3 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE area2_id in (${area2idListStr})`
            console.log('sql:::::', sql);
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    render() {
        const columns = [
            {
                title: '所属片区',
                dataIndex: 'area0_name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '名称',
                dataIndex: 'area1_name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                align: 'center',
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title={<div>确定要删除该一级巡检区域吗?<br />其下所包含的二三级区域都会统一删除</div>} onConfirm={() => { this.deleteArea1Confirm(record) }}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" type="primary" onClick={() => { this.setState({ updateVisible: true, areaRecord: record }) }}>修改</Button>
                    </div>
                )
            }
        ]
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button onClick={() => { this.setState({ addVisible: true }) }} type="primary" style={{ marginBottom: 10 }}>
                            添加一级巡检区域
                         </Button>
                    </Col>
                </Row>
                <Table
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                    }}
                />
                <AddArea1View visible={this.state.addVisible} onOk={this.addArea1ok} onCancel={this.addArea1cancel} />
                <UpdateArea1View visible={this.state.updateVisible} onOk={this.updateArea1ok} onCancel={this.updateArea1cancel} area={this.state.areaRecord} />
            </div>
        );
    }
}

export default EquipmentArea1View;