import React, { Component } from 'react';
import { Button, Modal, Row, Col, Input, message } from 'antd';
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
var storage = window.localStorage;
var userinfo = null;
const { TextArea } = Input;

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
        }
    }
    componentDidMount() {
        // console.log('userinfo:', userinfo);
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
    render() {
        return (
            <div>
                {this.state.isadmin ? <Button type='primary' style={{ width: "100%", marginBottom: 10 }} onClick={() => { this.setState({ showModal1: true }) }}>发布通知</Button> : null}
                <Button type='danger' style={{ width: "100%" }}
                    onClick={() => {
                        storage.removeItem('userinfo');
                        window.location.href = "/";
                    }}>退出登录</Button>
                <Modal
                    // mask={false}
                    title="发布通知"
                    visible={this.state.showModal1}
                    onOk={this.onOk}
                    onCancel={() => { this.setState({ showModal1: false }) }}
                    // footer={null}
                    width={520}
                >
                    {this.noticeRender()}
                </Modal>
            </div>
        );
    }
}