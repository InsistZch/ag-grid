export default [
    {
      type: 'column',
      xKey: 'station',
      yKey: 'early',
      stacked: true,
      yName: '成本5',
    },
    {
      type: 'column',
      xKey: 'station',
      yKey: 'morningPeak',
      yName: '成本4',
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'station',
      yKey: 'interPeak',
      yName: '成本3',
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'station',
      yKey: 'afternoonPeak',
      yName: '成本2',
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'station',
      yKey: 'evening',
      yName: '成本1',
      stacked: true,
    },
  ]