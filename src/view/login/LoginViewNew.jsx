import React from 'react'
import LoginPanel from './LoginPanel';
import bg from '../../assets/bg3.jpg';

export default props => {
    return <div style={styles.root}>
        <div style={styles.allcontentview}>
            <div style={styles.bartitle}>信息综合管理平台</div>
            <div style={styles.bgview}>
                <div>
                    <LoginPanel {...props} />
                </div>
            </div>
        </div>
    </div>
}
const styles = {
    root: {
        display: 'flex',
        backgroundColor: 'rgb(109,143,255)',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    allcontentview: {
        width: '100%',
        height: 600
    },
    bartitle: {
        height: 100, fontSize: 30, padding: 40, paddingLeft: 150, color: '#FFFFFF', fontWeight: 800
    },
    bgview: {
        backgroundImage: `url(${bg})`,
        width: '100%',
        height: 400,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row-reverse'
    }
}