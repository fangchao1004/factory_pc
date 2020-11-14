import { Col, Row } from 'antd'
import React from 'react'
import AllAboutMeInfoPage from './AllAboutMeInfoPage'
import InfoListPage from './InfoListPage'
//工作台
export default props => {
    return <div style={styles.root}>
        <Row gutter={10}>
            <Col span={9}>
                <div style={{ width: "100%" }}>
                    <AllAboutMeInfoPage />
                </div>
            </Col>
            <Col span={9}>
                <div style={{ width: "100%", backgroundColor: '#FFFFFF', height: 300 }}></div>
            </Col>
            <Col span={6}>
                <div style={{ width: "100%", backgroundColor: '#FFFFFF', height: 770 }}>
                    <InfoListPage />
                </div>
            </Col>
        </Row>
    </div>
}
const styles = {
    root: {
        height: '100vh'
    }
}