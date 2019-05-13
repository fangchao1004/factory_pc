import React, { Component } from 'react';
import { Card } from 'antd';
import TableView from './TableView'

const tabListNoTitle = [{
    key: 'TableView',
    tab: '表单概况',
}];

const contentListNoTitle = {
    TableView: <TableView />,
};

class TableModeRoot extends Component {
    state = {
        key: 'TableView',
        noTitleKey: 'TableView',
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

export default TableModeRoot;