import React, { Component } from 'react';
import { Row, Col, Input, Button, message, TreeSelect, Drawer } from 'antd';
import HttpApi from '../../../util/HttpApi';

var storage = window.localStorage;
var localUserInfo = '';
/**
 * 分配界面-抽屉
 */
class DistributionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,

            user_select_id: null, ///分配的维修人员的id
            user_select_title: null,///分配的维修人员的title
            runner_select_id: null,///分配的运行人员的id
            step_0_remark: '',///分配时的备注

            userLevels: []
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }
    init = async () => {
        let userData = await this.getUsersInfo();
        let userLevels = await this.getUsersLevels();
        userLevels.forEach((oneLevel) => {
            // console.log(oneLevel);
            let tempArr = [];
            userData.forEach((oneUser) => {
                if (oneLevel.level_id === oneUser.level_id) {
                    // console.log(oneUser);
                    tempArr.push(oneUser);
                }
            })
            // console.log(tempArr);
            oneLevel.children = tempArr
            oneLevel.selectable = false
        })
        this.setState({ userLevels })
    }
    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            let sqlText = `select users.*,users.name as title,levels.name level_name,  CONCAT(users.level_id,'-',users.id) 'key',CONCAT(users.level_id,'-',users.id) 'value' from users
            left join (select * from levels where effective = 1)levels
            on users.level_id = levels.id
            where users.effective = 1
            order by users.level_id`
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getUsersLevels = () => {
        return new Promise((resolve, reject) => {
            let sql = `select levels.id as level_id, levels.id as 'value', levels.name as title from levels
            where effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal
        })
    }

    ////缺陷分配界面
    renderSelectWorkerModal = () => {
        return (<div>
            <Row gutter={16}>
                <Col span={5}>
                    <span>人员选择:</span>
                </Col>
                <Col span={18}>
                    <TreeSelect
                        showSearch
                        value={this.state.user_select_title}
                        style={{ width: '100%' }}
                        treeNodeFilterProp="title"
                        placeholder="请选择维修人员"
                        treeCheckable={false}
                        treeData={this.state.userLevels}
                        onSelect={(v, node, extra) => {
                            // console.log(v, node, '选中的title:', extra.selectedNodes[0].props.title);
                            if (v.split('-').length === 2) {
                                let user_select_id = parseInt(v.split('-')[1]);
                                let user_select_title = extra.selectedNodes[0].props.title;
                                this.setState({ user_select_id, user_select_title })
                            }
                        }}
                    ></TreeSelect>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={5}>
                    <span>备注:</span>
                </Col>
                <Col span={18}>
                    <Input value={this.state.step_0_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_0_remark: e.target.value }) }} allowClear></Input>
                </Col>
            </Row>
            <div style={{ marginTop: 20 }}>
                <Button type={'primary'}
                    onClick={() => {
                        if (this.state.user_select_id !== null) {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            this.props.changeBugStatus(1, 0, this.state.step_0_remark, JSON.parse(localUserInfo).id, this.state.user_select_id);
                            this.setState({ user_select_title: null, user_select_id: null, step_0_remark: '' })
                            this.props.onClose();
                        } else { message.error('请分配人员'); }
                    }}>确定人员</Button>
            </div>
        </div >)
    }


    render() {
        return (
            < Drawer
                title="分配维修人员"
                placement='right'
                visible={this.state.showModal}
                onClose={() => { this.props.onClose(); this.setState({ user_select_title: null, user_select_id: null, step_0_remark: '' }) }}
                width={450}
            >
                {this.renderSelectWorkerModal()}
            </Drawer >
        );
    }
}

export default DistributionView;