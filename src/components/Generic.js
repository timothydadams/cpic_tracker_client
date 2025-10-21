import React from 'react';
import { Link } from 'catalyst/link';
import { Text } from 'catalyst/text.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
//import { Button } from 'catalyst/button.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'ui/button';

export const NotFound = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <>
      <div className='h-full mx-auto'>
        <div className='grid place-items-center py-24 px-6 sm:py-32 lg:px-8'>
          <div className='text-center'>
            <Text>404</Text>
            <Heading className='mt-4 sm:text-5xl'>Page not found</Heading>

            <Subheading className='mt-6 max-sm:hidden'>
              Sorry, we couldn’t find the page you’re looking for.
            </Subheading>

            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Button onClick={goBack}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const NotAuthorized = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const location = useLocation();
  const { customMessage } = location.state;

  return (
    <>
      <div className='h-full mx-auto'>
        <div className='grid place-items-center py-24 px-6 sm:py-32 lg:px-8'>
          <div className='text-center'>
            <Text>403</Text>
            <Heading className='mt-4 sm:text-5xl'>Access Denied</Heading>

            <Subheading className='mt-6'>
              {customMessage
                ? customMessage
                : 'Only CPIC Board members can perform this action.'}
            </Subheading>

            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Button onClick={goBack}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const NoResults = () => <Text>No results</Text>;

export const Error = ({ error }) => {
  const { status } = error;
  const serverRes = error?.data?.message || 'Opps!';
  const rtkQueryMsg = error?.message || '';
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  return (
    <>
      <div className='w-96 mx-auto'>
        <div className='grid fixed place-items-center py-24 px-6 sm:py-32 lg:px-8'>
          <div className='text-center'>
            <p className='text-base font-semibold text-blue-600'>{status}</p>
            <h1 className='mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              {serverRes}
            </h1>
            <p className='mt-6 text-base leading-7 text-gray-600'>
              {rtkQueryMsg}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              {status === 401 ? (
                <Link to='/login'>
                  Sign In <span aria-hidden='true'>&rarr;</span>
                </Link>
              ) : (
                <Button onClick={goBack}>Go Back</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
