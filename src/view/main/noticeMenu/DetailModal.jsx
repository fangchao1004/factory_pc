import React, { Component } from 'react';
import { Modal, Descriptions, Tooltip, Tag } from 'antd';
import { omitTextLength } from '../../util/Tool';

class DetailModal extends Component {
    constructor(props) {
        super(props);
        this.state = { visible: false, selectItem: null, engineerVisible: false }
    }
    componentWillReceiveProps(nextProps) {
        if (this.state.visible !== nextProps.visible) {
            this.setState({
                visible: nextProps.visible,
                selectItem: nextProps.item
            })
        }
    }
    render() {
        return (
            <Modal
                destroyOnClose
                maskClosable={false}
                width={800}
                visible={this.state.visible}
                footer={null}
                onCancel={() => { this.props.onCancel() }}
            >
                <Descriptions bordered title="缺陷信息" size={'small'}>
                    <Descriptions.Item label="编号">{this.state.selectItem ? this.state.selectItem.id : ''}</Descriptions.Item>
                    <Descriptions.Item label="区域">
                        <Tooltip title={this.state.selectItem ? this.state.selectItem.area_remark : ''}>
                            {this.state.selectItem ? omitTextLength(this.state.selectItem.area_remark, 10) : ''}
                        </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="登记时间">{this.state.selectItem ? this.state.selectItem.checkedAt : ''}</Descriptions.Item>
                    <Descriptions.Item label="上传者">{this.state.selectItem ? this.state.selectItem.user_name : ''}</Descriptions.Item>
                    <Descriptions.Item label="状态">{this.state.selectItem ? <Tag color='blue'>{this.state.selectItem.tag_des}</Tag> : ''}</Descriptions.Item>
                    <Descriptions.Item label="等级">{this.state.selectItem ? this.state.selectItem.buglevel + '级' : ''}</Descriptions.Item>
                    <Descriptions.Item label="内容">{this.state.selectItem ? JSON.parse(this.state.selectItem.content).text : ''}</Descriptions.Item>
                </Descriptions>
            </Modal >
        );
    }
}

export default DetailModal;