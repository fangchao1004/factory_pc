import React from "react";
import {
  Chart,
  Geom,
  Tooltip,
  Coord,
  Label,
  Guide,
} from "bizcharts";
import DataSet from "@antv/data-set";

export default class PieViewOfBug extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      titleStr: '',
      allCount: ''
    }
  }
  componentDidMount = () => {
    this.transConstruct(this.props.data);
  }
  transConstruct = (data) => {
    // console.log('获取原始数据：',data.datasouce,'对应的标题：',data.title);
    let totalCount = 0;
    let newArr = [];
    data.datasouce.forEach((ele) => {
      if (ele.major_count > 0) {
        totalCount += ele.major_count;
        newArr.push({ item: ele.major_name, count: ele.major_count });
      }
    })
    // console.log('处理后的数据：', newArr);
    this.setState({ data: newArr, titleStr: data.title, allCount: totalCount })
  }
  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const dv = new DataView();
    const str = '<div style="color:#8c8c8c;font-size:14px;text-align: center;width: 10em;">' + this.state.titleStr + '<br><span style="color:#262626;font-size:24px">' + this.state.allCount + '</span></div>'

    dv.source(this.state.data).transform({
      type: "percent",
      field: "count",
      dimension: "item",
      as: "percent"
    });
    const cols = {
      percent: {
        formatter: val => {
          val = val * 100 + "%";
          return val;
        }
      }
    };
    return (
      <div style={{ backgroundColor: '#F0F2F5', height: 280, marginTop: 16, borderRadius: 5 }}>
        <Chart
          height={280}
          data={dv}
          scale={cols}
          padding={[0, 0, 0, 0]}
          forceFit
        >
          <Coord type={"theta"} radius={0.75} innerRadius={0.6} />
          <Tooltip
            showTitle={false}
            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
          />
          <Guide>
            <Html
              position={["50%", "50%"]}
              html={str}
              alignX="middle"
              alignY="middle"
            />
          </Guide>
          <Geom
            type="intervalStack"
            position="percent"
            color='item'
            tooltip={[
              "item*percent",
              (item, percent) => {
                percent = `${(percent * 100).toFixed(2)}%`;
                return {
                  name: item + '率',
                  value: percent
                };
              }
            ]}
            style={{
              lineWidth: 1,
              stroke: "#fff"
            }}
          >
            <Label
              content="percent"
              formatter={(val, item) => {
                // let floatVal = parseFloat(val.substring(0, val.length - 1)).toFixed(1)
                // return item.point.item + ": " + floatVal + '%';
                return item.point.item + ": " + item.point.count + '次';
              }}
            />
          </Geom>
        </Chart>
      </div>
    );
  }
}
