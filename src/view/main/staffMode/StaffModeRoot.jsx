import React, { Component } from 'react';
import { Card } from 'antd';
import StaffView from './StaffView'

const tabListNoTitle = [{
    key: 'StaffView',
    tab: '员工概况',
}];

const contentListNoTitle = {
    StaffView: <StaffView />,
};

class StaffModeRoot extends Component {
    state = {
        key: 'StaffView',
        noTitleKey: 'StaffView',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <div>
                <Card
                    style={{ width: '100%' }}
                    tabList={tabListNoTitle}
                    activeTabKey={this.state.noTitleKey}
                    onTabChange={(key) => { this.onTabChange(key); }}
                >
                    {contentListNoTitle[this.state.noTitleKey]}
                </Card>
            </div>
        );
    }
}

export default StaffModeRoot;