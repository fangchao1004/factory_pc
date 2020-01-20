import React, { Component } from 'react';
import { Row, Col, Empty } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
import PieViewOfBug from './PieViewOfBug';
import LineChartViewOfBug from './LineChartViewOfBug'
import { getCheckManIdToday, getSomeOneBugsCountToday } from '../../util/Tool'

export default class BugsPageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let data = await this.getTodayBugsInfo();
        // console.log('今日的缺陷统计:', data.length);
        let result = { datasource: data, title: '今日缺陷统计' }
        let dataList = await this.testHandler();
        // console.log('dataList:', dataList)
        this.setState({ data: [result, ...dataList] })

    }
    testHandler = async () => {
        let checkManIdList = await getCheckManIdToday();
        let dataList = [];
        for (const key in checkManIdList) {
            const oneUserInfo = checkManIdList[key]
            let result = await getSomeOneBugsCountToday(oneUserInfo.user_id);
            let oneData = {};
            oneData.title = result[0].user_name;
            oneData.datasource = result;
            dataList.push(oneData);
        }
        return dataList;
    }
    getTodayBugsInfo = () => {
        return new Promise((resolve, reject) => {
            // let todayStart = moment().subtract(10, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            let todayStart = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            let todayEnd = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            let sql = `select t1.*,majors.name as major_name from
            (select 
            major_id,
            count(major_id) as major_count
            from bugs
            where createdAt>'${todayStart}' and createdAt<'${todayEnd}' and effective = 1
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
        if (this.state.data.length === 0) {
            return <Col span={24} style={{ backgroundColor: '#F0F2F5', height: 280, borderRadius: 5, marginTop: 10 }}>
                <Empty
                    image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                    imageStyle={{
                        height: 160,
                        marginTop: 50,
                    }}
                    description={'今日缺陷-暂无数据'} />
            </Col>
        } else {
            let cellsArr = [];
            let copy_data = JSON.parse(JSON.stringify(this.state.data))
            // console.log('copy_data:', copy_data)
            copy_data.forEach((item, index) => {
                cellsArr.push(
                    <Col span={8} key={index} style={{ marginTop: -5 }}>
                        <PieViewOfBug data={item} />
                    </Col>
                )
            })
            return cellsArr
        }
    }
    render() {
        return (
            <div style={{ marginTop: -10 }}>
                <Row gutter={10}>
                    {this.renderPieView()}
                </Row>
                <Row gutter={10}>
                    <Col span={24}>
                        <div style={{ marginTop: 10 }}>
                            <LineChartViewOfBug />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
