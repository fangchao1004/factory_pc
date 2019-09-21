import React, { Component } from 'react';
import { Card } from 'antd';
import TransactionView from './TransactionView';
import TransactionViewNew from './TransactionViewNew';
// import RechargeView from './RechargeViewNew'
const storage = window.localStorage;
var userinfo = null
var isAdmin = false;
var tabListNoTitle = [];

const contentListNoTitle = {
    TransactionView: <TransactionView />,
    TransactionViewNew: <TransactionViewNew />,
};

class TransactionModeRoot extends Component {

    componentDidMount() {
        userinfo = storage.getItem('userinfo');
        isAdmin = JSON.parse(userinfo).isadmin === 1;
        tabListNoTitle = isAdmin ? [{
            key: 'TransactionView',
            tab: '所有消费记录',
        }] : [{
            key: 'TransactionViewNew',
            tab: '人员消费记录',
        }]
        this.forceUpdate();
    }

    state = {
        key: 'TransactionView',
        noTitleKey: 'TransactionView',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <Card
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default TransactionModeRoot;