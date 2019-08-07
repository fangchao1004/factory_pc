import React, { Component } from 'react';
import { Row, Col, Empty } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
import PieViewOfBug from './PieViewOfBug';

export default class BugsPageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let data = await this.getTodayBugsInfo();
        let result = { datasouce: data, title: '今日缺陷统计' }
        // console.log('result:', result);
        this.setState({ data: result })
    }
    getTodayBugsInfo = () => {
        return new Promise((resolve, reject) => {
            let todayStart = moment().subtract(10, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            // let todayStart = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            let todayEnd = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            let sql = `select t1.*,majors.name as major_name from
            (select 
            major_id,
            count(major_id) as major_count
            from bugs
            where createdAt>'${todayStart}' and createdAt<'${todayEnd}'
            group by bugs.major_id) t1
            left join majors
            on majors.id = t1.major_id`
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data; }
                resolve(result);
            })
        })
    }
    renderPieView = () => {
        // console.log('this.state.data:', this.state.data);
        if (JSON.stringify(this.state.data) === '{}' || this.state.data.datasouce.length === 0) {
            return <Col span={24} style={{ backgroundColor: '#F0F2F5', height: 280, marginTop: 16, borderRadius: 5 }}>
                <Empty
                    image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                    imageStyle={{
                        height: 160,
                        marginTop:50,
                    }}
                    description={'今日缺陷-暂无数据'} />
            </Col>
        }
        let result =
            <Col span={8}>
                <PieViewOfBug data={this.state.data} />
            </Col>
        return result
    }
    render() {
        return (
            <div style={{ marginTop: -16, paddingLeft: 10, paddingRight: 10 }}>
                <Row gutter={5}>
                    {this.renderPieView()}
                </Row>
            </div>
        );
    }
}
