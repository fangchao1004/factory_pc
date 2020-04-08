import React, { Component } from 'react';
import HttpApi, { Testuri } from '../../../util/HttpApi';
import { Modal, Timeline, Tag, Empty, Button } from 'antd';
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
        }
    }
    init = async (bugId) => {
        let stepData = await this.getStepData(bugId);
        // console.log('stepData:', stepData)
        this.setState({
            stepList: stepData
        })
    }
    getStepData = (bugId) => {
        return new Promise((resolve, reject) => {
            let sql = `select bug_step_log.*,users.name as user_name,bug_tag_status.des as tag_des,majors.name as major_name,bug_freeze_status.des as freeze_des from bug_step_log 
            left join (select * from users where effective = 1) users on users.id = bug_step_log.user_id
            left join (select * from majors where effective = 1) majors on majors.id = bug_step_log.major_id
            left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = bug_step_log.tag_id
            left join (select * from bug_freeze_status where effective = 1) bug_freeze_status on bug_freeze_status.id = bug_step_log.freeze_id
            where bug_step_log.effective = 1 and bug_step_log.bug_id = ${bugId}`
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.bugId && nextProps.visible)
            this.init(nextProps.bugId);
        this.setState({
            visible: nextProps.visible
        })
    }
    render() {
        return (
            <Modal
                title='日志记录'
                visible={this.state.visible}
                onCancel={() => { this.props.onCancel(); }}
                footer={null}
            >
                <div style={{ height: this.state.stepList.length > 0 ? 400 : 200, overflow: "scroll" }}>
                    {this.state.stepList.length > 0 ?
                        <Timeline style={{ marginTop: 10 }} >
                            {this.state.stepList.map((item, index) => {
                                return <Timeline.Item key={index}>
                                    <Tag color={'#1690FF'}>{item.createdAt}</Tag>
                                    <Tag color={'#FF9900'} >{item.user_name}</Tag>
                                    {item.tag_des ? <Tag color={'blue'}>{item.tag_des} {item.freeze_des ? '- ' + item.freeze_des : (item.major_name ? '- ' + item.major_name : '')}</Tag> : null}
                                    <div>{item.imgs ? item.imgs.split(',').map((img, i) => <Button style={{ marginTop: 4 }} size='small' type='link' key={i} onClick={() => {
                                        this.setState({ imguuid: img })
                                    }}>图片{i + 1}</Button>) : ''}</div>
                                    {item.remark ? <div style={{ color: '#FF9900', marginTop: item.imgs ? 5 : 10 }}>{'备注: ' + item.remark}</div> : ''}
                                </Timeline.Item>
                            })}
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


