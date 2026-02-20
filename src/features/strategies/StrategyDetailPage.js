import { useParams } from 'react-router-dom';
import { Button as CButton } from 'catalyst/button';
import { Heading, Subheading } from 'catalyst/heading';
import { Text } from 'catalyst/text';
import { Card, CardContent } from 'ui/card';
import { Dots } from 'components/Spinners';
import useAuth from 'hooks/useAuth';
import { useGetStrategySummaryQuery } from './strategiesApiSlice';
import { StrategyMetricLabels } from './StrategyMetricLabels';
import { StrategyImplementers } from './StrategyImplementers';
import { StrategySiblings } from './StrategySiblings';
import { StrategyComments } from './StrategyComments';
import { StrategyActivity } from './StrategyActivity';
import { StrategyCpicSmes } from './StrategyCpicSmes';

export const StrategyDetailPage = () => {
  const { id } = useParams();
  const user = useAuth();
  const isAuthenticated = user?.status !== 'Guest';
  const showEditPath = user?.isAdmin || user?.isCPICAdmin;

  const { data: summary, isLoading } = useGetStrategySummaryQuery(
    { id },
    {
      skip: !id,
      selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
    }
  );

  if (isLoading) return <Dots />;
  if (!summary) return null;

  const { strategy, metrics, counts, siblings } = summary;
  const refNumber = `${strategy.policy.policy_number}.${strategy.strategy_number}`;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-1 min-w-0'>
          <Heading>{strategy.focus_area.name}</Heading>
          <Subheading>
            Strategy {refNumber}: {strategy.policy.description}
          </Subheading>
        </div>
        {showEditPath && (
          <CButton href='edit' color='lime' className='shrink-0'>
            Configure
          </CButton>
        )}
      </div>

      {/* Metric Labels */}
      <StrategyMetricLabels
        strategy={strategy}
        metrics={metrics}
        counts={counts}
      />

      {/* Bento Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Strategy Content — spans 2 cols on desktop */}
        <Card className='lg:col-span-2'>
          <CardContent className='pt-6'>
            <Text>{strategy.content}</Text>
          </CardContent>
        </Card>

        {/* Implementers */}
        <StrategyImplementers implementers={strategy.implementers} />

        {/* Comments — spans 2 cols on desktop */}
        <div className='lg:col-span-2'>
          <StrategyComments
            strategyId={strategy.id}
            commentCount={counts.comments}
          />
        </div>

        {/* Right column: CPIC SMEs + Activity + Siblings */}
        <div className='space-y-4'>
          {isAuthenticated && (
            <StrategyCpicSmes implementers={strategy.implementers} />
          )}
          <StrategyActivity
            strategyId={strategy.id}
            activityCount={counts.activities}
          />
          <StrategySiblings
            siblings={siblings}
            policyNumber={strategy.policy.policy_number}
          />
        </div>
      </div>
    </div>
  );
};
