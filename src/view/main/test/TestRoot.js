import React from 'react'
import Test from './Test'
import EmployeeType from './EmployeeType'
import {Card} from 'antd';

const tabListNoTitle = [{
    key: 'Test',
    tab: '员工',
}, {
    key: 'EmployeeType',
    tab: '部门',
}];

const contentListNoTitle = {
    Test: < Test />,
    EmployeeType: < EmployeeType />
};

export default class TestRoot extends React.Component {
    state = {
        key: 'Test',
        noTitleKey: 'Test',
    }

    onTabChange = (key) => {
        this.setState({
            noTitleKey: key
        });
    }

    render() {
        return (
            < Card
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            > {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );

    }
}