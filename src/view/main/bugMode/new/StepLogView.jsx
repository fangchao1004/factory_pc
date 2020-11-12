import React, { Component } from 'react';
import HttpApi, { Testuri } from '../../../util/HttpApi';
import { Modal, Timeline, Empty } from 'antd';
import { RenderTimeLine } from '../../homePageMode/workTable/BugInfoPanelPage';
/**
 * 缺陷处理日志界面
 */
export default class StepLogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            stepList: [],
            imguuid: null,
            record: {},
        }
    }
    init = async (param) => {
        this.setState({
            visible: param.visible,
        })
        if (param.visible) {
            let res = await HttpApi.getBugStepLogList(param.record.id);
            if (res.data.code === 0) {
                let newList = [...param.firstStep, ...res.data.data]; ///合并
                // console.log('newList:', newList)
                this.setState({
                    stepList: newList
                })
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        let firstStep = [{ createdAt: nextProps.record.checkedAt, user_name: nextProps.record.user_name, tag_des: '上报缺陷' }];
        let param = { visible: nextProps.visible, record: nextProps.record, firstStep }
        this.init(param);
    }
    changeNumToStr = (num) => {
        let str = '';
        switch (num) {
            case 1:
                str = '一级'
                break;
            case 2:
                str = '二级'
                break;
            case 3:
                str = '三级'
                break;
            default:
                break;
        }
        return str
    }
    render() {
        return (
            <Modal
                destroyOnClose
                width={600}
                title='缺陷处理记录'
                visible={this.state.visible}
                onCancel={() => { this.props.onCancel(); }}
                footer={null}
            >
                <div style={{ height: this.state.stepList.length > 0 ? 400 : 200, overflow: "scroll" }}>
                    {this.state.stepList.length > 0 ?
                        <Timeline style={{ marginTop: 10 }} >
                            {RenderTimeLine(this.state.stepList, (imguuid) => { this.setState({ imguuid }) })}
                        </Timeline> : <Empty />}
                </div>
                <Modal visible={this.state.imguuid !== null} destroyOnClose centered
                    width={410} bodyStyle={{ textAlign: 'center', padding: 5, margin: 0 }} footer={null} onCancel={() => {
                        this.setState({ imguuid: null })
                    }}>
                    <img alt='' style={{ width: 400 }} src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} />
                    {/* <img alt='' style={{ width: 400 }} src={'http://ixiaomu.cn:3008/get_jpg?uuid=' + this.state.imguuid} /> */}
                </Modal>
            </Modal>
        );
    }
}


