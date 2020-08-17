import React, { Component } from 'react'
import { Modal, Form, Input, Select, TreeSelect } from 'antd'
import HttpApi from '../../../util/HttpApi'
import { transfromDataTo3level, sortByOrderKey2 } from '../../../util/Tool'

/**
 * 添加员工的表单界面
 *
 * @param {*} props
 * @returns
 */
function AddEquipmentForm(props) {
    const { getFieldDecorator } = props.form
    const typeOptions = props.types.map(type => <Select.Option value={type.id} key={type.id}>{type.name}</Select.Option>)
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)

    return <Form>
        <Form.Item label="区域" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('area_id', {
                rules: [{ required: true, message: '请选择巡检点区域(精确到第三级)' }]
            })(<TreeSelect
                treeNodeFilterProp="title"
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={props.areas}
                placeholder="请选择巡检点区域(精确到第三级)"
            />)}
        </Form.Item>
        <Form.Item label="巡检点类型" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('type_id', {
                rules: [{ required: true, message: '请选择巡检点类型' }]
            })(<Select showSearch={true} filterOption={(inputValue, option) => { return option.props.children.indexOf(inputValue) !== -1 }} >{typeOptions}</Select>)}
        </Form.Item>
        <Form.Item label="NFC" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('nfc_id', {
                rules: [{ required: true, message: '请选择巡检点NFC' }]
            })(<Select showSearch={true} filterOption={(inputValue, option) => { return option.props.children.indexOf(inputValue) !== -1 }}>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点名称" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入巡检点名称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const EquipmentForm = Form.create({ name: 'EquipmentForm' })(AddEquipmentForm)

/**
 * 添加巡检点界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default class AddEquipmentView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            areas: [],
            types: [],
            nfcs: []
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
        let typeResult = await this.getTypeInfo();
        let nfcResult = await this.getNfcInfo();
        let result = await HttpApi.getArea123Info(this.props.id);
        let resultList = transfromDataTo3level(result, false);
        this.setState({ areas: sortByOrderKey2(resultList), types: typeResult, nfcs: nfcResult })
    }
    getTypeInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getDeviceTypeInfo({ effective: 1, area0_id: this.props.id }, res => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result)
            })
        })
    }
    getNfcInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from nfcs where type = 2 and effective = 1
            order by id desc`
            HttpApi.obs({ sql }, res => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result)
            })
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.EquipmentFormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.EquipmentFormRef.validateFields((error, values) => {
            if (!error) {
                // console.log('OK：', values);
                this.props.onOk(values);
                this.refs.EquipmentFormRef.resetFields();
            }
        })
    }
    render() {
        return <div>
            <Modal
                centered
                title="添加巡检点"
                onOk={this.onOkHandler}
                onCancel={this.onCancelHandler}
                visible={this.state.visible}
            >
                <EquipmentForm ref={'EquipmentFormRef'} areas={this.state.areas} types={this.state.types} nfcs={this.state.nfcs}></EquipmentForm>
            </Modal >
        </div>
    }
}