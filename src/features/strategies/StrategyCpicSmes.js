import { Avatar, AvatarImage, AvatarFallback } from 'ui/avatar';
import { Badge } from 'ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import { EmptyContainer } from 'components/EmptyContainer';

function getInitial(user) {
  const name = user?.given_name || user?.display_name || user?.username || '?';
  return name.charAt(0).toUpperCase();
}

function getDisplayName(user) {
  const first = user?.given_name;
  const last = user?.family_name;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return user?.display_name || user?.username || 'Unknown';
}

const SmeUser = ({ user }) => (
  <div className='flex items-center gap-2'>
    <Avatar className='h-7 w-7 shrink-0'>
      {user.profile_pic && (
        <AvatarImage src={user.profile_pic} alt={getDisplayName(user)} />
      )}
      <AvatarFallback className='text-xs'>{getInitial(user)}</AvatarFallback>
    </Avatar>
    <span className='text-sm truncate'>{getDisplayName(user)}</span>
  </div>
);

export const StrategyCpicSmes = ({ implementers }) => {
  const sorted = [...implementers].sort((a, b) => a.name.localeCompare(b.name));

  const hasSmes = sorted.some((impl) => impl.cpic_smes?.length > 0);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>
          CPIC Board Oversight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSmes ? (
          <EmptyContainer
            title='No SMEs assigned'
            description='No CPIC board members are assigned to oversee these implementers.'
          />
        ) : (
          <div className='flex flex-col gap-4'>
            {sorted.map((impl) => (
              <div key={impl.implementer_id}>
                <div className='flex items-center gap-2 mb-2'>
                  <Badge variant='outline' className='text-xs'>
                    {impl.name}
                  </Badge>
                  {impl.is_primary && (
                    <Badge className='bg-amber-500 text-white hover:bg-amber-500 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-600 font-semibold text-xs'>
                      Primary
                    </Badge>
                  )}
                </div>
                <div className='flex flex-col gap-1.5 pl-2'>
                  {impl.cpic_smes?.length > 0 ? (
                    impl.cpic_smes.map((sme) => (
                      <SmeUser key={sme.id} user={sme} />
                    ))
                  ) : (
                    <p className='text-xs text-muted-foreground'>
                      No SME assigned
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
