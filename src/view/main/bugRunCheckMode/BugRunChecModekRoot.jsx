import React, { Component } from 'react';
import { Card } from 'antd';
import BugRunCheckView from './BugRunCheckView'

const tabListNoTitle = [{
    key: 'BugRunCheckView',
    tab: '运行验收',
}];

const contentListNoTitle = {
    BugRunCheckView: <BugRunCheckView />,
};

class BugRunChecModekRoot extends Component {
    state = {
        key: 'BugRunCheckView',
        noTitleKey: 'BugRunCheckView',
    }
    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }
    render() {
        var tabs = tabListNoTitle
        return (
            <Card
                bodyStyle={{ padding: 20 }}
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabs}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default BugRunChecModekRoot;