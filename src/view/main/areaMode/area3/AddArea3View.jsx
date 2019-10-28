import React, { Component } from 'react';
import { Modal, Form, Input, TreeSelect } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { transfromDataTo2level } from '../../../util/Tool'


var treeData = [];

/**
 * 添加area3的界面
 */
export default class AddArea3View extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
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
        // console.log('area12result:', area12result);
        let jsonList = transfromDataTo2level(area12result);
        treeData = jsonList
        this.forceUpdate();
    }
    getArea12options = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name from area_1
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
            where area_1.effective = 1
            order by area_1.id`
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
                title='添加三级设备范围'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area3Form ref={'area3FormRef'} />
            </Modal>
        );
    }
}



function AddArea3From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="所属上级位置:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area12_id', {
                rules: [{ required: true, message: '请选择所属的上级(精确到二级)' }]
            })(<TreeSelect
                treeNodeFilterProp="title"
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={treeData}
                placeholder="请选择所属的上级(精确到二级)"
            />)}
        </Form.Item>
        <Form.Item label="三级设备范围:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area3_name', {
                rules: [{ required: true, message: '请输入三级设备范围名称' }]
            })(<Input placeholder='请输入三级设备范围名称'></Input>)}
        </Form.Item>
    </Form>
}

const Area3Form = Form.create({ name: 'areaForm' })(AddArea3From)