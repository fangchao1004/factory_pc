import React, { Component } from 'react';
import HttpApi, { Testuri } from '../../../util/HttpApi';
import { Modal, Timeline, Tag, Empty } from 'antd';
import { originStatus } from '../../../util/AppData'
import moment from 'moment'
import { getDuration } from '../../../util/Tool';
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
    init = async (bugId) => {
        let result = await this.getStepData(bugId);
        let newList = [...this.state.stepList, ...result]; ///合并
        this.setState({
            stepList: newList
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
    getStepData = (bugId) => {
        return new Promise((resolve, reject) => {
            let sql = `select bug_step_log.*,users.name as user_name,bsd.duration_time as bug_next_status_duration,bug_tag_status.bug_next_status,bug_tag_status.des as tag_des,majors.name as major_name,bug_freeze_status.des as freeze_des from bug_step_log 
            left join (select * from users where effective = 1) users on users.id = bug_step_log.user_id
            left join (select * from majors where effective = 1) majors on majors.id = bug_step_log.major_id
            left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = bug_step_log.tag_id
            left join (select * from bug_freeze_status where effective = 1) bug_freeze_status on bug_freeze_status.id = bug_step_log.freeze_id
            left join (select * from bug_status_duration where effective = 1) bsd on bsd.status = bug_tag_status.bug_next_status
            where bug_step_log.effective = 1 and bug_step_log.bug_id = ${bugId} order by bug_step_log.id`
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
        this.setState({
            record: nextProps.record,
            visible: nextProps.visible,
            stepList: [{ createdAt: nextProps.record.checkedAt, user_name: nextProps.record.user_name, tag_des: '上报缺陷' }] ///添加上上报缺陷的信息
        }, () => {
            if (nextProps.record.id && nextProps.visible) {
                this.init(nextProps.record.id)
            }
        })

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
    changeStatusToStr = (record) => {
        let str = '/'
        originStatus.forEach((item) => {
            if (item.value === record.status) { str = item.text }
        })
        if (record.status === 5) { str = record.bug_freeze_des }
        return str
    }
    getLineRender = () => {
        let resultList = [];
        this.state.stepList.forEach((item, index) => {
            let createdAtTime = moment(item.createdAt).toDate().getTime();
            let preCreatedAtTime = index > 0 ? moment(this.state.stepList[index - 1].createdAt).toDate().getTime() : 0
            let duration = index > 0 ? this.state.stepList[index - 1].bug_next_status_duration : 0 ///设定时间
            let color = 'green'
            if (index > 0 && (createdAtTime - preCreatedAtTime) > duration) {
                color = 'red'
            }
            resultList.push(<Timeline.Item key={index}>
                <Tag color={'#1690FF'}>{item.createdAt}</Tag>
                <Tag color={'#FF9900'} >{item.user_name}</Tag>
                {item.tag_des ? <Tag color={'blue'}>{item.tag_des} {item.freeze_des ? '- ' + item.freeze_des : (item.major_name ? '- ' + item.major_name : '')}</Tag> : null}
                {index > 0 && this.state.stepList[index - 1].bug_next_status === 3 ? <Tag color={color} >{"用时:" + getDuration(createdAtTime - preCreatedAtTime)}</Tag> : null}
                <div>{item.imgs ? item.imgs.split(',').map((img, i) =>
                    <img alt='' style={{ width: 50, height: 50, marginTop: 10, marginRight: 10 }} key={img} src={Testuri + 'get_jpg?uuid=' + img}
                        onClick={() => {
                            this.setState({ imguuid: img })
                        }}
                    />
                )
                    : ''}</div>
                {item.remark ? <div style={{ color: '#FF9900', marginTop: item.imgs ? 5 : 10 }}>{'备注: ' + item.remark}</div> : ''}
            </Timeline.Item>)
        })
        return resultList;
    }
    render() {
        return (
            <Modal
                destroyOnClose
                width={600}
                title='缺陷日志'
                visible={this.state.visible}
                onCancel={() => { this.props.onCancel(); }}
                footer={null}
            >
                <div style={{ height: this.state.stepList.length > 0 ? 400 : 200, overflow: "scroll" }}>
                    {this.state.stepList.length > 0 ?
                        <Timeline style={{ marginTop: 10 }} >
                            {this.getLineRender()}
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


