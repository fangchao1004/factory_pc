import React, { Component, Fragment } from 'react';
import { Checkbox, Input } from 'antd';
import { Testuri } from '../../util/HttpApi';

const { TextArea } = Input;
/**
 * 一次record记录中所包含的bugs的详情
 * 位于抽屉界面显示
 */
class OneRecordDetialView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderData: null
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return JSON.stringify(this.state.renderData) !== JSON.stringify(nextProps.renderData)
    }
    componentDidMount() {
        this.setState({ renderData: this.props.renderData })
    }
    componentWillReceiveProps(nextProps, nextState) {
        this.setState({ renderData: nextProps.renderData })
    }
    renderView = () => {
        if (!this.state.renderData) { return }
        let titleComponent = this.renderTitleView();
        let bugContentComponent = this.renderBugView();
        return (<Fragment>
            {titleComponent}
            {bugContentComponent}
        </Fragment>)
    }
    ///渲染标题
    renderTitleView = () => {
        return (<div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: 24, color: '#40A9FF' }}>{this.state.renderData.table_name}</div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 16, marginTop: 10, marginBottom: 20 }}>
                <span>设备名: {this.state.renderData.device_name}</span>
                <span>上传者: {this.state.renderData.user_name}</span>
            </div>
        </div >)
    }
    ///渲染bug界面
    renderBugView = () => {
        // console.log('渲染bug界面', this.state.renderData.content);
        ///将content中，bug_id 值不为null都的提取处理
        this.state.renderData.content.sort((a, b) => {
            return parseInt(a.key) - parseInt(b.key)
        })
        let result = [];
        for (const oneBug of this.state.renderData.content) {
            let oneBugContent = [];
            oneBugContent.push(<div key={0} style={{ color: '#40A9FF' }}>{oneBug.key + '. ' + oneBug.title_name}</div>)
            oneBugContent.push(<div key={1} style={{ marginBottom: 20 }}>{this.renderOneSelectOption(JSON.parse(oneBug.content))}</div>);
            oneBugContent.push(<div key={2} style={{ marginBottom: 20 }}>{oneBug.major_name ? '缺陷专业 ' + oneBug.major_name : null}</div>);
            oneBugContent.push(<div key={3} style={{ marginBottom: 20 }}>{this.renderOneTextArea(JSON.parse(oneBug.content))}</div>);
            oneBugContent.push(<div key={4} style={{ marginBottom: 20 }}>{this.renderOneImg(JSON.parse(oneBug.content))}</div>)
            result.push(oneBugContent);
        }
        return result
    }
    ///渲染那些选中的选项
    renderOneSelectOption = (content) => {
        let select = content.select;
        let result_arr = [];
        if (select) {
            select.split('/').forEach((oneSelectOption) => {
                result_arr.push(<Checkbox checked disable key={result_arr.length - 1}>{oneSelectOption}</Checkbox>);
            })
        }
        return result_arr;
    }
    ///渲染一个文本域
    renderOneTextArea = (content) => {
        return <Fragment>{content.text ? <div>问题描述<TextArea style={{ marginTop: 10 }} value={content.text} /></div> : null}</Fragment>
    }
    renderOneImg = (content) => {
        let imgArr = [];
        let result = [];
        // console.log('content:', content.imgs);
        if (content.imgs.length > 0) {
            content.imgs.forEach((oneImgUUID) => {
                imgArr.push(<img key={oneImgUUID} alt='' src={Testuri + 'get_jpg?uuid=' + oneImgUUID} style={{ width: 450, height: 600, marginTop: 15 }} />);
            })
            result = [<div key={0}>图片补充</div>, ...imgArr]
        }
        return result;
    }

    render() {
        return (
            <div>
                {this.renderView()}
            </div>
        );
    }
}

export default OneRecordDetialView;