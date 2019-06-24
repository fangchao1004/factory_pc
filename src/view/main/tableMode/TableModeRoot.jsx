import React, { Component } from 'react';
import { Card } from 'antd';
import TableView from './TableView'
import EditableTable from './EditableTable'

const tabListNoTitle = [{
    key: 'TableView',
    tab: '表单概况',
}, {
    key: 'EditableTable',
    tab: '创建表单'
}];

const contentListNoTitle = {
    TableView: <TableView />,
    EditableTable: <EditableTable />
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
                    bordered={false}
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