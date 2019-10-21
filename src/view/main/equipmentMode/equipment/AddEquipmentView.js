import React, { Component } from 'react'
import { Modal, Form, Input, Select, TreeSelect } from 'antd'
import HttpApi from '../../../util/HttpApi'
import { transfromDataTo3level } from '../../../util/Tool'

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
                rules: [{ required: true, message: '请选择巡检点区域' }]
            })(<TreeSelect
                treeNodeFilterProp="title"
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={props.areas}
                placeholder="请选择所属具体设备范围"
            />)}
        </Form.Item>
        <Form.Item label="巡检点类型" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('type_id', {
                rules: [{ required: true, message: '请选择巡检点类型' }]
            })(<Select>{typeOptions}</Select>)}
        </Form.Item>
        <Form.Item label="NFC" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('nfc_id', {
                rules: [{ required: true, message: '请选择设备NFC' }]
            })(<Select>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点名称" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入巡检点名称' }]
            })(<Input></Input>)}
        </Form.Item>
        {/* <Form.Item label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remark', {
                rules: [{ required: false, message: '请输入设备备注' }]
            })(<Input></Input>)}
        </Form.Item> */}
    </Form>
}

const EquipmentForm = Form.create({ name: 'EquipmentForm' })(AddEquipmentForm)

/**
 * 添加设备界面
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
        let result = await HttpApi.getArea123Info();
        let resultList = transfromDataTo3level(result);
        // console.log('resultList', resultList);
        this.setState({ areas: resultList, types: typeResult, nfcs: nfcResult })
    }
    getTypeInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getDeviceTypeInfo({ effective: 1 }, res => {
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
            HttpApi.getNFCInfo({ type: 2, effective: 1 }, res => {
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
                console.log('OK：', values);
                // this.props.onOk(values);
                // this.refs.EquipmentFormRef.resetFields();
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