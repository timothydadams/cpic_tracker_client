import { Badge } from 'ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';

export const StrategyImplementers = ({ implementers }) => {
  const sorted = [...implementers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>Implementers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2'>
          {sorted.map((impl) => (
            <div key={impl.implementer_id} className='flex items-center gap-2'>
              <Badge className='bg-zinc-800 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-200'>
                {impl.name}
              </Badge>
              {impl.is_primary && (
                <Badge className='bg-amber-500 text-white hover:bg-amber-500 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-600 font-semibold'>
                  Primary Lead
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
