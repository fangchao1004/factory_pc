import React, { Component } from 'react'
import { Modal, Form, Input, Select, TreeSelect } from 'antd'
import HttpApi from '../../../util/HttpApi'
import { transfromDataTo3level } from '../../../util/Tool'


/**
 * 更新巡检点的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateEquipmentForm(props) {
    // console.log('props.device:', props.device);
    const { getFieldDecorator } = props.form
    const typeOptions = props.types.map(type => <Select.Option value={type.id} key={type.id}>{type.name}</Select.Option>)
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)
    const statusOptions = [{ id: 1, lab: '正常' }, { id: 2, lab: '异常' }, { id: 3, lab: '待检' }].map(item => <Select.Option value={item.id} key={item.id}>{item.lab}</Select.Option>)
    // const switchOptions = [{ value: 0, lab: '停运' }, { value: 1, lab: '运行' }].map(item => <Select.Option value={item.value} key={item.value}>{item.lab}</Select.Option>)
    return <Form>
        <Form.Item label="区域" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('area_id', {
                initialValue: props.device.area_id,
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
                initialValue: props.device.type_id,
                rules: [{ required: true, message: '请选择巡检点类型' }]
            })(<Select showSearch={true} filterOption={(inputValue, option) => { return option.props.children.indexOf(inputValue) !== -1 }}>{typeOptions}</Select>)}
        </Form.Item>
        <Form.Item label="NFC" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('nfc_id', {
                initialValue: props.device.nfc_id,
                rules: [{ required: true, message: '请选择巡检点NFC' }]
            })(<Select showSearch={true} filterOption={(inputValue, option) => { return option.props.children.indexOf(inputValue) !== -1 }}>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点名称" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('name', {
                initialValue: props.device.name,
                rules: [{ required: true, message: '请输入巡检点名称' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="巡检点状态" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('status', {
                initialValue: props.device.status,
                rules: [{ required: true, message: '请选择巡检点状态' }]
            })(<Select>{statusOptions}</Select>)}
        </Form.Item>
        {/* <Form.Item label="运/停切换" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('switch', {
                initialValue: props.device.switch,
                rules: [{ required: true, message: '请选择功能切换' }]
            })(<Select>{switchOptions}</Select>)}
        </Form.Item> */}
    </Form>
}

const EquipmentForm = Form.create({ name: 'EquipmentForm' })(UpdateEquipmentForm)

/**
 * 更新巡检点界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default class UpdateEquipmentView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            areas: [],
            types: [],
            nfcs: [],
            device: {},
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible,
            device: nextProps.device
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
        // console.log('resultList', resultList);
        this.setState({ areas: resultList, types: typeResult, nfcs: nfcResult })
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
                // console.log('OK：', values);
                this.props.onOk(values);
                this.refs.EquipmentFormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal centered title="修改巡检点"
                onOk={this.onOkHandler}
                onCancel={this.onCancelHandler}
                visible={this.state.visible}
            >
                <EquipmentForm ref='EquipmentFormRef' areas={this.state.areas} types={this.state.types} nfcs={this.state.nfcs} device={this.state.device}></EquipmentForm>
            </Modal>
        )
    }
}