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
class TableModeRoot extends Component {
    constructor(props) {
        super(props);
        console.log('TableModeRoot:', props)
        this.state = {
            key: 'TableView',
            noTitleKey: 'TableView',
        }
        this.contentListNoTitle = {
            TableView: <TableView {...props} />,
            EditableTable: <EditableTable {...props} onTabChange={this.onTabChange} />
        };
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
                {this.contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default TableModeRoot;