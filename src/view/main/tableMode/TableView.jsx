import React, { Component } from 'react';
import { Row, Col, Card, Button, Tag, Icon, Popconfirm, Empty } from 'antd'
import HttpApi from '../../util/HttpApi';

var TagColor = ['magenta', 'orange', 'green', 'blue', 'purple', 'geekblue', 'cyan'];
var sample_data = [];
var device_type_data = [];
/**
 * 表单模版展示界面--（支持修改和删除）
 */
class TableView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: []
        }
    }
    componentDidMount() {
        this.initHandler();
    }
    initHandler = async () => {
        sample_data.length = device_type_data.length = 0;
        sample_data = await this.getSampleData();
        device_type_data = await this.getDeviceTypeData();
        let newData = await this.transfromConstruct();
        this.setState({
            dataSource: newData
        })
    }
    getSampleData = async () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getSampleInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getDeviceTypeData = async () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getDeviceTypeInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    transfromConstruct = async () => {
        for (const item of sample_data) {
            item.key = item.id + ""
            item.device_type_name = await this.findTypeName(item)
        }
        return sample_data
    }
    findTypeName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            device_type_data.forEach((item) => {
                if (item.id === deviceItem.device_type_id) {
                    resolve(item.name)
                }
            })
        })
        return p;
    }

    renderEachCard = () => {
        let cellsArr = [];
        this.state.dataSource.forEach((element, index) => {
            cellsArr.push(
                <Col span={8} key={element.key}>
                    <Card title={(<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <span>{element.table_name}</span>
                        <Popconfirm title="确定删除吗?" onConfirm={() => this.onConfirmHandler(element)}>
                            {/* <Button type='primary' loading={this.state.uploadLoading}>确定保存</Button> */}
                            <Icon type="delete" theme="twoTone" style={{ fontSize: 20 }} />
                        </Popconfirm>

                    </div>)}
                        bordered={true} style={{ marginTop: 16, height: 125, borderRadius: 10, borderWidth: 2 }}>
                        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', width: '102%' }}>
                            <div>
                                <Button type='primary' onClick={() => { console.log(element); }}>修改</Button>
                                <Button style={{ marginLeft: 20 }} type='primary' onClick={() => { console.log(element); }}>详情</Button>
                            </div>
                            <Tag color={TagColor[index]} style={{ height: 25 }}>
                                <span style={{ fontSize: 15 }}>{element.device_type_name}</span>
                            </Tag>
                        </div>
                    </Card>
                </Col>
            )
        });
        return cellsArr
    }
    onConfirmHandler = (element) => {
        HttpApi.removeSampleInfo({ id: element.id }, (res) => {
            if (res.data.code === 0) {
                this.initHandler();
            }
        })
    }
    render() {
        return (
            <div>
                {this.state.dataSource.length === 0 ?
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                    <div style={{ padding: 16, paddingTop: 0 }}>
                        <Row gutter={16}>
                            {this.renderEachCard()}
                        </Row>
                    </div>}
            </div>
        );
    }
}

export default TableView;