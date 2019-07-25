import React, { Component } from 'react';
import { Card } from 'antd';
import TransactionView from './TransactionView';

const tabListNoTitle = [{
    key: 'TransactionView',
    tab: '消费记录',
}];

const contentListNoTitle = {
    TransactionView: <TransactionView />,
};

class TransactionModeRoot extends Component {
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