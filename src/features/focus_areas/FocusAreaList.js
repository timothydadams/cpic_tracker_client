import React from 'react';
import {
  useGetAllFocusAreasQuery,
  useGetFocusAreaQuery,
} from './focusAreaApiSlice';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'ui/accordion';
import { Loading } from 'components/Spinners';

export const FocusAreaList = () => {
  const { data, isLoading } = useGetAllFocusAreasQuery({ policies: 'true' });

  if (isLoading) {
    return <Loading />;
  }

  return (
    data && (
      <Accordion
        type='single'
        collapsible
        className='w-full'
        transform='translate3d(0,0,0)'
        defaultValue=''
      >
        {data.map((fa) => {
          return (
            <AccordionItem value={fa.id}>
              <AccordionTrigger>{fa.name}</AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-balance'>
                <Accordion
                  type='single'
                  collapsible
                  className='w-full pl-5'
                  defaultValue=''
                >
                  {fa.policies.map((p) => {
                    return (
                      <AccordionItem value={p.id}>
                        <AccordionTrigger>{`${p.policy_number}. ${p.description}`}</AccordionTrigger>
                        <AccordionContent className='flex flex-col gap-4 text-balance'>
                          {p.description}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    )
  );
};
