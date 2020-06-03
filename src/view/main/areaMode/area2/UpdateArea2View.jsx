import React, { Component } from 'react';
import { Modal, Form, Input, TreeSelect } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { translate } from '../../../util/Tool'
var treeData = [];

export default class UpdateArea2View extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        })
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let area12result = await this.getArea12options();
        treeData = translate(['area0_id', 'area1_id'], area12result, 2);
    }
    getArea12options = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_0.id as area0_id , area_0.name as area0_name, area_1.id as area1_id , area_1.name as area1_name
            from area_0
            left join (select * from area_1 where effective = 1)area_1 on area_0.id = area_1.area0_id
            where area_0.effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.area2FormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.area2FormRef.validateFields((error, values) => {
            if (!error) {
                this.props.onOk(values);
                this.refs.area2FormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal
                title='修改区域位置'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area2Form ref={'area2FormRef'} area={this.props.area} treeData={treeData} />
            </Modal>
        );
    }
}

function updateArea2From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="所属一级区域:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area01_id', {
                initialValue: props.area.area0_id + '-' + props.area.area1_id,
                rules: [{ required: true, message: '请选择所属的一级区域' }]
            })(<TreeSelect
                treeNodeFilterProp="title"
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={props.treeData}
                placeholder="请选择所属的上级(精确到第一级)"
            />)}
        </Form.Item>
        <Form.Item label="二级巡检位置:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area2_name', {
                initialValue: props.area.area2_name,
                rules: [{ required: true, message: '请输入二级巡检位置名称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const Area2Form = Form.create({ name: 'areaForm' })(updateArea2From)
