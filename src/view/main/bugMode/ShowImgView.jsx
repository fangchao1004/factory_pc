import React, { Component } from 'react';
import { Drawer, Spin } from 'antd';
import { Testuri } from '../../util/HttpApi'

/**
 * 图片展示抽屉界面
 */
class ShowImgView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            showLoading: true,///现实loading图片
            imguuid: null,
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal,
            showLoading: nextProps.showLoading,
            imguuid: nextProps.imguuid,
        })
    }

    render() {
        return (
            <Drawer
                title="查看图片"
                placement="left"
                visible={this.state.showModal}
                onClose={() => { this.props.cancel(); }}
                width={450}
                bodyStyle={{ padding: 10 }}
            >
                <div style={{ textAlign: 'center', display: this.state.showLoading ? 'block' : 'none' }}><Spin tip='努力加载中。。。' /></div>
                <img alt='' src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} style={{ width: 430, height: 430 / 3 * 4, display: this.state.showLoading ? 'none' : 'block' }}
                    onLoad={() => { this.setState({ showLoading: false }) }} />
            </Drawer>
        );
    }
}

export default ShowImgView;