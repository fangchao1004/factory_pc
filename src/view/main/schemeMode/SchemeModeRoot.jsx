import React, { Component } from 'react';
import { Card } from 'antd';
import SchemeOfDate from './date/SchemeOfDate';
import SchemeOfAllowTime from './allowTime/SchemeOfAllowTime';

const tabListNoTitle = [{
    key: 'SchemeOfDate',
    tab: '日期方案',
}, {
    key: 'SchemeOfAllowTime',
    tab: '时间段方案',
}];
class SchemeModeRoot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'SchemeOfDate',
            noTitleKey: 'SchemeOfDate',
        }
        this.contentListNoTitle = {
            SchemeOfDate: <SchemeOfDate {...props} />,
            SchemeOfAllowTime: <SchemeOfAllowTime  {...props} />,
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
export default SchemeModeRoot;