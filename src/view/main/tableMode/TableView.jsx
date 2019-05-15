import React, { Component } from 'react';
import { Row, Col, Card, Button, Tag, Icon, Popconfirm, Empty, Modal } from 'antd'
import HttpApi from '../../util/HttpApi';
import SampleViewTool from '../../util/SampleViewTool';

var TagColor = ['magenta', 'orange', 'green', 'blue', 'purple', 'geekblue', 'cyan'];
var sample_data = [];
var device_type_data = [];
/**
 * 表单模版展示(卡片)界面--（支持修改和删除）
 */
class TableView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            modalvisible: false,
            sampleView: null
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
    getSampleData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getSampleInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getDeviceTypeData = () => {
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
                        <Popconfirm title="确定删除吗?" onConfirm={() => this.onConfirmDeleteHandler(element)}>
                            {/* <Button type='primary' loading={this.state.uploadLoading}>确定保存</Button> */}
                            <Icon type="delete" theme="twoTone" style={{ fontSize: 20 }} />
                        </Popconfirm>

                    </div>)}
                        bordered={true} style={{ marginTop: 16, height: 125, borderRadius: 5 }}>
                        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', width: '102%' }}>
                            <div>
                                {/* <Button type='primary' onClick={() => { console.log(element); }}>修改</Button> */}
                                <Button style={{ marginLeft: 20 }} type='primary' onClick={() => { this.openModalHandler(element) }}>详情</Button>
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
    onConfirmDeleteHandler = (element) => {
        HttpApi.removeSampleInfo({ id: element.id }, (res) => {
            if (res.data.code === 0) {
                this.initHandler();
            }
        })
    }
    openModalHandler = (element) => {
        // console.log('查看详情：',element);
        let titleObj = {};
        titleObj.key = '0';
        titleObj.title_name = '表头';
        titleObj.type_id = '7';
        titleObj.default_values = element.device_type_id + ''; ///表头的value值
        titleObj.extra_value = element.table_name;
        let dataArr = JSON.parse(element.content);
        let newArr = [titleObj, ...dataArr];///将数据结构进行转化
        this.setState({
            modalvisible: true
        })
        let sample = SampleViewTool.renderTable(newArr);
        this.setState({
            sampleView: sample
        })
    }

    handleCancel = () => {
        this.setState({
            modalvisible: false
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
                <Modal
                    // confirmLoading={this.state.modalvisible}
                    width={450}
                    hight={500}
                    title={<div><span>效果预览</span><span style={{ fontSize: 10, color: '#AAAAAA', marginLeft: 40 }}>实际效果以移动端显示为准</span></div>}
                    visible={this.state.modalvisible}
                    // onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={
                        <div>
                            <Button type='primary' onClick={this.handleCancel}>确定</Button>
                        </div>
                    }
                >
                    {this.state.sampleView}
                </Modal>
            </div>
        );
    }
}

export default TableView;