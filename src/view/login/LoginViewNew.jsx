import React from 'react'
import LoginPanel from './LoginPanel';
import bg1svg from '../../assets/bg1.svg'
export default props => {
    return <div style={styles.root}>
        <LoginPanel {...props} />
        {/* <div style={{ position: 'fixed', bottom: 15, textAlign: 'center' }}>
            <img style={{ cursor: 'pointer' }} src='https://hefeixiaomu.oss-cn-hangzhou.aliyuncs.com/xiaomu/xiaomu_logo_64.png' alt="" width="20" height="20" onClick={() => {
                window.open("https://www.ixiaomu.cn")
            }} />
          &nbsp;
        <span style={{ color: '#888', fontSize: 12, cursor: 'pointer' }} onClick={() => {
                window.open("https://www.ixiaomu.cn")
            }}>小木软件提供服务</span>
          &nbsp;&nbsp;&nbsp;
        <span style={{ color: '#888', fontSize: 12, cursor: 'pointer' }} onClick={() => {
                window.open("http://www.beian.miit.gov.cn")
            }}>皖ICP备17017819号</span>
        </div> */}
    </div>
}
const styles = {
    root: {
        backgroundSize: '100% 100%',
        backgroundImage: `url(${bg1svg})`,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
}