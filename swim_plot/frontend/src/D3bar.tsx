import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib";
import React, { ReactNode } from "react";
import * as d3 from "d3"; // Import d3 library

interface RawDatum {
  "Label": string;
  "Start Date": string;
  "End Date": string;
}

interface Datum {
  "Label": string;
  "Start Date": Date;
  "End Date": Date;
}

interface State {
  rawData: RawDatum;
}

const countUniqueValues = function <T>(arr: T[], property: keyof T): number {
  const uniqueValues = new Set();
  
  arr.forEach(item => {
    uniqueValues.add(item[property]);
  });
  
  return uniqueValues.size;
};

class MyComponent extends StreamlitComponentBase<State> {

  private svgRef: React.RefObject<SVGSVGElement>; // Create a ref for the SVG element

  constructor(props: any) {
    super(props);
    this.svgRef = React.createRef(); // Initialize the SVG ref
  }

  public componentDidMount() {
    this.createBarPlot(this.props.args.data);
    Streamlit.setFrameHeight()
  }

  public componentDidUpdate() {
    this.updateBarPlot(this.props.args.data);
    Streamlit.setFrameHeight()
  }

  private convertData(data: RawDatum[]): Datum[] {
    let output_data: Datum[] = [];
    for (let i = 0; i < data.length; i++) {
      let datum: Datum = {
        "Label": data[i]['Label'],
        "Start Date": new Date(data[i]['Start Date']),
        "End Date": new Date(data[i]['End Date'])
      }
      output_data.push(datum)
    }
    return output_data
  }

  private updateBarPlot(rawData: RawDatum[]) {
    let data = this.convertData(rawData)
    if (data.length === 0) { return }

    const min_date: Date = d3.min(data, d => d["Start Date"]) || new Date();
    const max_date: Date = d3.max(data, d => d["End Date"]) || new Date();

    const chartHeight = countUniqueValues(data, "Label") * 40;

    const max_label: number = d3.max(data, d => d["Label"].length) || 0;
    console.log(max_label);
    const margin = { top: 20, right: 20, bottom: 30, left: max_label * 5 };
    const chartWidth = 600 - margin['left'] - margin['right'];
    const padding = 0.4;

    const svg = d3.select(this.svgRef.current).select('g')

    const x = d3.scaleTime()
      .domain([min_date, max_date])
      .range([5, chartWidth]);

    const customTickFormat = (value: Date | d3.NumberValue) => {
      if (value instanceof Date) {
        return d3.timeFormat('%m/%d/%y')(value); // Format Date objects
      } else {
        return value.toString(); // Convert NumberValue to string
      }
    };
    const xAxis = d3.axisBottom(x).tickFormat(customTickFormat);

    const y = d3.scaleBand()
      .domain(data.map(d => d["Label"]))
      .range([0, chartHeight])
      .padding(padding);

    const tooltip = svg.select('.tt')

    console.log(data)
    svg.selectAll("rect")
      .data(data)
      .join(function (enter) {
        return enter.append('rect')
          .attr("class", "bar")
          .attr("fill", "black")
          .on('mouseover', (i, d) => {
            tooltip.text(`${d['Label']} | ${d['Start Date'].toISOString().split('T')[0]} to ${d['End Date'].toISOString().split('T')[0]}`)
          })
          .on('mouseout', (i, d) => {
            tooltip.text('')
          })
          .attr("width", d => (x(d["End Date"] || new Date()) - x(d["Start Date"] || new Date())))
          .attr("height", y.bandwidth())
          .attr("x", d => x(d["Start Date"] || new Date()))
          .attr("y", d => y(d["Label"]) || 0)

      }, function (update) {
        return update
          .transition()
          .attr("x", d => x(d["Start Date"] || new Date()))
          .attr("y", d => y(d["Label"]) || 0)
          .attr("width", d => (x(d["End Date"] || new Date()) - x(d["Start Date"] || new Date())))
          .attr("height", y.bandwidth())

      }, function (exit) {exit.remove()})

    const r = 5 + y.bandwidth()/2;
    svg.selectAll(".startcircle")
      .data(data)
      .join(
        function (enter) {
          return enter
          .append("circle")
          .attr("class", "circle")
          .attr("fill", "black")
          .attr("cx", d => x(d["Start Date"] || new Date()))
          .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
          .attr("r", r);
                         },
        function (update) {return update
          .attr("class", "circle")
          .attr("fill", "black")
          .attr("cx", d => x(d["Start Date"] || new Date()))
          .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
          .attr("r", r);
                          },
        function (exit) {exit.remove()}
      )

    svg.selectAll(".endcircle")
      .data(data)
      .join(
        function (enter) {
          return enter
          .append("circle")
          .attr("class", "circle")
          .attr("fill", "black")
          .attr("cx", d => x(d["End Date"] || new Date()))
          .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
          .attr("r", r);
                         },
        function (update) {return update
          .attr("class", "circle")
          .attr("fill", "black")
          .attr("cx", d => x(d["End Date"] || new Date()))
          .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
          .attr("r", r);
                          },
        function (exit) {exit.remove()}
      )

    svg.selectAll('g').remove();
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .transition()
      .call(xAxis);

    svg.append("g")
      .attr("class", "y-axis")
      .transition()
      .call(d3.axisLeft(y));
  }

  private createBarPlot(rawData: RawDatum[]) {
    console.log("drawing")
    let data = this.convertData(rawData)
    if (data.length === 0) { return }

    const min_date: Date = d3.min(data, d => d["Start Date"]) || new Date();
    const max_date: Date = d3.max(data, d => d["End Date"]) || new Date();
    const max_label: number = d3.max(data, d => d["Label"].length) || 0;
    console.log(max_label);

    const chartHeight = countUniqueValues(data, "Label") * 40;
    const margin = { top: 20, right: 30, bottom: 30, left: max_label * 5 };
    const chartWidth = 700 - margin['left'] - margin['right'];
    const padding = 0.9;

    d3.selectAll("svg > *").remove();
    const svg = d3.select(this.svgRef.current)
      .style('background-color', 'slate')
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3.scaleTime()
      .domain([min_date, max_date])
      .range([5, chartWidth]);

    const customTickFormat = (value: Date | d3.NumberValue) => {
      if (value instanceof Date) {
        return d3.timeFormat('%m/%d/%y')(value); // Format Date objects
      } else {
        return value.toString(); // Convert NumberValue to string
      }
    };
    const xAxis = d3.axisBottom(x).tickFormat(customTickFormat);

    const y = d3.scaleBand()
      .domain(data.map(d => d["Label"]))
      .range([0, chartHeight])
      .padding(padding);


    const tooltip = svg
      .append("text")
      .style("position", "absolute")
      .attr("stroke", 'black')
      .attr("fill", 'black')
      .attr("x", 10)
      .attr("y", 0)
      .attr("class", "tt")
    // .style("visibility", "hidden")

    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("fill", "black")
      .attr("x", d => x(d["Start Date"] || new Date()))
      .attr("y", d => y(d["Label"]) || 0)
      .attr("width", d => (x(d["End Date"] || new Date()) - x(d["Start Date"] || new Date())))
      .on('mouseover', (i, d) => {
        tooltip.text(`${d['Label']} | ${d['Start Date'].toISOString().split('T')[0]} to ${d['End Date'].toISOString().split('T')[0]}`)
      })
      .on('mouseout', (i, d) => {
        tooltip.text('')
      })
      .attr("height", y.bandwidth());

    const r = 5 + y.bandwidth()/2;
    svg.selectAll(".startcircle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("fill", "black")
      .attr("cx", d => x(d["Start Date"] || new Date()))
      .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
      .attr("r", r)
      .attr("class", "startcircle");

    svg.selectAll(".endcircle")
      .data(data)
      .join(
        function (enter) {
          return enter
          .append("circle")
          .attr("class", "circle")
          .attr("fill", "black")
          .attr("cx", d => x(d["End Date"] || new Date()))
          .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
          .attr("r", r)
          .attr("class", "endcircle");
                         },
        function (update) {return update
          .attr("class", "circle")
          .attr("fill", "black")
          .attr("cx", d => x(d["End Date"] || new Date()))
          .attr("cy", d => (y(d["Label"]) || 0) + y.bandwidth()/2)
          .attr("r", r);
                          },
        function (exit) {exit.remove()}
      )
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

  }


  public render = (): ReactNode => {
    const { theme } = this.props;
    console.log(theme);
    const style: React.CSSProperties = {width: "100%"};

    return (
        <svg
          id="d3viz"
          ref={this.svgRef}
          style={style}
        />
    );
  };

}

export default withStreamlitConnection(MyComponent);
