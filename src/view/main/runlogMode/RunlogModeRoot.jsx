import React, { Component } from 'react';
import { Card } from 'antd';
import RunlogView from './RunlogView';

var tabListNoTitle = [{
    key: 'RunlogView',
    tab: '运行日志',
}]
class RunlogModeRoot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'RunlogView',
            noTitleKey: 'RunlogView',
        }
        this.contentListNoTitle = {
            RunlogView: <RunlogView {...props} />,
        };
    }
    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }
    render() {
        return (
            <Card
                bodyStyle={{ padding: 20 }}
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {this.contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default RunlogModeRoot;