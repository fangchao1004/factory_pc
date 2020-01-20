import React, { Component } from 'react';
import { Card } from 'antd';
import TransactionView from './TransactionView'; /// 所有消费数据界面
import OneTransactionView from './OneTransactionView';/// 个人消费数据界面
// import RechargeView from './RechargeViewNew'
const storage = window.localStorage;
var userinfo;
var isAdmin;
var tabListNoTitle;
var contentListNoTitle;

class TransactionModeRoot extends Component {
    constructor(props) {
        super(props);
        userinfo = storage.getItem('userinfo');
        isAdmin = JSON.parse(userinfo).isadmin === 1;
        this.state = {
            key: isAdmin ? 'TransactionView' : 'OneTransactionView',
            noTitleKey: isAdmin ? 'TransactionView' : 'OneTransactionView',
        }
        contentListNoTitle = isAdmin ? {
            TransactionView: <TransactionView />,
        } : { OneTransactionView: <OneTransactionView />, }
        tabListNoTitle = isAdmin ? [{
            key: 'TransactionView',
            tab: '所有消费记录',
        }] : [{
            key: 'OneTransactionView',
            tab: '个人消费记录',
        }]
    }
    render() {
        return (
            <Card
                bodyStyle={{ padding: 20 }}
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default TransactionModeRoot;