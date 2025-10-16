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
import useAuth from 'hooks/useAuth';
import { AddCommentForm } from '../comments/comment_input';
import { useGetStrategyCommentsQuery } from './strategiesApiSlice';

const Comments = ({ strategyId }) => {
  const params = {
    replies: 'true',
  };
  const { data } = useGetStrategyCommentsQuery({
    id: strategyId,
    params,
  });
  return (
    <>
      <p>Comments list...</p>
      <AddCommentForm />
    </>
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

export const ResourcesTabs = ({ strategy }) => {
  return (
    <div className='flex w-full flex-col gap-6'>
      <Tabs defaultValue='comments'>
        <TabsList>
          <TabsTrigger value='comments'>Comments</TabsTrigger>
          <TabsTrigger value='resources'>Resources</TabsTrigger>
          <TabsTrigger value='stakeholders'>Stakeholders</TabsTrigger>
        </TabsList>
        <TabsContent value='comments'>
          <Comments strategyId={strategy.id} />
        </TabsContent>
        <TabsContent value='resources'>
          <Resources />
        </TabsContent>
        <TabsContent value='stakeholders'>
          <Stakeholders />
        </TabsContent>
      </Tabs>
    </div>
  );
};
