import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import * as echarts from "echarts/core";
import { LineChart, BarChart, PieChart, CustomChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  AriaComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  CustomChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  AriaComponent,
  SVGRenderer,
]);

export default function ChartCanvas({
  option,
  description,
  onSelect,
  className = "",
}) {
  const element = useRef(null);
  const instance = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const chart = echarts.init(element.current, null, { renderer: "svg" });
    instance.current = chart;
    let frame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!chart.isDisposed()) chart.resize();
      });
    });
    observer.observe(element.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      chart.dispose();
      instance.current = null;
    };
  }, []);
  useEffect(() => {
    instance.current?.setOption(
      {
        textStyle: { fontFamily: "DM Sans, sans-serif" },
        animationDuration: 600,
        animationDurationUpdate: 450,
        ...option,
        animation: !reduce,
        aria: { enabled: true, label: { description } },
      },
      { notMerge: true },
    );
  }, [option, reduce, description]);
  useEffect(() => {
    const chart = instance.current;
    if (!chart || !onSelect) return;
    const select = (event) => onSelect(event.dataIndex);
    chart.on("click", select);
    return () => {
      if (!chart.isDisposed()) chart.off("click", select);
    };
  }, [onSelect]);
  return (
    <div
      className={`chart-canvas ${className}`}
      ref={element}
      role="img"
      aria-label={description}
    />
  );
}
