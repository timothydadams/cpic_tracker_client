import { Link } from 'react-router-dom';
import { Badge } from 'ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';

export const StrategySiblings = ({ siblings, policyNumber }) => {
  if (!siblings || siblings.length === 0) return null;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>
          Related Strategies (Policy {policyNumber})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2'>
          {siblings.map((sibling) => (
            <Link
              key={sibling.id}
              to={`/strategies/${sibling.id}`}
              className='flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0'
            >
              <span className='flex-1 mr-2 truncate'>
                {policyNumber}.{sibling.strategy_number}{' '}
                <span className='text-zinc-500 dark:text-zinc-400'>
                  {sibling.content}
                </span>
              </span>
              <Badge variant='outline' className='shrink-0 text-xs'>
                {sibling.status.title}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
