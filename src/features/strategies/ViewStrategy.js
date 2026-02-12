import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useGetStrategyQuery } from './strategiesApiSlice';
import { AppWindowIcon, CodeIcon } from 'lucide-react';
import { Button } from 'ui/button';
import { Link } from 'catalyst/link';
import { RelativeTimeCard } from 'ui/relative-time-card';
import { Button as CButton } from 'catalyst/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Input } from 'ui/input';
import { Label } from 'ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/tabs';
import { Separator } from 'ui/separator';
import { useGetFocusAreaQuery } from '../focus_areas/focusAreaApiSlice';
import { Loading } from 'components/Spinners';
import { CustomOl, CustomLi } from 'components/custom-ol';
import { useGetImplementerQuery } from '../implementers/implementersApiSlice';
import { useGetStrategyCommentsQuery } from './strategiesApiSlice';
import useAuth from 'hooks/useAuth';
import { ResourcesTabs } from './Resources';
import { EmptyContainer } from '../../components/EmptyContainer';
import { AddCommentForm } from '../comments/comment_input';

const DescriptionRow = ({ fields }) => (
  <div className='flex h-5 items-center space-x-4 text-sm'>
    <div>TEST</div>
    <Separator orientation='vertical' />
    <div>ME</div>
  </div>
);

const TimeCard = ({ timestamp }) => {
  const createdDate = new Date(timestamp);
  return (
    <RelativeTimeCard date={createdDate} side='left'>
      {createdDate.toLocaleDateString()}
    </RelativeTimeCard>
  );
};

const CommentCard = ({ comment }) => (
  <Card>
    <CardHeader>
      <CardTitle>{comment.user_id}</CardTitle>
      <CardDescription>
        <TimeCard timestamp={comment.createdAt} />
      </CardDescription>
    </CardHeader>
    <CardContent>{comment.content}</CardContent>
  </Card>
);

const Comments = ({ strategyId }) => {
  const params = {
    replies: 'true',
  };
  const { data: comments, refetch } = useGetStrategyCommentsQuery({
    id: strategyId,
    params,
  });

  return (
    comments && (
      <>
        <AddCommentForm refetchComments={refetch} strategy={strategyId} />
        {comments.length == 0 ? (
          <EmptyContainer
            title='No comments yet'
            description='add a comment!'
          />
        ) : (
          <div className='m-5'>
            {comments.map((comment, i) => (
              <CommentCard comment={comment} key={i} />
            ))}
          </div>
        )}
      </>
    )
  );
};

const Resources = () => {
  return (
    <>
      <p>Resources list...</p>
    </>
  );
};

const Stakeholders = () => {
  return (
    <>
      <p>stakeholders list...</p>
    </>
  );
};

export const StrategyCard = ({ strategy }) => {
  const { content, id, timeline, policy, status, strategy_number } = strategy;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`${policy.policy_number}.${strategy_number}`}</CardTitle>
        <CardDescription>
          <DescriptionRow fields={{}} />
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter>{id}</CardFooter>
    </Card>
  );
};

export const Implementers = ({ implementers }) => {
  //fetch implementers
  return (
    <Card>
      <CardContent>
        {implementers.map((implementer) => (
          <p key={implementer.implementer_id}>
            {implementer.name} {implementer.is_primary ? ' (Primary)' : null}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export const PolicyOverview = ({ policy }) => {
  const { id, description, policy_number, area } = policy;
  const { data: focus_area, isLoading } = useGetFocusAreaQuery(
    {
      id: policy.area.id,
      params: {
        policies: 'true',
      },
    },
    { skip: !policy.area.id }
  );

  const matchClasses = 'text-green-700 font-bold';

  return isLoading ? (
    <Loading />
  ) : focus_area ? (
    <Card>
      <CardHeader>
        <CardTitle>{area.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {focus_area.policies.map((item) => (
          <p
            key={item.id}
            className={item.id === id ? matchClasses : ''}
          >{`${item.policy_number}. ${item.description}`}</p>
        ))}
      </CardContent>
    </Card>
  ) : null;
};

export const StrategyTabs = ({ strategy, user }) => {
  const { implementers, policy } = strategy;

  const isCpicUser =
    user?.isAdmin ||
    user?.isCPICAdmin ||
    user?.isImplementer ||
    user?.isCPICMember;

  return (
    <div className='flex w-full flex-col gap-6'>
      <Tabs defaultValue='strategy'>
        <TabsList>
          <TabsTrigger value='policy'>Focus Area</TabsTrigger>
          <TabsTrigger value='strategy'>Strategy Details</TabsTrigger>
          <TabsTrigger value='implementers'>Assigned Implementers</TabsTrigger>
          <TabsTrigger value='comments'>Comments</TabsTrigger>
          {isCpicUser && (
            <>
              <TabsTrigger value='resources'>Resources</TabsTrigger>
              <TabsTrigger value='stakeholders'>Stakeholders</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value='policy'>
          <PolicyOverview policy={policy} />
        </TabsContent>
        <TabsContent value='strategy'>
          <StrategyCard strategy={strategy} />
        </TabsContent>
        <TabsContent value='implementers'>
          <Implementers implementers={implementers} />
        </TabsContent>
        <TabsContent value='comments'>
          <Comments strategyId={strategy.id} />
        </TabsContent>
        {isCpicUser && (
          <>
            <TabsContent value='resources'>
              <Resources />
            </TabsContent>
            <TabsContent value='stakeholders'>
              <Stakeholders />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export const ViewStrategy = () => {
  let { id } = useParams();
  const user = useAuth();
  const showEditPath = user?.isAdmin || user?.isCPICAdmin;

  const params = {
    timeline: 'true',
    policy: 'true',
    status: 'true',
    implementers: 'true',
  };
  const { data: strategy } = useGetStrategyQuery(
    {
      id,
      params,
    },
    {
      skip: !id,
    }
  );

  return (
    strategy && (
      <>
        {showEditPath && (
          <div className='flex w-full justify-end'>
            <CButton href={`edit`} color='lime'>
              Configure
            </CButton>
          </div>
        )}

        <StrategyTabs user={user} strategy={strategy} />
      </>
    )
  );
};
