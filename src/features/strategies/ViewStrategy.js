import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useGetStrategyQuery } from './strategiesApiSlice';
import { AppWindowIcon, CodeIcon } from 'lucide-react';
import { Button } from 'ui/button';
import { Link } from 'catalyst/link';
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
import { EmptyContainer } from './EmptyContainer';

import { RegisteredInput } from 'components/forms/Input.js';
/*

api response (data):
{
        "id": 1,
        "content": "Promote future endeavors at Norcross Point such as more concerts and theatrical offerings in the open-air stage",
        "last_comms_date": null,
        "createdAt": "2025-09-13T17:41:05.656Z",
        "updatedAt": "2025-09-13T17:41:05.656Z",
        "policy_id": "2d056291-6508-4b79-9781-2e8672180890",
        "strategy_number": 5,
        "timeline_id": 2,
        "status_id": 1,
        "timeline": {
            "id": 2,
            "title": "Short-Term"
        },
        "policy": {
            "id": "2d056291-6508-4b79-9781-2e8672180890",
            "description": "Work to establish a calendar of year-round community events",
            "policy_number": 5,
            "focus_area_id": 7,
            "area": {
                "id": 7,
                "name": "Recreation and Culture"
            }
        },
        "status": {
            "id": 1,
            "title": "Needs Updating"
        }
    }
*/

const DescriptionRow = ({ fields }) => (
  <div className='flex h-5 items-center space-x-4 text-sm'>
    <div>TEST</div>
    <Separator orientation='vertical' />
    <div>ME</div>
  </div>
);

export const AddCommentForm = () => {
  return (
    <>
      <RegisteredInput
        className='flex w-full max-w-sm items-center space-x-2'
        type='text'
        placeholder='Add your comment...'
        element='textarea'
      />
      <Button type='submit'>Comment</Button>
    </>
  );
};

const Comments = ({ strategyId }) => {
  const params = {
    replies: 'true',
  };
  const { data: comments } = useGetStrategyCommentsQuery({
    id: strategyId,
    params,
  });

  return (
    comments && (
      <>
        {comments.length == 0 ? (
          <EmptyContainer
            title='No comments yet'
            description='add a comment!'
          />
        ) : (
          comments.map((i) => <p>{i.content}</p>)
        )}
        <AddCommentForm />
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
      <CardHeader>
        <CardTitle>Build out List</CardTitle>
      </CardHeader>
      <CardContent>
        {implementers.map((implementer) => (
          <p key={implementer.implementer_id}>{implementer.name}</p>
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
