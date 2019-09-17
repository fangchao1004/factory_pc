import React, { Component } from 'react';
import { Card } from 'antd';
import ApplyTrans from './ApplyTrans';
import ApproveTrans from './ApproveTrans'
const storage = window.localStorage;
var userinfo = null
var isAdmin = false;
var tabListNoTitle = [];

const contentListNoTitle = {
    ApplyTrans: <ApplyTrans />,
    ApproveTrans: <ApproveTrans />,
};

class TansactionApplyModeRoot extends Component {

    componentDidMount() {
        userinfo = storage.getItem('userinfo');
        isAdmin = JSON.parse(userinfo).isadmin === 1;
        tabListNoTitle = isAdmin ? [{
            key: 'ApplyTrans',
            tab: '消费申请',
        }, {
            key: 'ApproveTrans',
            tab: '消费审批'
        }] : [{
            key: 'ApplyTrans',
            tab: '消费记录',
        }]
        this.forceUpdate();
    }

    state = {
        key: 'ApplyTrans',
        noTitleKey: 'ApplyTrans',
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

export default TansactionApplyModeRoot;