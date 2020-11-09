import React, { Component } from 'react';
import { Card } from 'antd';
import ApplyTrans from './ApplyTrans';
import ApproveTrans from './ApproveTrans'

const tabListNoTitle = [{
    key: 'ApplyTrans',
    tab: '消费申请',
}, {
    key: 'ApproveTrans',
    tab: '消费审批'
}];

const contentListNoTitle = {
    ApplyTrans: <ApplyTrans />,
    ApproveTrans: <ApproveTrans />,
};

class TansactionApplyModeRoot extends Component {

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
                bodyStyle={{ padding: 10, backgroundColor: '#F1F2F5' }}
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