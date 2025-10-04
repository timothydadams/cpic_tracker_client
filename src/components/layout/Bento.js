//lg:px-8
export default function ExampleBento() {
  return (
    <div className='py-24 sm:py-32 max-w-6xl'>
      <div className='mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8'>
        <div className='mt-10 grid grid-cols-1 gap-4 lg:mt-16 lg:grid-cols-6 lg:grid-rows-2'>
          <div className='flex p-px col-pan-1 lg:col-span-4'>
            <div className='overflow-hidden rounded-lg ring-1 ring-white/15 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]'>
              <div className='p-10'>One</div>
            </div>
          </div>
          <div className='flex p-px lg:col-span-2'>
            <div className='overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-tr-[2rem]'>
              <div className='p-10'>Two</div>
            </div>
          </div>
          <div className='flex p-px lg:col-span-2'>
            <div className='overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-bl-[2rem]'>
              <div className='p-10'>
                <h3 className='text-sm/4 font-semibold text-gray-400'>
                  Security
                </h3>
                <p className='mt-2 text-lg/7 font-medium tracking-tight text-white'>
                  Advanced access control
                </p>
                <p className='mt-2 max-w-lg text-sm/6 text-gray-400'>
                  Vestibulum ante ipsum primis in faucibus orci luctus et
                  ultrices posuere cubilia.
                </p>
              </div>
            </div>
          </div>
          <div className='flex p-px lg:col-span-4'>
            <div className='overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]'>
              <div className='p-10'>
                <h3 className='text-sm/4 font-semibold text-gray-400'>
                  Performance
                </h3>
                <p className='mt-2 text-lg/7 font-medium tracking-tight text-white'>
                  Lightning-fast builds
                </p>
                <p className='mt-2 max-w-lg text-sm/6 text-gray-400'>
                  Sed congue eros non finibus molestie. Vestibulum euismod augue
                  vel commodo vulputate. Maecenas at augue sed elit dictum
                  vulputate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
