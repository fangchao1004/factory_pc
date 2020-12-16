import React, { Component } from 'react';
import { Row, Col, Card, Button, Tag, Icon, Popconfirm, Empty, Modal, message, Input } from 'antd'
import HttpApi from '../../util/HttpApi';
import SampleViewTool from '../../util/SampleViewTool';
import ChangeTableView from './ChangeTableView';
import { omitTextLength } from '../../util/Tool'
const { Search } = Input;
var TagColor = ['magenta', 'orange', 'green', 'blue', 'purple', 'geekblue', 'cyan'];
var sample_data = [];
var device_type_data = [];
var dataSourceCopy = [];
/**
 * 表单模版展示(卡片)界面--（仅支持删除）
 */
class TableView extends Component {
    constructor(props) {
        super(props);
        console.log('TableView:', props)
        this.state = {
            dataSource: [],
            modalvisible: false,
            sampleView: null,
            drawerVisible: false,///修改表单界面是否显示
            currentTable: null,///当前选中的table数据
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        sample_data.length = device_type_data.length = 0;
        sample_data = await this.getSampleWithSchemeInfo();
        this.setState({
            dataSource: sample_data.map((item, index) => { item.key = index; return item }).reverse()
        }, () => {
            dataSourceCopy = JSON.parse(JSON.stringify(this.state.dataSource))
        })
    }
    getSampleWithSchemeInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getSampleWithSchemeInfo({ area0_id: this.props.id }, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
    }
    renderEachCard = () => {
        let cellsArr = [];
        this.state.dataSource.forEach((element, index) => {
            cellsArr.push(
                <Col span={8} key={element.key}>
                    <Card
                        hoverable={true}
                        title={(<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <div style={{ width: '70%' }}>{omitTextLength(element.table_name, 15)}</div>
                            <Popconfirm title="确定删除吗?" onConfirm={() => this.onConfirmDeleteHandler(element)}>
                                <div><Icon type="delete" theme="twoTone" style={{ fontSize: 20, cursor: "pointer" }} /></div>
                            </Popconfirm></div>)}
                        bordered={true}
                        style={{ marginTop: 10, height: 170, borderRadius: 5 }}>
                        <div>
                            <Tag color={element.device_type_name ? TagColor[index % TagColor.length] : '#f00'} style={{ height: 25 }}>
                                <span style={{ fontSize: 15 }}>{element.device_type_name ? omitTextLength(element.device_type_name, 18) : '该设备类型可能被删除；请删除该表单'}</span>
                            </Tag>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', width: '102%', marginTop: 10 }}>
                            <div>
                                <Button icon={'edit'} size="small" type='ghost' onClick={() => {
                                    HttpApi.getDeviceInfo({ effective: 1, type_id: element.device_type_id, status: 2 }, (res) => {
                                        if (res.data.code === 0) {
                                            if (res.data.data.length > 0) { message.error('使用该表单模版的某类巡检点中，某些巡检点还有未消除的缺陷，请消缺后再尝试变动表单', 5); return }
                                            else {
                                                this.setState({ drawerVisible: true, currentTable: element })
                                            }
                                        }
                                    })
                                }}>修改</Button>
                                <Button icon={'search'} size="small" style={{ marginLeft: 20 }} type='primary' onClick={() => { this.openModalHandler(element) }}>详情</Button>
                            </div>
                        </div>

                    </Card>
                </Col>
            )
        });
        return cellsArr
    }
    onConfirmDeleteHandler = (element) => {
        ///要先判断用这个表单的某类设备中，是否还有是故障状态的。则说明该设备还有缺陷未消除，则不允许删除或修改表单
        HttpApi.getDeviceInfo({ effective: 1, type_id: element.device_type_id, status: 2 }, (res) => {
            if (res.data.code === 0) {
                if (res.data.data.length > 0) { message.error('使用该表单模版的某类巡检点中，某些巡检点还有未消除的缺陷，请消缺后再尝试变动表单', 5); return }
                else {
                    HttpApi.obs({ sql: `update samples set effective = 0 where id = ${element.id} ` }, (res) => {
                        if (res.data.code === 0) {
                            let sql = `update sche_cyc_atm_map_sample set effective = 0 where sample_id = ${element.id}`
                            HttpApi.obs({ sql }, () => {
                                if (res.data.code === 0) {
                                    message.success('删除表单成功');
                                    this.init();
                                }
                            })

                        }
                    })
                }
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
            <div style={{ backgroundColor: '#FFFFFF', padding: 10 }}>
                <div style={{ textAlign: 'right' }}>
                    <Search size="small" style={{ width: 400 }} placeholder="名称模糊查询" enterButton
                        onChange={(e) => {
                            if (e.target.value === '') { this.init(); }
                        }}
                        onSearch={(value) => {
                            if (value.length > 0) {
                                let searchResult = dataSourceCopy.filter((item) => {
                                    return item.table_name.indexOf(value) !== -1
                                })
                                this.setState({ dataSource: searchResult })
                            }
                        }}
                    />
                </div>
                {this.state.dataSource.length === 0 ?
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                    <Row gutter={10}>
                        {this.renderEachCard()}
                    </Row>
                }
                <Modal
                    centered
                    width={450}
                    hight={500}
                    title={<div><span>效果预览</span><span style={{ fontSize: 10, color: '#AAAAAA', marginLeft: 40 }}>实际效果以移动端显示为准</span></div>}
                    visible={this.state.modalvisible}
                    onCancel={this.handleCancel}
                    footer={
                        <div>
                            <Button type='primary' onClick={this.handleCancel}>确定</Button>
                        </div>
                    }
                >
                    {this.state.sampleView}
                </Modal>
                <ChangeTableView {...this.props} data={this.state.currentTable} visible={this.state.drawerVisible} onClose={() => { this.setState({ drawerVisible: false }) }} onOk={() => { this.setState({ drawerVisible: false }); this.init(); message.success('刷新数据') }} />
            </div>
        );
    }
}

export default TableView;