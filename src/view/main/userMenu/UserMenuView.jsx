import React, { Component } from 'react';
import { Button, Modal, Row, Col, Input, message, Card, Tooltip, Tag } from 'antd';
import HttpApi, { environmentIsTest } from '../../util/HttpApi'
import moment from 'moment'
import { permisstionWithDes, adminPermission } from '../../util/AppData'
import { omitTextLength } from '../../util/Tool'

var storage = window.localStorage;
var userinfo = null;
const { TextArea } = Input;

function changeIdListToNameListForPer(idList) {
    let nameList = [];
    permisstionWithDes.forEach((item) => {
        idList.forEach((idStr) => {
            if (idStr + '' === item.value + '') {
                nameList.push({ name: item.name, des: item.des });
            }
        })
    })
    return nameList
}

/**
 * 右上角 退出登录等功能的菜单
 */
export default class UserMenuView extends Component {
    constructor(props) {
        super(props);
        userinfo = window.localStorage.getItem('userinfo')
        // console.log('JSON.parse(userinfo).isadmin === 1:',JSON.parse(userinfo).isadmin === 1);
        this.state = {
            isadmin: JSON.parse(userinfo).isadmin === 1,
            showModal1: false,
            notiveTxt: '',
            permissionList: [],
            majorName: '',
        }
    }
    componentDidMount() {
        let major_name = JSON.parse(userinfo).major_name_all
        this.setState({
            majorName: major_name,
            permissionList: JSON.parse(userinfo).permission ? changeIdListToNameListForPer(JSON.parse(userinfo).permission.split(',')) : []
        })
    }
    noticeRender = () => {
        return <div>
            <Row>
                <Col span={3}>
                    <div>内容:</div>
                </Col>
                <Col span={21}>
                    <TextArea
                        onChange={(e) => { this.setState({ notiveTxt: e.target.value }) }}
                        placeholder="请输入通知信息"
                        autosize={{ minRows: 2, maxRows: 6 }}
                    />
                </Col>
            </Row>
        </div>
    }
    onOk = async () => {
        if (this.state.notiveTxt === '') { message.error('请输入有效信息') }
        else {
            ///将数据 上传至数据库
            let result = await this.insertNoticeToDB();
            if (result) { this.setState({ showModal1: false }); message.success('发布通知成功') }
        }
    }
    insertNoticeToDB = () => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO notices(content,name,time) VALUES ('${this.state.notiveTxt}','${JSON.parse(userinfo).name}','${moment().format('YYYY-MM-DD HH:mm:ss')}')`
            let result = false
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = true }
                resolve(result);
            })
        })
    }
    renderHandler = () => {
        let tempList = JSON.parse(JSON.stringify(this.state.permissionList));
        if (this.state.isadmin) {
            tempList.unshift(adminPermission)
        }
        return tempList.map((item, index) => {
            return (
                <Tooltip key={index} placement="leftBottom" title={item.des}>
                    <div style={{ color: '#46a1ff' }}>{item.name}</div>
                </Tooltip>
            )
        })
    }
    render() {
        return (
            <div style={{ minWidth: 200 }}>
                {this.state.majorName ? <Tooltip title={this.state.majorName}>
                    <Tag color={'#FF9900'} style={{ marginBottom: 10 }}>{'所属专业: ' + omitTextLength(this.state.majorName, 12)}</Tag>
                </Tooltip> : null}
                {this.state.permissionList.length > 0 || this.state.isadmin ? <Card size="small" title="所有权限">{this.renderHandler()}</Card> : null}
                {/* {this.state.isadmin ? <Button type='primary' style={{ width: "100%", marginTop: 10 }} onClick={() => { this.setState({ showModal1: true }) }}>发布通知</Button> : null} */}
                < Button type='danger' style={{ width: "100%", marginTop: 10 }}
                    onClick={() => {
                        storage.removeItem('userinfo');
                        window.location.href = environmentIsTest ? '/test/' : '/';
                    }}> 退出登录</Button >
                <Modal
                    title="发布通知"
                    visible={this.state.showModal1}
                    onOk={this.onOk}
                    onCancel={() => { this.setState({ showModal1: false }) }}
                    width={520}
                >
                    {this.noticeRender()}
                </Modal>
            </div >
        );
    }
}