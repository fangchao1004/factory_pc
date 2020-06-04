import React, { Component } from 'react';
import HttpApi from '../../../util/HttpApi';
import { Popconfirm, Button, Divider, Table, Row, Col, message, Alert } from 'antd'
import AddArea0View from './AddArea0View';
import UpdateArea0View from './UpdateArea0View';
import moment from 'moment'

class EquipmentArea0View extends Component {
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
        let area0Result = await this.getArea0Info();
        // console.log('area0Result:', area0Result);
        this.setState({ dataSource: area0Result.map((item, index) => { item.key = index; return item }) })
    }
    addArea0ok = async (value) => {
        let result = await this.insertArea0Info(value.area0_name);
        if (result === 0) { message.success('添加成功'); }
        this.setState({ addVisible: false })
        this.init();
    }
    addArea0cancel = () => {
        this.setState({ addVisible: false })
    }
    deleteArea0Confirm = async (record) => {
        // console.log('确认删除某个厂区', record);
        let result0 = await this.deleteArea0Info(record.area0_id);
        if (result0 === 0) {
            let area1idList = await this.getArea1ByArea0id(record.area0_id);
            // console.log('旗下包含的1级有这些：', area1idList);///这些一级都下被删除的一级下面
            let result1 = await this.deleteArea1Info(record.area0_id);
            if (result1 === 0) {
                let area2idList = await this.getArea2ByArea1id(area1idList);
                // console.log('旗下包含的2级有这些：', area2idList);///这些二级都下被删除的一级下面
                let result2 = await this.deleteArea2Info(area1idList);
                if (result2 === 0) {
                    let result3 = await this.deleteArea3Info(area2idList)///根据对应的二级id数组 去删除他们旗下的三级
                    if (result3 === 0) {
                        message.success('删除成功');
                    }
                }
            }
        }
        this.init();
    }
    updateArea0ok = async (value) => {
        // console.log('确认修改某个厂区', value);
        let result = await this.updateArea0Info(value.area0_name);
        if (result === 0) { message.success('修改成功'); }
        this.setState({
            updateVisible: false
        })
        this.init();
    }
    updateArea0cancel = () => {
        this.setState({ updateVisible: false })
    }
    getArea0Info = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_0.id as area0_id,area_0.name as area0_name,deletable from area_0 where effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    getArea1ByArea0id = (area0_id) => {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.id,area_1.name from area_1 where area0_id = ${area0_id} `
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    getArea2ByArea1id = (area1idList) => {
        let area1idListStr = (area1idList.map((item) => { return item.id })).join(',')
        return new Promise((resolve, reject) => {
            let sql = `select area_2.id,area_2.name from area_2 where area1_id in (${area1idListStr})`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    deleteArea0Info = (area0_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_0 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE id = ${area0_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea1Info = (area0_id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_1 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE area0_id  = ${area0_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea2Info = (area1idList) => {
        let area1idListStr = (area1idList.map((item) => { return item.id })).join(',')
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_2 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE area1_id in (${area1idListStr})`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    deleteArea3Info = (area2idList) => {
        let area2idListStr = (area2idList.map((item) => { return item.id })).join(',')
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_3 SET effective = 0 ,updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE area2_id in (${area2idListStr})`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    insertArea0Info = (newAreaName) => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO area_0 (name,createdAt) VALUES ('${newAreaName}','${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}')`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    updateArea0Info = (newAreaName) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE area_0 SET name = '${newAreaName}',updatedAt = '${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' WHERE id = ${this.state.areaRecord.area0_id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }
    render() {
        const columns = [
            {
                title: '名称',
                dataIndex: 'area0_name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                align: 'center',
                render: (text, record) => {
                    return <div style={{ textAlign: 'center' }}>
                        {record.deletable === 1 ?
                            <><Popconfirm title={<div>确定要删除该厂区吗?<br />如果当前厂区已经正常使用切勿删除</div>} onConfirm={() => { this.deleteArea0Confirm(record) }} okText='确定删除' >
                                <Button size="small" type="danger">删除</Button>
                            </Popconfirm><Divider type="vertical" /></> : null}
                        <Button size="small" type="primary" onClick={() => { this.setState({ updateVisible: true, areaRecord: record }) }}>修改</Button>
                    </div>
                }
            }
        ]
        return (
            <div>
                <Alert message={'因左侧菜单栏会根据厂区数据动态生成, 所以当厂区数据发生变动时, 会触发页面刷新; 且请勿随意变动厂区数据; 因为数据安全问题默认不可删除, 如果要删除测试数据请联系管理员'} />
                <Row>
                    <Col span={6}>
                        <Button onClick={() => { this.setState({ addVisible: true }) }} type="primary" style={{ marginBottom: 16, marginTop: 16 }}>
                            添加厂区
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
                <AddArea0View visible={this.state.addVisible} onOk={this.addArea0ok} onCancel={this.addArea0cancel} />
                <UpdateArea0View visible={this.state.updateVisible} onOk={this.updateArea0ok} onCancel={this.updateArea0cancel} area={this.state.areaRecord} />
            </div>
        );
    }
}

export default EquipmentArea0View;