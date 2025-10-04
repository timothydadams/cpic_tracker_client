import React, { useRef, useEffect, useState, useReducer } from 'react';
import Chart from 'chart.js/auto';
import './graph.module.css';
import { CategoryScale } from 'chart.js';
import 'chartjs-adapter-luxon';

Chart.register(CategoryScale);
//--Chart Style Options--//
//Chart.defaults.global.defaultFontFamily = "'PT Sans', sans-serif"
//Chart.defaults.global.legend.display = false;
//Chart.defaults.global.elements.line.tension = 0.2;
//--Chart Style Options--//

export const CustomChart = ({ type, options, chartData }) => {
  const chartContainer = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (chart.current) {
      chart.current.destroy();
    }

    chart.current = new Chart(chartContainer.current, {
      type,
      data: chartData,
      options,
    });
  }, [options, type, chartData]);

  return (
    <div className='w-full grow-1'>
      <canvas ref={chartContainer} />
    </div>
  );
};
