import React, { Component } from 'react';
import { Col, Row, Button, Select, InputNumber, Popconfirm, message, Input } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi'
const storage = window.localStorage;
const { Option } = Select;
var result = [];
/**
 * 发起申请消费-界面
 */
class ApproveTrans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            foods: [],
            peopleNum: 2,
            selectfoods: ['2'],///默认选择2 午餐
            remarkText: null,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        result = await this.getFoodsInfo();
        let foods = result.map((item, index) => { return <Option key={item.id}> {item.type}--{item.price} </Option> })
        this.setState({ foods })
    }
    getFoodsInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from foods`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    applyHandler = () => {
        if (this.state.remarkText === null || this.state.remarkText === '') { message.error('请说明具体事由'); return; }
        // console.log('applyHandler', this.state.selectfoods, this.state.peopleNum, moment().format('YYYY-MM-DD'), JSON.parse(storage.getItem('userinfo')).name);
        if (this.state.selectfoods.length === 0) { message.error('请选择消费类型'); return }
        let total_price = this.getTotalPrice(this.state.selectfoods, result, this.state.peopleNum);
        let apply_id = JSON.parse(storage.getItem('userinfo')).id;
        let apply_time = moment().format('YYYY-MM-DD HH:mm:ss');
        let type = this.state.selectfoods.join(',')
        let sql = `insert into applyRecords(total_price,apply_id,apply_time,type,people_count,remark) values (${total_price},${apply_id},'${apply_time}','${type}',${this.state.peopleNum},'${this.state.remarkText}') `;
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('申请提交成功') } else { message.error('申请提交失败') }
        })
    }
    getTotalPrice = (selectfoods, result, peopleNum) => {
        let count = 0;
        selectfoods.forEach((item) => {
            result.forEach((ele) => {
                if (item + '' === ele.id + '') {
                    count = count + ele.price
                }
            })
        })
        return count * peopleNum;
    }
    render() {
        return (
            <div style={{ padding: 10, backgroundColor: '#FFFFFF' }}>
                <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>发起申请</h2>
                <div style={{ borderStyle: 'solid', borderColor: "#DDDDDD", padding: 20, paddingTop: 30, borderWidth: 1, borderRadius: 4, marginTop: 10 }}>
                    <Row>
                        <Col span={12}>
                            <Row>
                                <Col span={6}>
                                    消费类型:
                                </Col>
                                <Col span={18}>
                                    <Select
                                        mode="multiple"
                                        placeholder="请选择消费类型"
                                        value={this.state.selectfoods}
                                        onChange={(v) => {
                                            this.setState({ selectfoods: v })
                                        }}
                                        style={{ width: '70%' }}
                                    >
                                        {this.state.foods}
                                    </Select>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={6}>
                                    人数:
                                </Col>
                                <Col span={18}>
                                    <InputNumber min={1} max={100} value={this.state.peopleNum} onChange={(v) => {
                                        this.setState({ peopleNum: v ? v : 2 })
                                    }} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                        <Col span={12}>
                            <Row>
                                <Col span={6}>
                                    日期:
                            </Col>
                                <Col span={18}>
                                    {moment().format('YYYY-MM-DD')}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={6}>
                                    申请人:
                            </Col>
                                <Col span={18}>
                                    {JSON.parse(storage.getItem('userinfo')).name}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                        <Col span={12}>
                            <Row>
                                <Col span={6}>
                                    具体事由:
                            </Col>
                                <Col span={18}>
                                    <Input style={{ width: '70%' }} placeholder="说明相关情况" value={this.state.remarkText} onChange={(e) => { this.setState({ remarkText: e.target.value }) }} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Popconfirm title="确认检查无误-要提交申请吗?" onConfirm={this.applyHandler}>
                        <Button size="small" type={'danger'} style={{ marginTop: 10 }} >提交申请</Button>
                    </Popconfirm>
                </div>
            </div>
        );
    }
}

export default ApproveTrans;