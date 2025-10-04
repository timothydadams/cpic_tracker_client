import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../catalyst/table.jsx';

export const DynamicTable = ({ data, excludedKeys = [] }) => {
  console.log(data);
  const headers = Object.keys(data[0]).filter((h) => !excludedKeys.includes(h));

  return (
    <Table className='[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]'>
      <TableHead>
        <TableRow>
          {headers.map((h, i) => {
            return <TableHeader key={i}>{h}</TableHeader>;
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((d) => {
          console.log('user data:', d);
          return (
            <TableRow key={d.id}>
              {headers.map((col, i) => {
                if (Array.isArray(d[col])) {
                  return (
                    <TableCell key={i}>
                      <ul>
                        {d[col].map((x, i) => (
                          <li key={i}>{x.name}</li>
                        ))}
                      </ul>
                    </TableCell>
                  );
                } else {
                  return <TableCell key={i}>{d[col]}</TableCell>;
                }
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
