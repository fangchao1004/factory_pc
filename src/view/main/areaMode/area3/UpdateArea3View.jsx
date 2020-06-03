import React, { Component } from 'react';
import { Modal, Form, Input, TreeSelect } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { translate } from '../../../util/Tool'
var treeData = [];
export default class UpdateArea3View extends Component {
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
        let area012result = await this.getArea012options();
        treeData = translate(['area0_id', 'area1_id', 'area2_id'], area012result, 3);
    }
    getArea012options = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_0.id as area0_id,area_0.name as area0_name,area_1.id as area1_id,area_1.name as area1_name,area_2.id as area2_id,area_2.name as area2_name
            from area_0
            left join (select * from area_1 where effective = 1)area_1 on area_0.id = area_1.area0_id
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
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
        this.refs.area3FormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.area3FormRef.validateFields((error, values) => {
            if (!error) {
                this.props.onOk(values);
                this.refs.area3FormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal
                title='修改三级巡检点范围'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area3Form ref={'area3FormRef'} area={this.props.area} treeData={treeData} />
            </Modal>
        );
    }
}

function updateArea3From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="所属上级位置:" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('area012_id', {
                initialValue: props.area.area0_id + '-' + props.area.area1_id + '-' + props.area.area2_id,
                rules: [{ required: true, message: '请选择所属的上级(精确到第二级)' }]
            })(<TreeSelect
                treeNodeFilterProp="title"
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={props.treeData}
                placeholder="请选择所属的上级(精确到第二级)"
            />)}
        </Form.Item>
        <Form.Item label="第三级巡检点范围:" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('area3_name', {
                initialValue: props.area.area3_name,
                rules: [{ required: true, message: '请输入第三级巡检点范围名称' }]
            })(<Input placeholder='请输入第三级巡检点范围名称'></Input>)}
        </Form.Item>
    </Form>
}

const Area3Form = Form.create({ name: 'areaForm' })(updateArea3From)
